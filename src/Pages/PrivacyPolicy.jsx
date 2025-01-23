import React from 'react';
import { ScrollText, Shield, Cookie, Share2, Database, UserCheck, RefreshCw, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last Updated: December 20, 2024</p>
      </div>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-gray-700 leading-relaxed">
          At E-KICKER, we value the trust you place in us and recognize the importance of secure transactions and information privacy. This Privacy Policy describes how E-KICKER collects, uses, shares, or otherwise processes your personal data through our website and related services (hereinafter referred to as the "Platform").
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {/* Collection Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <ScrollText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Collection of Your Information</h2>
          </div>
          <p className="text-gray-700 mb-4">
            When you use our Platform, we collect and store information that you provide voluntarily. The information collected may include, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Your name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Delivery address</li>
            <li>Payment information</li>
            <li>Other personal details required for transactions or services</li>
          </ul>
        </section>

        {/* Use Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Use of Your Information</h2>
          </div>
          <p className="text-gray-700 mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Process and fulfill orders</li>
            <li>Provide customer support and resolve disputes</li>
            <li>Enhance your experience on the Platform</li>
            <li>Offer personalized recommendations and promotional content</li>
            <li>Improve our products, services, and user experience</li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        {/* Cookies Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Cookies and Tracking</h2>
          </div>
          <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Analyze website performance and usage patterns</li>
            <li>Provide personalized content and advertisements</li>
            <li>Enhance security and user experience</li>
          </ul>
        </section>

        {/* Sharing Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Sharing of Information</h2>
          </div>
          <p className="text-gray-700">
            We do not sell or rent your personal data to third parties. However, we may share your data with trusted partners, such as service providers assisting in payment processing, order fulfillment, or delivery.
          </p>
        </section>

        {/* Data Retention Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Data Retention and Security</h2>
          </div>
          <p className="text-gray-700">
            We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, or as required by law. We implement robust security measures to safeguard your data against unauthorized access or misuse.
          </p>
        </section>

        {/* Your Rights Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Your Rights</h2>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Access and update your personal information</li>
            <li>Opt-out of non-essential communications</li>
            <li>Request the deletion or correction of inaccurate data</li>
            <li>Withdraw consent for data processing where applicable</li>
          </ul>
        </section>

        {/* Changes Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Changes to this Privacy Policy</h2>
          </div>
          <p className="text-gray-700">
            E-KICKER reserves the right to update this Privacy Policy as needed. Significant changes will be communicated through updates on the Platform or via email notifications.
          </p>
        </section>

        {/* Contact Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Contact Us</h2>
          </div>
          <p className="text-gray-700">
            For questions or concerns regarding this Privacy Policy, please reach out to us at{' '}
            <a href="mailto:ekickers24@gmail.com" className="text-blue-600 hover:underline">
              ekickers24@gmail.com
            </a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600">
        <p>Your continued use of the Platform signifies your acceptance of this Privacy Policy.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;