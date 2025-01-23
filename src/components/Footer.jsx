import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin ,
  Code
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TermsOfUse from '../Pages/TermsOfUse';


const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              E-KICKER
            </h3>
            <p className="text-blue-100 text-sm mb-4">
            Come join us and become part of our E-Kicker family!
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/e_kicker_/" 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
      <h4 className="text-xl font-semibold text-yellow-400 mb-4">Quick Links</h4>
      <ul className="space-y-2">
        {/*'Seller products' section will implement it later*/}
        {['About Us', 'Careers', 'Services', 'Contact'].map((link) => (
          <li key={link}>
            <Link 
              to={`/${link.toLowerCase().replace(' ', '-')}`} 
              className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
          {/* Services */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">
              Our Services
            </h4>
            <ul className="space-y-2">
            <li>
              <Link 
                to="/repairing" 
                className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
              >
                Repairing
              </Link>
            </li>
            <li>
              <Link 
                to="/project-prototyping" 
                className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
              >
                Project Prototyping
              </Link>
            </li>
            <li>
              <Link 
                to="/r&d" 
                className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
              >
                R&D Project
              </Link>
            </li>
          </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold text-yellow-400 mb-4">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-yellow-300" />
                <span className="text-blue-200 text-sm">
                ekickers24@gmail.com
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-yellow-300" />
                <span className="text-blue-200 text-sm">
                  +919395416435
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-yellow-300" />
                <span className="text-blue-200 text-sm">
                  Tezpur University, Nilachal Mens Hostel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-blue-700 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-blue-200">
              © 2024 E-Kicker. All Rights Reserved.
            </p>
            <div className="flex items-center text-blue-200 text-sm">
              <Code className="w-4 h-4 mr-1 text-yellow-300" />
              <span>Developed by</span>
              <a 
                href="https://www.linkedin.com/in/jyotishmoy-deka-6871b9229/"
                className="ml-1 text-yellow-300 hover:text-yellow-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Jyotishmoy
              </a>
            </div>
          </div>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link
              to="/privacypolicy"
              className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/termsofuse"
              className="text-blue-200 hover:text-yellow-300 transition-colors text-sm"
            > 
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;