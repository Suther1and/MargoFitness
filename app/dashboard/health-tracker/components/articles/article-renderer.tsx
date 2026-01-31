"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, Lock, Sparkles, Share2, Loader2 } from "lucide-react";
import { SubscriptionUpgradeModal } from "@/components/subscription-upgrade-modal";
import { MDXRemote } from "next-mdx-remote";
import { Callout, ExpertTip, Checklist, Row, Col, FullWidth, StatCard, ArticleLink } from "@/components/articles/mdx-components";
import { InteractiveChart } from "@/components/articles/interactive-chart";

import { SubscriptionTier, Article } from "@/types/database";

interface ArticleRendererProps {
  article: any;
  hasAccess: boolean;
  userTier: SubscriptionTier;
  onBack: () => void;
}

const components = {
  Callout,
  ExpertTip,
  Checklist,
  InteractiveChart,
  Row,
  Col,
  FullWidth,
  StatCard,
  ArticleLink,
};

export const ArticleRenderer = ({
  article,
  hasAccess,
  userTier,
  onBack,
}: ArticleRendererProps) => {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      if (!hasAccess) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/articles/${article.slug}`);
        const data = await res.json();
        
        if (data.source) {
          setMdxSource(data.source);
        } else {
          setError(data.error || "Не удалось загрузить контент");
        }
      } catch (err) {
        setError("Ошибка при загрузке статьи");
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [article.slug, hasAccess]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#09090b] pb-20 text-left"
    >
      {/* Шапка статьи */}
      <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/[0.02]">
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Назад
          </button>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[400px] md:min-h-[500px]">
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-16 pt-24 md:pt-24">
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="bg-slate-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                {article.category}
              </Badge>
              <Badge className="bg-white/10 backdrop-blur-md text-white/80 border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                <Clock className="h-3.5 w-3.5" /> {article.reading_time} мин
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              {article.title}
            </h1>

            <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-medium border-l-4 border-slate-400/30 pl-8 italic">
              {article.description}
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        {hasAccess ? (
          <div className="space-y-16">
            <article className="prose prose-invert prose-rose max-w-none 
              prose-headings:font-oswald prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black
              prose-h2:text-4xl prose-h2:mt-20 prose-h2:mb-10 prose-h2:text-white
              prose-p:text-white/80 prose-p:text-xl prose-p:leading-relaxed prose-p:max-w-3xl prose-p:mx-auto
              prose-strong:text-slate-200 prose-strong:font-bold
              prose-ul:list-none prose-ul:pl-0 prose-ul:max-w-3xl prose-ul:mx-auto
              prose-li:text-white/80 prose-li:text-xl prose-li:mb-6">
              
              <div className="markdown-content">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Loader2 className="h-12 w-12 text-slate-400 animate-spin mb-6" />
                    <p className="text-white/40 font-oswald uppercase tracking-widest text-lg">Загрузка экспертного контента...</p>
                  </div>
                ) : error ? (
                  <div className="p-10 rounded-[2rem] bg-red-500/5 border border-red-500/10 text-red-400 text-center text-lg">
                    {error}
                  </div>
                ) : mdxSource ? (
                  <MDXRemote {...mdxSource} components={components} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <Sparkles className="h-12 w-12 text-white/20 mb-6" />
                    <p className="text-white/40 font-medium text-lg">Контент статьи скоро будет доступен.</p>
                  </div>
                )}
              </div>
            </article>

            {/* Футер статьи */}
            <div className="pt-20 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-slate-400 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-slate-400/20">
                  M
                </div>
                <div>
                  <div className="text-lg font-black uppercase tracking-widest text-white">Марго</div>
                  <div className="text-sm text-white/40 font-bold uppercase tracking-tighter">Эксперт MargoFitness</div>
                </div>
              </div>
              
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-[0.2em] text-white/60">
                <Share2 className="h-5 w-5" /> Поделиться статьей
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] rounded-[4rem] border border-white/5">
            <div className="mb-10 flex h-28 w-24 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
              <Lock className="h-12 w-12" />
            </div>
            <h2 className="text-4xl font-oswald font-black text-white uppercase tracking-tight mb-6">
              Материал ограничен
            </h2>
            <p className="mb-12 max-w-lg text-white/40 font-medium text-lg leading-relaxed px-6">
              Эта статья доступна только для пользователей с уровнем <span className="text-amber-400 font-bold">{article.access_level.toUpperCase()}</span> и выше. 
              Обновите подписку, чтобы открыть доступ ко всей базе знаний.
            </p>
            <SubscriptionUpgradeModal 
              open={false}
              currentTier={userTier} 
              userId={""}
              onOpenChange={() => {}} 
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
