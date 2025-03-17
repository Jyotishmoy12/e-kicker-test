import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductComponent from '../components/ProductComponent';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from Firestore...");
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        
        if (productSnapshot.empty) {
          console.warn("No products found in Firestore!");
        }
  
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        console.log("Fetched Products:", productList);
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    fetchProducts();
  }, []);
  
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ProductComponent products={products} isAllProductsPage={true}/>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default ProductsPage;