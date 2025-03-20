import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { ShoppingBag, CreditCard } from "lucide-react";
import Navbar from "../components/Navbar";

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const fetchCartItems = async () => {
          try {
            const cartCollection = collection(db, "users", currentUser.uid, "cart");
            const cartSnapshot = await getDocs(cartCollection);
            const cartList = cartSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setCartItems(cartList);
            setFormData((prev) => ({
              ...prev,
              email: currentUser.email,
            }));
            setLoading(false);
          } catch (error) {
            console.error("Error fetching cart items:", error);
            setLoading(false);
          }
        };

        fetchCartItems();
      } else {
        navigate("/account");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Please fill in all details.");
      return;
    }

    const totalAmount = calculateTotal();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: totalAmount * 100,
      currency: "INR",
      name: "Your Store",
      description: "Order Payment",
      handler: async function (response) {
        try {
          const orderData = {
            items: cartItems,
            amount: totalAmount,
            shipping: formData,
            paymentId: response.razorpay_payment_id,
            timestamp: new Date(),
          };

          const orderRef = await addDoc(collection(db, "users", user.uid, "orders"), orderData);
          setOrderId(orderRef.id);

          const cartCollection = collection(db, "users", user.uid, "cart");
          const cartSnapshot = await getDocs(cartCollection);
          for (const cartDoc of cartSnapshot.docs) {
            await deleteDoc(doc(db, "users", user.uid, "cart", cartDoc.id));
          }

          // **Show WhatsApp modal after payment**
          setShowWhatsAppModal(true);
        } catch (error) {
          console.error("Error saving order:", error);
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phoneNumber,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const sendWhatsAppMessage = () => {
    const adminNumber = "+916000460553"; // Change this to your admin's WhatsApp number
    let message = `🛍 *New Order Received!*\n\n`;
    message += `📦 *Order ID:* ${orderId}\n`;
    message += `👤 *Customer:* ${formData.firstName} ${formData.lastName}\n`;
    message += `📞 *Phone:* ${formData.phoneNumber}\n`;
    message += `📍 *Address:* ${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}\n`;
    message += `📧 *Email:* ${formData.email}\n\n`;
    message += `💰 *Total Amount:* ₹${calculateTotal().toFixed(2)}\n\n`;
    message += `🛒 *Order Items:*\n`;

    cartItems.forEach((item) => {
      message += `  - ${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="flex items-center mb-6">
              <ShoppingBag className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold">Order Summary</h2>
            </div>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between py-4">
                <div className="flex items-center space-x-4">
                  <img src={item.image || "vite.svg"} alt={item.name} className="w-20 h-20 rounded-xl" />
                  <div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="mt-6 pt-6 border-t flex justify-between">
              <span className="text-xl font-bold">Total</span>
              <span className="text-2xl font-extrabold">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <div className="flex items-center mb-6">
              <CreditCard className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold">Checkout</h2>
            </div>
            <form className="space-y-4">
              {["firstName", "lastName", "phoneNumber", "email", "address", "city", "state", "zipCode"].map((field) => (
                <div key={field}>
                  <label className="block mb-2 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              ))}
              <button type="button" onClick={handlePayment} className="w-full py-3 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Pay with Razorpay
              </button>
            </form>
          </div>
        </div>
        
      </div>

      {showWhatsAppModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg text-center">
                <h2 className="text-xl font-bold mb-4">Order Placed Successfully!</h2>
                <p>Your order details have been saved. Would you like to share them on WhatsApp?</p>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={sendWhatsAppMessage}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Send Details to Admin
                  </button>
                  <button
                    onClick={() => navigate(`/order-confirmation/${orderId}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Go to Order Confirmation
                  </button>
                </div>
              </div>
            </div>
          )}
    
    </>
  );
  
};

export default CheckoutPage;
