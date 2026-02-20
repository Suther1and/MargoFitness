"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Gift,
  Dumbbell,
  Activity,
  Layers,
  Trophy,
  Coins,
  Flame,
  Medal,
  Play,
  Repeat,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  Star,
  Zap,
  Check,
  Droplets,
  Footprints,
  Moon,
  Coffee,
  Smile,
  Camera,
  Apple,
  Scale,
  BarChart3,
  Sunrise,
  Sunset,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

const OVERVIEW_SECTIONS = [
  { num: "01", label: "Что доступно сразу", icon: Gift },
  { num: "02", label: "Система тренировок", icon: Dumbbell },
  { num: "03", label: "Трекер здоровья", icon: Activity },
  { num: "04", label: "Тарифы подписки", icon: Layers },
  { num: "05", label: "Достижения", icon: Trophy },
  { num: "06", label: "Бонусы и рефералы", icon: Coins },
  { num: "07", label: "Интенсивы", icon: Flame },
  { num: "08", label: "Марафоны", icon: Medal },
];

export default function WelcomeGuide({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "welcome-guide",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-orange-500/30"
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
              <span className="bg-orange-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Основы
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-orange-500/20 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 12 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Добро пожаловать в MargoFitness:{" "}
              <span className="text-orange-400">
                твой личный план трансформации
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-orange-400/30 pl-8 italic">
              Полный гид по платформе — от первой тренировки до продвинутых
              инструментов. Всё, что нужно знать, чтобы начать и не
              останавливаться.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Welcome to MargoFitness"
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
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Ты здесь — и это уже больше, чем большинство людей когда-либо
            сделают. Регистрация на фитнес-платформе — не формальность. Это
            решение, за которым стоит желание изменить что-то в своей жизни.
            Мы хотим, чтобы это решение привело к результату.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            MargoFitness — это не просто набор тренировок. Это система:
            программы, трекеры, аналитика, достижения, бонусы, сообщество.
            Много инструментов — и все они работают вместе. В этой статье мы
            проведём тебя по каждому из них, чтобы ты точно знала, как
            пользоваться платформой на максимум.
          </p>
        </div>

        {/* === СЕКЦИИ КОНТЕНТА === */}

        {/* Секция 1 — Что доступно сразу */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Gift} title="Что доступно сразу после регистрации" />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Бесплатный аккаунт — не демо-версия с заглушками. Ты получаешь
            реальные инструменты, которые уже работают. Вот что доступно с
            первого дня:
          </p>

          <FreeValueGrid />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            Это не «пробный период». Бесплатный доступ остаётся навсегда. А
            когда захочешь больше тренировок, виджетов и привычек — подписка
            расширит возможности. Но начать можно прямо сейчас, без вложений.
          </p>
        </section>

        {/* Секция 2 — Тренировки */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Dumbbell} title="Как устроены тренировки" />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Каждый понедельник для тебя готовится новая программа из 2–3 сессий
            на неделю. Ты сама выбираешь, в какие дни тебе удобно
            тренироваться — платформа подстраивается под твой график. Программа
            уже составлена, твоя задача — открыть тренировку и следовать плану.
          </p>

          <WeeklyWorkoutFlow />

          <p className="text-lg text-white/60 leading-relaxed mt-8 mb-6">
            Каждая сессия состоит из 4–6 упражнений. К каждому прикреплена
            видео-инструкция с разбором техники и амплитуды. Ты всегда видишь,
            как правильно выполнять движение. Помимо видео указаны подходы,
            повторения, время отдыха и описание техники — всё на экране,
            запоминать ничего не нужно.
          </p>

          <ExerciseBreakdown />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            После завершения ты оцениваешь тренировку: насколько было тяжело и
            насколько понравилось. Тренировка отмечается как выполненная, а
            результат сохраняется в статистике. Каждый понедельник цикл
            повторяется — новые упражнения, новые акценты, постоянная динамика.
          </p>
        </section>

        {/* Секция 3 — Трекер здоровья */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Activity} title="Трекер здоровья" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            Тренировки — это только часть результата. Сон, вода, питание, вес,
            настроение — всё влияет на прогресс. Трекер здоровья объединяет все
            эти метрики в одном месте, чтобы ты видела полную картину, а не
            только количество отжиманий.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Трекер состоит из двух систем: виджеты и привычки. Виджеты
            отслеживают измеримые показатели. Привычки — ежедневные действия,
            которые ты хочешь закрепить.
          </p>

          <WidgetShowcase />

          <p className="text-lg text-white/60 leading-relaxed mt-8 mb-8">
            Каждый виджет — полноценный инструмент. Виджет воды помогает
            поддерживать оптимальный гидробаланс в течение дня. Виджет веса
            рассчитывает ИМТ и строит тренд, а виджет фото позволяет наглядно
            сравнивать снимки «до» и «после» в один клик.
          </p>

          <HabitDayExample />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            Гибкая настройка расписания позволяет интегрировать привычки в любой
            образ жизни. Система автоматически отслеживает серии выполнений,
            формируя наглядную статистику прогресса. Это помогает не только
            закреплять полезные действия, но и дисциплинированно двигаться к
            долгосрочным целям, превращая рутину в устойчивый результат.
          </p>
        </section>

        {/* Секция 4 — Тарифы */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Layers} title="Тарифы подписки" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            На платформе <span className="text-orange-400/80 font-semibold">MARGOFITNESS</span> доступно четыре уровня подписки:{" "}
            <span className="text-white/40 font-bold">Free</span>,{" "}
            <span className="text-orange-400 font-bold">Basic</span>,{" "}
            <span className="text-purple-400 font-bold">Pro</span> и{" "}
            <span className="text-amber-400 font-bold">Elite</span>. Бесплатный
            аккаунт остаётся навсегда и даёт попробовать платформу. Подписка
            расширяет доступ к тренировкам, трекеру и материалам.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Подписка расширяет доступ к тренировкам, трекеру и материалам.
          </p>

          <TierComparisonGrid />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            <span className="text-amber-400 font-bold uppercase tracking-tight">Elite</span> — тариф с ограниченным числом
            мест. Включает всё из <span className="text-purple-400 font-bold uppercase tracking-tight">Pro</span> плюс
            индивидуальное ведение от Марго. Подходит тем, кому нужен
            персональный подход.
          </p>
        </section>

        {/* Секция 5 — Достижения */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Trophy} title="Система достижений" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            За активность на платформе ты получаешь достижения — от первой
            тренировки до многомесячных серий. Каждое достижение относится к
            одной из пяти категорий редкости, а некоторые начисляют бонусные
            шаги, которые можно потратить на оплату подписки.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Всего на платформе более 50 достижений. Они открываются
            автоматически, когда ты достигаешь условия — не нужно ничего
            запрашивать вручную.
          </p>

          <AchievementShowcase />
        </section>

        {/* Секция 6 — Бонусы и рефералы */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Coins} title="Бонусы и реферальная программа" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            На MargoFitness есть внутренняя валюта — «шаги». 1 шаг = 1 рубль.
            Шаги начисляются за достижения, кешбэк с покупок и реферальную
            программу. Тратить их можно на оплату подписки — до 30% от суммы.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            При регистрации ты сразу получаешь 250 шагов — приветственный
            бонус. Если пришла по реферальной ссылке — ещё 250 сверху.
          </p>

          <BonusSystemOverview />
        </section>

        {/* Секция 7 — Интенсивы */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Flame} title="Интенсивы" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            Интенсивы — это готовые тематические пакеты тренировок, которые
            можно купить один раз и получить доступ навсегда. В отличие от
            еженедельных программ по подписке, интенсив — самостоятельный
            продукт с фокусом на конкретную задачу.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Каждый интенсив содержит набор сессий с видео-инструкциями,
            техникой и программой. Ты покупаешь его один раз и возвращаешься к
            нему когда удобно — без ограничений по времени.
          </p>

          <IntensiveCardsMockup />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            Интенсивы доступны вне зависимости от подписки. Можно быть на
            бесплатном тарифе и при этом иметь доступ к нескольким интенсивам.
            Это отдельная покупка — не влияет на подписку и не привязана к ней.
          </p>
        </section>

        {/* Секция 8 — Марафоны */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Medal} title="Марафоны" />

          <p className="text-lg text-white/60 leading-relaxed mb-4">
            Марафоны — это тематические фитнес-челленджи длительностью 3–4
            недели, которые проводятся на платформе периодически. Это не
            самостоятельная тренировка, а групповое событие с общей целью,
            сроками и мотивацией от сообщества.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Во время марафона все участники выполняют одну программу, делятся
            результатами и поддерживают друг друга. Марафоны помогают выйти
            из рутины, попробовать новый формат и получить заряд мотивации
            от коллективной динамики.
          </p>

          <MarathonFormat />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            Информация о предстоящих марафонах публикуется в личном кабинете
            и Telegram-сообществе. Следи за анонсами — количество мест может
            быть ограничено.
          </p>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Всё готово.
            <br />
            <span className="text-orange-400">Осталась ты.</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Платформа настроена, инструменты ждут, программа готова.
            Первый шаг — самый важный.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-500/15 mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}

/* --- Локальные компоненты --- */

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-orange-400" />
      </div>
      <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}

