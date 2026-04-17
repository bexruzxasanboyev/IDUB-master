"use client";

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Passive + rAF-throttled — updates happen at most once per frame and
    // don't block the scroll thread.
    let ticking = false;
    const toggle = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        ticking = false;
      });
    };
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-second/90 backdrop-blur-sm text-white shadow-[0_4px_20px_rgba(126,84,230,0.35)] border border-second/30 transition-all duration-400 hover:scale-110 hover:bg-second hover:shadow-[0_8px_30px_rgba(126,84,230,0.5)] active:scale-95 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
      }`}
    >
      <FaArrowUp className="text-sm" />
    </button>
  );
}
