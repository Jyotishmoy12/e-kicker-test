import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";// Assuming you have an Auth Context

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!currentUser) {
          console.error("User not logged in!");
          navigate("/login");
          return;
        }

        const userId = currentUser.uid; // Dynamically fetch user ID
        const orderDoc = await getDoc(doc(db, "users", userId, "orders", orderId));

        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          alert("Order not found!");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate, currentUser]);

  const generatePDF = () => {
    if (!order) {
      alert("Order details are missing!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Order Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 30);
    doc.text(`Payment ID: ${order.paymentId}`, 20, 40);
    doc.text(`Total Amount: ₹${order.amount}`, 20, 50);
    doc.text(`Date: ${new Date(order.timestamp.seconds * 1000).toLocaleString()}`, 20, 60);

    // Shipping Address
    doc.text("Shipping Address:", 20, 80);
    doc.text(`${order.shipping.firstName} ${order.shipping.lastName}`, 20, 90);
    doc.text(order.shipping.address, 20, 100);
    doc.text(`${order.shipping.city}, ${order.shipping.state}, ${order.shipping.zipCode}`, 20, 110);
    doc.text(`Phone: ${order.shipping.phoneNumber}`, 20, 120);
    doc.text(`Email: ${order.shipping.email}`, 20, 130);

    // Table for Order Items
    const tableColumn = ["Item", "Quantity", "Price"];
    const tableRows = order.items.map((item) => [
      item.name,
      item.quantity,
      `₹${item.price * item.quantity}`,
    ]);

    doc.autoTable({
      startY: 150,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10 },
    });

    // Footer with Total Amount
    doc.text(`Total Amount: ₹${order.amount}`, 20, doc.lastAutoTable.finalY + 10);

    doc.save(`Invoice_${orderId}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">Fetching Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-xl">Order not found.</p>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center py-12 px-6">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Order Confirmed</h1>
        <p className="text-lg mb-6">Thank you for your purchase! Your order has been placed successfully.</p>

        <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Payment ID:</strong> {order.paymentId}</p>
          <p><strong>Total Amount:</strong> ₹{order.amount}</p>
          <p><strong>Date:</strong> {new Date(order.timestamp.seconds * 1000).toLocaleString()}</p>

          <h2 className="text-xl font-bold mt-6">Shipping Information</h2>
          <p>{order.shipping.firstName} {order.shipping.lastName}</p>
          <p>{order.shipping.address}</p>
          <p>{order.shipping.city}, {order.shipping.state}, {order.shipping.zipCode}</p>
          <p><strong>Phone:</strong> {order.shipping.phoneNumber}</p>
          <p><strong>Email:</strong> {order.shipping.email}</p>

          <h2 className="text-xl font-bold mt-6">Ordered Items</h2>
          {order.items.map((item, index) => (
            <p key={index}>{item.name} - {item.quantity} x ₹{item.price}</p>
          ))}

         
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
