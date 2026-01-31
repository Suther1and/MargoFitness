"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle, Quote } from "lucide-react";

interface CalloutProps {
  children: React.ReactNode;
  type?: "info" | "warning" | "success" | "quote";
}

export const Callout = ({ children, type = "info" }: CalloutProps) => {
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    quote: <Quote className="h-5 w-5 text-purple-500" />,
  };

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    quote: "bg-purple-50 border-purple-200 text-purple-900 italic",
  };

  return (
    <div className={cn("my-6 flex gap-4 rounded-xl border p-4", styles[type])}>
      <div className="mt-1 shrink-0">{icons[type]}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

export const ExpertTip = ({ title = "Совет от Марго", children }: { title?: string; children: React.ReactNode }) => {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-[1px]">
      <div className="rounded-[15px] bg-white p-6">
        <h4 className="mb-2 flex items-center gap-2 font-bold text-rose-600">
          <span className="text-xl">✨</span> {title}
        </h4>
        <div className="text-gray-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export const Checklist = ({ items }: { items: string[] }) => {
  return (
    <div className="my-6 space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
          <span className="text-gray-700">{item}</span>
        </div>
      ))}
    </div>
  );
};
