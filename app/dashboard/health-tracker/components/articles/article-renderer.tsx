"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, Lock, Sparkles, Share2, Loader2 } from "lucide-react";
import { SubscriptionUpgradeModal } from "@/components/subscription-upgrade-modal";
import { MDXRemote } from "next-mdx-remote";
import { Callout, ExpertTip, Checklist } from "@/components/articles/mdx-components";
import { InteractiveChart } from "@/components/articles/interactive-chart";

interface ArticleRendererProps {
  article: any;
  hasAccess: boolean;
  userTier: string;
  onBack: () => void;
}

const components = {
  Callout,
  ExpertTip,
  Checklist,
  InteractiveChart,
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-[#09090b] pb-20 text-left"
    >
      {/* Шапка статьи */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden rounded-[3rem] border border-white/10">
        <img
          src={article.image_url || "/placeholder-article.jpg"}
          alt={article.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-4xl">
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" /> Назад к материалам
            </button>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="bg-slate-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                {article.category}
              </Badge>
              <Badge className="bg-white/10 backdrop-blur-md text-white/80 border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                <Clock className="h-3.5 w-3.5" /> {article.reading_time} мин
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              {article.title}
            </h1>

            <p className="text-lg md:text-xl text-white/60 leading-relaxed font-medium max-w-2xl border-l-2 border-slate-400/30 pl-6 italic">
              {article.description}
            </p>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {hasAccess ? (
          <div className="space-y-12">
            <article className="prose prose-invert prose-rose max-w-none 
              prose-headings:font-oswald prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-white
              prose-p:text-white/70 prose-p:text-lg prose-p:leading-relaxed
              prose-strong:text-slate-300 prose-strong:font-bold
              prose-ul:list-none prose-ul:pl-0
              prose-li:text-white/70 prose-li:text-lg prose-li:mb-4">
              
              <div className="markdown-content">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-10 w-10 text-slate-400 animate-spin mb-4" />
                    <p className="text-white/40 font-medium font-oswald uppercase tracking-widest">Загрузка контента...</p>
                  </div>
                ) : error ? (
                  <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 text-red-400 text-center">
                    {error}
                  </div>
                ) : mdxSource ? (
                  <MDXRemote {...mdxSource} components={components} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <Sparkles className="h-10 w-10 text-white/20 mb-4" />
                    <p className="text-white/40 font-medium">Контент статьи скоро будет доступен.</p>
                  </div>
                )}
              </div>
            </article>

            {/* Футер статьи */}
            <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-400 flex items-center justify-center text-black font-black">
                  M
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-widest text-white">Марго</div>
                  <div className="text-xs text-white/40">Эксперт MargoFitness</div>
                </div>
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                <Share2 className="h-4 w-4" /> Поделиться статьей
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white/[0.02] rounded-[3rem] border border-white/5">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
              <Lock className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-oswald font-black text-white uppercase tracking-tight mb-4">
              Материал ограничен
            </h2>
            <p className="mb-10 max-w-md text-white/40 font-medium leading-relaxed">
              Эта статья доступна только для пользователей с уровнем <span className="text-amber-400">{article.access_level.toUpperCase()}</span> и выше. 
              Обновите подписку, чтобы открыть доступ ко всей базе знаний.
            </p>
            <SubscriptionUpgradeModal 
              currentTier={userTier} 
              onUpgrade={() => {}} 
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
