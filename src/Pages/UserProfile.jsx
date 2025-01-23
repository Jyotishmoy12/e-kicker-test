import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { Package, MapPin, Phone, Mail, Edit2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        // Reference to user document
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        // Get user document
        const userDoc = await getDoc(userRef);
        
        // If user document doesn't exist, create it
        if (!userDoc.exists()) {
          const initialUserData = {
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            createdAt: new Date().toISOString()
          };
          
          await setDoc(userRef, initialUserData);
          setUserProfile(initialUserData);
        } else {
          // User document exists, use its data
          const userData = userDoc.data();
          setUserProfile({
            displayName: auth.currentUser.displayName || '',
            email: auth.currentUser.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || ''
          });
        }

        // Fetch orders
        const ordersCollection = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersCollection);
        const orderList = orderSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(order => order.userId === auth.currentUser.uid)
          .sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(orderList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      if (!auth.currentUser) {
        toast.error('You must be logged in to update your profile');
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // First, ensure the document exists by checking it
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If document doesn't exist, create it with setDoc
        await setDoc(userRef, {
          ...userProfile,
          createdAt: new Date().toISOString()
        });
      } else {
        // If document exists, update it
        await updateDoc(userRef, {
          phone: userProfile.phone,
          address: userProfile.address,
          city: userProfile.city,
          state: userProfile.state,
          pincode: userProfile.pincode
        });
      }

      // Update display name in Firebase Auth if changed
      if (userProfile.displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: userProfile.displayName
        });
      }

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Please <Link to="/account">LogIn</Link>log in to view your profile
            </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="text-white">
            <h1 className="text-2xl font-bold">{userProfile.displayName || 'User'}</h1>
            <p className="text-blue-100">{userProfile.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Details
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Order History
            </button>
          </nav>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                <button
                  onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userProfile.displayName}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={userProfile.address}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={userProfile.city}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={userProfile.state}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={userProfile.pincode}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, pincode: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">Order #{order.id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-medium">{order.items?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium">₹{order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;