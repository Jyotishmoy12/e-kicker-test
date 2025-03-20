import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const location = useLocation();
  const auth = getAuth();
  const db = getFirestore();

  const searchVisibleRoutes = ['/', '/products'];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
        setUserEmail(user.email);
        localStorage.setItem('userEmail', user.email);
        try {
          const cartCollection = collection(db, 'users', user.uid, 'cart');
          const cartSnapshot = await getDocs(cartCollection);
          setCartCount(cartSnapshot.size);
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      } else {
        setUserEmail(null);
        localStorage.removeItem('userEmail');
        setCartCount(0);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Process search term for better matching
  const processSearchTerm = (term) => {
    // Convert to lowercase and remove extra spaces
    const processed = term.toLowerCase().trim();
    // Split into tokens (words, numbers, etc.)
    return {
      fullTerm: processed,
      tokens: processed.split(/\s+/),
    };
  };

  // Score a product based on how well it matches the search term
  const scoreProduct = (product, searchInfo) => {
    const { fullTerm, tokens } = searchInfo;
    const productName = product.name?.toLowerCase() || '';
    const productCategory = product.category?.toLowerCase() || '';
    const productDescription = product.description?.toLowerCase() || '';
    const productSku = product.sku?.toLowerCase() || '';
    const productModel = product.model?.toLowerCase() || '';
    const productKeywords = product.keywords?.map(k => k.toLowerCase()) || [];
    
    let score = 0;
    
    // Exact match gives highest score
    if (productName === fullTerm) score += 100;
    if (productCategory === fullTerm) score += 50;
    
    // Check if product name starts with search term
    if (productName.startsWith(fullTerm)) score += 75;
    
    // Check if any field contains the full search term
    if (productName.includes(fullTerm)) score += 60;
    if (productCategory.includes(fullTerm)) score += 40;
    if (productDescription.includes(fullTerm)) score += 30;
    if (productSku.includes(fullTerm)) score += 45;
    if (productModel.includes(fullTerm)) score += 45;
    
    // Check for token matches in product name
    let tokenMatches = 0;
    tokens.forEach(token => {
      if (token.length < 2) return; // Skip very short tokens
      
      if (productName.includes(token)) tokenMatches++;
      if (productCategory.includes(token)) tokenMatches += 0.5;
      if (productDescription.includes(token)) tokenMatches += 0.3;
      if (productSku.includes(token)) tokenMatches += 0.7;
      if (productModel.includes(token)) tokenMatches += 0.7;
      
      // Check if keywords match
      if (productKeywords.some(keyword => keyword.includes(token))) {
        tokenMatches += 0.8;
      }
    });
    
    // Add token match score - higher % of matches = higher score
    if (tokens.length > 0) {
      score += (tokenMatches / tokens.length) * 50;
    }
    
    return score;
  };

  const handleSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchInfo = processSearchTerm(term);
      const productsRef = collection(db, 'products');
      
      // Get all products for advanced filtering
      // In a real production app, you might want to limit this somehow
      // or implement server-side search for larger catalogs
      const snapshot = await getDocs(productsRef);
      
      const allProducts = [];
      snapshot.forEach((doc) => {
        allProducts.push({ id: doc.id, ...doc.data() });
      });
      
      // Score and filter products
      const scoredProducts = allProducts
        .map(product => ({
          ...product,
          score: scoreProduct(product, searchInfo)
        }))
        .filter(product => product.score > 0)  // Only keep products with a match
        .sort((a, b) => b.score - a.score)     // Sort by score descending
        .slice(0, 8);                          // Limit to top 8 results
      
      setSearchResults(scoredProducts);
      setShowSearchResults(scoredProducts.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Set new timeout to debounce search
    searchDebounceRef.current = setTimeout(() => {
      handleSearch(term);
    }, 300); // 300ms debounce
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleResultClick = (productId) => {
    // Only close if user explicitly chooses to
    clearSearch();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/r&d', label: 'Research' },
    { to: '/account', label: 'Account' },
    {to:'/profile', label:"Profile"},
    ...(userEmail === 'admfouekicker@gmail.com' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setUserEmail(null);
        localStorage.removeItem('userEmail');
      })
      .catch((error) => {
        console.error('Logout error: ', error);
      });
  };

  // Highlight matching text in search results
  const highlightMatch = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    const lowerText = text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    if (!lowerText.includes(lowerSearchTerm)) return text;
    
    const startIndex = lowerText.indexOf(lowerSearchTerm);
    const endIndex = startIndex + lowerSearchTerm.length;
    
    return (
      <>
        {text.substring(0, startIndex)}
        <span className="bg-yellow-200 text-blue-900 font-bold px-0.5 rounded">
          {text.substring(startIndex, endIndex)}
        </span>
        {text.substring(endIndex)}
      </>
    );
  };

  return (
    <header className="bg-gradient-to-r from-blue-100 to-blue-200 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-between py-4 px-6">
        {/* Logo with enhanced hover effect */}
        <div className="flex items-center">
          <Link to='/'>
          <img
            className="h-20 w-40 mr-6 rounded-lg"
            src="/e-kickerhd.png"
            alt="logo"
          />
          </Link>
          
        </div>

        {/* Search Bar with enhanced styling */}
        {searchVisibleRoutes.includes(location.pathname) && (
          <div className="flex-grow max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products, models, or part numbers..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm && setShowSearchResults(true)}
                className="w-full pl-10 pr-10 py-3 border-2 border-blue-300 rounded-full 
                           focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent
                           bg-white/70 backdrop-blur-sm shadow-md
                           transition-all duration-300 text-sm 
                           group-hover:shadow-lg"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="text-blue-500 w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="text-gray-500 w-6 h-6 hover:text-red-500 hover:scale-125 transition-all" />
                </button>
              )}
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto animate-fade-in">
                <div className="sticky top-0 bg-blue-100 p-3 flex justify-between items-center border-b border-blue-200 rounded-t-xl">
                  <span className="text-sm font-bold text-blue-900">Search Results</span>
                  <button 
                    onClick={() => setShowSearchResults(false)}
                    className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-blue-800" />
                  </button>
                </div>
                {searchResults.map((product) => (
                  <Link
                    to={`/productDetails/${product.id}`}
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="flex items-center p-4 hover:bg-blue-50 
                               transition-colors duration-200 border-b last:border-b-0 
                               hover:shadow-inner group"
                  >
                    <img
                      src={product.image || 'default-image.png'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-grow">
                      <h3 className="font-bold text-blue-900 text-base group-hover:text-blue-700">
                        {highlightMatch(product.name, searchTerm)}
                      </h3>
                      <p className="text-sm text-gray-600 font-semibold">₹
                      {product.price?.toFixed(2) || '0.00'}</p>
                      {product.model && (
                        <p className="text-xs text-gray-500">Model: {highlightMatch(product.model, searchTerm)}</p>
                      )}
                      {product.category && (
                        <p className="text-xs text-gray-500">Category: {highlightMatch(product.category, searchTerm)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button with enhanced styling */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="text-blue-800 focus:outline-none bg-blue-100 p-2 rounded-full 
                       hover:bg-blue-200 transition-colors shadow-md"
          >
            {isMenuOpen ? <X size={24} className="animate-rotate-in" /> : <Menu size={24} className="animate-fade-in" />}
          </button>
        </div>

        {/* Desktop Navigation with enhanced styling */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <Link 
                  to={to} 
                  className="text-blue-900 font-bold tracking-wide 
                             hover:text-blue-600 transition-colors duration-300 
                             relative pb-1 group"
                >
                  {label}
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-600 
                                   group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            ))}
            <li>
              <Link 
                to="/cart" 
                className="bg-blue-600 text-white px-4 py-2 rounded-full 
                           hover:bg-blue-700 transition-colors flex items-center 
                           text-sm relative shadow-md hover:shadow-lg group"
              >
                <ShoppingCart className="mr-2 w-5 h-5 group-hover:animate-bounce" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 
                                   text-xs flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            {userEmail && userEmail !== 'admfouekicker@gmail.com' && location.pathname === '/' && (
              <li>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-full 
                             hover:bg-red-600 transition-colors shadow-md 
                             hover:shadow-lg active:scale-95"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation Menu with enhanced styling */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-gradient-to-br from-blue-100 to-blue-200 
                          md:hidden shadow-2xl z-20 animate-slide-in">
            <ul className="flex flex-col items-center py-6 space-y-6">
              {navItems.map(({ to, label }) => (
                <li key={to} className="w-full text-center">
                  <Link 
                    to={to} 
                    onClick={toggleMenu}
                    className="text-blue-900 font-bold tracking-wide block py-2 
                               hover:bg-blue-200 transition-colors group relative"
                  >
                    {label}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 
                                     bg-blue-600 group-hover:w-1/2 transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/cart" 
                  onClick={toggleMenu}
                  className="bg-blue-600 text-white px-6 py-3 rounded-full 
                             hover:bg-blue-700 transition-colors flex items-center 
                             text-base relative shadow-md group"
                >
                  <ShoppingCart className="mr-3 w-6 h-6 group-hover:animate-bounce" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white 
                                     rounded-full w-7 h-7 text-xs flex items-center 
                                     justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              {userEmail && userEmail !== 'admfouekicker@gmail.com' && location.pathname === '/' && (
                <li>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-3 rounded-full 
                               hover:bg-red-600 transition-colors shadow-md 
                               active:scale-95"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;