import React from 'react';
import { 
  Cpu, 
  CircuitBoard, 
  Microscope, 
  Box, 
  Cog, 
  Rocket,
  CheckCircle2,
  ArrowRight,
  Ruler,
  ServerCrash,
  Cable,
  FlaskConical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Navbar';
import Footer from '../components/Footer';
const ProjectPrototyping = () => {
  const services = [
    {
      title: "PCB Design & Fabrication",
      icon: <CircuitBoard className="w-8 h-8 text-blue-500" />,
      description: "Professional PCB design and manufacturing services for your projects.",
      capabilities: [
        "Single & Multi-layer PCB Design",
        "Surface Mount Technology",
        "Through-hole Technology",
        "Flex PCB Design"
      ]
    },
    {
      title: "Microcontroller Programming",
      icon: <Cpu className="w-8 h-8 text-blue-500" />,
      description: "Expert programming services for various microcontroller platforms.",
      capabilities: [
        "Arduino Development",
        "ESP32/ESP8266 Programming",
        "STM32 Development",
        "Custom Firmware Development"
      ]
    },
    {
      title: "3D Modeling & Printing",
      icon: <Box className="w-8 h-8 text-blue-500" />,
      description: "Custom enclosure design and rapid prototyping solutions.",
      capabilities: [
        "Custom Enclosure Design",
        "Component Housing",
        "Prototype Cases",
        "Functional Models"
      ]
    },
    {
      title: "Testing & Validation",
      icon: <FlaskConical className="w-8 h-8 text-blue-500" />,
      description: "Comprehensive testing and validation of electronic prototypes.",
      capabilities: [
        "Functionality Testing",
        "Performance Analysis",
        "Thermal Testing",
        "EMC Pre-compliance"
      ]
    }
  ];

  const processSteps = [
    {
      title: "Initial Consultation",
      description: "Discuss your project requirements, specifications, and goals",
      icon: <Microscope className="w-6 h-6" />
    },
    {
      title: "Design Phase",
      description: "Create detailed designs and schematics for your approval",
      icon: <Ruler className="w-6 h-6" />
    },
    {
      title: "Prototyping",
      description: "Build the initial prototype with careful attention to detail",
      icon: <Cog className="w-6 h-6" />
    },
    {
      title: "Testing",
      description: "Rigorous testing and validation of the prototype",
      icon: <FlaskConical className="w-6 h-6" />
    },
    {
      title: "Refinement",
      description: "Implement improvements based on testing results",
      icon: <ServerCrash className="w-6 h-6" />
    },
    {
      title: "Final Delivery",
      description: "Deliver the completed prototype with documentation",
      icon: <Rocket className="w-6 h-6" />
    }
  ];

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Turn Your Ideas Into Reality
            </h1>
            <p className="text-xl mb-8">
              Professional electronics prototyping services from concept to completion
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center">
             <Link to="/contact">Start Your Project</Link> 
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Prototyping Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="space-y-2">
                  {service.capabilities.map((capability, idx) => (
                    <div key={idx} className="flex items-center text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative p-6 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
                <div className="absolute top-6 right-6 text-blue-200 font-bold text-xl">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Prototype Your Project?</h2>
            <p className="text-xl mb-8">
              Get started with our expert team and bring your electronic projects to life
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            <Link to="/contact">Transform your vision into reality ! </Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default ProjectPrototyping;