import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  Truck, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  XCircle
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { toast } from 'react-toastify';
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    // Check user authentication
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Fetch specific product details from Firestore
    const fetchProductDetails = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = {
            id: productSnap.id,
            ...productSnap.data(),
            price: parseFloat(productSnap.data().price || 0),
            originalPrice: parseFloat(productSnap.data().originalPrice || 0),
            ratings: parseFloat(productSnap.data().ratings || 0),
            // Ensure images is an array, fallback to empty array
            inStock: productSnap.data().inStock ?? true,
            images: productSnap.data().images || [productSnap.data().image || '/vite.svg']
            
          };
          setProduct(productData);
        } else {
          console.error('No such product!');
          navigate('/products');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setLoading(false);
        navigate('/products');
      }
    };

    fetchProductDetails();

    // Cleanup subscription
    return () => unsubscribe();
  }, [id, navigate]);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };


  const handleImageChange = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        (prev + 1) % product.images.length
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleAddToCart = async () => {
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
      await addDoc(cartCollection, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity
      });
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/account');
      return;
    }
    if (!product.inStock) {
      toast.error('Cannot add out of stock items to wishlist');
      return;
    }
    try {
      const wishlistCollection = collection(db, 'users', user.uid, 'wishlist');
      await addDoc(wishlistCollection, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
      toast.success('Item added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center mt-8">Product not found</div>;
  }

  return (
    <>
    <Navbar/>
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="relative">
          <div 
            className="relative overflow-hidden rounded-lg shadow-lg cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            ref={imageRef}
            style={{ height: '500px' }}
          >
            {/* Stock Status Badge */}
            <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-white ${
              product.inStock ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>

            <img 
              src={product.images[currentImageIndex]} 
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-[500px] object-cover"
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transition: isZoomed ? 'none' : 'transform 0.3s ease'
              }}
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                e.target.src = '/vite.svg';
              }}
            />
            {!isZoomed && product.images.length > 1 && (
              <>
                <button 
                  onClick={() => handleImageChange('prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full"
                >
                  <ChevronLeft />
                </button>
                <button 
                  onClick={() => handleImageChange('next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4 overflow-x-auto">
              {product.images.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer transition-all
                    ${currentImageIndex === index ? 'border-2 border-blue-500' : 'opacity-50 hover:opacity-75'}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>


        {/* Product Information Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={i < Math.floor(product.ratings) ? 'fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              ({product.ratings.toFixed(1)} Rating)
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-4 flex items-center">
            <span className="text-3xl font-bold text-blue-600">₹{product.price.toFixed(2)}</span>
            <span className="ml-4 line-through text-gray-500">₹{product.originalPrice.toFixed(2)}</span>
            <span className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {((1 - product.price / product.originalPrice) * 100).toFixed(0)}% OFF
            </span>
          </div>

          {/* Product Description */}
          {/* <p className="mt-4 text-gray-600">{product.description}</p> */}

          {/* Product Highlights */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              {product.inStock ? (
                <>
                  <Check className="mr-2 text-green-500" />
                  <span className="text-green-700">In Stock and Ready to Ship</span>
                </>
              ) : (
                <>
                  <XCircle className="mr-2 text-red-500" />
                  <span className="text-red-700">Currently Out of Stock</span>
                </>
              )}
            </div>
            <div className="flex items-center">
              <Truck className="mr-2 text-blue-500" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center">
              <Shield className="mr-2 text-purple-500" />
              <span>Easy Replacement</span>
            </div>
          </div>


          {/* Quantity Selector */}
          <div className="mt-6 flex items-center space-x-4">
            <span>Quantity:</span>
            <div className="flex items-center border rounded">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 bg-gray-100"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
          <button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center px-6 py-3 rounded-lg transition ${
              product.inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="mr-2" /> 
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button 
            onClick={handleAddToWishlist}
            disabled={!product.inStock}
            className={`flex items-center border px-6 py-3 rounded-lg transition ${
              product.inStock 
                ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                : 'border-gray-400 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Heart className="mr-2" /> Add to Wishlist
          </button>
        </div>
        </div>
      </div>

      {/* Additional Product Details */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700">{product.longDescription || product.description}</p>
        </div>

        {/* Additional Specifications or Features if available */}
        {(product.specifications || product.features) && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
            {product.specifications && (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded shadow-sm">
                    <h4 className="font-medium text-gray-700 capitalize">{key}</h4>
                    <p className="text-gray-600">{value}</p>
                  </div>
                ))}
              </div>
            )}
            {product.features && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    
    <Footer/>
    </>
  );
};

export default ProductDetails;