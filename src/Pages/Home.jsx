import React, { useState, useEffect } from 'react'
import Navbar from "../components/Navbar"
import ImageCarousel from '../components/ImageCarousel'
import ProductComponent from '../components/ProductComponent'
import Footer from '../components/Footer'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'
const Home = () => {
  const [products, setProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: parseFloat(doc.data().price || 0),
          originalPrice: parseFloat(doc.data().originalPrice || 0),
          ratings: parseFloat(doc.data().ratings || 0)
        }));

        setProducts(productList);
        setDisplayProducts(productList.slice(0, 4)); // Display first 4 products on home page
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar/>
      <ImageCarousel/>
      <ProductComponent products={displayProducts} showAllProductsLink={products.length > 4} totalProductCount={products.length}/>
      <Footer/>
    </>
  )
}

export default Home;