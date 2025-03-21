import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const ProductRating = ({ productId, currentRating = 0 }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUserRating = async () => {
      if (!auth.currentUser) return;
      try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(
          ratingsRef,
          where('productId', '==', productId),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userRatingDoc = snapshot.docs[0].data();
          setUserRating(userRatingDoc.rating);
          setHasRated(true);
        }
        // Get total ratings
        const allRatingsQuery = query(ratingsRef, where('productId', '==', productId));
        const allRatingsSnapshot = await getDocs(allRatingsQuery);
        setTotalRatings(allRatingsSnapshot.size);
      } catch (error) {
        console.error('Error checking user rating:', error);
      }
    };
    checkUserRating();
  }, [productId]);

  const submitRating = async (selectedRating) => {
    if (!auth.currentUser) {
      toast.error('Please login to rate this product');
      return;
    }
    setIsLoading(true);
    try {
      const ratingsRef = collection(db, 'ratings');
      // Check if user has already rated
      const q = query(
        ratingsRef,
        where('productId', '==', productId),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        toast.info('You have already rated this product');
        return;
      }
      // Add new rating
      await addDoc(ratingsRef, {
        productId,
        userId: auth.currentUser.uid,
        rating: selectedRating,
        timestamp: new Date()
      });
      // Update product's average rating
      const allRatingsQuery = query(ratingsRef, where('productId', '==', productId));
      const allRatingsSnapshot = await getDocs(allRatingsQuery);
      let totalRating = selectedRating;
      allRatingsSnapshot.forEach(doc => {
        if (doc.data().userId !== auth.currentUser.uid) {
          totalRating += doc.data().rating;
        }
      });
      const averageRating = totalRating / (allRatingsSnapshot.size + 1);
      // Update product document
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ratings: averageRating
      });
      setHasRated(true);
      setUserRating(selectedRating);
      setTotalRatings(prev => prev + 1);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-left space-y-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={hasRated || isLoading}
            onClick={() => submitRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`focus:outline-none ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= (hover || rating || userRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      <div className="text-sm text-blue-600 text-center">
        {hasRated ? (
          <p>Your rating: {userRating}/5</p>
        ) : (
          <p>Rate this product</p>
        )}
        <p className="text-xs mt-1">
          Average rating: {currentRating.toFixed(1)}/5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </p>
      </div>
      
      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Submitting...</span>
        </div>
      )}
    </div>
  );
};

const ProductComponent = ({ 
  products = [], 
  showAllProductsLink = false, 
  totalProductCount = 0,
  isAllProductsPage = false 
}) => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    if (user) {
      const fetchUserData = async () => {
        try {
          const cartCollection = collection(db, 'users', user.uid, 'cart');
          const cartSnapshot = await getDocs(cartCollection);
          setCartCount(cartSnapshot.size);

          const wishlistCollection = collection(db, 'users', user.uid, 'wishlist');
          const wishlistSnapshot = await getDocs(wishlistCollection);
          const wishlistProductIds = new Set(
            wishlistSnapshot.docs.map(doc => doc.data().productId)
          );
          setWishlistItems(wishlistProductIds);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
    return () => unsubscribeAuth();
  }, [user]);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/account');
      return;
    }
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    try {
      const cartCollection = collection(db, 'users', user.uid, 'cart');
      const q = query(cartCollection, where('productId', '==', product.id));
      const cartSnapshot = await getDocs(q);
      if (!cartSnapshot.empty) {
        toast.info('Item is already in your cart!');
        return;
      }
      await addDoc(cartCollection, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      toast.success('Item added to cart!');
      setCartCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!user) {
      navigate('/account');
      return;
    }
    if (!product.inStock) {
      toast.error('Out of stock items cannot be added to wishlist');
      return;
    }
    try {
      const wishlistCollection = collection(db, 'users', user.uid, 'wishlist');
      if (wishlistItems.has(product.id)) {
        toast.info('Item is already in your wishlist!');
        return;
      }
      await addDoc(wishlistCollection, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        inStock: product.inStock
      });
      setWishlistItems(prev => new Set([...prev, product.id]));
      toast.success('Item added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 bg-neutral-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-thin text-blue-800">
          {isAllProductsPage ? 'All Products' : 'Our Collection'}
        </h1>
        {user && (
          <div className="flex space-x-4">
            <Link 
              to="/wishlist" 
              className="flex items-center text-blue-600 hover:text-black transition-colors"
            >
              <Heart className="w-5 h-5 mr-2" />
              Wishlist ({wishlistItems.size})
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center text-blue-600 hover:text-black transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cartCount})
            </Link>
          </div>
        )}
      </div>

      {/* Dropdown to filter by category */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Electrical">Electrical</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-neutral-500">No products available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative">
                  <Link to={`/productDetails/${product.id}`} className="block">
                    <img 
                      src={product.image || 'vite.svg'} 
                      alt={product.name} 
                      className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <button 
                    onClick={() => handleAddToWishlist(product)} 
                    className={`absolute top-3 right-3 p-2 rounded-full ${
                      wishlistItems.has(product.id) 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-white/80 text-neutral-500'
                    } hover:bg-red-100 hover:text-red-500 transition-colors`}
                    disabled={!product.inStock}
                  >
                    <Heart 
                      className="w-5 h-5" 
                      fill={wishlistItems.has(product.id) ? "currentColor" : "none"} 
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2 truncate">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-semibold text-blue-900 mr-2">
                        ₹{parseFloat(product.price || 0).toFixed(2)}
                      </span>
                      <span className="text-sm text-blue-500 line-through">
                        ₹{parseFloat(product.originalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                    <ProductRating 
                      productId={product.id} 
                      currentRating={product.ratings} 
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/productDetails/${product.id}`} 
                      className="hidden md:inline-block py-2 px-4 rounded-md text-white bg-blue-800 hover:bg-blue-700 transition-colors"
                    >
                      Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className={`flex-1 py-2 rounded-md text-white transition-colors ${
                        product.inStock 
                          ? 'bg-blue-800 hover:bg-blue-700' 
                          : 'bg-neutral-400 cursor-not-allowed'
                      }`}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAllProductsLink && (
            <div className="text-center mt-8">
              <Link 
                to="/products" 
                className="px-6 py-3 bg-blue-800 text-white rounded-md hover:bg-neutral-700 transition-colors"
              >
                View All Products
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductComponent;
