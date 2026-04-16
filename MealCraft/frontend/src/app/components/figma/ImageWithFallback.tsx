import React, { useState, useEffect } from 'react';

const API_URL = "http://localhost:5000";
const DEFAULT_FALLBACK = `${API_URL}/images/default.jpg`;

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  // Update when src changes
  useEffect(() => {
    if (src) {
      setImgSrc(src);
    } else {
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt || "image"}
      {...props}
      onError={() => {
        // prevent infinite loop
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}