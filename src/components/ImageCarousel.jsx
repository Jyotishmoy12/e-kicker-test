import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Lightbulb, Beaker, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = () => {
  // Improved image array with proper alt text and responsive image sources
  const carouselImages = [
    {
      id: 1,
      src: "image1.jpg",
      srcSet: {
        sm: "image1.jpg",
        md: "image1.jpg",
        lg: "image1.jpg",
      },
      alt: "Electronic components and tools",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIRAAAQMCBwAAAAAAAAAAAAAAAQACAwQFESEiMUKRof/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAMBAAIRAxEAPwCmnaKZzKiX1DXSHbXNxLx/NFAEUAf/2Q==",
    },
    {
      id: 2,
      src: "image2.jpg",
      srcSet: {
        sm: "image2.jpg",
        md: "image2.jpg",
        lg: "image2.jpg",
      },
      alt: "Prototype development workspace",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAABQb/xAAhEAABAwMEAwAAAAAAAAAAAAABAAIDBAURITFBcbHR8P/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCj0tkpqXvVIyJxL2taWtG3UdoiICIgP//Z",
    },
    {
      id: 3,
      src: "image3.jpg",
      srcSet: {
        sm: "image3.jpg",
        md: "image3.jpg",
        lg: "image3.jpg",
      },
      alt: "Research and development laboratory",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAABgf/xAAiEAABAwMEAwAAAAAAAAAAAAABAAMEAgURITFBYXGBsdH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aou9ULr1wkpqglvSXGmlmSdOUREBERAf/2Q==",
    },
    {
      id: 4,
      src: "image1.jpg",
      srcSet: {
        sm: "image1.jpg",
        md: "image1.jpg",
        lg: "image1.jpg",
      },
      alt: "Precision electronics engineering",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIRAAAQMCBwAAAAAAAAAAAAAAAQACAwQREyExQVFhcf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmNGFmdBJHVSh5BJF2i5tfmyKAIoA//9k=",
    },
    {
      id: 5,
      src: "image2.jpg",
      srcSet: {
        sm: "image2.jpg",
        md: "image2.jpg",
        lg: "image2.jpg",
      },
      alt: "Advanced circuit board assembly",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAABQb/xAAhEAABAwMEAwAAAAAAAAAAAAABAAMEAgURITFBYXGBsdH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aou9ULr1wkpqglvSXGmlmSdOUREBERAf/2Q==",
    }
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const autoPlayTimeoutRef = useRef(null);
  const carouselRef = useRef(null);

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      carouselImages.forEach((image, index) => {
        const img = new Image();
        img.src = image.src;
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [index]: true }));
          if (Object.keys(imagesLoaded).length === carouselImages.length - 1) {
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${image.src}`);
          setImagesLoaded(prev => ({ ...prev, [index]: true }));
        };
      });
    };

    preloadImages();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const startAutoPlay = () => {
      autoPlayTimeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
      }, 5000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, carouselImages.length]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    // Restart auto-play after 8 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handlePrev = () => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNext = () => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX - touchEndX;

    // Swipe threshold
    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Intersection Observer for pausing when not in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAutoPlaying(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % carouselImages.length;
    const img = new Image();
    img.src = carouselImages[nextIndex].src;
  }, [currentIndex, carouselImages]);

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
      <div 
        ref={carouselRef}
        className="relative w-full lg:w-2/3 h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden order-1 lg:order-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Low-quality image placeholders */}
        {carouselImages.map((image, index) => (
          <div 
            key={`placeholder-${image.id}`}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image.blurDataUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
              transform: 'scale(1.1)',
              zIndex: 1
            }}
          />
        ))}

        {/* Main carousel images */}
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
            className="absolute inset-0 w-full h-full z-10"
          >
            <picture>
              <source media="(max-width: 640px)" srcSet={carouselImages[currentIndex].srcSet.sm} />
              <source media="(max-width: 1024px)" srcSet={carouselImages[currentIndex].srcSet.md} />
              <source media="(min-width: 1025px)" srcSet={carouselImages[currentIndex].srcSet.lg} />
              <img 
                src={carouselImages[currentIndex].src}
                alt={carouselImages[currentIndex].alt}
                className="w-full h-full object-cover"
                loading={currentIndex === 0 ? "eager" : "lazy"}
                onLoad={() => currentIndex === 0 && setIsLoading(false)}
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-20">
          <button 
            onClick={handlePrev}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all
                       transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all
                       transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {carouselImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                pauseAutoPlay();
                setCurrentIndex(index);
              }}
              className={`
                w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300
                ${currentIndex === index 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'}
              `}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentIndex === index ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;