function ArticleOverview() {
  return null;
}

function FreeValueGrid() {
  const items = [
    { icon: Play, label: "Демо-тренировка с видео" },
    { icon: Heart, label: "1 виджет здоровья на выбор" },
    { icon: Check, label: "1 привычка с отслеживанием" },
    { icon: BookOpen, label: "Бесплатные статьи" },
    { icon: Users, label: "Telegram-сообщество" },
    { icon: Sparkles, label: "250 бонусных шагов" },
    { icon: Trophy, label: "Система достижений" },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
        Доступно бесплатно — навсегда
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <item.icon className="size-4 text-orange-400/60 shrink-0" />
            <span className="text-sm text-white/55 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyWorkoutFlow() {
  const days = [
    { day: "Пн", type: "workout", label: "Тренировка 1", sub: "Ноги + Кор" },
    { day: "Вт", type: "rest" },
    { day: "Ср", type: "workout", label: "Тренировка 2", sub: "Верх + Кардио" },
    { day: "Чт", type: "rest" },
    { day: "Пт", type: "workout", label: "Тренировка 3", sub: "Всё тело", pro: true },
    { day: "Сб", type: "rest" },
    { day: "Вс", type: "rest" },
  ] as const;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
        Пример недели тренировок
      </p>

      {/* Mobile: вертикальный стэк */}
      <div className="flex flex-col gap-2 md:hidden">
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl",
              d.type === "workout"
                ? "bg-orange-500/[0.06] border border-orange-500/10"
                : "bg-white/[0.01]"
            )}
          >
            <span
              className={cn(
                "text-xs font-bold w-6 shrink-0",
                d.type === "workout" ? "text-orange-400/70" : "text-white/15"
              )}
            >
              {d.day}
            </span>
            {d.type === "workout" ? (
              <div className="flex items-center gap-2 flex-1">
                <Dumbbell className="size-3.5 text-orange-400/50 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white/70">
                    {d.label}
                  </span>
                  <span className="text-[10px] text-white/30 ml-2">
                    {d.sub}
                  </span>
                </div>
                {d.pro && (
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400/60 ml-auto shrink-0">
                    Pro
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-white/15">Отдых</span>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: горизонтальный ряд */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl p-3 text-center",
              d.type === "workout"
                ? "bg-orange-500/[0.06] border border-orange-500/10"
                : "bg-white/[0.01] border border-transparent"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase block mb-2",
                d.type === "workout" ? "text-orange-400/60" : "text-white/15"
              )}
            >
              {d.day}
            </span>
            {d.type === "workout" ? (
              <>
                <Dumbbell className="size-4 text-orange-400/40 mx-auto mb-1.5" />
                <p className="text-[10px] font-bold text-white/60 leading-tight">
                  {d.label}
                </p>
                <p className="text-[8px] text-white/25 mt-0.5">{d.sub}</p>
                {d.pro && (
                  <span className="inline-block text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400/50 mt-1.5">
                    Pro
                  </span>
                )}
              </>
            ) : (
              <p className="text-[10px] text-white/10 mt-4">Отдых</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-orange-400/40" />
          <span className="text-[10px] text-white/25">Basic: 2 сессии</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-purple-400/40" />
          <span className="text-[10px] text-white/25">Pro: 3 сессии</span>
        </div>
        <span className="text-[10px] text-white/20 italic ml-auto">
          Дни ты выбираешь сама
        </span>
      </div>
    </div>
  );
}

function ExerciseBreakdown() {
  return (
    <div className="group relative overflow-hidden rounded-[3rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500">
      <div className="p-8 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border shrink-0 transition-colors group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20">
                <span className="text-2xl font-oswald font-black text-white/20 transition-colors group-hover:text-cyan-400">
                  1
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-1.5 py-0 rounded border border-white/10 text-[9px] font-mono text-white/30 uppercase">
                    Базовое
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-oswald font-bold text-white uppercase tracking-tight leading-tight mb-4 transition-colors group-hover:text-cyan-400">
                  Приседания с гантелями
                </h3>
                <p className="text-sm text-white/50 leading-relaxed italic border-l-2 border-white/10 pl-4">
                  Базовое многосуставное упражнение на нижнюю часть тела. Включает квадрицепсы, ягодичные и кор.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-white/20">
                  <Repeat className="size-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Подходы
                  </span>
                </div>
                <div className="text-xl font-oswald font-bold text-white">3</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-white/20">
                  <Zap className="size-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Повторы
                  </span>
                </div>
                <div className="text-xl font-oswald font-bold text-white">12</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-white/20">
                  <Clock className="size-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Отдых
                  </span>
                </div>
                <div className="text-xl font-oswald font-bold text-white">
                  60 <span className="text-[10px] text-white/40 uppercase">сек</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-400/40">
                  <Dumbbell className="size-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Инвентарь
                  </span>
                </div>
                <div className="text-[11px] font-bold text-amber-200/70 leading-tight uppercase line-clamp-2">
                  Гантели
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-cyan-400" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Техника выполнения
                </h4>
              </div>
              <div className="text-sm text-white/40 leading-relaxed whitespace-pre-line bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                Стопы на ширине плеч, колени в направлении носков. Опускайся до параллели бедра с полом, сохраняя нейтральное положение спины. На выдохе поднимайся, давя через пятки.
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="relative aspect-[9/16] w-full max-w-[320px] mx-auto overflow-hidden rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl group/video">
                <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-white/10 text-cyan-400">
                    <Play className="size-8 fill-current" />
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest text-white/40">
                    Видео доступно
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 rounded-[3rem]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetShowcase() {
  const widgets = [
    { icon: Droplets, name: "Вода" },
    { icon: Footprints, name: "Шаги" },
    { icon: Scale, name: "Вес" },
    { icon: Moon, name: "Сон" },
    { icon: Coffee, name: "Кофеин" },
    { icon: Smile, name: "Настроение" },
    { icon: Apple, name: "Питание" },
    { icon: Camera, name: "Фото" },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
          8 виджетов <span className="hidden md:inline">здоровья</span>
        </p>
        <span className="text-[10px] text-orange-400/50 font-bold uppercase tracking-wider">
          Free: 1 · Basic: 6 · Pro+: 8
        </span>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
        {widgets.map((w, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
          >
            <w.icon className="size-5 text-orange-400/50" />
            <span className="text-[10px] text-white/40 font-medium text-center leading-tight">
              {w.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/[0.04] border border-orange-500/10">
        <Star className="size-4 text-orange-400/50 shrink-0 mt-0.5" />
        <p className="text-sm text-white/40 leading-relaxed">
          Для каждого виджета можно задать{" "}
          <span className="text-white/60 font-medium">персональную цель</span>.
          Все виджеты формируют{" "}
          <span className="text-white/60 font-medium">цель дня</span> —
          единый прогресс-бар из всех активных показателей.
        </p>
      </div>
    </div>
  );
}

function HabitDayExample() {
  const habits = [
    { time: "Утро", icon: Sunrise, name: "Стакан воды натощак", done: true, streak: 12 },
    { time: "Утро", icon: Sunrise, name: "Зарядка 10 мин", done: true, streak: 5 },
    { time: "Вечер", icon: Sunset, name: "Без экранов за час до сна", done: false, streak: 3 },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
          Привычки
        </p>
        <span className="text-[10px] text-orange-400/50 font-bold uppercase tracking-wider">
          Free: 1 · Basic: 6 · Pro: 10 · Elite: 15
        </span>
      </div>

      <div className="space-y-1.5 mb-4">
        {habits.map((h, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300",
              h.done
                ? "bg-orange-500/[0.03] border-orange-500/10 opacity-80"
                : "bg-white/[0.01] border-white/[0.05]"
            )}
          >
            <div
              className={cn(
                "size-6 rounded-lg flex items-center justify-center shrink-0",
                h.done ? "bg-orange-500/25" : "bg-white/[0.04] border border-white/10"
              )}
            >
              {h.done && <Check className="size-3.5 text-orange-400" />}
            </div>
            <span className={cn("text-sm flex-1 transition-all font-bold", h.done ? "text-white/40 line-through" : "text-white/35")}>
              {h.name}
            </span>
            {h.streak > 0 && (
              <span className="text-[10px] text-orange-400/40 font-bold shrink-0">
                <Flame className="size-3 inline -mt-0.5 mr-0.5" />{h.streak}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <BarChart3 className="size-4 text-orange-400/50 shrink-0 mt-0.5" />
        <p className="text-sm text-white/40 leading-relaxed">
          Ты сама решаешь, какие привычки отслеживать и в какие дни. Задаёшь
          расписание — привычка появляется в личном кабинете именно тогда,
          когда нужна. Утро, день, вечер или «в любое время» — всё
          настраивается под твой ритм.
        </p>
      </div>
    </div>
  );
}

function TierComparisonGrid() {
  const tiers = [
    { name: "Free", color: "text-white/40" },
    { name: "Basic", color: "text-orange-400" },
    { name: "Pro", color: "text-purple-400", popular: true },
    { name: "Elite", color: "text-amber-400" },
  ];

  const features: {
    label: string;
    mobileLabel?: string;
    values: (string | boolean)[];
  }[] = [
    { label: "Тренировки в неделю", mobileLabel: "Тренировок", values: ["Демо", "2", "3", "3"] },
    { label: "Виджеты здоровья", mobileLabel: "Виджеты", values: ["1", "6", "8", "8"] },
    { label: "Привычки", values: ["1", "6", "10", "15"] },
    { label: "Статьи", values: ["Демо", "Расш.", "Все", "Все"] },
    { label: "Telegram-сообщество", mobileLabel: "Telegram", values: [true, true, true, true] },
    { label: "Статистика", values: [false, true, true, true] },
    { label: "Личное ведение", values: [false, false, false, true] },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="w-full overflow-x-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-2 py-3 w-[32%] md:w-auto">
                <span className="text-[15px] md:text-sm font-oswald font-bold uppercase text-white/30">Уровень</span>
              </th>
              {tiers.map((t, i) => (
                <th key={i} className={cn("px-0.5 py-3 text-center relative", t.popular && "bg-purple-500/[0.05]")}>
                  {t.popular && (
                    <span className="absolute top-1.5 left-0 right-0 text-[7px] font-bold uppercase tracking-tight text-purple-400/70 leading-none">
                      Best
                    </span>
                  )}
                  <span className={cn("text-[15px] md:text-sm font-oswald font-bold uppercase leading-none", t.color)}>
                    {t.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, fi) => (
              <tr key={fi} className="border-b border-white/[0.04] last:border-none">
                <td className="py-2 px-2">
                  <span className={cn(
                    "md:text-sm text-white/50 md:hidden leading-tight block font-medium",
                    f.label === "Личное ведение" ? "text-[13px]" : "text-[15px]"
                  )}>
                    {f.mobileLabel || f.label}
                  </span>
                  <span className="text-sm text-white/50 hidden md:inline">{f.label}</span>
                </td>
                {f.values.map((v, vi) => (
                  <td
                    key={vi}
                    className={cn(
                      "py-2 px-0.5 text-center",
                      vi === 2 && "bg-purple-500/[0.05]"
                    )}
                  >
                    {typeof v === "boolean" ? (
                      v ? (
                        <Check className="size-3.5 md:size-4 text-emerald-400/70 mx-auto" />
                      ) : (
                        <span className="text-white/10 text-[10px]">—</span>
                      )
                    ) : (
                      <span className="text-[15px] md:text-sm font-bold text-white/65 leading-none">{v}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AchievementShowcase() {
  const categories = [
    { name: "Обычное", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: "Редкое", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "Эпическое", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { name: "Легендарное", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { name: "Абсолютное", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  ];

  const examples = [
    { img: "/achievements/first-workout.png", name: "Первая тренировка", cat: 0, reward: 50 },
    { img: "/achievements/two-weeks.png", name: "Две недели", cat: 1, reward: 100 },
    { img: "/achievements/perfect-month.png", name: "Идеальный месяц", cat: 2, reward: 200 },
    { img: "/achievements/legend.png", name: "Легенда", cat: 3, reward: 300 },
    { img: "/achievements/collector.png", name: "Коллекционер", cat: 4, reward: 1000 },
  ];

  return (
    <div className="py-2">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-8 px-1">
        5 категорий редкости
      </p>

      {/* Мобильная версия: Горизонтальный скролл карточек редкости */}
      <div className="md:hidden -mx-5 px-5 mb-8">
        <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
          {examples.map((a, i) => (
            <div 
              key={i} 
              className="relative w-[280px] shrink-0 snap-center p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col items-center text-center group"
            >
              {/* Фоновое свечение и паттерн */}
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-b from-transparent to-current",
                categories[a.cat].color
              )} />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              
              <div className="relative mb-8">
                <div className={cn(
                  "absolute inset-0 blur-3xl opacity-20 scale-150",
                  categories[a.cat].color.replace('text-', 'bg-')
                )} />
                
                {/* Иконка достижения */}
                <div className="relative z-10 size-32 flex items-center justify-center">
                  <img
                    src={a.img}
                    alt={a.name}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  />
                </div>

                {/* Награда в верхнем правом углу (наезжает на иконку) */}
                <div className={cn(
                  "absolute -top-2 -right-6 z-20 px-3 py-1.5 rounded-xl border bg-black/60 backdrop-blur-md shadow-xl flex items-center gap-1.5",
                  categories[a.cat].border
                )}>
                  <span className={cn("text-xs font-black tracking-tight", categories[a.cat].color)}>
                    +{a.reward}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-bold">шагов</span>
                </div>
              </div>

              <div className="relative z-10 space-y-4 w-full">
                <span
                  className={cn(
                    "inline-block text-[10px] font-black px-4 py-1 rounded-full border uppercase tracking-[0.15em]",
                    categories[a.cat].color, categories[a.cat].bg, categories[a.cat].border
                  )}
                >
                  {categories[a.cat].name}
                </span>
                
                <div className="flex items-center justify-center gap-2.5">
                  <div className={cn("size-2 rounded-full animate-pulse shrink-0", categories[a.cat].color.replace('text-', 'bg-'))} />
                  <h4 className="text-xl font-oswald font-bold text-white uppercase tracking-tight leading-tight">
                    {a.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Индикатор скролла */}
        <div className="flex justify-center gap-1.5 mt-2">
          {examples.map((_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === 0 ? "w-6 bg-orange-400/60" : "w-1.5 bg-white/10")} />
          ))}
        </div>
      </div>

      {/* Десктопная версия: старый вариант */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c, i) => (
            <span
              key={i}
              className={cn(
                "text-[11px] font-bold px-2.5 py-1 rounded-full border",
                c.color, c.bg, c.border
              )}
            >
              {c.name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-3 md:gap-4 mb-8">
          {examples.map((a, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="size-16 md:size-20 flex items-center justify-center">
                <img
                  src={a.img}
                  alt={a.name}
                  className="max-w-full max-h-full object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <p className="text-[10px] text-white/50 font-medium leading-tight">
                  {a.name}
                </p>
                <p className={cn("text-[9px] font-bold", categories[a.cat].color)}>
                  +{a.reward} шагов
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <Sparkles className="size-4 text-yellow-400/50 shrink-0 mt-0.5" />
        <p className="text-sm text-white/40 leading-relaxed">
          Награды за достижения — от 50 до 1 000 шагов. Абсолютные достижения
          требуют месяцев активности, но дают максимальный бонус.
        </p>
      </div>
    </div>
  );
}

function BonusSystemOverview() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const levels = [
    { 
      icon: "🥉", 
      name: "Bronze", 
      pct: "3%", 
      gradient: 'linear-gradient(135deg, #b46d3e 0%, #dfa579 25%, #8c4a20 50%, #5d2e12 100%)',
      pattern: 'rgba(255, 255, 255, 0.15)',
      points: 'text-[#1e0f04]',
      subtext: 'text-[#4a2e19]/70',
      badge: 'bg-[#2d1a0a]/90 border-white/10 text-orange-50',
      ring: "ring-orange-900/30",
      progressTrack: 'bg-[#2d1a0a]/10',
      progressBar: 'bg-[#2d1a0a]',
      progress: 75,
      goal: "0 ₽" 
    },
    { 
      icon: "🥈", 
      name: "Silver", 
      pct: "5%", 
      gradient: 'linear-gradient(135deg, #8e9196 0%, #ffffff 35%, #5c5f66 75%, #2a2c30 100%)',
      pattern: 'rgba(15, 23, 42, 0.08)',
      points: 'text-[#0f172a]',
      subtext: 'text-slate-600',
      badge: 'bg-slate-900/90 border-white/10 text-slate-50',
      ring: "ring-slate-500/30",
      progressTrack: 'bg-slate-900/10',
      progressBar: 'bg-slate-900',
      progress: 65,
      goal: "10 000 ₽" 
    },
    { 
      icon: "🥇", 
      name: "Gold", 
      pct: "7%", 
      gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #aa771c 100%)',
      pattern: 'rgba(69, 26, 3, 0.12)',
      points: 'text-[#2d1a0a]',
      subtext: 'text-amber-900/70',
      badge: 'bg-amber-950/90 border-white/10 text-amber-50',
      ring: "ring-yellow-700/30",
      progressTrack: 'bg-amber-950/10',
      progressBar: 'bg-amber-950',
      progress: 40,
      goal: "30 000 ₽" 
    },
    { 
      icon: "💎", 
      name: "Platinum", 
      pct: "10%", 
      gradient: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 25%, #dbeafe 50%, #94a3b8 100%)',
      pattern: 'rgba(15, 23, 42, 0.1)',
      points: 'text-[#020617]',
      subtext: 'text-slate-600',
      badge: 'bg-slate-900/90 border-white/10 text-white',
      ring: "ring-cyan-700/30",
      progressTrack: 'bg-slate-950/10',
      progressBar: 'bg-slate-900',
      progress: 15,
      goal: "100 000 ₽" 
    },
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / (width * 0.8));
    if (index !== activeIndex) setActiveIndex(index);
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * (width * 0.8),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Уровни кешбэка */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">
            4 уровня кешбэка <span className="hidden md:inline">— растёт с покупками</span>
          </p>
          <div className="flex gap-1.5 md:hidden">
            {levels.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all duration-300",
                  activeIndex === i ? "bg-orange-500 w-3" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative -mx-4 px-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          <div className="flex gap-3 min-w-max md:grid md:grid-cols-2 md:min-w-0 md:gap-4">
            {levels.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-[80vw] md:w-auto overflow-hidden rounded-[2rem] p-5 shadow-xl snap-center transition-all duration-300",
                  l.ring
                )}
                style={{ background: l.gradient }}
              >
                {/* Premium Inner Glow */}
                <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/20 inset-shadow-sm pointer-events-none" />
                
                {/* Geometric Patterns overlay - matching reference exactly */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-40" 
                  style={{ 
                    backgroundImage: `radial-gradient(circle at 1px 1px, ${l.pattern} 1px, transparent 0)`, 
                    backgroundSize: '20px 20px' 
                  }}
                />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Trophy className={cn("w-4 h-4", l.points)} />
                      <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em] opacity-90 font-montserrat", l.points)}>Бонусы</span>
                    </div>
                    
                    <div className={cn("relative overflow-hidden border rounded-lg px-2.5 h-6 flex items-center justify-center", l.badge)}>
                      <span className="text-[10px] font-black tracking-widest relative z-10 uppercase font-montserrat leading-none">
                        {l.name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest block mb-0.5 font-montserrat leading-none", l.subtext)}>кешбэк</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-3xl font-black font-oswald tracking-tight leading-none", l.points)}>
                            {l.pct}
                          </span>
                          <Sparkles className={cn("w-4 h-4", l.subtext)} />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest block mb-1 font-montserrat leading-none", l.points)}>порог</p>
                        <div className={cn("px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight font-montserrat bg-white/10", l.badge)}>
                          {l.goal}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar - matching real cards */}
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", l.progressTrack)}>
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", l.progressBar)}
                        style={{ width: `${l.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-white/30 italic leading-relaxed px-1 -mt-2 mb-8">
        Потратив суммарно 10 000 ₽, ты переходишь на уровень Silver. Теперь твой кешбэк 5% вместо 3% с каждой покупки.
      </p>

      {/* Реферальная программа */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 md:p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.06] via-transparent to-transparent pointer-events-none rounded-3xl" />

        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
            Реферальная программа
          </p>

          <div className="space-y-2 mb-4">
            {[
              { step: "1", text: "Друг регистрируется по твоей ссылке → получает 250 шагов" },
              { step: "2", text: "Друг покупает подписку → ты получаешь 500 шагов (за первого)" },
              { step: "3", text: "С каждой его покупки тебе начисляется 3–10% шагами" },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="size-6 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-purple-400">{s.step}</span>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-500/[0.04] border border-purple-500/10">
            <Coins className="size-4 text-purple-400/50 shrink-0 mt-0.5" />
            <p className="text-sm text-white/40 leading-relaxed">
              Шагами можно оплатить до{" "}
              <span className="text-white/60 font-medium">30% стоимости</span>{" "}
              любой подписки. 1 шаг = 1 рубль. Реферальный процент растёт
              с общей суммой покупок рефералов — от 3% до 10%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntensiveCardsMockup() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft - walk;
      }
    });
  };

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardW = isMobile ? window.innerWidth * 0.8 : 290;
    const gap = isMobile ? 24 : 16;
    
    if (!isMobile) {
      const el = scrollRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      // Определяем 3 фиксированных положения:
      // 0: Начало (левая карточка прижата, правая обрезана)
      // 1: Середина (скролл на одну карточку)
      // 2: Конец (правая карточка прижата, левая обрезана)
      const positions = [0, cardW + gap, maxScroll];
      
      // Находим текущую позицию (индекс ближайшей точки)
      const currentScroll = el.scrollLeft;
      let currentIndex = positions.findIndex(pos => Math.abs(pos - currentScroll) < 10);
      if (currentIndex === -1) {
        currentIndex = Math.round(currentScroll / (cardW + gap));
      }

      let nextIndex;
      if (dir === "left") {
        nextIndex = Math.max(0, currentIndex - 1);
      } else {
        nextIndex = Math.min(positions.length - 1, currentIndex + 1);
      }
      
      el.scrollTo({
        left: positions[nextIndex],
        behavior: "smooth",
      });
    } else {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -(cardW + gap) : (cardW + gap),
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isMobile = window.innerWidth < 768;
    const cardW = isMobile ? window.innerWidth * 0.8 : 290;
    const gap = isMobile ? 24 : 16;
    setCurrentSlide(Math.round(el.scrollLeft / (cardW + gap)));
  }, []);

  const intensives = [
    {
      title: "Утренняя зарядка",
      desc: "Короткие бодрые сессии для энергичного старта дня без инвентаря",
      difficulty: 1,
      inventory: "Нет",
      price: "990 ₽",
      videos: 12,
      duration: "180 мин",
      img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format&fit=crop",
    },
    {
      title: "Йога и растяжка",
      desc: "Глубокая работа с подвижностью, восстановление и расслабление",
      difficulty: 2,
      inventory: "Коврик",
      price: "1 490 ₽",
      videos: 16,
      duration: "480 мин",
      img: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80&auto=format&fit=crop",
    },
    {
      title: "Пилатес",
      desc: "Контроль тела, глубокие мышцы и осанка. Мягко, но эффективно",
      difficulty: 2,
      inventory: "Коврик",
      price: "1 490 ₽",
      videos: 14,
      duration: "520 мин",
      img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop",
    },
    {
      title: "Функциональный тренинг",
      desc: "Комплексные упражнения на силу, координацию и выносливость",
      difficulty: 3,
      inventory: "Гантели",
      price: "1 990 ₽",
      videos: 20,
      duration: "750 мин",
      img: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&q=80&auto=format&fit=crop",
    },
    {
      title: "Тренировки на воздухе",
      desc: "Программы для улицы и парка — кардио и работа с весом тела",
      difficulty: 2,
      inventory: "Нет",
      price: "1 290 ₽",
      videos: 10,
      duration: "280 мин",
      img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80&auto=format&fit=crop",
    },
  ];

  return (
    <div className="overflow-visible">
      {/* Arrows — desktop */}
      <div className="hidden md:flex items-center justify-end gap-2 mb-3">
        <button
          onClick={() => scroll("left")}
          className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseMove={onMouseMove}
          className={cn(
            "flex overflow-x-auto pb-6 scrollbar-hide select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab md:snap-none snap-x snap-mandatory"
          )}
          style={{ 
            gap: window.innerWidth < 768 ? '24px' : '16px',
            paddingBottom: '24px',
            marginBottom: '-24px',
            paddingLeft: window.innerWidth < 768 ? '20px' : '0px',
            paddingRight: window.innerWidth < 768 ? '20px' : '0px'
          }}
        >
          {intensives.map((item, i) => (
            <div
              key={i}
              className="w-[80vw] md:w-[290px] shrink-0 snap-start rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-sm text-white/80 px-2 py-1 rounded-full">
                    {item.videos} видео
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-sm text-white/80 px-2 py-1 rounded-full">
                    {item.duration}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h4 className="text-sm font-bold text-white/80 mb-1 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-white/35 leading-relaxed mb-3 flex-1">
                  {item.desc}
                </p>

                <div className="mb-3 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 block">
                      Сложность
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={cn(
                            "size-3.5",
                            si < item.difficulty
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-yellow-500/20"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/25 block">
                      Инвентарь
                    </span>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider leading-[14px]">
                      {item.inventory}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-oswald font-bold text-white leading-none">
                      {item.price}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                      / навсегда
                    </span>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-orange-400/70 hover:text-orange-400 transition-colors px-3 py-1.5 rounded-lg bg-orange-500/[0.06] border border-orange-500/10">
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {intensives.map((_, i) => {
          const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
          
          // На мобильном 5 точек (по одной на каждую карточку)
          // На десктопе 3 точки (так как всего 3 шага прокрутки для 5 карточек при 3 видимых)
          if (!isMobileView && i > 2) return null;

          const isActive = currentSlide === i;

          return (
            <button
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                const isMobileView = window.innerWidth < 768;
                const cardW = isMobileView ? window.innerWidth * 0.8 : 290;
                const gap = isMobileView ? 24 : 16;
                scrollRef.current.scrollTo({
                  left: i * (cardW + gap),
                  behavior: "smooth",
                });
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                isActive
                  ? (isMobileView ? "w-6 bg-orange-400/60" : "w-10 bg-orange-400/60")
                  : "w-1.5 bg-white/15"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function MarathonFormat() {
  const features = [
    {
      title: "3–4 недели",
      desc: "Структурированная программа с нарастающей нагрузкой и чёткими целями на каждую неделю.",
    },
    {
      title: "Групповой формат",
      desc: "Все участники идут по одной программе. Общие чаты, обмен результатами, взаимная поддержка.",
    },
    {
      title: "Тематический фокус",
      desc: "Каждый марафон посвящён конкретной цели: жиросжигание, выносливость, тонус, гибкость.",
    },
    {
      title: "Мотивация и результаты",
      desc: "Групповая динамика помогает не сдаваться. Промежуточные результаты фиксируются на платформе.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
        Как устроены марафоны
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
          >
            <p className="text-sm font-bold text-white/70 mb-1">{f.title}</p>
            <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
