import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Lightbulb, Beaker, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = () => {
  const images = [
    "image1.jpg",
    "image1.jpg",
    "image1.jpg",
    "image1.jpg",
    "image1.jpg"
  ];

  const services = [
    {
      title: "Precision Repair",
      description: "Expert diagnostics and repair for technical equipment",
      icon: <Wrench className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />,
      link: "/repairing",
      color: "bg-blue-50"
    },
    {
      title: "Innovative Prototyping",
      description: "Transform concepts into functional prototypes",
      icon: <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-green-600" />,
      link: "/project-prototyping",
      color: "bg-green-50"
    },
    {
      title: "Advanced R&D",
      description: "Cutting-edge research and development solutions",
      icon: <Beaker className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />,
      link: "/r&d",
      color: "bg-purple-50"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % images.length
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full bg-gray-50">
      {/* Services Section */}
      <div className="w-full lg:w-1/3 bg-white shadow-md flex flex-col min-h-[400px] lg:h-[500px] overflow-hidden order-2 lg:order-1">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-2 text-gray-800 px-4 md:px-6 pt-4 md:pt-6">Our Services</h2>
        <div className="flex-1 flex flex-col justify-between px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-0">
          {services.map((service, index) => (
            <Link 
              key={index}
              to={service.link}
              className={`p-4 md:p-8 rounded-xl transition-all duration-300 
                hover:shadow-xl hover:-translate-y-1 ${service.color}
                transform hover:scale-105`}
            >
              <div className="flex items-center space-x-3 md:space-x-6">
                <div className="flex-shrink-0 bg-white p-2 md:p-4 rounded-lg shadow-sm">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative w-full lg:w-2/3 h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden order-1 lg:order-2">
        <AnimatePresence>
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { 
                duration: 1, 
                ease: "easeInOut" 
              } 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              transition: { 
                duration: 0.5 
              } 
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={images[currentIndex]} 
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <button 
            onClick={handlePrev}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300
                ${currentIndex === index 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;