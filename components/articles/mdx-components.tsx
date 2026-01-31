"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle, Quote, Sparkles, TrendingUp, Zap, Target } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
  type?: "info" | "warning" | "success" | "quote";
}

export const Callout = ({ children, type = "info" }: CalloutProps) => {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/5 text-blue-200",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
    quote: "border-slate-400/30 bg-white/5 text-slate-300 italic",
  };

  const icons = {
    info: <Info className="h-5 w-5 text-blue-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    quote: <Quote className="h-5 w-5 text-slate-400" />,
  };

  return (
    <div className={cn("my-10 flex gap-4 rounded-2xl border p-6 backdrop-blur-sm max-w-4xl mx-auto", styles[type])}>
      <div className="mt-1 shrink-0">{icons[type]}</div>
      <div className="text-lg leading-relaxed">{children}</div>
    </div>
  );
};

export const ExpertTip = ({ title = "Совет от Марго", children }: { title?: string; children: React.ReactNode }) => {
  return (
    <div className="my-12 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:p-12 max-w-5xl mx-auto">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-[80px]" />
      <div className="relative">
        <h4 className="mb-6 flex items-center gap-3 font-oswald text-3xl font-black uppercase tracking-tight text-white">
          <Sparkles className="h-8 w-8 text-rose-400" /> {title}
        </h4>
        <div className="text-xl text-white/80 leading-relaxed italic border-l-4 border-rose-500/30 pl-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Checklist = ({ items }: { items: string[] }) => {
  return (
    <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-400/20 text-slate-300">
            <CheckCircle className="h-4 w-4" />
          </div>
          <span className="text-white/90 text-base font-medium leading-snug">{item}</span>
        </div>
      ))}
    </div>
  );
};

export const StatCard = ({ label, value, description, iconType }: { label: string, value: string, description?: string, iconType?: "trend" | "zap" | "target" }) => {
  const icons = {
    trend: TrendingUp,
    zap: Zap,
    target: Target,
  };
  const Icon = iconType ? icons[iconType] : null;

  return (
    <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col gap-4">
      {Icon && <Icon className="size-8 text-rose-500" />}
      <div className="text-sm font-bold uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-5xl font-black font-oswald text-white tracking-tighter">{value}</div>
      {description && <div className="text-white/60 leading-relaxed">{description}</div>}
    </div>
  );
};

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16 items-start max-w-6xl mx-auto">
    {children}
  </div>
);

export const Col = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-6">{children}</div>
);

export const FullWidth = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full my-16">
    {children}
  </div>
);
