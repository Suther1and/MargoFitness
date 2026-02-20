"use client";

import React from "react";
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
            На платформе MARGOFITNESS доступно четыре уровня подписки: Free, Basic, Pro и Elite. Бесплатный
            аккаунт остаётся навсегда и даёт попробовать платформу. Подписка
            расширяет доступ к тренировкам, трекеру и материалам.
          </p>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Ниже — что именно доступно на каждом уровне. Pro — оптимальный
            выбор: 3 тренировки, полный трекер и все материалы. Актуальные
            цены и скидки за длительный период — на главной странице.
          </p>

          <TierComparisonGrid />

          <p className="text-lg text-white/60 leading-relaxed mt-8">
            Elite — тариф с ограниченным числом мест. Включает всё из Pro
            плюс индивидуальное ведение от Марго. Подходит тем, кому нужен
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

          <IntensiveExamples />

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
    values: (string | boolean)[];
  }[] = [
    { label: "Тренировки в неделю", values: ["Демо", "2", "3", "3"] },
    { label: "Виджеты здоровья", values: ["1", "6", "8", "8"] },
    { label: "Привычки", values: ["1", "6", "10", "15"] },
    { label: "Статьи", values: ["Демо", "Расш.", "Все", "Все"] },
    { label: "Статистика", values: [false, true, true, true] },
    { label: "Telegram-сообщество", values: [true, true, true, true] },
    { label: "Личное ведение", values: [false, false, false, true] },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 w-[130px] md:w-auto" />
              {tiers.map((t, i) => (
                <th key={i} className={cn("px-3 py-3 text-center", t.popular && "bg-purple-500/[0.05]")}>
                  {t.popular && (
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-purple-400/70 mb-1">
                      Оптимальный
                    </span>
                  )}
                  <span className={cn("text-sm font-oswald font-bold uppercase", t.color)}>
                    {t.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, fi) => (
              <tr key={fi} className="border-b border-white/[0.04] last:border-none">
                <td className="py-3 px-4">
                  <span className="text-sm text-white/50">{f.label}</span>
                </td>
                {f.values.map((v, vi) => (
                  <td
                    key={vi}
                    className={cn(
                      "py-3 px-3 text-center",
                      vi === 2 && "bg-purple-500/[0.05]"
                    )}
                  >
                    {typeof v === "boolean" ? (
                      v ? (
                        <Check className="size-4 text-emerald-400/70 mx-auto" />
                      ) : (
                        <span className="text-white/10">—</span>
                      )
                    ) : (
                      <span className="text-sm font-bold text-white/65">{v}</span>
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
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
        5 категорий редкости
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
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

      <div className="grid grid-cols-5 gap-3 md:gap-4 mb-4">
        {examples.map((a, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <img
              src={a.img}
              alt={a.name}
              className="size-16 md:size-20 object-contain drop-shadow-lg"
            />
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

      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
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
  return (
    <div className="space-y-4">
      {/* Бонусная карточка — стиль платформы */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 ring-1 ring-amber-700/40 p-4 md:p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-700/15 blur-3xl pointer-events-none" />

        <div className="rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.04] p-4 ring-1 ring-white/10 backdrop-blur relative">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-700 p-[2px] shadow-lg shadow-amber-700/20">
                <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                  <span className="text-2xl">🥉</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white font-oswald tracking-tight">
                    250
                  </span>
                  <span className="text-xl">👟</span>
                </div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium mt-0.5">
                  Стартовый баланс
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>До Silver</span>
                  <span className="font-medium">10 000 ₽</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-[2%] rounded-full bg-gradient-to-r from-amber-500 to-orange-600" />
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right space-y-2">
              <div className="inline-flex items-center rounded-full bg-amber-700/30 px-3 py-1 text-xs text-amber-200 ring-1 ring-amber-600/50 font-semibold">
                Bronze
              </div>
              <div className="rounded-xl bg-white/10 ring-1 ring-white/20 px-3 py-1.5">
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                  Кешбэк
                </p>
                <p className="text-xl font-bold text-white font-oswald">3%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Уровни кешбэка */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
          4 уровня кешбэка — растёт с покупками
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "🥉", name: "Bronze", pct: "3%", grad: "from-amber-700/20 to-orange-800/20", ring: "ring-amber-700/30" },
            { icon: "🥈", name: "Silver", pct: "5%", grad: "from-slate-500/20 to-slate-600/20", ring: "ring-slate-500/30" },
            { icon: "🥇", name: "Gold", pct: "7%", grad: "from-yellow-500/20 to-amber-600/20", ring: "ring-yellow-500/30" },
            { icon: "💎", name: "Platinum", pct: "10%", grad: "from-cyan-600/20 to-blue-700/20", ring: "ring-cyan-500/30" },
          ].map((l, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl bg-gradient-to-br p-3 text-center ring-1",
                l.grad, l.ring
              )}
            >
              <span className="text-lg">{l.icon}</span>
              <p className="text-lg font-oswald font-bold text-white mt-1">{l.pct}</p>
              <p className="text-[9px] text-white/35 font-bold uppercase tracking-wider">
                {l.name}
              </p>
            </div>
          ))}
        </div>
      </div>

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

function IntensiveExamples() {
  const examples = [
    {
      icon: "☀️",
      title: "Утренняя зарядка",
      desc: "Набор коротких утренних сессий для бодрого старта дня. 10–15 минут без инвентаря.",
    },
    {
      icon: "🧘",
      title: "Йога и растяжка",
      desc: "Глубокая растяжка, восстановление после тренировок и работа с подвижностью суставов.",
    },
    {
      icon: "🏕",
      title: "Тренировки на воздухе",
      desc: "Программы для улицы и парка — кардио, функциональные упражнения, работа с весом тела.",
    },
    {
      icon: "🩰",
      title: "Пилатес",
      desc: "Контроль тела, глубокие мышцы, осанка. Мягкая, но эффективная нагрузка для любого уровня.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
          Примеры интенсивов
        </p>
        <span className="text-[10px] text-orange-400/50 font-bold uppercase tracking-wider">
          Разовая покупка · навсегда
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {examples.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
          >
            <span className="text-xl shrink-0 mt-0.5">{e.icon}</span>
            <div>
              <p className="text-sm font-bold text-white/70 mb-0.5">{e.title}</p>
              <p className="text-xs text-white/35 leading-relaxed">{e.desc}</p>
            </div>
          </div>
        ))}
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
