import {
  SearchX,
  BookmarkX,
  HistoryIcon,
  Sparkles,
  BellOff,
  UserX,
  Download,
  Lightbulb,
  Compass,
  Film,
  Inbox,
  CalendarX,
  PackageSearch,
  FilterX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Variant =
  | "search"
  | "saved"
  | "history"
  | "recommendations"
  | "notifications"
  | "favorite-actors"
  | "downloads"
  | "tips"
  | "explore"
  | "dramas"
  | "schedule"
  | "catalog"
  | "filter"
  | "generic";

const VARIANT_MAP: Record<Variant, { Icon: LucideIcon; color: string }> = {
  search: { Icon: SearchX, color: "from-second/30 to-second/5" },
  saved: { Icon: BookmarkX, color: "from-second/30 to-second/5" },
  history: { Icon: HistoryIcon, color: "from-second/30 to-second/5" },
  recommendations: { Icon: Sparkles, color: "from-second/30 to-second/5" },
  notifications: { Icon: BellOff, color: "from-second/30 to-second/5" },
  "favorite-actors": { Icon: UserX, color: "from-second/30 to-second/5" },
  downloads: { Icon: Download, color: "from-second/30 to-second/5" },
  tips: { Icon: Lightbulb, color: "from-second/30 to-second/5" },
  explore: { Icon: Compass, color: "from-second/30 to-second/5" },
  dramas: { Icon: Film, color: "from-second/30 to-second/5" },
  schedule: { Icon: CalendarX, color: "from-second/30 to-second/5" },
  catalog: { Icon: PackageSearch, color: "from-second/30 to-second/5" },
  filter: { Icon: FilterX, color: "from-second/30 to-second/5" },
  generic: { Icon: Inbox, color: "from-second/30 to-second/5" },
};

type Props = {
  variant?: Variant;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
};

export default function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  compact = false,
}: Props) {
  const { Icon, color } = VARIANT_MAP[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-10" : "py-16 sm:py-24"
      }`}
    >
      <div className="relative mb-5 sm:mb-6">
        {/* Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} blur-2xl scale-150 opacity-70`}
        />
        {/* Icon container */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon
            className="text-second"
            strokeWidth={1.6}
            size={compact ? 32 : 38}
          />
        </div>
        {/* Decorative rings */}
        <div className="pointer-events-none absolute inset-0 rounded-full border border-second/20 scale-[1.35] animate-pulse" />
        <div className="pointer-events-none absolute inset-0 rounded-full border border-second/10 scale-[1.65]" />
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-1.5 sm:mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-gray-400 max-w-sm sm:max-w-md leading-relaxed px-4">
          {description}
        </p>
      )}
      {action && <div className="mt-5 sm:mt-6">{action}</div>}
    </div>
  );
}
