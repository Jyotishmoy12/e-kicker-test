import React from 'react';
import { Wrench, Bolt, Layers, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from "../components/Footer"
import Header from "../components/Navbar"

const ServiceCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
    <div className="p-8 text-center">
      <div className="mb-6 flex justify-center">
        <Icon className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const Services = () => {
  const services = [
    {
      icon: Wrench,
      title: 'Repairing',
      description: 'Our expert technicians provide comprehensive repair services for electronic equipment, ensuring optimal performance and extending the life of your devices. From diagnostic assessment to precise repairs, we restore functionality with meticulous attention to detail.'
    },
    {
      icon: Bolt,
      title: 'House Wiring',
      description: 'We offer professional house wiring services that combine safety, efficiency, and modern electrical solutions. Our team ensures proper installation, upgrade, and maintenance of electrical systems, providing reliable and code-compliant wiring for residential spaces.'
    },
    {
      icon: Layers,
      title: 'Project Prototyping',
      description: 'Transform your innovative ideas into tangible prototypes with our advanced prototyping services. We provide end-to-end support from initial concept design to functional prototype development, helping you validate and refine your electronic project concepts.'
    },
    {
      icon: Microscope,
      title: 'R&D Project',
      description: 'Dive deep into technological innovation with our Research and Development project support. We offer comprehensive R&D services, providing expertise, resources, and cutting-edge facilities to help you push the boundaries of electronic technology and scientific exploration.'
    }
  ];

  return (
    <>
    <Header/>
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Comprehensive Electronic Solutions Tailored to Your Needs
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today to discuss how our services can bring your electronic projects to life.
          </p>
         
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
            <Link to="/contact" className="text-white">
              Contact Us
            </Link>
          </button>
        </div>
      </div>
    </div>
   <Footer/>
    </>
  );
};

export default Services;