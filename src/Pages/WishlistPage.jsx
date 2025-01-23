import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowRight, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar"


const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) {
        navigate('/account');
        return;
      }

      try {
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        const productsData = {};
        productsSnapshot.docs.forEach(doc => {
          productsData[doc.id] = { id: doc.id, ...doc.data() };
        });

        const wishlistCollection = collection(db, 'users', auth.currentUser.uid, 'wishlist');
        const wishlistSnapshot = await getDocs(wishlistCollection);
        const items = wishlistSnapshot.docs.map(doc => {
          const productData = productsData[doc.data().productId] || {};
          return {
            docId: doc.id,
            ...doc.data(),
            inStock: productData.inStock,
            currentPrice: productData.price,
            originalPrice: productData.originalPrice,
            description: productData.description,
            ratings: productData.ratings
          };
        });
        
        // Filter out any out-of-stock items
        const inStockItems = items.filter(item => item.inStock);
        if (items.length !== inStockItems.length) {
          const removePromises = items
            .filter(item => !item.inStock)
            .map(item => deleteDoc(doc(db, 'users', auth.currentUser.uid, 'wishlist', item.docId)));
          await Promise.all(removePromises);
          toast.info('Some items were removed from your wishlist because they are out of stock');
        }
        
        setWishlistItems(inStockItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load wishlist');
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemoveFromWishlist = async (docId) => {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'wishlist', docId));
      setWishlistItems(prev => prev.filter(item => item.docId !== docId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      const cartCollection = collection(db, 'users', auth.currentUser.uid, 'cart');
      await addDoc(cartCollection, {
        productId: item.productId,
        name: item.name,
        price: item.currentPrice,
        image: item.image,
        quantity: 1
      });

      await handleRemoveFromWishlist(item.docId);
      toast.success('Item moved to cart');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move item to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            Continue Shopping
          </button>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Heart className="w-16 h-16 text-gray-400" />
              <p className="text-gray-600 text-lg">Your wishlist is empty</p>
              <p className="text-gray-500">Add items you like to your wishlist and they will show up here</p>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mt-4"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.docId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative group">
                  <img
                    src={item.image || '/vite.svg'}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-800">₹{item.currentPrice?.toFixed(2)}</span>
                      {item.originalPrice && item.originalPrice > item.currentPrice && (
                        <span className="text-sm line-through text-gray-500">₹{item.originalPrice?.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {item.ratings !== undefined && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= item.ratings
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({item.ratings.toFixed(1)})</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Move to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.docId)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
