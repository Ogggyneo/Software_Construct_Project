import React, { useState, useEffect } from 'react';

/* =========================
   ✅ EXPORT THIS
========================= */
export const getImageUrl = (src?: string) => {
  if (!src) return "/images/default.jpg";

  // Full URL (keep)
  if (src.startsWith("http")) return src;

  // Already correct path
  if (src.startsWith("/images")) return src;

  // If already has extension
  if (src.includes(".")) return `/images/${src}`;

  // Treat as ID
  return `/images/${src}.jpg`;
};

const DEFAULT_FALLBACK = "/images/default.jpg";

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string>(getImageUrl(src));

  useEffect(() => {
    setImgSrc(getImageUrl(src));
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || "image"}
      {...props}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}