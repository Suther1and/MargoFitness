"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock, Lock, ArrowRight } from "lucide-react";

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
}

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

export const ArticlesList = ({ articles, userTier }: ArticlesListProps) => {
  const [activeCategory, setActiveCategory] = useState("Все");

  const categories = ["Все", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles = articles.filter(
    (a) => activeCategory === "Все" || a.category === activeCategory
  );

  const hasAccess = (articleLevel: string) => {
    return (
      TIER_WEIGHTS[userTier as keyof typeof TIER_WEIGHTS] >=
      TIER_WEIGHTS[articleLevel as keyof typeof TIER_WEIGHTS]
    );
  };

  return (
    <div className="space-y-8">
      {/* Категории */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-rose-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Сетка статей */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article, index) => {
          const locked = !hasAccess(article.access_level);
          const isLarge = index === 0 && activeCategory === "Все";

          return (
            <Link
              key={article.id}
              href={`/dashboard/articles/${article.slug}`}
              className={cn(
                "group relative block overflow-hidden rounded-3xl transition-all hover:shadow-xl",
                isLarge ? "md:col-span-2 md:row-span-1" : ""
              )}
            >
              <Card className="h-full border-none bg-gray-50 overflow-hidden">
                <div
                  className={cn(
                    "relative overflow-hidden",
                    isLarge ? "h-64 md:h-80" : "h-48"
                  )}
                >
                  <img
                    src={article.image_url || "/placeholder-article.jpg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none">
                      {article.category}
                    </Badge>
                    {locked && (
                      <Badge variant="secondary" className="bg-amber-500 text-white border-none">
                        <Lock className="mr-1 h-3 w-3" /> {article.access_level.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className={cn(
                      "font-bold leading-tight",
                      isLarge ? "text-2xl md:text-3xl" : "text-xl"
                    )}>
                      {article.title}
                    </h3>
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {article.description}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between p-5 pt-0">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {article.reading_time} мин
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-rose-600">
                    Читать <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
