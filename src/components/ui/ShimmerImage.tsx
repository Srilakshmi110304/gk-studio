// components/ui/ShimmerImage.tsx
import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ShimmerImage: React.FC<ShimmerImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 shimmer" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default ShimmerImage;