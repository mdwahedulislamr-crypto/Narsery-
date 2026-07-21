import React, { useState, useEffect } from "react";

interface ImgBBLoaderProps {
  id: string; // The raw ID, e.g. "zTwFc571" or "V0f0n9QW"
  alt: string;
  className?: string;
  fallbackUrl: string;
}

export default function ImgBBLoader({ id, alt, className = "", fallbackUrl }: ImgBBLoaderProps) {
  // Clean up ID - sometimes a trailing character is a typo, so we try multiple variations
  const cleanId = id.trim();
  const idWithoutLastChar = cleanId.length > 1 ? cleanId.slice(0, -1) : cleanId;

  // Generate a list of candidate direct image URLs
  const getCandidates = () => {
    const list: string[] = [];
    
    // 1. Direct standard formats for the main ID
    list.push(`https://i.ibb.co/${cleanId}/${cleanId}.jpg`);
    list.push(`https://i.ibb.co/${cleanId}/${cleanId}.png`);
    list.push(`https://i.ibb.co/${cleanId}/${cleanId}.jpeg`);
    list.push(`https://i.ibb.co/${cleanId}/${cleanId}.webp`);
    list.push(`https://i.ibb.co/${cleanId}/image.png`);
    list.push(`https://i.ibb.co/${cleanId}/image.jpg`);
    list.push(`https://i.ibb.co/${cleanId}/image.jpeg`);
    list.push(`https://i.ibb.co/${cleanId}/1.jpg`);
    list.push(`https://i.ibb.co/${cleanId}/1.png`);
    list.push(`https://i.ibb.co/${cleanId}/original.jpg`);
    list.push(`https://i.ibb.co/${cleanId}/original.png`);

    // 2. Direct formats for the ID without the last character (to fix trailing typos like '1' at the end of zTwFc571)
    if (idWithoutLastChar !== cleanId) {
      list.push(`https://i.ibb.co/${idWithoutLastChar}/${idWithoutLastChar}.jpg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/${idWithoutLastChar}.png`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/${idWithoutLastChar}.jpeg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/${idWithoutLastChar}.webp`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/image.png`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/image.jpg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/image.jpeg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/1.jpg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/1.png`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/original.jpg`);
      list.push(`https://i.ibb.co/${idWithoutLastChar}/original.png`);
    }

    // 3. Premium high-quality unsplash fallback (Put before html link to avoid rendering broken HTML as images)
    list.push(fallbackUrl);

    // 4. Fallback to the viewer link (as a last resort)
    list.push(`https://ibb.co/${cleanId}`);

    return list;
  };

  const candidates = getCandidates();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <img
      src={candidates[currentIndex]}
      alt={alt}
      className={`${className} ${hasError ? "opacity-50" : "opacity-100"} transition-opacity duration-350`}
      onError={handleError}
      referrerPolicy="no-referrer"
    />
  );
}
