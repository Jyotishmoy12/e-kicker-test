import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, LogOut, ShoppingBag, Loader } from 'lucide-react';

const SellerProfile = () => {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { sellerId: urlSellerId } = useParams();

  // Determine sellerId for dynamic dashboard navigation
  const sellerId = urlSellerId || (auth.currentUser ? auth.currentUser.uid : localStorage.getItem('sellerId'));

  // Check if the current user is an admin
  useEffect(() => {
    const checkAdminStatus = () => {
      const currentUser = auth.currentUser;
      const storedAdminEmail = localStorage.getItem('adminEmail');
      if ((currentUser && currentUser.email === "admfouekicker@gmail.com") ||
          storedAdminEmail === "admfouekicker@gmail.com") {
        setIsAdmin(true);
      }
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    
    const setupSellerProfile = async () => {
      try {
        setLoading(true);
        
        if (!sellerId) {
          toast.error('Seller ID not found');
          navigate('/seller-form');
          return;
        }
        
        const sellerDocRef = doc(db, 'sellers', sellerId);
        // First fetch to initialize
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          // If 'verified' doesn't exist, set it to false by default
          if (sellerDoc.data().verified === undefined) {
            await updateDoc(sellerDocRef, {
              verified: false,
              registrationDate: new Date().toISOString()
            });
            setSellerInfo({
              ...sellerDoc.data(),
              verified: false,
              registrationDate: new Date().toISOString()
            });
          } else {
            setSellerInfo(sellerDoc.data());
          }
        } else {
          toast.error('Seller profile not found');
        }
        
        // Set up real-time listener
        unsubscribe = onSnapshot(sellerDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const updatedData = docSnapshot.data();
            // Show toast notification when verification status changes
            if (sellerInfo && updatedData.verified !== sellerInfo.verified) {
              if (updatedData.verified === true) {
                toast.success('Account has been verified! Products can now be added.');
              } else {
                toast.info('Verification status has changed. Contact support for more information.');
              }
            }
            setSellerInfo(updatedData);
          }
        });
        
      } catch (error) {
        console.error('Error fetching seller info:', error);
        toast.error('Failed to load seller profile');
      } finally {
        setLoading(false);
      }
    };

    setupSellerProfile();
    return () => unsubscribe();
  }, [navigate, urlSellerId, sellerId]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('sellerId');
      toast.success('Logged out successfully');
      navigate('/seller-form');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin/sellers');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find this seller profile.</p>
          {isAdmin ? (
            <button 
              onClick={handleBackToAdmin} 
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Back to Admin Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/seller-form')} 
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Registration
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isAdmin && urlSellerId && (
          <div className="max-w-4xl mx-auto mb-4">
            {/* Admin-specific navigation can be placed here */}
          </div>
        )}
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-3xl font-bold">
                {isAdmin && urlSellerId ? 'Seller Profile' : 'Seller Dashboard'}
              </h1>
              <div className="flex flex-wrap gap-2">
                {/* Dynamically open the dashboard for this seller */}
                {sellerInfo.verified === true && (
                  <button
                    onClick={() => navigate(`/seller-dashboard/${sellerId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Access Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className={`px-6 py-4 ${
            sellerInfo.verified === true 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : 'bg-amber-50 border-l-4 border-amber-500'
          }`}>
            <div className="flex items-center">
              {sellerInfo.verified === true ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Verified Seller</p>
                    <p className="text-sm text-green-700">This account has been verified. Products can now be sold on the platform.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-3" />
                  <div>
                    <p className="font-medium text-amber-800">Verification Pending</p>
                    <p className="text-sm text-amber-700">This account is under review. Products can be sold once verified.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-800 font-medium">{sellerInfo.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800">{sellerInfo.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-800">{sellerInfo.phoneNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-gray-800">{new Date(sellerInfo.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Number</label>
                  <p className="text-gray-800">{sellerInfo.accountNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">IFSC Code</label>
                  <p className="text-gray-800">{sellerInfo.ifscCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Branch Name</label>
                  <p className="text-gray-800">{sellerInfo.branchName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tax Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">GST Number</label>
                <p className="text-gray-800">{sellerInfo.gstNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">PAN Number</label>
                <p className="text-gray-800">{sellerInfo.panNumber}</p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          {sellerInfo.verified === true ? (
            <div className="px-6 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Products</h2>
                {!isAdmin && (
                  <button
                    onClick={() => navigate('/add-product')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add New Product
                  </button>
                )}
              </div>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'This seller can manage and sell products on the platform.' 
                  : 'You can now manage and sell your products on our platform.'}
              </p>
            </div>
          ) : (
            <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-700">Product Management</h3>
                  <p className="text-sm text-gray-500">
                    {isAdmin 
                      ? 'This seller will be able to add products once verified.' 
                      : 'You\'ll be able to add and manage products once your account is verified.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerProfile;
