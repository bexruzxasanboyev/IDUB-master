"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = ImageProps & {
  fallbackText?: string;
};

export default function SafeImage({ fallbackText, alt, className, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center ${className || ""}`}
        style={props.fill ? { position: "absolute", inset: 0 } : undefined}
      >
        <span className="text-white/20 text-2xl font-bold">
          {fallbackText || alt?.charAt(0) || "?"}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
