import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import {toast} from "react-toastify"

const CartPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    if (user) {
      fetchCartItems();
    }

    return () => unsubscribeAuth();
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const cartCollection = collection(db, 'users', user.uid, 'cart');
      const cartSnapshot = await getDocs(cartCollection);
      const cartList = cartSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(cartList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setLoading(false);
    }
  };
  const handleRemoveItem = async (itemId) => {
    try {
      const cartDocRef = doc(db, 'users', user.uid, 'cart', itemId);
      await deleteDoc(cartDocRef);
      toast.success('Item removed from cart!');
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const cartDocRef = doc(db, 'users', user.uid, 'cart', itemId);
      await updateDoc(cartDocRef, { quantity });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/account');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-4 px-2 sm:py-12 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-blue-600 text-white py-4 px-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-3xl font-bold">Your Cart</h2>
          <ShoppingCart className="w-6 h-6 sm:w-10 sm:h-10" />
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-lg sm:text-xl text-gray-500">Your cart is empty</p>
            <Link 
              to="/" 
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-blue-50 transition duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                    <img
                      src={item.image || 'vite.svg'}
                      alt={item.name}
                      className="w-full h-48 sm:w-24 sm:h-24 object-cover rounded-xl shadow-lg mb-4 sm:mb-0"
                    />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-3">Price: ₹{(item.price || 0).toFixed(2)}</p>
                      <div className="flex items-center space-x-4 bg-blue-100 rounded-full px-2 py-1 w-fit">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-blue-600 disabled:opacity-50 hover:bg-blue-200 rounded-full p-1 transition"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-blue-900 mx-2">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-blue-600 hover:bg-blue-200 rounded-full p-1 transition"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:items-end sm:space-y-3">
                    <p className="text-xl sm:text-2xl font-bold text-blue-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="bg-blue-50 p-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              <ArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
            <div className="text-xl sm:text-2xl font-bold text-blue-900">
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
            <Link
              to="/checkout"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition text-center"
            >
              <span className="flex items-center justify-center">
                <ShoppingCart className="mr-2 w-5 h-5" />
                Checkout
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;