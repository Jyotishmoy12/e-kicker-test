import React, { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Star, 
  Lightbulb, 
  Send, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

import emailjs from '@emailjs/browser';

const Careers = () => {
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    educationLevel: '',
    appliedFor: '',
    resumeLink:'',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    isLoading: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setApplicationData(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ isLoading: true, success: false, error: null });

    try {
      // Add application to Firestore
      const emailResponse = await emailjs.send(
        'service_bkiv5kw', // Replace with your EmailJS Service ID
        'template_j94r9sf', // Replace with your EmailJS Template ID
        {
          fullName: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          educationLevel: applicationData.educationLevel,
          appliedFor: applicationData.appliedFor,
          resumeLink:applicationData.resumeLink,
          message: applicationData.message,
        },
        'DTWnwOQdkRUcJa4EA' // Replace with your EmailJS Public Key
      );
  
      console.log('Email sent successfully:', emailResponse);

      // Reset form
      setApplicationData({
        fullName: '',
        email: '',
        phone: '',
        educationLevel: '',
        appliedFor: '',
        resumeLink:'',
        message: ''
      });

      // Clear file input
      e.target.reset();

      setSubmitStatus({ 
        isLoading: false, 
        success: true, 
        error: null 
      });
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitStatus({ 
        isLoading: false, 
        success: false, 
        error: 'Failed to submit application. Please try again.' 
      });
    }
  };

  const opportunityCards = [
    {
      icon: <Lightbulb className="w-12 h-12 text-blue-600" />,
      title: "Internship Program",
      description: "Gain hands-on experience in electronic engineering and innovative product development.",
      details: [
        "3-6 month program",
        "Mentorship from industry experts",
        "Real-world project exposure",
        "Potential for full-time employment"
      ]
    },
    {
      icon: <GraduationCap className="w-12 h-12 text-green-600" />,
      title: "Technical Training",
      description: "Comprehensive training modules to enhance your technical skills and knowledge.",
      details: [
        "Advanced electronic design",
        "Prototype development",
        "Industry-standard tools and technologies",
        "Certification upon completion"
      ]
    },
    {
      icon: <Star className="w-12 h-12 text-yellow-600" />,
      title: "Research & Development",
      description: "Collaborate on cutting-edge electronic innovation and breakthrough technologies.",
      details: [
        "Innovative research projects",
        "Cross-functional team collaboration",
        "Publication opportunities",
        "Competitive stipend"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center">
            <Briefcase className="mr-4 w-12 h-12" /> 
            Careers at E-KICKER
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Join Our Team of Innovative Electronics Engineers and Technologists
          </p>
        </div>
      </div>

      {/* Opportunities Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Opportunities</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {opportunityCards.map((opportunity, index) => (
            <div 
              key={index} 
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex justify-center mb-6">
                {opportunity.icon}
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">
                {opportunity.title}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {opportunity.description}
              </p>
              <ul className="space-y-2 text-gray-700">
                {opportunity.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="max-w-4xl mx-auto px-4 py-16 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Apply Now
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={applicationData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Full Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
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
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={applicationData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(123) 456-7890"
              />
            </div>
            <div>
              <label htmlFor="educationLevel" className="block text-gray-700 mb-2">
                Education Level
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={applicationData.educationLevel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Education Level</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="appliedFor" className="block text-gray-700 mb-2">
              Applying For
            </label>
            <select
              id="appliedFor"
              name="appliedFor"
              value={applicationData.appliedFor}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Opportunity</option>
              <option value="internship">Internship Program</option>
              <option value="training">Technical Training</option>
              <option value="research">Research & Development</option>
            </select>
          </div>
            <div>
              <label htmlFor="resumeLink" className="block text-gray-700 mb-2">
                Resume Link
              </label>
              <input
                type="text"
                id="resumeLink"
                name="resumeLink"
                value={applicationData.resumeLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Resume Link"
              />
            </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              id="message"
              name="message"
              value={applicationData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us why you're interested in this opportunity..."
            ></textarea>
          </div>

          {submitStatus.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
              <AlertTriangle className="mr-2 w-6 h-6" />
              {submitStatus.error}
            </div>
          )}

          {submitStatus.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
              <CheckCircle className="mr-2 w-6 h-6" />
              Your application has been successfully submitted!
            </div>
          )}

          <button
            type="submit"
            disabled={submitStatus.isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            {submitStatus.isLoading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Careers;