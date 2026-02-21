"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  Quote,
  ArrowRight,
  AlertTriangle,
  Utensils,
  Dumbbell,
  ShieldAlert,
  Lightbulb,
  Flame,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";
import { calculateBMI, getBMICategory, calculateCalorieNorms } from "@/app/dashboard/health-tracker/utils/bmi-utils";

export default function NutritionBasics({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "nutrition-basics",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

  useEffect(() => {
    const handleScrollToCalculator = (e: any) => {
      const element = document.getElementById('calorie-calculator');
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'instant'
        });

        // Если пришли из другой статьи, показываем кнопку возврата
        if (e.detail?.fromArticle === 'ration-constructor') {
          window.dispatchEvent(new CustomEvent('show-back-to-article', { 
            detail: { articleName: 'Конструктор рациона' } 
          }));
        }
      }
    };
    window.addEventListener('scroll-to-calorie-calculator', handleScrollToCalculator);
    return () => window.removeEventListener('scroll-to-calorie-calculator', handleScrollToCalculator);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-amber-500/30"
    >
      {/* HERO */}
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
              <span className="bg-amber-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Питание
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 7 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Основы питания:{" "}
              <span className="text-amber-400">
                3 правила, чтобы начать меняться
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-amber-400/30 pl-8 italic">
              Простые принципы,
              которые работают и которые ты сможешь применить уже сегодня.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Healthy food"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <article className="max-w-[860px] mx-auto px-4 md:px-0">
        {/* Вступление */}
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Давай я скажу тебе кое-что: ни одна тренировка в мире не «сожжёт» плохое питание. Если твоё тело получает <span className="text-white/90 font-bold">больше энергии</span>, чем тратит, оно будет запасать. Это не мнение, это <span className="text-amber-400/85 font-bold underline decoration-amber-500/30 underline-offset-4">физика</span>.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Но просто меньше есть - тоже не решение. Я дам три фундаментальных правила, которые <span className="text-white/90 font-bold">реально работают</span>. Без трекеров и взвешивания еды.
          </p>
        </div>

        {/* ПРАВИЛО 1 - Дефицит калорий */}
        <div id="calorie-calculator">
          <RuleSection number={1} title="Дефицит калорий - единственная причина похудения" accentColor="amber">
            <p className="text-lg text-white/70 leading-relaxed mb-6">
              Представь своё тело как банковский счёт. Еда - это доход. Всё, что
              ты делаешь - от дыхания до тренировки - это расходы.
            </p>

            <p className="text-lg text-white/70 leading-relaxed mb-6">
              <span className="text-amber-400/85 font-bold underline decoration-amber-500/20 underline-offset-4">Дефицит калорий</span> - это
              когда ты тратишь чуть больше энергии, чем получаешь. Не
              голодание. А <span className="text-white/85 font-bold">мягкая разница</span>, при которой тело начинает использовать запасы.
            </p>

            {/* Интерактивный калькулятор калорий */}
            <CalorieCalculator />

            <p className="text-lg text-white/60 leading-relaxed mb-6">
              И вот что важно: для этого не нужно считать каждую калорию.
              Достаточно понимать принцип и менять привычки постепенно. Убрала
              сладкий кофе утром - минус 200 ккал. Заменила белый хлеб на цельнозерновой - ещё минус
              80. Уже дефицит. Без страданий.
            </p>
          </RuleSection>
        </div>

        {/* Миф-разбор: блок контраста */}
        <div className="my-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/15 p-6 text-left">
            <div className="flex items-center gap-2.5 mb-4">
              <ShieldAlert className="size-5 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400/80">
                Как думают многие
              </span>
            </div>
            <p className="text-base text-white/50 leading-relaxed italic">
              «Я буду тренироваться каждый день и похудею, даже если не буду
              менять питание»
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15 p-6 text-left">
            <div className="flex items-center gap-2.5 mb-4">
              <Lightbulb className="size-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">
                Как работает на самом деле
              </span>
            </div>
            <p className="text-base text-white/50 leading-relaxed">
              40 минут интенсивной тренировки сжигают ~300–400 ккал. Одна
              шоколадка - 550. Тренировками невозможно компенсировать
              систематическое переедание.
            </p>
          </div>
        </div>

        {/* ПРАВИЛО 2 - Почему тренировки не для похудения */}
        <RuleSection number={2} title="Тренировки не для похудения. Но без них нельзя" accentColor="amber">
          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Тренировки сжигают сравнительно мало калорий. Основной расход энергии идёт на поддержание жизни. Это называется <span className="text-amber-400/85 font-bold underline decoration-amber-500/20 underline-offset-4">базовый метаболизм</span>.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Но вот что тренировки делают <span className="text-white/85 font-bold">по-настоящему</span>:
          </p>

          <div className="space-y-3 mb-8">
            {[
              {
                title: "Сохраняют мышцы",
                text: "При дефиците калорий тело готово «съесть» мышцы, а не жир. Силовые тренировки дают сигнал: мышцы нужны, не трогай их. Тело начинает расходовать именно жировые запасы.",
              },
              {
                title: "Разгоняют метаболизм",
                text: "Мышечная ткань потребляет энергию даже в покое. Чем больше мышц - тем больше калорий ты сжигаешь, просто сидя на диване. Тренировки увеличивают твой «базовый расход».",
              },
              {
                title: "Формируют тело",
                text: "Дефицит калорий делает тебя легче. Тренировки делают тебя подтянутой. Без них ты получишь «худую-дряблую» версию себя вместо упругой и сильной.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors text-left"
              >
                <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Dumbbell className="size-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white/85 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-white/45 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Цитата */}
          <blockquote className="relative my-10 pl-8 text-left">
            <div className="absolute left-0 top-6 bottom-[-8px] w-0.5 bg-amber-400/40" />
            <Quote className="absolute -left-3 -top-1 size-6 text-amber-400/30 p-0.5" />
            <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
              «Питание решает, сколько ты весишь. Тренировки решают, как ты
              выглядишь. Одно без другого - это половина пути.»
            </p>
            <footer className="flex items-center gap-4">
              <div className="relative w-14 h-14 -ml-1 -my-2 shrink-0 rounded-full border-2 border-amber-500/20 overflow-hidden shadow-lg shadow-amber-500/20">
                <img
                  src="/images/avatars/margo.png"
                  alt="Марго"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-widest text-white/90 leading-none">
                  Марго
                </span>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-white/30 mt-1">
                  Основатель MargoFitness
                </span>
              </div>
            </footer>
          </blockquote>
        </RuleSection>

        {/* ПРАВИЛО 3 - Почему нельзя просто мало есть */}
        <RuleSection number={3} title="Почему «просто меньше есть» - это ловушка" accentColor="amber">
          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Ты думаешь: «Буду есть совсем мало - и похудею быстрее». Это <span className="text-white/85 font-bold">ловушка</span>. Когда ты резко урезаешь калории без тренировок, тело включает <span className="text-amber-400/85 font-semibold italic underline decoration-amber-500/20 underline-offset-4">аварийный режим</span>.
          </p>

          {/* Каскад последствий */}
          <div className="relative pl-8 md:pl-10 mb-10 text-left">
            <div className="absolute left-3 md:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/30 via-rose-500/30 to-rose-500/10" />

            {[
              {
                step: "1–2 неделя",
                title: "Тело теряет воду и мышцы",
                text: "Вес падает быстро, и ты радуешься. Но это не жир - это вода и мышечная ткань. Зеркало пока не меняется.",
                severity: "low" as const,
              },
              {
                step: "3–4 неделя",
                title: "Метаболизм замедляется",
                text: "Тело понимает, что еды мало, и начинает экономить. Ты тратишь меньше энергии на всё: на обогрев, на активность, даже на мышление. Становишься вялой.",
                severity: "medium" as const,
              },
              {
                step: "1–2 месяц",
                title: "Плато и срыв",
                text: "Вес встаёт, хотя ты ешь мало. Тело адаптировалось. Настроение на нуле, энергии нет. И однажды ты срываешься - потому что организм требует еду.",
                severity: "high" as const,
              },
              {
                step: "После срыва",
                title: "Вес возвращается с запасом",
                text: "Метаболизм ещё замедлен, а ты ешь как раньше. Результат - ты набираешь больше, чем потеряла. Мышц стало меньше, жира - больше. Это называется эффект йо-йо.",
                severity: "critical" as const,
              },
            ].map((item, i) => (
              <CascadeStep key={i} {...item} />
            ))}
          </div>

          {/* Предупреждение */}
          <div className="rounded-2xl bg-rose-500/[0.05] border border-rose-500/15 p-6 md:p-8 mb-8 text-left">
            <div className="flex gap-4">
              <AlertTriangle className="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-rose-400/80 mb-2">
                  Важно понимать
                </p>
                <p className="text-base text-white/60 leading-relaxed">
                  Диеты на 800–1200 ккал без физической нагрузки - это не
                  похудение, а разрушение. Ты теряешь мышцы, замедляешь
                  метаболизм и создаёшь условия для набора веса в будущем.
                  Правильный подход - мягкий дефицит + тренировки, которые
                  защищают мышцы.
                </p>
              </div>
            </div>
          </div>
        </RuleSection>

        {/* КБЖУ - Разбираемся раз и навсегда */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            КБЖУ: разбираемся раз и навсегда
          </h2>

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            КБЖУ - четыре буквы, которые определяют всё, что происходит с твоим
            телом. Это не диета, не система и не тренд. Это просто описание того,
            что и сколько ты ешь.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            <span className="text-amber-400/85 font-bold">К</span> - калории, энергия. <span className="text-white/85 font-bold">Б, Ж, У</span> - белки, жиры и углеводы. Калории определяют, будешь ты худеть или нет. БЖУ определяют, <span className="text-white/85 font-bold underline decoration-white/10 underline-offset-4">как ты будешь выглядеть</span>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {(
              [
                {
                  letter: "К",
                  name: "Калории",
                  value: "= общая энергия",
                  desc: "Определяют, худеешь ты, держишь вес или набираешь",
                  color: "amber",
                },
                {
                  letter: "Б",
                  name: "Белки",
                  value: "4 ккал / 1 г",
                  desc: "Мышцы, кожа, волосы, гормоны. Строительный материал тела",
                  color: "rose",
                },
                {
                  letter: "Ж",
                  name: "Жиры",
                  value: "9 ккал / 1 г",
                  desc: "Гормоны, мозг, витамины. Самый калорийный макронутриент",
                  color: "violet",
                },
                {
                  letter: "У",
                  name: "Углеводы",
                  value: "4 ккал / 1 г",
                  desc: "Топливо для мозга и мышц. Главный источник энергии",
                  color: "sky",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.letter}
                className={cn(
                  "p-4 rounded-xl border text-center",
                  item.color === "amber" &&
                    "bg-amber-500/[0.04] border-amber-500/10",
                  item.color === "rose" &&
                    "bg-rose-500/[0.04] border-rose-500/10",
                  item.color === "violet" &&
                    "bg-violet-500/[0.04] border-violet-500/10",
                  item.color === "sky" &&
                    "bg-sky-500/[0.04] border-sky-500/10"
                )}
              >
                <span
                  className={cn(
                    "text-4xl font-oswald font-black leading-none",
                    item.color === "amber" && "text-amber-400",
                    item.color === "rose" && "text-rose-400",
                    item.color === "violet" && "text-violet-400",
                    item.color === "sky" && "text-sky-400"
                  )}
                >
                  {item.letter}
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-white/70 mt-2">
                  {item.name}
                </p>
                <p className="text-[10px] font-bold text-white/30 mt-0.5">
                  {item.value}
                </p>
                <p className="text-xs text-white/40 leading-relaxed mt-2">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Парадокс пончика */}
          <div className="my-10 rounded-2xl overflow-hidden border border-white/10">
            <div className="bg-amber-500/[0.06] border-b border-amber-500/10 p-6">
              <div className="flex items-start gap-3">
                <Flame className="size-5 text-amber-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-amber-400/80 mb-2">
                    Парадокс пончика
                  </p>
                  <p className="text-base text-white/70 leading-relaxed">
                    <strong className="text-amber-400/90">Не важно, что именно ты ешь: если есть дефицит калорий - ты будешь худеть.</strong> Это база. Профессор Марк
                    Хауб доказал это в 2010&nbsp;году - сбросил 12&nbsp;кг за
                    2&nbsp;месяца на диете из снеков и сладостей. Потому что
                    дефицит калорий - это физика, и она работает с любой едой.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-500/[0.03] p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-rose-400 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-rose-400/80 mb-3">
                    Но вот что будет с телом
                  </p>
                  <div className="space-y-2">
                    {[
                      "Потеря мышц - без белка тело разрушает само себя",
                      "Постоянный голод - сахарные качели и неизбежные срывы",
                      "Волосы, кожа, ногти - без витаминов всё разваливается",
                      "Гормональный хаос - нет здоровых жиров, нет баланса",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <X className="size-3.5 text-rose-400/60 shrink-0 mt-0.5" />
                        <p className="text-sm text-white/50 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-10 pl-6 border-l-2 border-amber-400/30">
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium italic">
              Количество калорий решает, будешь ты худеть или нет. Качество
              питания решает, будешь ты при этом здоровой и энергичной - или
              уставшей и больной.
            </p>
          </div>

          {/* Инфографика - 6 сценариев */}
          <h3 className="text-xl md:text-2xl font-oswald font-black uppercase tracking-tight text-white mb-3 mt-14">
            Что будет с твоим телом: 6&nbsp;сценариев
          </h3>

          <p className="text-base text-white/50 leading-relaxed mb-6">
            Дефицит калорий, отслеживание БЖУ и тренировки - три переменные. Вот
            что происходит с телом при каждой комбинации:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                {
                  deficit: false,
                  macros: false,
                  training: false,
                  title: "Ничего не меняется",
                  description:
                    "Нет дефицита, нет тренировок, питание без контроля. Тело остаётся таким же. Каждый день - повтор предыдущего.",
                  rating: 0,
                  accent: "zinc",
                },
                {
                  deficit: true,
                  macros: false,
                  training: false,
                  title: "Путь к skinny-fat",
                  description:
                    "Вес падает, но уходят и мышцы, и жир. Тело легче, но рыхлое и дряблое. Метаболизм замедляется.",
                  rating: 1.5,
                  accent: "orange",
                },
                {
                  deficit: false,
                  macros: true,
                  training: true,
                  title: "Сильнее, но не стройнее",
                  description:
                    "Мышцы растут, сила увеличивается. Но без дефицита жир остаётся. Визуально - мало изменений на весах.",
                  rating: 2,
                  accent: "violet",
                },
                {
                  deficit: true,
                  macros: false,
                  training: true,
                  title: "Тренировки вхолостую",
                  description:
                    "Тренируешься, но без белка тело не восстанавливается. Мышцы разрушаются, результат от зала минимальный.",
                  rating: 2.5,
                  accent: "amber",
                },
                {
                  deficit: true,
                  macros: true,
                  training: false,
                  title: "Стройность без формы",
                  description:
                    "Вес уходит, белок защищает мышцы. Но без тренировок тело «плоское» - стройное, но без рельефа и тонуса.",
                  rating: 3.5,
                  accent: "sky",
                },
                {
                  deficit: true,
                  macros: true,
                  training: true,
                  title: "Идеальная трансформация",
                  description:
                    "Жир уходит, мышцы сохраняются. Тело подтянутое, рельефное. Энергия стабильная, настроение отличное. Золотой стандарт.",
                  rating: 5,
                  accent: "emerald",
                },
              ] as const
            ).map((scenario, i) => (
              <ScenarioCard key={i} {...scenario} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Первый шаг - самый важный
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Теория без практики не стоит ничего. Попробуй свою первую тренировку
            - и почувствуй разницу.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-amber-500/15 mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}

/* --- Локальные компоненты --- */

function CalorieCalculator({ onBack }: { onBack: () => void }) {
  const [height, setHeight] = React.useState<string>("");
  const [weight, setWeight] = React.useState<string>("");
  const [age, setAge] = React.useState<string>("");
  const [activityLevel, setActivityLevel] = React.useState<number>(1.55);

  const [showBackLink, setShowBackLink] = React.useState(false);
  const [backArticleName, setBackArticleName] = React.useState("");

  useEffect(() => {
    const handleShowBack = (e: any) => {
      setShowBackLink(true);
      setBackArticleName(e.detail?.articleName || "");
    };
    window.addEventListener('show-back-to-article', handleShowBack);
    return () => window.removeEventListener('show-back-to-article', handleShowBack);
  }, []);

  const activityOptions = [
    { label: "Низкая", value: 1.375, desc: ">1 тренировки в неделю" },
    { label: "Средняя", value: 1.55, desc: "2-3 тренировки в неделю" },
    { label: "Высокая", value: 1.725, desc: "3+ тренировки в неделю" },
  ];

  const norms = React.useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (isNaN(h) || isNaN(w) || isNaN(a)) return null;
    return calculateCalorieNorms(w, h, a, activityLevel);
  }, [height, weight, age, activityLevel]);

  const bmiValue = React.useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w)) return null;
    return calculateBMI(h, w);
  }, [height, weight]);

  const bmiCategory = bmiValue ? getBMICategory(parseFloat(bmiValue)) : null;

  const hasInput = height || weight || age;

  return (
    <div className="max-w-[600px] mx-auto relative">
      {showBackLink && (
        <button
          onClick={() => onBack()}
          className="absolute -top-8 left-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          <ChevronLeft className="size-3" /> Вернуться к статье «{backArticleName}»
        </button>
      )}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden mb-8 shadow-xl">
      {/* Header + Inputs - single compact strip */}
      <div className="flex items-stretch border-b border-white/5">
        <div className="flex items-center flex-1 p-0.5">
          {[
            { label: "Рост", unit: "см", value: height, set: setHeight, ph: "170" },
            { label: "Вес", unit: "кг", value: weight, set: setWeight, ph: "60" },
            { label: "Возраст", unit: "лет", value: age, set: setAge, ph: "25" },
          ].map((field, i) => (
            <div key={field.label} className={cn("flex flex-col px-3 md:px-4 py-2 flex-1 min-w-0", i < 2 && "border-r border-white/5")}>
              <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.15em] mb-0.5">{field.label}</label>
              <div className="flex items-baseline gap-0.5">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
                    field.set(val);
                  }}
                  placeholder={field.ph}
                  className="w-full bg-transparent text-[22px] md:text-[26px] font-oswald font-black text-white focus:outline-none placeholder:text-white/10 leading-none min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[8px] font-bold text-white/15 uppercase shrink-0">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity selector - compact row */}
      <div className="flex flex-col gap-2 px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Активность</span>
          <span className="text-[8px] font-bold text-amber-400/60 uppercase tracking-tight italic">
            {activityOptions.find((o) => o.value === activityLevel)?.desc}
          </span>
        </div>
        <div className="flex bg-black/20 rounded-lg p-0.5 border border-white/5">
          {activityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActivityLevel(opt.value)}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all relative",
                activityLevel === opt.value ? "text-amber-400" : "text-white/20 hover:text-white/40"
              )}
            >
              {activityLevel === opt.value && (
                <motion.div
                  layoutId="calc-activity"
                  className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!norms ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-5 flex items-center justify-center gap-2"
          >
            <Utensils className="size-3.5 text-white/10" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/15">
              {hasInput ? "Заполни все поля" : "Введи свои параметры"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-3 md:px-4 py-4 space-y-3"
          >
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Похудение", value: norms.loss, color: "emerald" },
                { label: "Баланс", value: norms.maintain, color: "violet" },
                { label: "Набор", value: norms.gain, color: "orange" },
              ].map((goal) => (
                <div
                  key={goal.label}
                  className={cn(
                    "py-3 px-2 rounded-xl border flex flex-col items-center text-center",
                    goal.color === "emerald" && "bg-emerald-500/5 border-emerald-500/10",
                    goal.color === "violet" && "bg-violet-500/5 border-violet-500/10",
                    goal.color === "orange" && "bg-orange-500/5 border-orange-500/10"
                  )}
                >
                  <span className={cn(
                    "text-[7px] md:text-[8px] font-black uppercase tracking-widest mb-1",
                    goal.color === "emerald" && "text-emerald-400/80",
                    goal.color === "violet" && "text-violet-400/80",
                    goal.color === "orange" && "text-orange-400/80"
                  )}>
                    {goal.label}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl md:text-3xl font-oswald font-black text-white leading-none">
                      {goal.value}
                    </span>
                    <span className="text-[7px] font-bold text-white/20 uppercase">ккал</span>
                  </div>
                </div>
              ))}
            </div>

            {bmiValue && (
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[9px] font-bold text-white/25">ИМТ</span>
                <span className="text-sm font-oswald font-black text-white/70">{bmiValue}</span>
                <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5", bmiCategory?.color)}>
                  {bmiCategory?.label}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleSection({
  number,
  title,
  accentColor,
  children,
}: {
  number: number;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14 text-left">
      <div className="flex items-start gap-4 md:gap-6 mb-6">
        <div className="shrink-0 size-14 md:size-16 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
          <span className="text-2xl md:text-3xl font-oswald font-black text-amber-400">
            {number}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white leading-tight pt-2 md:pt-3">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function CascadeStep({
  step,
  title,
  text,
  severity,
}: {
  step: string;
  title: string;
  text: string;
  severity: "low" | "medium" | "high" | "critical";
}) {
  const dotColors = {
    low: "bg-amber-400 shadow-amber-400/30",
    medium: "bg-orange-400 shadow-orange-400/30",
    high: "bg-rose-400 shadow-rose-400/30",
    critical: "bg-red-500 shadow-red-500/30",
  };

  return (
    <div className="relative pb-8 last:pb-0">
      <div
        className={cn(
          "absolute -left-[25px] md:absolute md:-left-[29px] top-2 size-3 rounded-full shadow-[0_0_8px]",
          dotColors[severity]
        )}
      />
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">
        {step}
      </p>
      <h4 className="text-base font-bold text-white/85 mb-1.5">{title}</h4>
      <p className="text-sm text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}

const scenarioAccentStyles = {
  emerald: {
    border: "border-emerald-500/15",
    bg: "bg-emerald-500/[0.03]",
    bar: "bg-emerald-400",
    title: "text-emerald-400/90",
  },
  sky: {
    border: "border-sky-500/15",
    bg: "bg-sky-500/[0.03]",
    bar: "bg-sky-400",
    title: "text-sky-400/90",
  },
  amber: {
    border: "border-amber-500/15",
    bg: "bg-amber-500/[0.03]",
    bar: "bg-amber-400",
    title: "text-amber-400/90",
  },
  orange: {
    border: "border-orange-500/15",
    bg: "bg-orange-500/[0.03]",
    bar: "bg-orange-400",
    title: "text-orange-400/90",
  },
  violet: {
    border: "border-violet-500/15",
    bg: "bg-violet-500/[0.03]",
    bar: "bg-violet-400",
    title: "text-violet-400/90",
  },
  zinc: {
    border: "border-zinc-500/15",
    bg: "bg-zinc-500/[0.03]",
    bar: "bg-zinc-500",
    title: "text-zinc-400/90",
  },
} as const;

function ScenarioCard({
  deficit,
  macros,
  training,
  title,
  description,
  rating,
  accent,
}: {
  deficit: boolean;
  macros: boolean;
  training: boolean;
  title: string;
  description: string;
  rating: number;
  accent: keyof typeof scenarioAccentStyles;
}) {
  const styles = scenarioAccentStyles[accent];

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 text-left",
        styles.border,
        styles.bg
      )}
    >
      <div className="h-1 rounded-full bg-white/5 mb-4">
        {rating > 0 && (
          <div
            className={cn("h-full rounded-full", styles.bar)}
            style={{ width: `${rating * 20}%` }}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <FactorBadge active={deficit} label="Дефицит" />
        <FactorBadge active={macros} label="БЖУ" />
        <FactorBadge active={training} label="Тренировки" />
      </div>

      <h4 className={cn("text-base font-bold mb-1.5", styles.title)}>
        {title}
      </h4>
      <p className="text-sm text-white/45 leading-relaxed">{description}</p>
    </div>
  );
}

function FactorBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
        active
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80"
          : "bg-white/[0.02] border-white/[0.06] text-white/20"
      )}
    >
      {active ? <Check className="size-2.5" /> : <X className="size-2.5" />}
      {label}
    </span>
  );
}
