import { Sparkles, TrendingUp, Tag } from "lucide-react";

interface ProductBadgeProps {
  type: "new" | "sale" | "bestseller";
}

export function ProductBadge({ type }: ProductBadgeProps) {
  const badges = {
    new: {
      label: "New",
      icon: Sparkles,
      className: "bg-green-500 text-white",
    },
    sale: {
      label: "Sale",
      icon: Tag,
      className: "bg-red-500 text-white",
    },
    bestseller: {
      label: "Best Seller",
      icon: TrendingUp,
      className: "bg-blue-600 text-white",
    },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}
    >
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}
