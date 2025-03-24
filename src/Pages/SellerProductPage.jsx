import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { ShoppingCart, Circle } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from "../components/Navbar"
import Footer from "../components/Footer"

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all seller products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from Firebase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Base query for fetching products
      let productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

      if (inStockOnly) {
        productsQuery = query(productsQuery, where('inStock', '==', true));
      }

      const querySnapshot = await getDocs(productsQuery);

      // Read `sellerName` directly from Firestore (already stored with each product)
      const productsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        sellerName: docSnap.data().sellerName || 'Unknown Seller' // Ensures `sellerName` is always available
      }));

      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding product to cart
  const addToCart = async (product) => {
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
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));

      // Check if the product is already in the cart
      const cartCollection = collection(db, 'users', user.uid, 'cart');
      const cartSnapshot = await getDocs(cartCollection);
      const cartItems = cartSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const existingCartItem = cartItems.find(item => item.productId === product.id);

      if (existingCartItem) {
        // Update quantity if already in cart
        const cartItemRef = doc(db, 'users', user.uid, 'cart', existingCartItem.id);
        await setDoc(cartItemRef, {
          ...existingCartItem,
          quantity: existingCartItem.quantity + 1
        });
        toast.success(`${product.productName} quantity updated in your cart`);
      } else {
        // Add new item to cart
        const cartItemData = {
          productId: product.id,
          name: product.productName,
          price: product.price,
          image: product.imageUrl,
          quantity: 1,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          addedAt: new Date()
        };

        await addDoc(collection(db, 'users', user.uid, 'cart'), cartItemData);
        toast.success(`${product.productName} added to your cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Filter and sort products based on user selections
  const filteredProducts = products
    .filter(product => {
      // Filter by category
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !product.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by stock status
      if (inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate());
        case 'oldest':
          return new Date(a.createdAt?.toDate()) - new Date(b.createdAt?.toDate());
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  // Get unique categories from all products
  const categories = ['all', ...new Set(products.map(product => product.category))];

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">All Seller Products</h1>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block mb-1 text-sm font-medium">Search Products</label>
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block mb-1 text-sm font-medium">Sort By</label>
              <select
                className="w-full p-2 border rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                  className="mr-2"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded overflow-hidden bg-white shadow hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg truncate flex-grow">{product.productName}</h3>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm text-gray-700">Seller:</span>
                    <span className="text-sm font-medium text-blue-600">{product.sellerName}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">₹{product.price.toFixed(2)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-gray-500 line-through text-sm">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}

                    {product.originalPrice > product.price && (
                      <span className="text-green-600 text-sm">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>
                 {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* View Details Button */}
                    <button
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View Details
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      className={`flex-1 py-2 rounded flex items-center justify-center gap-1 transition-colors ${product.inStock
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      onClick={() => product.inStock && addToCart(product)}
                      disabled={!product.inStock || addingToCart[product.id]}
                    >
                      {addingToCart[product.id] ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></span>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SellerProductsPage;