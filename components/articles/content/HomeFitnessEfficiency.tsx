"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
  Sparkles,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Локальные UI-компоненты для статьи (уникальные стили) ---

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={cn("py-16 md:py-24 px-6 max-w-6xl mx-auto", className)}>
    {children}
  </section>
);

const HighlightCard = ({ title, description, icon: Icon, color }: any) => (
  <div className="group relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden">
    <div className={cn("absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-10 rounded-full", color)} />
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 bg-white/5", color.replace('bg-', 'text-'))}>
      <Icon className="size-7" />
    </div>
    <h3 className="text-2xl font-oswald font-black uppercase tracking-tight text-white mb-4 group-hover:text-rose-400 transition-colors">
      {title}
    </h3>
    <p className="text-white/50 leading-relaxed text-lg">
      {description}
    </p>
  </div>
);

const ComparisonRow = ({ label, gym, home }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-white/5 items-center group">
    <div className="md:col-span-4 text-white/30 font-bold uppercase text-[10px] tracking-widest group-hover:text-white/60 transition-colors">
      {label}
    </div>
    <div className="md:col-span-4 text-white/60 text-sm italic pr-4">
      {gym}
    </div>
    <div className="md:col-span-4 text-rose-400 font-medium flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
      {home}
    </div>
  </div>
);

// --- Основная статья ---

export default function HomeFitnessEfficiency() {
  return (
    <div className="bg-[#09090b] text-white selection:bg-rose-500/30">
      
      {/* HERO SECTION - Уникальный дизайн */}
      <div className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 grayscale scale-110"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent" />
        </div>

        <Section className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                Методика
              </span>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <Clock className="size-3.5" /> 7 минут чтения
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-oswald font-black uppercase tracking-tighter leading-[0.85] text-white mb-8">
              Домашний фитнес: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">
                Больше чем зал
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-medium border-l-4 border-rose-500/30 pl-8 italic max-w-2xl">
              Развенчиваем миф о том, что для крутого тела нужен абонемент. Научный подход к тренировкам, где твоя гостиная становится местом силы.
            </p>
          </motion.div>
        </Section>
      </div>

      {/* SECTION 1: Научный разбор */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tight leading-none mb-8">
              Биологии <br /> всё равно
            </h2>
            <p className="text-lg text-white/40 leading-relaxed mb-8">
              Твоим мышцам не важно, сколько стоит тренажер. Им важен только один стимул — <strong>адекватное механическое напряжение</strong>. В MargoFitness мы используем физиологию, а не железо.
            </p>
            <div className="space-y-4">
              <ComparisonRow 
                label="Контроль темпа" 
                gym="Ожидание тренажера, пульс падает" 
                home="Непрерывная работа, идеальный тайминг" 
              />
              <ComparisonRow 
                label="Фокус" 
                gym="Внешние раздражители, шум" 
                home="Полная концентрация на ощущениях" 
              />
              <ComparisonRow 
                label="Гормоны" 
                gym="Кортизол от логистики и очередей" 
                home="Эндорфины в комфортной среде" 
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <HighlightCard 
              title="Метаболический стресс"
              description="Короткие интервалы отдыха и работа «внутри амплитуды» запускают мощный жиросжигающий отклик."
              icon={Zap}
              color="bg-rose-500"
            />
            <HighlightCard 
              title="Нейромышечная связь"
              description="Дома ты учишься чувствовать каждую мышцу, а не просто перемещать вес из точки А в точку Б."
              icon={Target}
              color="bg-orange-500"
            />
            <div className="md:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 relative overflow-hidden group">
              <Quote className="absolute -right-4 -bottom-4 size-40 text-rose-500/5 group-hover:scale-110 transition-transform duration-700" />
              <p className="text-2xl font-oswald font-black uppercase text-white mb-6 italic">
                «Зал — это часто социальная прокрастинация. Дом — это 40 минут чистой эффективности».
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center font-black">M</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">Марго, твой наставник</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 2: Инфографика (Чистый CSS/Tailwind) */}
      <div className="bg-white/[0.02] border-y border-white/5 py-24">
        <Section>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tight mb-6 text-white">
              Эффект EPOC
            </h2>
            <p className="text-white/40 text-lg">
              Почему 40 минут дома эффективнее 2-х часов в зале? Секрет в «дожиге» калорий после тренировки.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {[
              { label: "Кардио в зале", val: 30, color: "bg-white/10", height: "h-32" },
              { label: "Обычная силовая", val: 60, color: "bg-white/20", height: "h-64" },
              { label: "MargoFitness", val: 100, color: "bg-rose-500", height: "h-96", active: true }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="relative w-full flex items-end justify-center">
                  <div className={cn(
                    "w-full max-w-[120px] rounded-t-[2rem] transition-all duration-1000 ease-out relative group-hover:brightness-125",
                    item.height,
                    item.color,
                    item.active && "shadow-[0_0_50px_rgba(244,63,94,0.3)]"
                  )}>
                    {item.active && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-rose-500 font-black font-oswald text-4xl animate-pulse">
                        MAX
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                    item.active ? "text-rose-500" : "text-white/20"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    {item.val}% эффективности
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* FINAL CTA */}
      <Section className="text-center">
        <div className="max-w-2xl mx-auto space-y-10">
          <Sparkles className="size-12 text-rose-500 mx-auto" />
          <h2 className="text-4xl md:text-7xl font-oswald font-black uppercase tracking-tighter text-white">
            Готова начать <br /> по-настоящему?
          </h2>
          <p className="text-white/40 text-xl leading-relaxed">
            Не жди понедельника. Твой результат начинается с первого осознанного движения в твоей гостиной.
          </p>
          <button className="group relative px-12 py-6 rounded-full bg-rose-500 text-white font-black text-lg uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-rose-500/20 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              Начать тренировку <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </div>
      </Section>

    </div>
  );
}
