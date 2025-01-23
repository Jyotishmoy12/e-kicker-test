import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnapshot = await getDoc(orderRef);

        if (orderSnapshot.exists()) {
          setOrderDetails(orderSnapshot.data());
        } else {
          console.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Thank You for Your Order!</h2>
        <p className="text-gray-700 mb-4">Your order ID is: <strong>{orderId}</strong></p>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Summary:</h3>
        <ul className="mb-4">
          {orderDetails.items.map((item, index) => (
            <li key={index} className="text-gray-700">
              {item.name} (x{item.quantity}) - ₹{(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="text-gray-800 font-bold">Total: ₹{orderDetails.total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
