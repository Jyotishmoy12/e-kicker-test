import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {db} from '../../firebase';
import emailjs from "@emailjs/browser"

const Contact = () => {
  const [applicationData, setApplicationData] = useState({
    fullName: '',  // Changed name to fullName
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({
    isLoading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ isLoading: true, success: false, error: null });

      // Add form data to Firestore
      try {
        // Add application to Firestore
        const emailResponse = await emailjs.send(
          'service_bkiv5kw', // Replace with your EmailJS Service ID
          'template_3p4l7dr', // Replace with your EmailJS Template ID
          {
            fullName: applicationData.fullName,
            email: applicationData.email,
            phone: applicationData.phone,
            subject: applicationData.subject,
            message: applicationData.message,
          },
          'DTWnwOQdkRUcJa4EA' // Replace with your EmailJS Public Key
        );
    
        console.log('Email sent successfully:', emailResponse);

      // Reset form and show success message
      setApplicationData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitStatus({ 
        isLoading: false, 
        success: true, 
        error: null 
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({ 
        isLoading: false, 
        success: false, 
        error: 'Failed to submit. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact E-KICKER</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Get in Touch - We're Here to Support Your Electronic Innovations
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
          
          <div className="flex items-center space-x-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-700">Email</h3>
              <p className="text-gray-600">ekickers24@gmail.com</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Phone className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-700">Phone</h3>
              <p className="text-gray-600"> +919395416435</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-700">Address</h3>
              <p className="text-gray-600">Tezpur University, Nilachal Mens Hostel</p>
            </div>
          </div>

          {/* Tezpur University Map */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our University Location</h3>
            <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.5655146114994!2d92.79739737470853!3d26.183140577107892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375b58e53cd43fab%3A0x69ed134160efe919!2sTezpur%20University!5e0!3m2!1sen!2sin!4v1702729076449!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{border:0}}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                name="fullName"
                value={applicationData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Full Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={applicationData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={applicationData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(123) 456-7890"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
              <select
                id="subject"
                name="subject"
                value={applicationData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Subject</option>
                <option value="Repair">Repair Services</option>
                <option value="Wiring">House Wiring</option>
                <option value="Prototyping">Project Prototyping</option>
                <option value="RnD">R&D Project</option>
                <option value="Other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
              <textarea
                id="message"
                name="message"
                value={applicationData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your project or inquiry..."
              ></textarea>
            </div>

            {submitStatus.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {submitStatus.error}
              </div>
            )}

            {submitStatus.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={submitStatus.isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              {submitStatus.isLoading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;