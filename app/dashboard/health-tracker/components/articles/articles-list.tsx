"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, ArrowRight, BookOpen, Search, Sparkles, CheckCircle2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  category: string;
  access_level: "free" | "basic" | "pro" | "elite";
  reading_time: number;
  is_read?: boolean;
}

interface ArticlesListProps {
  articles: Article[];
  userTier: string;
  onSelectArticle: (slug: string) => void;
}

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

const TIER_COLORS = {
  free: "text-white/40 border-white/10 bg-white/5",
  basic: "text-orange-400 border-orange-400/30 bg-orange-500/10",
  pro: "text-purple-400 border-purple-400/30 bg-purple-500/10",
  elite: "text-amber-400 border-amber-400/30 bg-amber-500/10",
  read: "text-emerald-400 border-emerald-400/30 bg-emerald-500/10",
  time: "text-white/40 border-white/10 bg-white/5",
};

const TIER_LABELS = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

export const ArticlesList = ({ articles, userTier, onSelectArticle }: ArticlesListProps) => {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories = ["Все", "Прочитанные", "Непрочитанные"];

  const filteredArticles = articles.filter((a) => {
    let matchesCategory = true;
    if (activeCategory === "Все") {
      matchesCategory = true;
    } else if (activeCategory === "Прочитанные") {
      matchesCategory = !!a.is_read;
    } else if (activeCategory === "Непрочитанные") {
      matchesCategory = !a.is_read;
    }

    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hasAccess = (articleLevel: string) => {
    return (
      TIER_WEIGHTS[userTier as keyof typeof TIER_WEIGHTS] >=
      TIER_WEIGHTS[articleLevel as keyof typeof TIER_WEIGHTS]
    );
  };

  return (
    <div className="space-y-8">
      {/* Поиск и Фильтры */}
      <div className="flex items-center justify-between gap-3 h-10">
        <div className="flex-1 flex items-center overflow-hidden h-full">
          <AnimatePresence mode="wait" initial={false}>
            {!isSearchOpen ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex overflow-x-auto no-scrollbar gap-2 w-full"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 h-10",
                      activeCategory === cat
                        ? "bg-slate-400 text-black shadow-lg shadow-slate-400/20"
                        : "bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="search-input"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="relative flex items-center h-full"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-base font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-slate-400/50 transition-all h-10"
                />
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 text-white/40 hover:text-white"
                >
                  <Search className="h-4 w-4 rotate-45" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Search - Always visible */}
        <div className="hidden md:flex relative w-48 lg:w-64 group shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-slate-400/50 transition-all h-10"
          />
        </div>

        {/* Mobile Search Trigger */}
        {!isSearchOpen && (
          <div className="md:hidden shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Сетка статей - 2 колонки на мобилках */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => {
            const locked = !hasAccess(article.access_level);
            
            return (
              <button
                key={article.id}
                onClick={() => onSelectArticle(article.slug)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-slate-400/30 transition-all duration-500 text-left",
                  locked && "opacity-80"
                )}
              >
                {/* Изображение */}
                <div className="relative aspect-video md:h-48 w-full overflow-hidden">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute left-3 top-3 md:left-4 md:top-4 flex flex-wrap gap-1 md:gap-2">
                    <Badge className="bg-black/40 backdrop-blur-md text-white border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0 md:px-2 md:py-0.5">
                      {article.category}
                    </Badge>
                  </div>
                </div>

                {/* Контент */}
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <h3 className="text-sm md:text-xl font-oswald font-black text-white uppercase tracking-tight mb-2 md:mb-3 group-hover:text-slate-300 transition-colors line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  <p className="hidden md:block text-xs text-white/40 leading-relaxed line-clamp-2 mb-6 flex-1">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <Badge className={cn(
                        "text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-1.5 py-0 md:px-2 md:py-0.5 border-none",
                        TIER_COLORS.time
                      )}>
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" /> {article.reading_time} мин
                      </Badge>

                      <Badge className={cn(
                        "text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0 md:px-2 md:py-0.5 border-none",
                        TIER_COLORS[article.access_level as keyof typeof TIER_COLORS]
                      )}>
                        {TIER_LABELS[article.access_level as keyof typeof TIER_LABELS]}
                      </Badge>

                      {article.is_read && (
                        <Badge className={cn(
                          "text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0 md:px-2 md:py-0.5 border-none",
                          TIER_COLORS.read
                        )}>
                          Прочитано
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:translate-x-1 transition-transform shrink-0">
                      <span className="hidden xs:inline">Читать</span> <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <BookOpen className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">Статьи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};
