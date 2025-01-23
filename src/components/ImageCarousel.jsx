import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Lightbulb, Beaker } from 'lucide-react';

const ImageCarousel = () => {
  const images = [
    "arduino.jpg",
    "arduino.jpg",
    "arduino.jpg",
    "arduino.jpg",
    "arduino.jpg"
  ];

  const services = [
    {
      title: "Repairing",
      description: "Expert repair services for your equipment",
      icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
      link: "/repairing"
    },
    {
      title: "Project Prototyping",
      description: "Turn your ideas into working prototypes",
      icon: <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
      link: "/project-prototyping"
    },
    {
      title: "R&D Projects",
      description: "Research and development solutions",
      icon: <Beaker className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
      link: "/r&d"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [images.length]);

  return (
    <div className="flex flex-row w-full min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4">
      {/* Services Section */}
      <div className="w-1/4 space-y-2 sm:space-y-3 lg:space-y-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 lg:mb-6">Our Services</h2>
        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {services.map((service, index) => (
            <Link 
              key={index}
              to={service.link}
              className="block p-2 sm:p-3 lg:p-4 rounded-lg bg-white shadow-md hover:shadow-lg 
                transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="text-blue-600 flex-shrink-0">
                  {service.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm lg:text-lg truncate">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs lg:text-sm line-clamp-2">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative w-3/4 h-[40vh] sm:h-[50vh] lg:h-[70vh] max-h-[600px] overflow-hidden rounded-lg">
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

        {/* Slide Indicators */}
        <div className="absolute bottom-2 sm:bottom-4 lg:bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 lg:space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300
                ${currentIndex === index 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'}
              `}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentIndex((prevIndex) => 
            (prevIndex - 1 + images.length) % images.length
          )}
          className="absolute left-1 sm:left-2 lg:left-5 top-1/2 transform -translate-y-1/2 
            bg-black/30 text-white p-1 sm:p-1.5 lg:p-2 rounded-full hover:bg-black/50 
            transition-all duration-300 text-xs sm:text-sm lg:text-base"
        >
          ←
        </button>
        <button 
          onClick={() => setCurrentIndex((prevIndex) => 
            (prevIndex + 1) % images.length
          )}
          className="absolute right-1 sm:right-2 lg:right-5 top-1/2 transform -translate-y-1/2 
            bg-black/30 text-white p-1 sm:p-1.5 lg:p-2 rounded-full hover:bg-black/50 
            transition-all duration-300 text-xs sm:text-sm lg:text-base"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ImageCarousel;