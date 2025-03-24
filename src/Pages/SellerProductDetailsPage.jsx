import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ShoppingCart, Star, Heart, Tag, Truck, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from "../components/Navbar";
import Footer from "../components/Footer";

const SellerProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkWishlistStatus();
      }
    });
    return () => unsubscribe();
  }, [productId]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() });
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const q = query(wishlistRef, where('productId', '==', productId));
      const wishlistSnapshot = await getDocs(q);
      setIsInWishlist(!wishlistSnapshot.empty);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.warning('Please sign in to add items to your cart');
      navigate('/account');
      return;
    }

    if (!product.inStock) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      const cartCollection = collection(db, 'users', user.uid, 'cart');
      const cartItemData = {
        productId: product.id,
        name: product.productName,
        price: product.price,
        image: product.imageUrl,
        quantity: quantity,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        addedAt: new Date()
      };
      
      await addDoc(cartCollection, cartItemData);
      toast.success(`${product.productName} added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.warning('Please sign in to manage your wishlist');
      navigate('/account');
      return;
    }

    if (!product.inStock) {
      toast.error('Out of stock items cannot be added to wishlist');
      return;
    }

    try {
      setAddingToWishlist(true);

      if (isInWishlist) {
        // Remove from wishlist
        const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
        const q = query(wishlistRef, where('productId', '==', productId));
        const wishlistSnapshot = await getDocs(q);
        
        if (!wishlistSnapshot.empty) {
          const docToDelete = wishlistSnapshot.docs[0];
          await deleteDoc(doc(db, 'users', user.uid, 'wishlist', docToDelete.id));
          setIsInWishlist(false);
          toast.info(`${product.productName} removed from wishlist`);
        }
      } else {
        // Add to wishlist
        const wishlistCollection = collection(db, 'users', user.uid, 'wishlist');
        await addDoc(wishlistCollection, {
          productId: product.id,
          name: product.productName,
          image: product.imageUrl,
          currentPrice: product.price,
          originalPrice: product.originalPrice,
          description: product.description,
          addedAt: new Date()
        });
        setIsInWishlist(true);
        toast.success(`${product.productName} added to wishlist`);
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, 10)));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 text-center py-10">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 mb-4"></div>
            <div className="h-8 bg-gray-300 w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 w-1/2 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 text-center py-10 text-red-600">
          {error}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.productName} 
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
            
            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              disabled={addingToWishlist}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isInWishlist 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {addingToWishlist ? (
                <span className="animate-spin h-5 w-5 border-2 border-current rounded-full border-t-transparent"></span>
              ) : (
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">(0 reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">{product.description}</p>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-green-600">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-gray-500 line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => handleQuantityChange(-1)} 
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)} 
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart}
                  className={`flex items-center gap-2 px-6 py-2 rounded transition-colors ${
                    product.inStock 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {addingToCart ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-500" />
                  <span>Category: {product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-500" />
                  <span>Seller: {product.sellerName || 'Unknown Seller'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerProductDetailsPage;