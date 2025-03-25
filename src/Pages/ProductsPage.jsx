import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductComponent from '../components/ProductComponent';
import SellerProductsPage from './SellerProductPage';
import { useNavigate } from 'react-router-dom';


const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
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
      setError('Unable to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category || '').filter(Boolean))];
  
  // Filter products based on search term and category
  const filteredProducts = products
    .filter(product => 
      (searchTerm === '' || 
       product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       product.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'all' || product.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Skeleton loading component
  const ProductSkeleton = () => (
    <div className="border rounded-lg p-4 shadow-sm animate-pulse">
      <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
      <div className="bg-gray-300 h-6 rounded w-3/4 mb-2"></div>
      <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
      <div className="bg-gray-300 h-10 rounded w-full"></div>
    </div>
  );
  
  const navigate = useNavigate()
  const gotoSellerPage=()=>{
    navigate('/sellerProducts')
  }
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          
          <div className="mb-6">
            
            
            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search */}
           
              {/* Sort Options */}
              <div>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Sort By</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                
              </div>
              <button onClick={gotoSellerPage} className="mt-1 px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Go to SellerPage</button>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-6">
                <p>{error}</p>
                <button 
                  onClick={fetchProducts} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Products Display */}
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center p-12 bg-gray-100 rounded-lg">
                <p className="text-xl text-gray-600">No products found matching your criteria.</p>
                {(searchTerm || filterCategory !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setCurrentPage(1);
                    }} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <ProductComponent products={currentProducts} isAllProductsPage={true}/>
              </>
            )}
            
            {/* Pagination */}
            {!loading && filteredProducts.length > productsPerPage && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Prev
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <button 
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
      </div>
     
      <Footer/>
    </>
  );
};

export default ProductsPage;