"use client";

import { useState } from "react";

const PREVIEW_LENGTH = 220;

export default function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > PREVIEW_LENGTH;
  const displayText = !needsTruncation || expanded ? text : text.slice(0, PREVIEW_LENGTH).trimEnd() + "…";

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-start sm:text-base text-gray-400 leading-relaxed">
        {displayText}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs sm:text-sm font-semibold text-second hover:text-second/80 transition-colors duration-200"
        >
          {expanded ? "Kamroq" : "Ko'proq"}
        </button>
      )}
    </div>
  );
}
