"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { SubscriptionUpgradeModal } from "@/components/subscription-upgrade-modal";

interface ArticleRendererProps {
  article: any;
  mdxContent: React.ReactNode;
  hasAccess: boolean;
  userTier: string;
}

export const ArticleRenderer = ({
  article,
  mdxContent,
  hasAccess,
  userTier,
}: ArticleRendererProps) => {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Шапка статьи */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <img
          src={article.image_url || "/placeholder-article.jpg"}
          alt={article.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <div className="container mx-auto max-w-3xl">
            <Link
              href="/dashboard/articles"
              className="mb-6 flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" /> Назад к списку
            </Link>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-rose-600 text-white border-none">
                {article.category}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-md text-white border-none flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.reading_time} мин
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto max-w-3xl px-6 py-12">
        {hasAccess ? (
          <article className="prose prose-rose max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-rose-600">
            <p className="text-xl text-gray-600 mb-8 leading-relaxed italic">
              {article.description}
            </p>
            
            <div className="markdown-content">
              {mdxContent || <p>Контент статьи временно недоступен.</p>}
            </div>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Lock className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Статья доступна только для уровня {article.access_level.toUpperCase()}
            </h2>
            <p className="mb-8 max-w-md text-gray-600">
              Ваш текущий уровень: {userTier.toUpperCase()}. Обновите подписку, чтобы получить доступ к этой и другим эксклюзивным статьям.
            </p>
            <SubscriptionUpgradeModal 
              currentTier={userTier} 
              onUpgrade={() => {}} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
