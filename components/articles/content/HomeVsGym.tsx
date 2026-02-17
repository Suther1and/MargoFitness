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
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  Building2,
  Home,
  Shield,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Локальные UI-компоненты для статьи ---

const ConceptItem = ({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: "rose" | "orange" | "emerald";
  children: React.ReactNode;
}) => {
  const colors = {
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/15",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/15",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
  };

  const iconColors = {
    rose: "text-rose-400",
    orange: "text-orange-400",
    emerald: "text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.03] transition-colors text-left">
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center shrink-0 border",
            colors[color]
          )}
        >
          <Icon className={cn("size-4.5", iconColors[color])} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white/90 mb-1.5">{title}</h3>
          <p className="text-sm text-white/45 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
};

const TipBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 md:my-10 rounded-[2.5rem] md:rounded-[3.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 p-6 md:p-8 text-left inline-block w-auto max-w-full">
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Lightbulb className="size-4 text-emerald-400/80" />
        </div>
        <p className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-emerald-400/70">
          Совет от Марго
        </p>
      </div>
      <p className="text-sm md:text-base text-white/60 leading-relaxed">{children}</p>
    </div>
  </div>
);

// --- Основная статья ---

export default function HomeVsGym({ onBack, metadata }: { onBack: () => void, metadata?: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-rose-500/30"
    >
      {/* HERO SECTION */}
      <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-white/[0.02] mb-16">
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 hidden md:block">
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Назад к материалам
          </button>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[400px] md:min-h-[500px]">
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-16 pt-6 md:pt-24 text-left">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-slate-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Методика
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 6 мин чтения
              </span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Домашние тренировки VS Зал: <br />
              <span className="text-rose-500">почему это работает</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-rose-500/30 pl-8 italic">
              Разбираемся, почему домашние тренировки дают реальный результат и в чём их честное преимущество перед залом. Наука, практика, ноль мифов.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <article className="max-w-[860px] mx-auto px-4 md:px-0">
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Давай начистоту. Ты наверняка хотя бы раз слышала: «Дома нормально не потренируешься», «Без тренажёров результата не будет», «Это всё для тех, кому лень дойти до зала». Я слышала это сотни раз - и от подруг, и от коллег по индустрии. И каждый раз улыбалась, потому что знаю: за этими фразами стоит не наука, а привычка.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Сегодня я хочу разложить всё по полочкам. Без розовых очков, без агрессивного маркетинга. Просто факты о том, как работает твоё тело и почему ему всё равно, где ты тренируешься - в зале за пять тысяч в месяц или в своей гостиной.
          </p>
        </div>

        <blockquote className="relative my-14 pl-8 text-left">
          <div className="absolute left-0 top-0 bottom-[-8px] w-0.5 bg-rose-500/40" />
          <Quote className="absolute -left-3 -top-1 size-6 text-rose-500/30 bg-[#09090b] p-0.5" />
          <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
            «Твоим мышцам безразлично, стоит ли рядом с тобой хромированная стойка с блинами. Им важно одно - получили ли они достаточный стимул для роста. И это полностью в твоих руках.»
          </p>
          <footer className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center font-black text-white overflow-hidden shadow-lg shadow-rose-500/20">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest text-white/90 leading-none">Марго</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-white/30 mt-1">Основатель MargoFitness</span>
            </div>
          </footer>
        </blockquote>

        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Что на самом деле нужно мышцам
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Когда мы говорим о результате - подтянутом теле, тонусе, сжигании жира - всё сводится к трём вещам: <strong className="text-white/80">механическое напряжение</strong>, <strong className="text-white/80">метаболический стресс</strong> и <strong className="text-white/80">мышечное повреждение</strong>. Это три кита адаптации, о которых говорит спортивная физиология. И ни один из них не требует абонемента в зал.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <ConceptItem icon={Shield} title="Механическое напряжение" color="rose">
              Это про то, как долго и под каким углом мышца находится под нагрузкой. Замедли движение, задержись в нижней точке приседа на две секунды - и гантель даже в 3 кг даст нужную нагрузку.
            </ConceptItem>
            <ConceptItem icon={Flame} title="Метаболический стресс" color="orange">
              Жжение в мышцах при интенсивной работе с короткими паузами запускает мощный гормональный отклик: выброс гормона роста и тестостерона, которые отвечают за сжигание жира.
            </ConceptItem>
            <ConceptItem icon={TrendingUp} title="Мышечное повреждение" color="emerald">
              Микроразрывы волокон, после заживления которых мышца становится сильнее. Для этого достаточно регулярно менять паттерны движения и увеличивать сложность.
            </ConceptItem>
          </div>
        </section>

        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Честное сравнение: зал vs дом
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            <strong className="text-white/80">Зал в теории:</strong> ты приходишь 3 раза в неделю, выполняешь чёткую программу, работаешь с тренером, прогрессируешь. <strong className="text-white/80">Зал в реальности:</strong> 40 минут на дорогу, 15 минут на переодевание, 10 минут ждёшь свободный тренажёр, отвлекаешься на телефон между подходами, ещё 40 минут обратно. Из 60 минут тренировки эффективных остаётся 25-30.
          </p>

          <div className="rounded-2xl border border-white/10 overflow-hidden mb-8">
            <div className="grid grid-cols-3 text-center">
              <div className="p-4 bg-white/[0.02] border-b border-r border-white/10" />
              <div className="p-4 bg-white/[0.02] border-b border-r border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="size-4 text-white/30" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Зал</span>
                </div>
              </div>
              <div className="p-4 bg-rose-500/[0.06] border-b border-white/10">
                <div className="flex items-center justify-center gap-2">
                  <Home className="size-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Дом</span>
                </div>
              </div>
            </div>
            {[
              { label: "Дорога", gym: "40-80 мин", home: "0 мин", homeWins: true },
              { label: "Чистая работа", gym: "25-30 мин", home: "38-40 мин", homeWins: true },
              { label: "Отвлечения", gym: "Высокие", home: "Минимальные", homeWins: true },
              { label: "Стресс-фактор", gym: "Пробки, очереди", home: "Отсутствует", homeWins: true },
              { label: "Тяжёлые веса", gym: "Доступны", home: "Ограничены", homeWins: false },
              { label: "Регулярность", gym: "~40% бросают", home: "Выше в 2 раза", homeWins: true },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 text-center border-b border-white/5 last:border-b-0">
                <div className="p-3.5 md:p-4 text-left border-r border-white/10 text-sm font-medium text-white/50">{row.label}</div>
                <div className="p-3.5 md:p-4 border-r border-white/10 text-sm text-white/40">{row.gym}</div>
                <div className={cn("p-3.5 md:p-4 text-sm font-medium", row.homeWins ? "text-rose-400 bg-rose-500/[0.04]" : "text-white/40")}>{row.home}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Миф про «несерьёзные» веса
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            «С гантелями по 2-4 кг ничего не накачаешь» - самый живучий миф. Исследование в <em>Journal of Applied Physiology</em> показало: тренировки с лёгкими весами (30% от максимума) до отказа дают <strong className="text-white/80">сопоставимый рост мышечной массы</strong> с тяжёлыми весами.
          </p>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6">Минуты реальной мышечной работы за 40-минутную сессию</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 text-white/20" />
                    <span className="text-sm font-medium text-white/50">Зал (с паузами)</span>
                  </div>
                  <span className="text-sm font-bold text-white/40 tabular-nums">18 мин</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "45%" }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-white/15 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <Home className="size-4 text-rose-400" />
                    <span className="text-sm font-medium text-white/70">Дом (интенсив)</span>
                  </div>
                  <span className="text-sm font-bold text-rose-400 tabular-nums">34 мин</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "85%" }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 }} className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Главное преимущество, о котором не говорят
          </h2>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Знаешь, что убивает результат больше всего? Не маленькие гантели, не отсутствие тренажёра для ягодиц. <strong>Пропущенные тренировки.</strong>
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Я строю MargoFitness именно на этом принципе: максимум результата при минимуме барьеров. Потому что лучшая тренировка - это та, которую ты реально делаешь. Не та, о которой мечтаешь, глядя на абонемент в сумке.
          </p>

          <TipBlock>
            Не сравнивай свой старт с чьей-то серединой пути. Ты начинаешь - и это уже сильнее, чем ты думаешь. Каждая тренировка, даже самая первая, запускает процессы, которые меняют тело изнутри. Просто доверься процессу и будь последовательной.
          </TipBlock>
        </section>

        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Готова начать?
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Не жди понедельника. Твой результат начинается с первого движения в твоей гостиной.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-rose-500/15 mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>
      </article>
    </motion.div>
  );
}
