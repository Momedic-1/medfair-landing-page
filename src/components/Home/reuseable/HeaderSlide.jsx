import React, { useState, useEffect } from "react";
import nurse2 from "../assets/bgimg.png";

const HeaderSlider = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Array of imported images
  const images = [nurse2];

  useEffect(() => {
    // Preload images
    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="w-full relative image-slider">
      <img
        src={images[currentImageIndex]}
        className="object-contain w-full max-h-full transition-opacity duration-1000 ease-in-out"
        alt="slider image"
      />
    </div>
  );
};

export default HeaderSlider;
