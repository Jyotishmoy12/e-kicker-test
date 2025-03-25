import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ProductManagement from '../components/ProductManagement';
import DocumentUpload from '../components/DocumentUpload';
import Footer from '../components/Footer';
import Header from '../components/Navbar';
import AdminOrders from '../components/AdminOrders';
import SellerProfiles from '../components/SellersInfo';
import ServiceProviderComponent from '../components/ServiceProviderComponent';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  Users, 
  Briefcase, 
  Menu, 
  X , 
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser && loggedInUser.email === 'admfouekicker@gmail.com') {
        setUser(loggedInUser);
      } else {
        navigate('/account');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/account');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Tab configuration with icons
  const tabs = [
    { 
      key: 'products', 
      label: 'Manage Products', 
      icon: <Package size={20} /> 
    },
    { 
      key: 'documents', 
      label: 'Upload Docs', 
      icon: <FileText size={20} /> 
    },
    { 
      key: 'orders', 
      label: 'Orders', 
      icon: <ShoppingCart size={20} /> 
    },
    { 
      key: 'sellers', 
      label: 'Sellers', 
      icon: <Users size={20} /> 
    },
    { 
      key: 'service_providers', 
      label: 'Service Providers', 
      icon: <Briefcase size={20} /> 
    }
  ];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-blue-800"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Logout Button */}
        <div className="hidden lg:flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Mobile & Desktop Navigation */}
          <nav className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'} 
            lg:block 
            lg:w-1/5 
            lg:mr-6 
            mb-4 
            lg:mb-0
          `}>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full 
                    flex 
                    items-center 
                    p-3 
                    border-b 
                    last:border-b-0 
                    hover:bg-blue-50 
                    transition 
                    ${activeTab === tab.key 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-700'}
                  `}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              
              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="lg:hidden w-full flex items-center p-3 text-red-500 hover:bg-red-50"
              >
                <span className="mr-3">
                  <LogOut size={20} />
                </span>
                Logout
              </button>
            </div>
          </nav>

          {/* Content Area */}
          <main className="w-full lg:w-4/5 bg-white shadow-md rounded-lg p-4">
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'documents' && <DocumentUpload />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'sellers' && <SellerProfiles />}
            {activeTab === 'service_providers' && <ServiceProviderComponent />}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;