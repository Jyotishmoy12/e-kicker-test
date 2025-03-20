import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchOrders(currentUser.uid);
      } else {
        setLoading(false);
        // Redirect to login after short delay
        setTimeout(() => navigate("/account"), 2000);
      }
    }, (authError) => {
      setError("Authentication error: " + authError.message);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const fetchOrders = async (uid) => {
    setLoadingOrders(true);
    try {
      const ordersCollection = collection(db, "users", uid, "orders");
      // Add sorting by timestamp (most recent first) and limit results
      const ordersQuery = query(
        ordersCollection, 
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      
      if (ordersSnapshot.empty) {
        setOrders([]);
      } else {
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoadingOrders(false);
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    if (user) {
      fetchOrders(user.uid);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    try {
      return new Date(timestamp.seconds * 1000).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show unauthorized state
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl mb-4">Please log in to view your profile.</p>
        <button 
          onClick={() => navigate("/account")} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              
              <p className="mb-2">
                <span className="font-bold">Email:</span> {user.email || "Not provided"}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="font-bold">Account Created:</span>{" "}
                {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
              </p>
              <p className="mb-2">
                <span className="font-bold">Last Sign In:</span>{" "}
                {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mt-4 sm:mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Order History</h2>
            <button
              onClick={refreshOrders}
              disabled={loadingOrders}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
            >
              {loadingOrders ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading
                </>
              ) : (
                "Refresh Orders"
              )}
            </button>
          </div>
          
          {loadingOrders ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No orders found.</p>
              <button 
                onClick={() => navigate("/products")} 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="border p-4 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <p className="font-bold text-lg break-all">Order ID: {order.id}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.timestamp)}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-blue-600">
                      {order.amount ? formatCurrency(order.amount) : "Price unavailable"}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-semibold">Items:</h3>
                    {!order.items || order.items.length === 0 ? (
                      <p className="text-gray-500 italic">No items available</p>
                    ) : (
                      <ul className="divide-y">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="py-2 flex justify-between">
                            <span>
                              {item.name || "Unknown item"} 
                              <span className="text-gray-500">
                                (x{item.quantity || 0})
                              </span>
                            </span>
                            <span className="font-medium">
                              {item.price ? formatCurrency(item.price * (item.quantity || 1)) : "N/A"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {order.status && (
                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-semibold">Status:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;