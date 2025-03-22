import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orderTimeRange, setOrderTimeRange] = useState("all");
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

  const fetchOrders = async (uid, status = filterStatus, timeRange = orderTimeRange) => {
    setLoadingOrders(true);
    try {
      const ordersCollection = collection(db, "users", uid, "orders");

      // Build query based on filters
      let ordersQuery = query(
        ordersCollection, 
        orderBy("timestamp", "desc"),
        limit(20)
      );
      
      // Add status filter if not "all"
      if (status !== "all") {
        ordersQuery = query(
          ordersCollection,
          where("status", "==", status),
          orderBy("timestamp", "desc"),
          limit(20)
        );
      }

      // Time range filter would be applied here in a real implementation
      // For this example, we're just showing how it would be structured
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      if (ordersSnapshot.empty) {
        setOrders([]);
      } else {
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Apply time range filter in JavaScript (in production, this should be done in the query if possible)
        let filteredOrders = ordersList;
        if (timeRange !== "all") {
          const now = new Date();
          const cutoffDate = new Date();
          
          if (timeRange === "lastMonth") {
            cutoffDate.setMonth(now.getMonth() - 1);
          } else if (timeRange === "last3Months") {
            cutoffDate.setMonth(now.getMonth() - 3);
          } else if (timeRange === "last6Months") {
            cutoffDate.setMonth(now.getMonth() - 6);
          }
          
          filteredOrders = ordersList.filter(order => {
            if (!order.timestamp || !order.timestamp.seconds) return false;
            const orderDate = new Date(order.timestamp.seconds * 1000);
            return orderDate >= cutoffDate;
          });
        }
        
        setOrders(filteredOrders);
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
      fetchOrders(user.uid, filterStatus, orderTimeRange);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (user) {
      fetchOrders(user.uid, status, orderTimeRange);
    }
  };

  const handleTimeRangeChange = (range) => {
    setOrderTimeRange(range);
    if (user) {
      fetchOrders(user.uid, filterStatus, range);
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

  // Order status badge component
  

  // Loading skeleton for orders
  const OrderSkeleton = () => (
    <div className="border p-4 rounded-lg animate-pulse">
      <div className="flex flex-wrap justify-between items-start">
        <div>
          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
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
        <Footer />
      </>
    );
  }

  // Show unauthorized state
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <p className="text-xl mb-4">Please log in to view your profile.</p>
          <button 
            onClick={() => navigate("/account")} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto p-4">
          {/* Tabs Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeTab === "profile" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === "orders" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
           
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 text-blue-800 h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">{user.displayName || "User"}</h3>
                      <p className="text-sm text-gray-500">{user.email || "No email provided"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                    <p className="mb-2">
                      <span className="font-medium text-gray-600">Email:</span> {user.email || "Not provided"}
                    </p>
                  
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Account Information</h3>
                    <p className="mb-2">
                      <span className="font-medium text-gray-600">Created:</span>{" "}
                      {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium text-gray-600">Last Sign In:</span>{" "}
                      {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "N/A"}
                    </p>
                   
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => setActiveTab("orders")} 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <span>View your order history</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab Content */}
          {activeTab === "orders" && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold mb-2 sm:mb-0">Order History</h2>
                <button
                  onClick={refreshOrders}
                  disabled={loadingOrders}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center"
                >
                  {loadingOrders ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              
             
              
              {loadingOrders ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <OrderSkeleton key={index} />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-600 mb-4 text-lg">No orders found.</p>
                  {(filterStatus !== "all" || orderTimeRange !== "all") ? (
                    <button 
                      onClick={() => {
                        setFilterStatus("all");
                        setOrderTimeRange("all");
                        fetchOrders(user.uid, "all", "all");
                      }} 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate("/products")} 
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Start Shopping
                    </button>
                  )}
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
                      
                      <div className="mt-3 flex justify-between items-center">
                                              </div>
                    </div>
                  ))}
                </div>
              )}
              
              {orders.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      // This would typically load more orders
                      // For this example, we're just showing the UI element
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Load more orders
                  </button>
                </div>
              )}
            </div>
          )}
          
         
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;