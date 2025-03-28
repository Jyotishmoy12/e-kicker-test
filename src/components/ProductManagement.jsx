import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Trash2, Edit, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    ratings: 0,
    inStock: true,
    category: 'Electronics', // default category
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const adminProductsQuery = query(
          collection(db, 'products'), 
          where('isAdminProduct', '==', true)
        );
        const productSnapshot = await getDocs(adminProductsQuery);
        const productList = productSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            price: parseFloat(doc.data().price || 0),
            originalPrice: parseFloat(doc.data().originalPrice || 0),
          }));
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    setIsProductLoading(true);

    try {
      const imageUrl = imageFile ? await uploadImageToCloudinary(imageFile) : editingProduct?.image || '';

      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, { ...editingProduct, image: imageUrl });

        setProducts(products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, image: imageUrl } : p)));
        setEditingProduct(null);
        toast.success('Product updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...newProduct,
          image: imageUrl,
          isAdminProduct:true,
          createdBy:'admin'
        });

        setProducts([...products, { id: docRef.id, ...newProduct, image: imageUrl }]);
        setNewProduct({ name: '', description: '', price: '', originalPrice: '', image: '', ratings: 0, inStock: true, category: 'Electronics' });
        toast.success('Product added successfully');
      }

      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsProductLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter((p) => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStockStatus = async (productId, inStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { inStock: !inStock });

      setProducts(products.map((p) => (p.id === productId ? { ...p, inStock: !inStock } : p)));
      toast.success(`Product marked as ${!inStock ? 'Out of Stock' : 'In Stock'}`);
    } catch (error) {
      console.error('Error updating stock status:', error);
      toast.error('Failed to update stock status');
    }
  };

  // Group products by category
  const electronicsProducts = products.filter(p => p.category === 'Electronics');
  const electricalProducts = products.filter(p => p.category === 'Electrical');

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Products</h2>
      <form onSubmit={handleAddOrUpdateProduct} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Product Name" 
            value={editingProduct ? editingProduct.name : newProduct.name}
            onChange={(e) => editingProduct
              ? setEditingProduct({ ...editingProduct, name: e.target.value })
              : setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2 rounded"
            required 
          />

          <input 
            type="text" 
            placeholder="Description" 
            value={editingProduct ? editingProduct.description : newProduct.description}
            onChange={(e) => editingProduct
              ? setEditingProduct({ ...editingProduct, description: e.target.value })
              : setNewProduct({ ...newProduct, description: e.target.value })}
            className="border p-2 rounded"
            required 
          />

          <input 
            type="number" 
            placeholder="Price" 
            value={editingProduct ? editingProduct.price : newProduct.price}
            onChange={(e) => editingProduct
              ? setEditingProduct({ ...editingProduct, price: e.target.value })
              : setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-2 rounded"
            required 
          />

          <input 
            type="number" 
            placeholder="Original Price" 
            value={editingProduct ? editingProduct.originalPrice : newProduct.originalPrice}
            onChange={(e) => editingProduct
              ? setEditingProduct({ ...editingProduct, originalPrice: e.target.value })
              : setNewProduct({ ...newProduct, originalPrice: e.target.value })}
            className="border p-2 rounded"
            required 
          />

          {/* New Category Field */}
          <select 
            value={editingProduct ? editingProduct.category : newProduct.category}
            onChange={(e) => editingProduct
              ? setEditingProduct({ ...editingProduct, category: e.target.value })
              : setNewProduct({ ...newProduct, category: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="Electronics">Electronics</option>
            <option value="Electrical">Electrical</option>
          </select>

          <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded" />
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded border" />}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">
          <PlusCircle className="mr-2" />
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {/* Grouped Product List */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Electronics Components</h3>
        {electronicsProducts.length === 0 ? (
          <p className="text-gray-500">No electronics products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {electronicsProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded" />
                <p className="text-gray-600 mt-2">Price: ₹{product.price}</p>
                <p className="text-gray-500 line-through">Original: ₹{product.originalPrice}</p>

                <div className="flex justify-between mt-4">
                  <button onClick={() => toggleStockStatus(product.id, product.inStock)}
                    className={`text-white px-3 py-1 rounded-lg ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-800">
                    <Edit />
                  </button>

                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Electrical Components</h3>
        {electricalProducts.length === 0 ? (
          <p className="text-gray-500">No electrical products available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {electricalProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded" />
                <p className="text-gray-600 mt-2">Price: ₹{product.price}</p>
                <p className="text-gray-500 line-through">Original: ₹{product.originalPrice}</p>

                <div className="flex justify-between mt-4">
                  <button onClick={() => toggleStockStatus(product.id, product.inStock)}
                    className={`text-white px-3 py-1 rounded-lg ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-800">
                    <Edit />
                  </button>

                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
