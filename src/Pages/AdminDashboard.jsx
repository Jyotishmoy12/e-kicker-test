import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  addDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../../firebase';
import { Trash2, Edit, PlusCircle, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    ratings: 0,
    inStock:true
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const navigate = useNavigate();
  
  // Document states
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Utility function to safely convert to number
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  useEffect(() => {
    const checkAdminAccess = () => {
      const user = auth.currentUser;
      if (!user || user.email !== 'admfouekicker@gmail.com') {
        navigate('/account');
        return false;
      }
      return true;
    };

    const loadData = async () => {
      if (checkAdminAccess()) {
        try {
          // Load Products
          const productsCollection = collection(db, 'products');
          const productSnapshot = await getDocs(productsCollection);
          const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            price: safeParseFloat(doc.data().price),
            originalPrice: safeParseFloat(doc.data().originalPrice),
            ratings: safeParseFloat(doc.data().ratings),
            inStock:doc.data().inStock ?? true
          }));
          setProducts(productList);

          // Load Documents from Firestore if needed
          const documentsCollection = collection(db, 'r&d-documents');
          const documentSnapshot = await getDocs(documentsCollection);
          const documentList = documentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDocuments(documentList);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
    };

    loadData();
  }, [navigate]);

 
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
  
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };
  

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsProductLoading(true); 
    
    try {
      // Upload image to Cloudinary instead of Firebase
      const imageUrl = imageFile ? await uploadImageToCloudinary(imageFile) : null;
  
      const docRef = await addDoc(collection(db, 'products'), {
        ...newProduct,
        image: imageUrl || 'vite.svg',
        price: safeParseFloat(newProduct.price),
        originalPrice: safeParseFloat(newProduct.originalPrice),
        ratings: safeParseFloat(newProduct.ratings),
        inStock: newProduct.inStock
      });
  
      setProducts([...products, { 
        id: docRef.id, 
        ...newProduct,
        image: imageUrl || 'vite.svg',
        price: safeParseFloat(newProduct.price),
        originalPrice: safeParseFloat(newProduct.originalPrice),
        ratings: safeParseFloat(newProduct.ratings),
        inStock: newProduct.inStock
      }]);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        ratings: 0,
        inStock:true
      });
      setImageFile(null);
      setImagePreview(null);
      
      toast.success('Product added successfully');
      navigate('/');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsProductLoading(false); 
    }
  };
  

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsProductLoading(true);
    try {
      // Upload new image to Cloudinary if provided
      const imageUrl = imageFile 
        ? await uploadImageToCloudinary(imageFile) 
        : editingProduct.image;
  
      const productRef = doc(db, 'products', editingProduct.id);
      const updatedProduct = {
        ...editingProduct,
        image: imageUrl,
        price: safeParseFloat(editingProduct.price),
        originalPrice: safeParseFloat(editingProduct.originalPrice),
        ratings: safeParseFloat(editingProduct.ratings)
      };
  
      await updateDoc(productRef, updatedProduct);
  
      setProducts(products.map(p => 
        p.id === editingProduct.id ? updatedProduct : p
      ));
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
      toast.success('Product updated successfully');
      
      navigate('/');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsProductLoading(false);
    }
  };
  

  // Cloudinary document upload function
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      if (!documentFile) {
        toast.error('Please select a PDF file');
        return;
      }
  
      // Validate file type
      if (!documentFile.type.includes('pdf')) {
        toast.error('Please upload a PDF file');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'raw');
  
      // Add flag for PDF handling directly in upload
      formData.append('flags', 'attachment');
  
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
  
      const data = await response.json();
  
      // Use the secure_url directly without modification
      const pdfUrl = data.secure_url;
  
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'r&d-documents'), {
        ...newDocument,
        fileUrl: pdfUrl,
        fileName: documentFile.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser.email,
        mimeType: documentFile.type,
        fileSize: documentFile.size
      });
  
      // Update local state
      setDocuments(prev => [...prev, {
        id: docRef.id,
        ...newDocument,
        fileUrl: pdfUrl,
        fileName: documentFile.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser.email,
        mimeType: documentFile.type,
        fileSize: documentFile.size
      }]);
  
      // Reset form
      setNewDocument({
        title: '',
        description: '',
        category: ''
      });
      setDocumentFile(null);
  
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
  
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'r&d-documents', documentId));
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStock = async (productId, inStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { inStock });
      
      setProducts(products.map(p => 
        p.id === productId ? { ...p, inStock } : p
      ));
      
      toast.success(`Product marked as ${inStock ? 'in stock' : 'out of stock'}`);
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Failed to update stock status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Admin Dashboard</h1>
        <button 
          onClick={() => {
            auth.signOut();
            navigate('/account');
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Add/Edit Product Form */}
      <form 
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({...editingProduct, name: e.target.value})
                : setNewProduct({...newProduct, name: e.target.value})
            }
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={editingProduct ? editingProduct.description : newProduct.description}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({...editingProduct, description: e.target.value})
                : setNewProduct({...newProduct, description: e.target.value})
            }
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={editingProduct ? editingProduct.price : newProduct.price}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({...editingProduct, price: e.target.value})
                : setNewProduct({...newProduct, price: e.target.value})
            }
            className="border p-2 rounded"
            required
            step="0.01"
          />
          <input
            type="number"
            placeholder="Original Price"
            value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({...editingProduct, originalPrice: e.target.value})
                : setNewProduct({...newProduct, originalPrice: e.target.value})
            }
            className="border p-2 rounded"
            required
            step="0.01"
          />
          
          <input
            type="number"
            placeholder="Ratings"
            value={editingProduct ? editingProduct.ratings : newProduct.ratings}
            onChange={(e) => 
              editingProduct 
                ? setEditingProduct({...editingProduct, ratings: e.target.value})
                : setNewProduct({...newProduct, ratings: e.target.value})
            }
            className="border p-2 rounded"
            step="0.1"
            max="5"
          />
          <div className="col-span-2 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editingProduct ? editingProduct.inStock : newProduct.inStock}
              onChange={(e) => 
                editingProduct 
                  ? setEditingProduct({...editingProduct, inStock: e.target.checked})
                  : setNewProduct({...newProduct, inStock: e.target.checked})
              }
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>In Stock</span>
          </label>
        </div>
          <div className="col-span-2 flex items-center space-x-4">
  <div className="flex-1">
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="border p-2 rounded w-full"
      id="imageUpload"
    />
    <p className="text-sm text-gray-500 mt-1">
      Supported formats: JPG, PNG, GIF (max 5MB)
    </p>
  </div>
  {(imagePreview || (editingProduct && editingProduct.image)) && (
    <div className="w-24">
      <img 
        src={imagePreview || (editingProduct && editingProduct.image)} 
        alt="Product Preview" 
        className="w-24 h-24 object-cover rounded border"
      />
    </div>
  )}
</div>
        </div>
        <div className="mt-4 flex space-x-4">
                  <button
            type="submit"
            disabled={isProductLoading}
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center ${
              isProductLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProductLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">...</svg>
                {editingProduct ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <PlusCircle className="mr-2" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </>
            )}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setImagePreview(null);
                setImageFile(null);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative">
              <img 
                src={product.image || 'vite.svg'} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              } text-white text-sm`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-blue-800">
                  ₹{(product.price || 0).toFixed(2)}
                  </span>
                  <span className="ml-2 line-through text-gray-500">
                  ₹{(product.originalPrice || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStock(product.id, !product.inStock)}
                    className={`px-2 py-1 rounded text-white text-sm ${
                      product.inStock ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setImagePreview(product.image);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Ratings: {(product.ratings || 0).toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
        <form 
          onSubmit={handleDocumentUpload}
          className="bg-white p-6 rounded-lg shadow-md mb-6"
        >
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Document Title"
              value={newDocument.title}
              onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newDocument.description}
              onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newDocument.category}
              onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="border p-2 rounded"
                required
              />
              <p className="text-sm text-gray-500">Only PDF files are supported</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="mr-2" /> 
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white rounded-lg shadow-md p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-gray-600 mb-2">{doc.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Category: {doc.category}
                </span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FileText className="mr-1" size={18} />
                  View PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
   
   
  );
};

export default AdminDashboard;