import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as needed
import { getAuth } from 'firebase/auth';

const SellerProductManagement = () => {
  // Product form state
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [sellerId, setSellerId] = useState('');
  
  // Get current user ID from auth context
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // Replace this with your actual auth implementation
        // For example, if using Firebase Auth:
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          setSellerId(user.uid);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        // For development, you can set a dummy seller ID
        setSellerId("testSellerId123");
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch products on component mount and when sellerId changes
  useEffect(() => {
    if (sellerId) {
      fetchProducts();
    }
  }, [sellerId]);

  // Fetch products from Firebase
  const fetchProducts = async () => {
    try {
      setError('');
      // Query products where sellerId matches current user
      const productsQuery = query(
        collection(db, 'products'), 
        where('sellerId', '==', sellerId)
      );
      const querySnapshot = await getDocs(productsQuery);
      
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      
      // Upload image to Cloudinary if an image is selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'ekicker'); // Replace with your Cloudinary upload preset
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dymklhjht/image/upload`, // Replace with your cloud name
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const data = await response.json();
        imageUrl = data.secure_url;
      }

      // Keep existing image URL if in edit mode and no new image is selected
      if (editMode && !image && imagePreview) {
        imageUrl = imagePreview;
      }

      const productData = {
        productName: productName || '',
        description: description || '',
        originalPrice: parseFloat(originalPrice) || 0,
        price: parseFloat(price) || 0,
        category: category || '',
        imageUrl: imageUrl || '',
        inStock,
        sellerId, // Important: Associate product with seller
        updatedAt: new Date(),
      };

      if (editMode) {
        // Update existing product
        if (!editId) throw new Error('Product ID is missing');
        
        await updateDoc(doc(db, 'products', editId), productData);
        console.log('Product updated successfully!');
      } else {
        // Add new product
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
        console.log('Product added successfully!');
      }

      // Reset form and fetch updated products
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(`Failed to save product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setProductName('');
    setDescription('');
    setOriginalPrice('');
    setPrice('');
    setCategory('');
    setImage(null);
    setImagePreview('');
    setInStock(true);
    setEditMode(false);
    setEditId(null);
    setError('');
  };

  // Handle edit product
  const handleEdit = (product) => {
    setProductName(product.productName || '');
    setDescription(product.description || '');
    setOriginalPrice(product.originalPrice?.toString() || '');
    setPrice(product.price?.toString() || '');
    setCategory(product.category || '');
    setImagePreview(product.imageUrl || '');
    setInStock(product.inStock ?? true);
    setEditMode(true);
    setEditId(product.id);
    setError('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete product
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setError('');
        await deleteDoc(doc(db, 'products', id));
        console.log('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(`Failed to delete product: ${error.message}`);
      }
    }
  };

  // Toggle stock status
  const toggleStockStatus = async (id, currentStatus) => {
    try {
      setError('');
      await updateDoc(doc(db, 'products', id), {
        inStock: !currentStatus,
        updatedAt: new Date()
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock status:', error);
      setError(`Failed to update stock status: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Product Form */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block mb-1">Product Name*</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className="block mb-1">Category*</label>
              <select
                className="w-full p-2 border rounded"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="electrical">Electrical</option>
              </select>
            </div>
            
            {/* Original Price */}
            <div>
              <label className="block mb-1">Original Price*</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            {/* Selling Price */}
            <div>
              <label className="block mb-1">Selling Price*</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block mb-1">Description*</label>
              <textarea
                className="w-full p-2 border rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                required
              ></textarea>
            </div>
            
            {/* Product Image */}
            <div className="md:col-span-2">
              <label className="block mb-1">Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 object-contain"
                  />
                </div>
              )}
            </div>
            
            {/* Stock Status */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={() => setInStock(!inStock)}
                  className="mr-2"
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>
          
          {/* Form Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Processing...' : editMode ? 'Update Product' : 'Add Product'}
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Products List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Products</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded overflow-hidden bg-white shadow">
                {/* Product Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
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
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.description}</p>
                  
                  {/* Stock Status Badge */}
                  <div className="flex items-center mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1 hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStockStatus(product.id, product.inStock)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm flex-1 hover:bg-gray-700"
                    >
                      {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm flex-1 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProductManagement;