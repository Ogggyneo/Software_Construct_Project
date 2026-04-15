import React, { useState, useEffect } from 'react';

const DEFAULT_FALLBACK = '/images/default.jpg'; // put this in public/images

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  // Reset image if src changes
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      {...props}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}