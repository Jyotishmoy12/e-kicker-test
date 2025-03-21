import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { ShoppingBag, CreditCard, ChevronRight, ChevronDown, CheckCircle, X, Info, User, Home, Phone } from "lucide-react";
import Navbar from "../components/Navbar";

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [showItemDetails, setShowItemDetails] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
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

            if (cartList.length === 0) {
              navigate("/cart");
              return;
            }

            setCartItems(cartList);
            setFormData((prev) => ({
              ...prev,
              email: currentUser.email || "",
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
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  };
  

  const validateForm = () => {
    const errors = {};
    const fields = [
      "firstName", "lastName", "phoneNumber", "email", "address", "city", "state", "zipCode"
    ];

    fields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    // Validate phone number format
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
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

          setOrderSuccess(true);
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
        color: "#4F46E5",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const sendWhatsAppMessage = () => {
    const adminNumber = "+916000460553";
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
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading your checkout information...</p>
        </div>
      </>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    navigate("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Checkout steps */}
          <div className="mb-8 hidden md:block">
            <div className="flex justify-between items-center">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 1 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="mt-2 text-sm font-medium">Cart</span>
              </div>
              <div className={`w-full border-t-2 mx-4 ${currentStep >= 2 ? 'border-indigo-600' : 'border-gray-300'}`}></div>
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 2 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                  <User className="w-5 h-5" />
                </div>
                <span className="mt-2 text-sm font-medium">Information</span>
              </div>
              <div className={`w-full border-t-2 mx-4 ${currentStep >= 3 ? 'border-indigo-600' : 'border-gray-300'}`}></div>
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${currentStep >= 3 ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="mt-2 text-sm font-medium">Payment</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Order Summary (Collapsible on mobile) */}
            <div className="md:col-span-5 lg:col-span-4">
              <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 bg-indigo-600 text-white cursor-pointer md:cursor-default"
                  onClick={() => setShowSummary(!showSummary)}
                >
                  <div className="flex items-center">
                    <ShoppingBag className="w-6 h-6 mr-2" />
                    <h2 className="text-xl font-bold">Order Summary</h2>
                  </div>
                  <div className="md:hidden">
                    {showSummary ? <ChevronDown /> : <ChevronRight />}
                  </div>
                </div>

                <div className={`${showSummary ? 'block' : 'hidden md:block'}`}>
                  <div className="max-h-80 overflow-y-auto p-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="relative"
                            onClick={() => setShowItemDetails(item)}
                          >
                            <img 
                              src={item.image || "/vite.svg"} 
                              alt={item.name} 
                              className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80" 
                            />
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </div>
                          </div>
                          <div>
                            <h3 
                              className="font-medium text-gray-800 hover:text-indigo-600 cursor-pointer"
                              onClick={() => setShowItemDetails(item)}
                            >
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                            ₹{Number(item.price).toFixed(2)} each

                            </p>
                          </div>
                        </div>
                        <p className="font-bold">₹₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gray-50">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-indigo-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="md:col-span-7 lg:col-span-8">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Complete Your Purchase</h2>
                </div>

                <form className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-indigo-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.firstName && <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.lastName && <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <Home className="w-5 h-5 mr-2 text-indigo-600" />
                      Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}
                          />
                          {formErrors.state && <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {formErrors.zipCode && <p className="mt-1 text-sm text-red-500">{formErrors.zipCode}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="button" 
                      onClick={handlePayment} 
                      className="w-full py-3 font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay ₹{calculateTotal().toFixed(2)} with Razorpay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Detail Modal */}
        {showItemDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-bold">Product Details</h3>
                <button onClick={() => setShowItemDetails(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src={showItemDetails.image || "/vite.svg"} 
                    alt={showItemDetails.name} 
                    className="w-48 h-48 object-cover rounded-lg mb-4" 
                  />
                  <h3 className="text-xl font-bold text-center">{showItemDetails.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium">₹{showItemDetails.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium">{showItemDetails.quantity}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{(showItemDetails.price * showItemDetails.quantity).toFixed(2)}</span>
                  </div>
                </div>
                {showItemDetails.description && (
                  <div className="mt-4">
                    <span className="text-gray-500">Description</span>
                    <p className="text-sm mt-1">{showItemDetails.description}</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t">
                <button 
                  onClick={() => setShowItemDetails(null)} 
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Modal - Enhanced */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-green-500 p-6 text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Order Placed Successfully!</h2>
                <p className="mt-2">Thank you for your purchase</p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Order Details</h3>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Order ID:</span> {orderId}</p>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Total Amount:</span> ₹{calculateTotal().toFixed(2)}</p>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Items:</span> {cartItems.length}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Need assistance with your order?</h3>
                  <p className="text-gray-600 mb-4">Share your order details with our admin via WhatsApp for faster support.</p>
                  
                  <button
                    onClick={sendWhatsAppMessage}
                    className="w-full py-3 px-4 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600"
                  >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send Details to Admin
                  </button>
                </div>
                
                <button
                  onClick={() => navigate(`/order-confirmation/${orderId}`)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Order Confirmation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;