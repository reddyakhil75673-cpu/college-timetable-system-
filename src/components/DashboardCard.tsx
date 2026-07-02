import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  description?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "bg-slate-50 text-slate-700 border-slate-200",
  description,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Icon frame */}
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${color}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Stats details */}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="mt-1 text-2xl font-extrabold text-slate-800 leading-none tracking-tight">{value}</span>
        {description && (
          <span className="mt-1.5 text-xs font-medium text-slate-500 truncate leading-tight">{description}</span>
        )}
      </div>
    </div>
  );
};
