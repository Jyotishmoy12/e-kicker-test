import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { CreditCard, ShoppingBag, Check } from 'lucide-react';
import Navbar from "../components/Navbar";

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',  // Pincode field
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [isPincodeValid, setIsPincodeValid] = useState(true);  // Track pincode validity

  const validPincodes = ['110001', '110002', '110003']; // Add valid pincodes here

  const navigate = useNavigate();
  
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdU-1MiVmWSIqFtFKUDEBJbPc26IqpncSZ-CfVf5Haw8zHORQ/viewform" // Replace with your Google Form URL
  

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const fetchCartItems = async () => {
          try {
            const cartCollection = collection(db, 'users', currentUser.uid, 'cart');
            const cartSnapshot = await getDocs(cartCollection);
            const cartList = cartSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setCartItems(cartList);
            setFormData(prev => ({
              ...prev,
              email: currentUser.email,
            }));
            setLoading(false);
          } catch (error) {
            console.error('Error fetching cart items:', error);
            setLoading(false);
          }
        };

        fetchCartItems();
      } else {
        navigate('/account');
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'zipCode') {
      // Check if entered pincode is valid
      if (validPincodes.includes(value)) {
        setIsPincodeValid(true);
      } else {
        setIsPincodeValid(false);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!isPincodeValid) {
      alert('Invalid Pincode! You cannot place the order.');
      return;
    }
  
    try {
      // Clear the cart in Firestore
      const cartCollection = collection(db, 'users', user.uid, 'cart');
      const cartSnapshot = await getDocs(cartCollection);
      const cartDocs = cartSnapshot.docs;
  
      // Delete each cart item
      for (const cartDoc of cartDocs) {
        await deleteDoc(doc(db, 'users', user.uid, 'cart', cartDoc.id));
      }
  
      // Redirect to the cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error clearing the cart:', error);
    }
  
    // Redirect to Google Form (or proceed as necessary)
    window.open(googleFormUrl, "_blank");
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden grid md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-8">
            <div className="flex items-center mb-6">
              <ShoppingBag className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-3xl font-extrabold text-blue-900">Order Summary</h2>
            </div>
            <div className="divide-y divide-blue-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || 'vite.svg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div>
                      <h3 className="font-bold text-blue-900">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-blue-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-blue-200 flex justify-between">
              <span className="text-xl font-bold text-blue-900">Total</span>
              <span className="text-2xl font-extrabold text-blue-800">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center mb-6">
              <CreditCard className="w-10 h-10 text-blue-600 mr-4" />
              <h2 className="text-3xl font-extrabold text-blue-900">Checkout</h2>
            </div>
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Form fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 mb-2">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-blue-900 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Other fields */}
              {/* <div>
                <label className="block text-blue-900 mb-2">Pincode (Zip Code)</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!isPincodeValid && (
                  <p className="text-red-500 text-sm">Invalid Pincode! Please enter a valid pincode.</p>
                )}
              </div> */}

              <button
                type="button"
                onClick={handleSubmitOrder}
                // disabled={!isPincodeValid}
                className={`w-full py-3 font-bold rounded-lg ${isPincodeValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
              >
                Place Order
              </button>
              
              <p className="font-serif font-bold">Note: Please be aware that we are currently using Google Forms for orders. Therefore, kindly keep track of your order, as your cart will be emptied once you click on "Place Order"! </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
