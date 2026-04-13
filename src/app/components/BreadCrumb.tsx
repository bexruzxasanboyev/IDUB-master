"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiRightArrowAlt } from "react-icons/bi";

type BreadcrumbProps = {
  labels?: Record<string, string>;
  lastLabel?: string;
};

export default function Breadcrumb({ labels, lastLabel }: BreadcrumbProps = {}) {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 text-xs sm:text-sm font-second flex-wrap">
      <Link href="/" className="px-2.5 py-1 bg-white/8 border border-white/5 rounded-lg hover:bg-second/20 hover:text-second hover:border-second/20 transition-all duration-300 text-white/70">
        Bosh sahifa
      </Link>
      {pathParts.map((part, index) => {
        const href = "/" + pathParts.slice(0, index + 1).join("/");
        const isLast = index === pathParts.length - 1;
        const label =
          (isLast && lastLabel) ||
          labels?.[part] ||
          decodeURIComponent(part).replace(/-/g, " ");

        return (
          <div key={href} className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-gray-500"><BiRightArrowAlt /></span>
            {isLast ? (
              <span className="text-white capitalize truncate max-w-[200px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-white transition capitalize text-gray-400"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
