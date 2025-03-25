import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

// Utility function for tracking product interactions
export const trackProductInterest = async (product, interestType) => {
  const user = auth.currentUser;
  if (!user) {
    toast.warning('Please sign in to show interest');
    return false;
  }

  try {
    await addDoc(collection(db, 'product_interests'), {
      productId: product.id,
      productName: product.productName,
      sellerId: product.sellerId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous User',
      userEmail: user.email,
      interestType: interestType, // 'cart_add', 'view_details', 'show_interest', etc.
      timestamp: serverTimestamp()
    });

    // Show success toast based on interest type
    switch(interestType) {
      case 'show_interest':
        toast.success(`You've shown interest in ${product.productName}`);
        break;
      case 'cart_add':
        toast.success(`${product.productName} added to cart`);
        break;
      case 'view_details':
        toast.info(`Viewing details of ${product.productName}`);
        break;
    }

    return true;
  } catch (error) {
    console.error('Error tracking product interest:', error);
    toast.error('Failed to record your interaction');
    return false;
  }
};

// Component to display product interactions for a seller
export const ProductInterestTracker = ({ sellerId }) => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch product interests
  const fetchProductInterests = async () => {
    try {
      setLoading(true);
      const interestsRef = collection(db, 'product_interests');
      const q = query(
        interestsRef, 
        where('sellerId', '==', sellerId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const interestsSnapshot = await getDocs(q);
      const interestsList = interestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        formattedDate: doc.data().timestamp 
          ? new Date(doc.data().timestamp.toDate()).toLocaleString() 
          : 'Recent'
      }));

      setInterests(interestsList);
    } catch (error) {
      console.error('Error fetching product interests:', error);
      toast.error('Failed to load product interactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductInterests();
  }, [sellerId]);

  // Render product interactions
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Product Interactions</h2>
        <button 
          onClick={fetchProductInterests}
          className="text-blue-600 hover:underline text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading interactions...</div>
      ) : interests.length === 0 ? (
        <p className="text-gray-500 text-center">No recent interactions</p>
      ) : (
        <ul className="space-y-2">
          {interests.map((interest) => (
            <li 
              key={interest.id} 
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
            >
              <div>
                <div className="font-medium text-sm">
                  <span className="text-blue-600">{interest.userName}</span>
                  <span className="ml-2 text-gray-600">
                    {interest.interestType === 'cart_add' 
                      ? 'added to cart' 
                      : interest.interestType === 'view_details'
                      ? 'viewed details'
                      : interest.interestType === 'show_interest'
                      ? 'Wants to buy (please keep this in stock)'
                      : 'interacted with'} 
                    <span className="font-semibold ml-1">{interest.productName}</span>
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {interest.formattedDate}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductInterestTracker;