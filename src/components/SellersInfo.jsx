import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, User, Mail, Phone, FileText, ClipboardCheck, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerProfiles = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      
      // Allow access if user is the specified admin email
      if (currentUser && currentUser.email === "admfouekicker@gmail.com") {
        setIsAdmin(true);
        return;
      }
      
      // If not logged in with the admin email, check if admin credentials are in localStorage
      const storedAdminEmail = localStorage.getItem('adminEmail');
      if (storedAdminEmail === "admfouekicker@gmail.com") {
        setIsAdmin(true);
        return;
      }
      
      // If not admin, redirect to login
      toast.error("Access denied. Admin privileges required.");
      navigate('/login');
    };
    
    checkAdminStatus();
  }, [navigate]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const sellersCollection = collection(db, 'sellers');
      const sellersSnapshot = await getDocs(sellersCollection);
      const sellersList = sellersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure 'verified' exists (default to false for backward compatibility)
          verified: data.verified !== undefined ? data.verified : false
        };
      });
      setSellers(sellersList);
    } catch (error) {
      console.error("Error fetching sellers: ", error);
      toast.error("Failed to load seller profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSellers();
    }
  }, [isAdmin]);

  const handleToggleVerified = async (sellerId, currentVerified) => {
    try {
      const sellerRef = doc(db, 'sellers', sellerId);
      
      // Get current seller data
      const sellerSnap = await getDoc(sellerRef);
      if (!sellerSnap.exists()) {
        toast.error("Seller not found");
        return;
      }
      
      // Determine new status by inverting the current boolean
      const newStatus = !currentVerified;
      
      // Update the verified field and verificationDate accordingly
      await updateDoc(sellerRef, { 
        verified: newStatus,
        verificationDate: newStatus ? new Date().toISOString() : null
      });
      
      toast.success(`Seller ${newStatus ? 'verified' : 'unverified'} successfully`);
      fetchSellers(); // Refresh list after update
    } catch (error) {
      console.error("Error updating seller verification:", error);
      toast.error("Failed to update seller verification status");
    }
  };

  const viewSellerProfile = (sellerId) => {
    // Store admin status in localStorage to retain access rights
    localStorage.setItem('adminEmail', "admfouekicker@gmail.com");
    
    // Also store the sellerId to be viewed
    localStorage.setItem('sellerId', sellerId);
    
    // Navigate to seller profile
    navigate(`/seller-profile/${sellerId}`);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading seller profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage seller verification and accounts</p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Seller Profiles</h2>
            <div className="text-sm text-gray-500">Total sellers: {sellers.length}</div>
          </div>

          {sellers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No seller profiles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sellers.map(seller => (
                <div key={seller.id} className="border rounded-lg overflow-hidden">
                  {/* Verification status banner */}
                  <div className={`px-4 py-2 ${
                    seller.verified 
                      ? 'bg-green-100 border-l-4 border-green-500' 
                      : 'bg-amber-100 border-l-4 border-amber-500'
                  }`}>
                    <div className="flex items-center">
                      {seller.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        seller.verified 
                          ? 'text-green-700' 
                          : 'text-amber-700'
                      }`}>
                        {seller.verified ? 'Verified Seller' : 'Unverified Seller'}
                      </span>
                    </div>
                  </div>

                  {/* Seller information */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Full Name</div>
                          <div className="font-medium">{seller.fullName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium truncate">{seller.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium">{seller.phoneNumber}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">GST Number</div>
                          <div className="font-medium">{seller.gstNumber}</div>
                        </div>
                      </div>
                    </div>

                    {/* Registration date */}
                    <div className="text-sm text-gray-500 mb-4">
                      <span>Registration date: </span>
                      <span className="font-medium">
                        {seller.registrationDate 
                          ? new Date(seller.registrationDate).toLocaleDateString() 
                          : 'Unknown'}
                      </span>
                    </div>

                    {/* Verification date (if applicable) */}
                    {seller.verified && seller.verificationDate && (
                      <div className="text-sm text-gray-500 mb-4">
                        <span>Verified on: </span>
                        <span className="font-medium">
                          {new Date(seller.verificationDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button 
                        onClick={() => handleToggleVerified(seller.id, seller.verified)}
                        className={`flex items-center px-4 py-2 rounded-md text-white ${
                          seller.verified
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-green-500 hover:bg-green-600'
                        } transition-colors`}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        {seller.verified ? 'Unverify Seller' : 'Verify Seller'}
                      </button>
                      
                      <button 
                        onClick={() => viewSellerProfile(seller.id)}
                        className="flex items-center px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfiles;
