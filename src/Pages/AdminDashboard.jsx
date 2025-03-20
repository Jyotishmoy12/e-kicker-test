import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ProductManagement from '../components/ProductManagement';
import DocumentUpload from '../components/DocumentUpload';
import Footer from '../components/Footer';
import Header from '../components/Navbar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // Default to "Manage Products"
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // **Persistent Admin Authentication Check**
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser && loggedInUser.email === 'admfouekicker@gmail.com') {
        setUser(loggedInUser);
      } else {
        navigate('/account'); // Redirect unauthorized users
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
    <Header/>
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`py-2 px-4 ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Upload Documents
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && <ProductManagement />}
      {activeTab === 'documents' && <DocumentUpload />}
    </div>
    <Footer/>
    </>
  );
};

export default AdminDashboard;
