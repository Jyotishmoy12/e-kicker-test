import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ArrowLeft, History, Bookmark } from 'lucide-react';
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
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('recentSearches') || '[]')
  );
  const [savedProducts, setSavedProducts] = useState(
    JSON.parse(localStorage.getItem('savedProducts') || '[]')
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const saveSearchTerm = (term) => {
    if (!term || term.length < 2) return;

    // Add to recent searches
    const newRecentSearches = [
      term,
      ...recentSearches.filter(s => s !== term) // Remove duplicates
    ].slice(0, 5); // Keep only 5 most recent

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const clearSearch = () => {
    if (searchTerm) {
      saveSearchTerm(searchTerm);
    }
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const useRecentSearch = (term) => {
    setSearchTerm(term);
    handleSearch(term);
    setSearchFocused(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const saveProduct = (product) => {
    const newSavedProducts = [
      product,
      ...savedProducts.filter(p => p.id !== product.id)
    ].slice(0, 10); // Keep only 10 most recent

    setSavedProducts(newSavedProducts);
    localStorage.setItem('savedProducts', JSON.stringify(newSavedProducts));
  };

  const removeSavedProduct = (productId) => {
    const newSavedProducts = savedProducts.filter(p => p.id !== productId);
    setSavedProducts(newSavedProducts);
    localStorage.setItem('savedProducts', JSON.stringify(newSavedProducts));
  };

  const isProductSaved = (productId) => {
    return savedProducts.some(p => p.id === productId);
  };

  const handleResultClick = (product) => {
    saveSearchTerm(searchTerm);
    clearSearch();
  };

  // Click outside handler with exceptions for UI elements that shouldn't close the search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        !event.target.closest('.search-result-persistent')
      ) {
        setShowSearchResults(false);
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSearchResults) return;

      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchResults]);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/r&d', label: 'Research' },
    { to: '/account', label: 'Account' },
    { to: '/profile', label: "Profile" },
    { to: '/seller-form', label: 'Become a seller' },
    
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
              className="h-20 w-40 mr-6 "
              src="/e-kickerhd.png"
              alt="logo"
            />
          </Link>
        </div>

        {/* Search Bar with enhanced styling */}
        {searchVisibleRoutes.includes(location.pathname) && (
          <div className={`flex-grow max-w-md mx-4 relative ${searchFocused ? 'z-50' : 'z-40'}`} ref={searchRef}>
            <div className="relative group">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, models, or part numbers..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchTerm) setShowSearchResults(true);
                }}
                className={`w-full pl-10 pr-10 py-3 border-2 ${searchFocused ? 'border-blue-500 ring-4 ring-blue-500/30' : 'border-blue-300'} rounded-full 
                           focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent
                           bg-white/70 backdrop-blur-sm shadow-md
                           transition-all duration-300 text-sm 
                           group-hover:shadow-lg`}
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

            {searchFocused && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-[500px] overflow-y-auto animate-fade-in search-result-persistent">
                <div className="sticky top-0 bg-blue-100 p-3 flex justify-between items-center border-b border-blue-200 rounded-t-xl">
                  {searchResults.length > 0 ? (
                    <span className="text-sm font-bold text-blue-900">
                      Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-blue-900">
                      {searchTerm.length > 1 && !isSearching ? 'No results found' : 'Search our products'}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchFocused(false);
                    }}
                    className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-blue-800" />
                  </button>
                </div>

                {/* Recent searches section */}
                {!searchTerm && recentSearches.length > 0 && (
                  <div className="p-3 border-b border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center">
                        <History className="w-4 h-4 mr-1" /> Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => useRecentSearch(term)}
                          className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs
                                    hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search results */}
                {searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((product) => (
                      <div key={product.id} className="relative group">
                        <Link
                          to={`/productDetails/${product.id}`}
                          onClick={() => handleResultClick(product)}
                          className="flex items-center p-4 hover:bg-blue-50 
                                    transition-colors duration-200 border-b last:border-b-0 
                                    hover:shadow-inner group"
                        >
                          <img
                            src={product.image || 'default-image.png'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg mr-4 shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-grow pr-10">
                            <h3 className="font-bold text-blue-900 text-base group-hover:text-blue-700">
                              {highlightMatch(product.name, searchTerm)}
                            </h3>
                            <p className="text-sm text-gray-600 font-semibold">
                              ₹{!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : "0.00"}
                            </p>
                            {product.model && (
                              <p className="text-xs text-gray-500">Model: {highlightMatch(product.model, searchTerm)}</p>
                            )}
                            {product.category && (
                              <p className="text-xs text-gray-500">Category: {highlightMatch(product.category, searchTerm)}</p>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={() => isProductSaved(product.id) ? removeSavedProduct(product.id) : saveProduct(product)}
                          className="absolute right-4 top-4 p-2 hover:bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={isProductSaved(product.id) ? "Remove from saved" : "Save for later"}
                        >
                          <Bookmark
                            className={`w-5 h-5 ${isProductSaved(product.id) ? 'text-blue-600 fill-blue-600' : 'text-blue-400'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchTerm.length > 1 && !isSearching ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 mb-4">No products found for "{searchTerm}"</p>
                    <p className="text-sm text-gray-600">Try using different keywords or check for typos</p>
                  </div>
                ) : searchTerm && isSearching ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching for products...</p>
                  </div>
                ) : (
                  // Saved products or default content
                  savedProducts.length > 0 ? (
                    <div>
                      <div className="p-3 border-b border-blue-100">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center">
                          <Bookmark className="w-4 h-4 mr-1 fill-blue-600 text-blue-600" /> Saved Products
                        </h3>
                      </div>
                      {savedProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="relative group">
                          <Link
                            to={`/productDetails/${product.id}`}
                            className="flex items-center p-4 hover:bg-blue-50 
                                      transition-colors duration-200 border-b last:border-b-0"
                          >
                            <img
                              src={product.image || 'default-image.png'}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg mr-4 shadow-md group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-grow pr-10">
                              <h3 className="font-bold text-blue-900 text-base group-hover:text-blue-700">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 font-semibold">₹
                                {product.price?.toFixed(2) || '0.00'}</p>
                              {product.category && (
                                <p className="text-xs text-gray-500">Category: {product.category}</p>
                              )}
                            </div>
                          </Link>
                          <button
                            onClick={() => removeSavedProduct(product.id)}
                            className="absolute right-4 top-4 p-2 hover:bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove from saved"
                          >
                            <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
                          </button>
                        </div>
                      ))}
                      {savedProducts.length > 3 && (
                        <Link
                          to="/saved-products"
                          className="block p-3 text-center text-blue-600 hover:bg-blue-50"
                        >
                          View all {savedProducts.length} saved products
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 mb-2">Enter keywords to search products</p>
                      <p className="text-sm text-gray-600">Try searching for a category, model, or name</p>
                    </div>
                  )
                )}
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
                  className={`text-blue-900 font-bold tracking-wide 
                              hover:text-blue-600 transition-colors duration-300 
                              relative pb-1 group ${location.pathname === to ? 'text-blue-600' : ''}`}
                >
                  {label}
                  <span className={`absolute bottom-0 left-0 h-1 bg-blue-600 
                                   transition-all duration-300 ${location.pathname === to ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                    className={`text-blue-900 font-bold tracking-wide block py-2 
                               hover:bg-blue-200 transition-colors group relative
                               ${location.pathname === to ? 'bg-blue-200' : ''}`}
                  >
                    {label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 
                                     bg-blue-600 transition-all duration-300 
                                     ${location.pathname === to ? 'w-1/2' : 'w-0 group-hover:w-1/2'}`}></span>
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