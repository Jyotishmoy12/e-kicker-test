import React from 'react';
import {
  Zap,
  Wrench,
  Phone,
  Clock,
  Shield,
  Home,
  Settings,
  CheckCircle2,
  ArrowRight,
  Fan,
  Power,
  Plug
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from "../../firebase";
const RepairPage = () => {
  const [user] = useAuthState(auth);
  

  const services = [
    {
      title: "House Wiring",
      icon: <Power className="w-8 h-8 text-blue-500" />,
      description: "Complete house wiring solutions, including new installations, upgrades, and safety inspections.",
      subServices: ["Main Power Line Installation", "Circuit Installation", "Wiring Repair", "Safety Audits"]
    },
    {
      title: "Fan & Appliance Services",
      icon: <Fan className="w-8 h-8 text-blue-500" />,
      description: "Expert installation and repair of fans, ACs, and other electrical appliances.",
      subServices: ["Ceiling Fan Installation", "AC Point Installation", "Fan Repair", "Speed Control Setup"]
    },
    {
      title: "Switch Board Services",
      icon: <Plug className="w-8 h-8 text-blue-500" />,
      description: "Professional installation and repair of switch boards and electrical points.",
      subServices: ["New Board Installation", "Socket Repair", "Switch Replacement", "Board Upgrades"]
    },
    {
      title: "Emergency Repairs",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      description: "24/7 emergency electrical services for urgent repairs and issues.",
      subServices: ["Short Circuit Fixes", "Power Failure Resolution", "Emergency Lighting", "Safety Checks"]
    },
    {
      title: "Appliance Repair",
      icon: <Settings className="w-8 h-8 text-blue-500" />,
      description: "Repair services for various electrical and electronic appliances.",
      subServices: ["TV Repair", "Microwave Service", "Washing Machine Repair", "Refrigerator Service"]
    },
    {
      title: "Maintenance Services",
      icon: <Wrench className="w-8 h-8 text-blue-500" />,
      description: "Regular maintenance and upkeep of electrical systems and appliances.",
      subServices: ["Preventive Maintenance", "System Updates", "Performance Checks", "Safety Inspections"]
    }
  ];

  const features = [
    "Licensed & Certified Technicians",
    "Same Day Service Available",
    "Warranty on All Repairs",
    "Competitive Pricing",
    "Latest Equipment & Techniques",
    "Free Diagnostic Assessment"
  ];

  const navigate = useNavigate();
  const registerAsServiceProvider = () => {
    if (user) {
      // If user is logged in, navigate to profile
      navigate("/service-provider-profile");
    } else {
      // If user is not logged in, navigate to service provider registration
      navigate("/service-provider");
    }
  };

  const gotoServiceProvidersList = () => {
    navigate("/service-providers-list");
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Expert Electrical Repair & Installation Services
              </h1>
              <p className="text-xl mb-8">
                Professional solutions for all your electrical needs - from fan installation to switchboard repairs
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                  onClick={registerAsServiceProvider}
                >
                  {user 
                    ? "View Your Profile" 
                    : "Register as a Service Provider"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.subServices.map((subService, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                        {subService}
                      </li>
                    ))}
                  </ul>
                  <button
                  className=" text-blue-600  py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center" onClick={gotoServiceProvidersList}
                >
                  <Link to="/service-providers-list">Contact Service Providers</Link>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3" />
                  <span className="text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl mb-8">
                Visit our services page to explore our complete range of electrical services and repairs
              </p>
              <button
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center mx-auto"
              >
                <Link to="/contact">
                  Want to know more? Contact Us
                </Link>

                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default RepairPage;