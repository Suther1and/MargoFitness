"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, ArrowRight, BookOpen, Search } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  category: string;
  access_level: "free" | "basic" | "pro" | "elite";
  reading_time: number;
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

export const ArticlesList = ({ articles, userTier, onSelectArticle }: ArticlesListProps) => {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Все", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = activeCategory === "Все" || a.category === activeCategory;
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                activeCategory === cat
                  ? "bg-slate-400 text-black shadow-lg shadow-slate-400/20"
                  : "bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-slate-400 transition-colors" />
          <input
            type="text"
            placeholder="Поиск статей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-slate-400/50 transition-all"
          />
        </div>
      </div>

      {/* Сетка статей */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => {
            const locked = !hasAccess(article.access_level);
            
            return (
              <motion.button
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectArticle(article.slug)}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-slate-400/30 transition-all duration-500 text-left"
              >
                {/* Изображение */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={article.image_url || "/placeholder-article.jpg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge className="bg-black/40 backdrop-blur-md text-white border-white/10 text-[9px] font-black uppercase tracking-widest">
                      {article.category}
                    </Badge>
                    {locked && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Lock className="h-3 w-3" /> {article.access_level}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Контент */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-oswald font-black text-white uppercase tracking-tight mb-3 group-hover:text-slate-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-3 mb-6 flex-1">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/20">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {article.reading_time} мин
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:translate-x-1 transition-transform">
                      Читать <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </motion.button>
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
