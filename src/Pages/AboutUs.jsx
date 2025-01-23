import React from 'react';
import { CircuitBoard, Wrench, Lightbulb, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About E-KICKER</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Advancing Electronics Through Innovation, Expertise, and Empowerment
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mission Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <CircuitBoard className="w-12 h-12 text-blue-600" />
              <h2 className="text-3xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              At E-KICKER, we are dedicated to advancing the field of electronics through innovative research and development. We specialize in providing cutting-edge solutions for a wide range of projects, from prototyping to full-scale development, pushing the boundaries of technology with every project.
            </p>
          </div>

          {/* Components Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Wrench className="w-12 h-12 text-blue-600" />
              <h2 className="text-3xl font-semibold">Our Components</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              We offer a comprehensive selection of high-quality electronic components, ensuring that engineers, hobbyists, and educational institutions have access to the materials they need for success. Our expert repair services guarantee that equipment is restored to optimal performance.
            </p>
          </div>
        </div>

        {/* Education and Innovation Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-12">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Users className="w-12 h-12 text-blue-600" />
                <h2 className="text-3xl font-semibold">Supporting Future Engineers</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Supporting the next generation of engineers is at the heart of what we do. We provide tailored component recommendations for students working on class projects, prototypes, and research initiatives, helping bring their ideas to life with the guidance and resources they need to succeed.
              </p>
            </div>
            <div className="flex justify-center">
              <Lightbulb className="w-64 h-64 text-blue-400 opacity-30" />
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Passionate About Innovation
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            At E-KICKER, we are passionate about fostering innovation, nurturing talent, and empowering our clients to achieve their technological goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;