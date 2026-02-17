"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Clock, 
  ChevronLeft, 
  Quote,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Локальные UI-компоненты для статьи (уникальные стили) ---

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={cn("py-12 md:py-20", className)}>
    {children}
  </section>
);

const HighlightCard = ({ title, description, icon: Icon, color }: any) => (
  <div className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
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

export default function HomeFitnessEfficiency({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-rose-500/30"
    >
      {/* Кнопка назад */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Назад к материалам
        </button>
      </div>

      {/* HERO SECTION - Возвращаем старую структуру заголовка */}
      <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/[0.02] mb-16">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[400px] md:min-h-[500px]">
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-16">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-slate-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Методика
              </span>
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 7 мин чтения
              </span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Домашний фитнес: <br />
              <span className="text-rose-500">Больше чем зал</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-medium border-l-4 border-slate-400/30 pl-8 italic">
              Развенчиваем миф о том, что для крутого тела нужен абонемент. Научный подход к тренировкам, где твоя гостиная становится местом силы.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="max-w-5xl mx-auto">
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-4xl md:text-5xl font-oswald font-black uppercase tracking-tight leading-none mb-8">
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
                <div className="flex items-center gap-4 text-white/40">
                  <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center font-black text-white">M</div>
                  <div className="text-xs font-bold uppercase tracking-widest">Марго, эксперт MargoFitness</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* SECTION 2: Инфографика */}
        <Section className="bg-white/[0.02] rounded-[3rem] border border-white/5 px-8 md:px-16 my-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-oswald font-black uppercase tracking-tight mb-6 text-white">
              Эффект EPOC
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              Почему 40 минут дома эффективнее 2-х часов в зале? Секрет в «дожиге» калорий после тренировки.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
            {[
              { label: "Кардио в зале", val: 30, color: "bg-white/10", height: "h-32" },
              { label: "Обычная силовая", val: 60, color: "bg-white/20", height: "h-64" },
              { label: "MargoFitness", val: 100, color: "bg-rose-500", height: "h-80", active: true }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="relative w-full flex items-end justify-center">
                  <div className={cn(
                    "w-full max-w-[100px] rounded-t-[1.5rem] transition-all duration-1000 ease-out relative group-hover:brightness-125",
                    item.height,
                    item.color,
                    item.active && "shadow-[0_0_40px_rgba(244,63,94,0.2)]"
                  )}>
                    {item.active && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-rose-500 font-black font-oswald text-3xl animate-pulse">
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

        {/* FINAL CTA */}
        <Section className="text-center py-24">
          <div className="max-w-2xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white leading-none">
              Готова начать <br /> по-настоящему?
            </h2>
            <p className="text-white/40 text-xl leading-relaxed">
              Не жди понедельника. Твой результат начинается с первого осознанного движения в твоей гостиной.
            </p>
            <button className="group relative px-12 py-6 rounded-full bg-rose-500 text-white font-black text-lg uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-rose-500/20 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Начать тренировку <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </Section>
      </div>
    </motion.div>
  );
}
