import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TermsSection = ({ title, content, isExpanded, onToggle }) => {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors duration-200"
      >
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {isExpanded ? (
          <ChevronUp className="text-blue-600" />
        ) : (
          <ChevronDown className="text-blue-600" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 py-4 bg-white">
          <div className="prose max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-600 mb-3">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TermsOfUse = () => {
  const [expandedSections, setExpandedSections] = useState(new Set([0])); // First section expanded by default

  const sections = [
    {
      title: "Welcome to E-KICKER",
      content: "These Terms of Use ('Terms') govern your access to and use of our website and other online services (collectively, the 'Platform') provided by E-KICKER. By accessing or using the Platform, you agree to these Terms. If you do not agree, please refrain from using the Platform."
    },
    {
      title: "Eligibility",
      content: "You must be at least 18 years of age or the age of majority in your jurisdiction to use the Platform. By using the Platform, you represent and warrant that you meet this eligibility requirement.\n\nMinors may use the Platform under the supervision of a parent or legal guardian who agrees to be bound by these Terms."
    },
    {
      title: "Account Registration",
      content: "To access certain features of the Platform, you may need to create an account. You agree to:\n- Provide accurate, complete, and up-to-date information during registration.\n- Maintain the confidentiality of your account credentials.\n- Notify us immediately of any unauthorized use of your account.\n\nYou are responsible for all activities that occur under your account. We are not liable for any loss or damage resulting from unauthorized use of your account."
    },
    {
      title: "Use of the Platform",
      content: "You agree to use the Platform for lawful purposes only. Prohibited activities include, but are not limited to:\n- Engaging in fraudulent, abusive, or harmful behavior.\n- Uploading viruses, malware, or harmful code.\n- Violating the intellectual property rights of others.\n\nWe reserve the right to suspend or terminate your access to the Platform if you violate these Terms."
    },
    {
      title: "Purchases and Payments",
      content: "All orders placed through the Platform are subject to acceptance and availability.\n\nPrices and availability of products or services are subject to change without notice. We reserve the right to cancel any order if the price is incorrectly listed or if the product is unavailable.\n\nPayment must be made at the time of purchase through the approved payment methods on the Platform. By providing payment information, you represent and warrant that you have the legal right to use the chosen payment method."
    },
    {
      title: "Intellectual Property",
      content: "All content on the Platform, including text, graphics, logos, and software, is the property of E-KICKER or its licensors and is protected by intellectual property laws.\n\nYou may not reproduce, distribute, modify, or create derivative works from any content on the Platform without our prior written consent."
    },
    {
      title: "User-Generated Content",
      content: "By submitting content (e.g., reviews, comments, or feedback) to the Platform, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, and distribute your content.\n\nYou represent and warrant that your submitted content does not infringe on the rights of any third party or violate any laws."
    },
    {
      title: "Limitation of Liability",
      content: "To the fullest extent permitted by law, E-KICKER shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.\n\nOur liability for direct damages shall not exceed the amount paid by you for the relevant product or service."
    },
    {
      title: "Privacy",
      content: "Your use of the Platform is subject to our Privacy Policy, which outlines how we collect, use, and protect your personal information. Please review the Privacy Policy for more details."
    },
    {
      title: "Termination",
      content: "We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, for any violation of these Terms or applicable laws.\n\nUpon termination, your right to use the Platform will cease immediately, but the provisions of these Terms that by their nature should survive termination will remain in effect."
    },
    {
      title: "Changes to These Terms",
      content: "We may update these Terms from time to time. Changes will be effective when posted on the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms."
    },
    {
      title: "Contact Us",
      content: "If you have any questions or concerns about these Terms, please contact us at:\n\nekickers24@gmail.com\nTezpur University, Sonitpur\n784028, Assam"
    }
  ];

  const toggleSection = (index) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(index)) {
      newExpandedSections.delete(index);
    } else {
      newExpandedSections.add(index);
    }
    setExpandedSections(newExpandedSections);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Terms of Use</h1>
          <p className="text-gray-600 text-lg">Please read these terms carefully before using our platform</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <TermsSection
              key={index}
              title={section.title}
              content={section.content}
              isExpanded={expandedSections.has(index)}
              onToggle={() => toggleSection(index)}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>Last updated: December 2024</p>
          <p className="mt-2">Thank you for choosing E-KICKER.</p>
          <p>Your use of our Platform signifies your agreement to these Terms.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;