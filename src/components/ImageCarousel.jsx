import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wrench, Lightbulb, Beaker, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const ImageCarousel = () => {
  // Improved image array with proper alt text and responsive image sources
  // With optimal image sizes for different screen sizes
  const carouselImages = [
    {
      id: 1,
      srcSet: {
        sm: "image1.jpg", // 640px width (mobile)
        md: "image1.jpg", // 1024px width (tablet)
        lg: "image1.jpg", // 1920px width (desktop)
      },
      src: "image1.jpg", // Fallback
      alt: "Electronic components and tools",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIRAAAQMCBwAAAAAAAAAAAAAAAQACAwQFESEiMUKRof/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmnaKZzKiX1DXSHbXNxLx/NFAEUAf/2Q==",
    },
    {
      id: 2,
      srcSet: {
        sm: "image2.jpg", // 640px width
        md: "image2.jpg", // 1024px width
        lg: "image2.jpg", // 1920px width
      },
      src: "image2.jpg", // Fallback
      alt: "Prototype development workspace",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAABQb/xAAhEAABAwMEAwAAAAAAAAAAAAABAAIDBAURITFBcbHR8P/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCj0tkpqXvVIyJxL2taWtG3UdoiICIgP//Z",
    },
    {
      id: 3,
      srcSet: {
        sm: "image3.jpg", // 640px width
        md: "image3.jpg", // 1024px width
        lg: "image3.jpg", // 1920px width
      },
      src: "image3.jpg", // Fallback
      alt: "Research and development laboratory",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAABgf/xAAiEAABAwMEAwAAAAAAAAAAAAABAAMEAgURITFBYXGBsdH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aou9ULr1wkpqglvSXGmlmSdOUREBERAf/2Q==",
    },
    {
      id: 4,
      srcSet: {
        sm: "image3.jpg", // 640px width
        md: "image3.jpg", // 1024px width
        lg: "image3.jpg", // 1920px width
      },
      src: "image1.jpg", // Fallback
      alt: "Precision electronics engineering",
      blurDataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/wAALCAAIAAoBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAIRAAAQMCBwAAAAAAAAAAAAAAAQACAwQREyExQVFhcf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmNGFmdBJHVSh5BJF2i5tfmyKAIoA//9k=",
    },
    {
      id: 5,
      srcSet: {
        sm: "image1.jpg", // 640px width
        md: "image1.jpg", // 1024px width
        lg: "image1.jpg", // 1920px width
      },
      src: "image1.jpg", // Fallback
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
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimeoutRef = useRef(null);
  const carouselRef = useRef(null);

  // Improved loading indicator using image prefetch
  useEffect(() => {
    const preloadImages = () => {
      let loadedCount = 0;
      const totalImages = carouselImages.length;

      carouselImages.forEach((image, index) => {
        // Load all three sizes for each image
        const imgLarge = new Image();
        imgLarge.src = image.srcSet.lg;
        
        // Only count the large image for loading status
        imgLarge.onload = () => {
          loadedCount++;
          setImagesLoaded(prev => ({ ...prev, [index]: true }));
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
        };
        
        imgLarge.onerror = () => {
          console.error(`Failed to load image: ${image.srcSet.lg}`);
          loadedCount++;
          setImagesLoaded(prev => ({ ...prev, [index]: true }));
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
        };

        // Also load medium and small images in the background
        const imgMedium = new Image();
        imgMedium.src = image.srcSet.md;
        
        const imgSmall = new Image();
        imgSmall.src = image.srcSet.sm;
      });
    };

    preloadImages();
  }, []);

  // Memoized navigation functions
  const handlePrev = useCallback(() => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  }, [carouselImages.length]);

  const handleNext = useCallback(() => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  }, [carouselImages.length]);

  // Auto-play functionality with improved controls
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

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
  }, [currentIndex, isAutoPlaying, isPaused, carouselImages.length]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    // Restart auto-play after 8 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  // Toggle pause button
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Enhanced touch handling with velocity detection
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX - touchEndX;
    const velocity = Math.abs(difference) / 100; // Simple velocity calculation

    // Swipe threshold with velocity consideration
    if (Math.abs(difference) > 50 || velocity > 0.5) {
      if (difference > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  }, [touchStartX, handleNext, handlePrev]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        // Space bar toggles pause
        togglePause();
        e.preventDefault(); // Prevent page scrolling
      }
    };

    // Only add listeners if carousel is in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          document.addEventListener('keydown', handleKeyDown);
        } else {
          document.removeEventListener('keydown', handleKeyDown);
        }
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, [handlePrev, handleNext, togglePause]);

  // Intersection Observer with improved threshold array
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only auto-play when fully in view
        if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
          setIsAutoPlaying(true);
        } else {
          setIsAutoPlaying(false);
        }
      },
      { threshold: [0.1, 0.7, 1.0] }
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

  // Smart preloading - load next and previous images
  useEffect(() => {
    const preloadNextAndPrevious = () => {
      const nextIndex = (currentIndex + 1) % carouselImages.length;
      const prevIndex = (currentIndex - 1 + carouselImages.length) % carouselImages.length;
      
      // Load next image
      const nextImg = new Image();
      nextImg.src = carouselImages[nextIndex].src;
      
      // Load previous image
      const prevImg = new Image();
      prevImg.src = carouselImages[prevIndex].src;
    };

    preloadNextAndPrevious();
  }, [currentIndex, carouselImages]);

  // Animation variants for smoother transitions
  const imageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  // Track swipe direction for animations
  const [direction, setDirection] = useState(0);

  const slide = (newDirection) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full bg-gray-50 shadow-lg rounded-xl overflow-hidden">
      {/* Services Section */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col min-h-[400px] lg:h-[500px] overflow-hidden order-2 lg:order-1 shadow-inner">
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-2 text-gray-800 px-4 md:px-6 pt-4 md:pt-6">
          Our Services
        </h2>
        <div className="flex-1 flex flex-col justify-between px-4 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-0">
          {services.map((service, index) => (
            <Link 
              key={index}
              to={service.link}
              className={`p-4 md:p-8 rounded-xl transition-all duration-300 
                hover:shadow-xl hover:-translate-y-1 ${service.color}
                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              aria-label={service.title}
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
        aria-roledescription="carousel"
        aria-label="Product images carousel"
      >
        {/* Loading state with progress indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading images...</p>
            </div>
          </div>
        )}

        {/* Low-quality image placeholders with improved blur */}
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
            aria-hidden="true"
          />
        ))}

        {/* Main carousel images with improved animations */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full z-10"
            aria-roledescription="slide"
            aria-label={carouselImages[currentIndex].alt}
            role="group"
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

        {/* Enhanced Navigation Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-20">
          <button
            onClick={() => slide(-1)}
            className="bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all
                      transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => slide(1)}
            className="bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-all
                      transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Pause/Play button */}
        <button
          onClick={togglePause}
          className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-20
                    transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? (
            <Play className="w-5 h-5" />
          ) : (
            <Pause className="w-5 h-5" />
          )}
        </button>

        {/* Improved Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {carouselImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                pauseAutoPlay();
                setCurrentIndex(index);
              }}
              className={`
                w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 p-0
                ${currentIndex === index
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75'}
              `}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentIndex === index ? "true" : "false"}
            />
          ))}
        </div>

        {/* Image Caption/Description with improved accessibility */}
        <div className="absolute bottom-12 left-0 right-0 mx-auto px-6 py-2 bg-black/40 backdrop-blur-sm
                        text-white max-w-lg rounded-lg transform transition-opacity duration-500 z-20
                        opacity-0 hover:opacity-100 focus-within:opacity-100">
          <p className="text-center text-sm md:text-base">
            {carouselImages[currentIndex].alt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;