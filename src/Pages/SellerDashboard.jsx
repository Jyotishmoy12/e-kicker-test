import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle,  } from 'lucide-react';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import SellerProductManagement from '../components/SellerProductManagement';

const SellerDashboard = () => {
  const [sellerInfo, setSellerInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const { sellerId: paramSellerId } = useParams();

  // Determine which sellerId to use: URL param or current user's UID.
  const sellerId = paramSellerId || (auth.currentUser && auth.currentUser.uid);

  // Fetch seller information
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        if (!sellerId) {
          toast.error("Please log in first.");
          navigate("/seller-form");
          return;
        }
        const sellerRef = doc(db, "sellers", sellerId);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSellerInfo(sellerSnap.data());
        } else {
          toast.error("Seller profile not found.");
          navigate("/seller-form");
        }
      } catch (error) {
        console.error("Error fetching seller info:", error);
        toast.error("Failed to load seller information.");
      } finally {
        setLoadingSeller(false);
      }
    };

    fetchSellerInfo();
  }, [sellerId, navigate]);

  // Fetch products for the given seller
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!sellerId) return;
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("sellerId", "==", sellerId));
        const productsSnap = await getDocs(q);
        const productsList = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [sellerId]);

  if (loadingSeller || loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="container mx-auto p-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
        {sellerInfo.verified ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-2" />
            <p className="font-semibold">
              Welcome, {sellerInfo.fullName}! Your account is verified.
            </p>
          </div>
        ) : (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="mr-2" />
            <p className="font-semibold">
              Welcome, {sellerInfo.fullName}! Your account is not verified yet.
            </p>
          </div>
        )}
      </div>
      <SellerProductManagement/>
      </div>
      <Footer/>
    </>
  );
};

export default SellerDashboard;
