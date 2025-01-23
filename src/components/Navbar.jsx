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
  const searchRef = useRef(null);

  const location = useLocation();
  const auth = getAuth();
  const db = getFirestore();

  // Routes where search bar is visible
  const searchVisibleRoutes = ['/', '/products'];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Monitor authentication state
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

  const handleSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const nameQuery = query(
        productsRef,
        where('name', '>=', term.toLowerCase()),
        where('name', '<=', term.toLowerCase() + '\uf8ff')
      );
      const categoryQuery = query(
        productsRef,
        where('category', '>=', term.toLowerCase()),
        where('category', '<=', term.toLowerCase() + '\uf8ff')
      );

      const [nameSnapshot, categorySnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(categoryQuery),
      ]);

      const results = new Map();

      nameSnapshot.forEach((doc) => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });

      categorySnapshot.forEach((doc) => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const searchResults = Array.from(results.values()).slice(0, 5);
      setSearchResults(searchResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleResultClick = (productId) => {
    // Only close if user explicitly chooses to
  };

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/r&d', label: 'Research' },
    // { to: '/userprofile', label: 'User Profile' },
    { to: '/account', label: 'Account' },
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

  return (
    <header className="bg-blue-50 shadow-md relative">
      <div className="container mx-auto max-w-screen-xl flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img
            className="h-20 w-40 mr-6 hover:scale-105 transition-transform duration-300"
            src="/e-kickerhd.png"
            alt="logo"
          />
        </div>

        {/* Search Bar */}
        {searchVisibleRoutes.includes(location.pathname) && (
          <div className="flex-grow max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-10 pr-10 py-2 border border-blue-300 rounded-full 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           transition-all duration-300 text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="text-blue-500 w-5 h-5" />
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="text-gray-500 w-5 h-5 hover:text-red-500" />
                </button>
              )}
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-blue-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                <div className="sticky top-0 bg-blue-50 p-2 flex justify-between items-center border-b border-blue-200">
                  <span className="text-sm font-medium text-blue-800">Search Results</span>
                  <button 
                    onClick={() => setShowSearchResults(false)}
                    className="p-1 hover:bg-blue-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-blue-800" />
                  </button>
                </div>
                {searchResults.map((product) => (
                  <Link
                    to={`/productDetails/${product.id}`}
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="flex items-center p-3 hover:bg-blue-50 
                             transition-colors duration-200 border-b last:border-b-0"
                  >
                    <img
                      src={product.image || 'default-image.png'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="text-blue-800 focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <Link 
                  to={to} 
                  className="text-blue-800 font-semibold hover:text-yellow-500 
                             transition-colors duration-300 
                             relative pb-1
                             after:content-[''] after:absolute after:bottom-0 after:left-0 
                             after:w-0 after:h-[2px] after:bg-yellow-500 
                             after:transition-all after:duration-300
                             hover:after:w-full"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link 
                to="/cart" 
                className="bg-blue-600 text-white px-3 py-1.5 rounded-full 
                           hover:bg-blue-700 transition-colors flex items-center text-sm relative"
              >
                <ShoppingCart className="mr-1 w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            {userEmail && userEmail !== 'admfouekicker@gmail.com' && location.pathname === '/' && (
              <li>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-blue-50 md:hidden shadow-lg z-20">
            <ul className="flex flex-col items-center py-4 space-y-4">
              {navItems.map(({ to, label }) => (
                <li key={to} className="w-full text-center">
                  <Link 
                    to={to} 
                    onClick={toggleMenu}
                    className="text-blue-800 font-semibold hover:text-yellow-500 
                               transition-colors duration-300 
                               relative pb-1 block
                               after:content-[''] after:absolute after:bottom-0 after:left-0 
                               after:w-0 after:h-[2px] after:bg-yellow-500 
                               after:transition-all after:duration-300
                               hover:after:w-full"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/cart" 
                  onClick={toggleMenu}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-full 
                             hover:bg-blue-700 transition-colors flex items-center text-sm relative"
                >
                  <ShoppingCart className="mr-1 w-4 h-4" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              {userEmail && userEmail !== 'admfouekicker@gmail.com' && location.pathname === '/' && (
                <li>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700"
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