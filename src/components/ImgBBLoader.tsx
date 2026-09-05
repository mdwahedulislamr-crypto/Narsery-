import React, { useState, useEffect } from "react";

interface ImgBBLoaderProps {
  id: string; // The raw ID, e.g. "N2whzJqJ" or "4gd5RdCK"
  alt: string;
  className?: string;
  fallbackUrl: string;
  directUrl?: string;
}

export default function ImgBBLoader({ id, alt, className = "", fallbackUrl, directUrl }: ImgBBLoaderProps) {
  // Clean up ID - sometimes a trailing character is a typo, so we try multiple variations
  const cleanId = id.trim();
  const idWithoutLastChar = cleanId.length > 1 ? cleanId.slice(0, -1) : cleanId;

  // Generate a list of candidate direct image URLs
  const getCandidates = () => {
    const list: string[] = [];
    
    // 0. Explicit direct URL if provided
    if (directUrl) {
      list.push(directUrl);
    }

    // 1. Specific known imgbb mappings (HD Full Resolution direct URLs)
    if (cleanId === "1YGrz1Cq") {
      list.push("https://i.ibb.co/JWjv3VY7/file-0000000086b482089b85b2cb2fba4460.png");
    }
    if (cleanId === "HLhb5sZR") {
      list.push("https://i.ibb.co/V0wzfZ6b/file-00000000d0bc821082cb2b84f48f1430.png");
    }
    if (cleanId === "DHG7rkJY") {
      list.push("https://i.ibb.co/hJXKYH6c/file-000000004cf88211b21046762550d407.png");
    }
    if (cleanId === "KcC6pZwF") {
      list.push("https://i.ibb.co/NgwxdhSZ/file-00000000300481fa8784f816dfc70b66.png");
    }
    if (cleanId === "6cXy2rvj") {
      list.push("https://i.ibb.co/kVmGp53N/FB-IMG-1788208310227.jpg");
    }
    if (cleanId === "LX4bH1DS") {
      list.push("https://i.ibb.co/MxqWQ7yn/IMG-20260901-023357.jpg");
    }
    if (cleanId === "N2whzJqJ") {
      list.push("https://i.ibb.co/MkqTLtHt/images-1.jpg");
    }
    if (cleanId === "4gd5RdCK") {
      list.push("https://i.ibb.co/84cSgcGN/IMG-20260721-WA0003.jpg");
    }
    
    // 2. Direct standard formats for the main ID
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
