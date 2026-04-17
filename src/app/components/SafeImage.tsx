"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { normalizeImageUrl } from "@/lib/api";

type SafeImageProps = ImageProps & {
  fallbackText?: string;
};

export default function SafeImage({ fallbackText, alt, className, sizes, quality, ...props }: SafeImageProps) {
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

  const normalizedSrc = normalizeImageUrl(props.src as string);

  // Provide sensible responsive defaults so callers using `fill` don't end up
  // downloading the full-sized image when a small cell is rendered.
  const resolvedSizes = sizes ?? (props.fill ? "(max-width: 768px) 50vw, 33vw" : undefined);
  const resolvedQuality = quality ?? 75;

  return (
    <Image
      {...props}
      src={normalizedSrc || props.src}
      alt={alt}
      sizes={resolvedSizes}
      quality={resolvedQuality}
      className={className}
      onError={() => setError(true)}
    />
  );
}
