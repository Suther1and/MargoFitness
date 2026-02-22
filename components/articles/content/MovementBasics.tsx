"use client";

import React, { useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Quote,
  Lightbulb,
  Dumbbell,
  Target,
  Shield,
  Zap,
  ArrowUpFromLine,
  ArrowDownToLine,
  Footprints,
  Play,
  ChevronRight,
  Sparkles,
  Activity,
  Eye,
  BookOpen,
  Layers,
  TrendingUp,
  Check,
  RotateCcw,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

export default function MovementBasics({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "movement-basics",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.8,
  });

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-sky-500/30"
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
              <span className="bg-sky-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Тренировки
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 8 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Азбука движений:{" "}
              <span className="text-sky-400">
                разбор главных упражнений MargoFitness
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-sky-400/30 pl-8 italic">
              Десятки упражнений в тренировках - но всего 6 базовых движений.
              Понимая систему, ты тренируешься осознанно с первого дня.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Movement fundamentals"
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
            Когда ты впервые открываешь тренировку и видишь «румынская тяга с
            гантелями», «ягодичный мостик-марш» или «планка-паук» - это может
            выглядеть <span className="text-white/90 font-bold">пугающе</span>. Незнакомые названия, непонятные паттерны. Кажется,
            что нужно заучить десятки движений, прежде чем начать.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Это не так. Все упражнения в наших тренировках построены на
            <span className="text-sky-400/85 font-bold"> 6 фундаментальных движениях</span>. Каждое «сложное» упражнение - это
            вариация базового. Понимая эти 6 паттернов, ты <span className="text-white/90 font-bold underline decoration-sky-500/30 underline-offset-4">автоматически</span> понимаешь структуру любой тренировки.
          </p>
        </div>

        {/* Секция 1 - Система движений */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Layers}
            title="6 паттернов - основа всего"
          />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Человеческое тело создано для ограниченного набора движений:
            <span className="text-white/85 font-bold"> приседать, наклоняться, толкать, тянуть</span>, стабилизировать корпус и
            двигаться в пространстве. Всё остальное - это комбинации и
            усложнения этих базовых паттернов. Наши тренировки построены именно
            так: каждая сессия задействует несколько из этих паттернов, обеспечивая
            <span className="text-sky-400/85 font-semibold"> сбалансированную нагрузку</span> на всё тело.
          </p>

          <MovementPatternExplorer />
        </section>

        {/* Секция 2 - Как устроена тренировка */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={BookOpen}
            title="Анатомия тренировки: что тебя ждёт"
          />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Прежде чем начать, полезно понимать, как устроена каждая тренировка
            на платформе. Это <span className="text-white/85 font-semibold">снимает тревогу</span> «а что дальше?» и позволяет
            сосредоточиться на технике, а не на интерфейсе.
          </p>

          <WorkoutAnatomyVisual />

          <p className="text-lg text-white/70 leading-relaxed mt-8">
            Каждая неделя - это <span className="text-white/85 font-bold">новая программа</span> из 2-3 тренировочных сессий.
            Каждая сессия содержит 4-6 упражнений, подобранных так, чтобы
            выполнять разные группы мышц. Тебе не надо решать, что делать - программа уже составлена. Твоя задача -
            выполнять технично и слушать своё тело.
          </p>
        </section>

        {/* Секция 3 - Универсальные точки контроля */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Target}
            title="5 точек контроля: работают в каждом упражнении"
          />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Есть принципы, которые универсальны для <span className="text-white/85 font-bold">90% упражнений</span>. Запомни эти
            5 точек - и ты будешь выполнять любое движение <span className="text-sky-400/85 font-bold">безопаснее и эффективнее</span> с первого подхода.
          </p>

          <ControlPointsGrid />

          <p className="text-lg text-white/70 leading-relaxed mt-8">
            Эти 5 принципов - не абстрактные правила. Они <span className="text-white/85 font-bold underline decoration-white/15 underline-offset-4">физически защищают</span> твои суставы и позвоночник от нагрузок. Со
            временем контроль станет <span className="text-sky-400/85 font-semibold">автоматическим</span> - как переключение передач у
            опытного водителя.
          </p>
        </section>

        {/* Секция 4 - Прогрессия */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={TrendingUp}
            title="От простого к сложному: как устроены вариации"
          />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Если в одну неделю ты делаешь классические приседания, а в другую -
            кубковые с гантелью или приседания с паузой, это не случайность.
            У каждого базового движения есть <span className="text-white/85 font-bold">вариации разной сложности</span>. Понимая
            эту логику, ты не будешь теряться при встрече с новым упражнением.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Вот как выглядят вариации на примере <span className="text-sky-400/85 font-bold">приседаний</span>:
          </p>

          <ProgressionLadder />

          <p className="text-lg text-white/70 leading-relaxed mt-8 mb-6">
            Та же логика работает в каждом паттерне. <span className="text-white/85 font-semibold italic">Выпады: на месте →
            с шагом → назад → болгарские</span>. Когда ты встречаешь незнакомое название в тренировке - это почти
            всегда вариация того, что ты <span className="text-sky-400/85 font-bold underline decoration-sky-500/20 underline-offset-4">уже делала</span>.
          </p>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
              4 способа усложнения
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  method: "Добавить вес",
                  example: "Приседания → с гантелями",
                  icon: Dumbbell,
                },
                {
                  method: "Убрать опору",
                  example: "На двух ногах → на одной",
                  icon: Footprints,
                },
                {
                  method: "Замедлить темп",
                  example: "Обычный → 3 сек вниз",
                  icon: Clock,
                },
                {
                  method: "Добавить паузу",
                  example: "Без паузы → 2 сек внизу",
                  icon: Target,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <item.icon className="size-4 text-sky-400/50 mb-2" />
                  <p className="text-xs font-bold text-white/70 mb-1">
                    {item.method}
                  </p>
                  <p className="text-[10px] text-white/30 leading-snug">
                    {item.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Секция 5 - Частые вопросы новичков */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Lightbulb}
            title="То, о чём думает каждый новичок"
          />

          <div className="space-y-4">
            {[
              {
                q: "Я не знаю, что такое «румынская тяга». Мне нужно гуглить каждое упражнение?",
                a: "Нет. Каждое упражнение в тренировке сопровождается детальным описанием техники и видео-инструкцией. Ты увидишь пошаговый разбор прямо рядом с подходами и повторениями - не нужно переключаться никуда.",
              },
              {
                q: "Что если я не могу выполнить упражнение?",
                a: "У большинства упражнений есть облегчённая версия. Например, отжимания с упором на возвышение вместо классических, ягодичный мостик без веса вместо варианта с гантелью. Программа учитывает разный уровень подготовки.",
              },
              {
                q: "Сколько подходов и повторений делать?",
                a: "Это уже рассчитано за тебя. Каждое упражнение в тренировке показывает конкретное количество подходов (обычно 3–4), повторений (8–15) и время отдыха между подходами (45–90 секунд). Тебе нужно просто следовать плану.",
              },
              {
                q: "Я боюсь травмироваться без тренера",
                a: "Понятный страх. Именно поэтому все наши упражнения подобраны для домашнего выполнения с безопасным инвентарём - гантели 2–7 кг и бодибар. Плюс видео и текстовые инструкции показывают правильную технику, а статья «Техника безопасности» закрывает все вопросы по подготовке.",
              },
              {
                q: "Мне точно хватит домашних упражнений для результата?",
                a: "Да. Тренировки используют гантели, бодибар и собственный вес - этого достаточно, чтобы нагрузить все основные мышечные группы. Разнообразие вариаций обеспечивает рост нагрузки на месяцы вперёд. Домашний формат - это не ограничение, а осознанный выбор.",
              },
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        {/* Блок платформы */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-500/15 p-8 md:p-12 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.06] via-white/[0.01] to-transparent" />
            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-sky-500/5 blur-[80px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6">
                <Sparkles className="size-3.5 text-sky-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                  Каждое упражнение - с поддержкой
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
                Ты не одна в процессе.{" "}
                <span className="text-sky-400">MargoFitness ведёт тебя</span>
              </h3>

              <p className="text-base text-white/50 leading-relaxed mb-8 max-w-2xl">
                Платформа спроектирована так, чтобы тебе не нужно было ничего
                запоминать. Вся информация - прямо перед глазами в момент
                выполнения.
              </p>

              {/* Mockup-style карточка упражнения */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <PlatformFeatureRow
                    icon={Video}
                    title="Видео-инструкция к каждому упражнению"
                    desc="Смотришь правильную амплитуду, темп и ключевые акценты перед выполнением. Формат вертикального видео - удобно на телефоне."
                  />
                  <PlatformFeatureRow
                    icon={BookOpen}
                    title="Пошаговое описание техники"
                    desc="Исходное положение, фаза движения, точки контроля, частые ошибки - всё в текстовом формате рядом с упражнением."
                  />
                  <PlatformFeatureRow
                    icon={Activity}
                    title="Подходы, повторения, отдых"
                    desc="Каждое упражнение показывает конкретные цифры: 3 подхода × 12 повторений, отдых 60 секунд. Ничего не нужно придумывать."
                  />
                  <PlatformFeatureRow
                    icon={Dumbbell}
                    title="Инвентарь и замены"
                    desc="Указано, что нужно: гантели, бодибар или собственный вес. Если чего-то нет - есть альтернативные варианты."
                  />
                </div>

                <div className="hidden lg:block lg:col-span-2">
                  <ExerciseCardMockup />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Теория - за плечами.
            <br />
            <span className="text-sky-400">Время двигаться.</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Ты знаешь систему. Ты знаешь, на что обращать внимание.
            Всё остальное покажет тренировка.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-sky-500 hover:bg-sky-600 text-black font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-sky-500/15 mb-2">
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
      <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-sky-400" />
      </div>
      <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}

/* Movement Pattern Explorer - интерактивный блок с 6 паттернами */

const MOVEMENT_PATTERNS = [
  {
    id: "squat",
    name: "Приседания и выпады",
    shortName: "Ноги: перед",
    icon: Footprints,
    color: "sky" as const,
    muscles: ["Квадрицепсы", "Ягодичные", "Приводящие"],
    description:
      "Фундамент нижней части тела. Приседания и выпады - это движения, которые ты делаешь каждый день: садишься на стул, поднимаешься по лестнице, наклоняешься за ребёнком. Тренируя этот паттерн, ты делаешь повседневные движения сильнее и безопаснее.",
    exercises: [
      "Классические приседания",
      "Кубковые приседания",
      "Выпады на месте",
      "Болгарские выпады",
      "Приседания сумо",
    ],
    keyPoint:
      "Колени следуют за направлением носков. Вес тела на пятках, не на носках.",
  },
  {
    id: "hinge",
    name: "Наклоны и мостики",
    shortName: "Ноги: зад",
    icon: RotateCcw,
    color: "blue" as const,
    muscles: ["Ягодичные", "Бицепс бедра", "Разгибатели спины"],
    description:
      "Задняя цепь - мышцы, которые ты не видишь в зеркале, но которые определяют осанку, защищают поясницу и формируют ягодицы. Румынская тяга и ягодичный мостик - главные инструменты для этой зоны.",
    exercises: [
      "Румынская тяга с гантелями",
      "Ягодичный мостик",
      "Ягодичный мостик на одной ноге",
      "Становая с гантелями",
      "Тяга на одной ноге",
    ],
    keyPoint:
      "Движение идёт от тазобедренного сустава, не от поясницы. Спина остаётся нейтральной.",
  },
  {
    id: "push",
    name: "Жимы и отжимания",
    shortName: "Верх: жим",
    icon: ArrowUpFromLine,
    color: "sky" as const,
    muscles: ["Грудные", "Дельтовидные", "Трицепс"],
    description:
      "Все движения, где ты отталкиваешь вес от себя. Отжимания, жимы гантелей, махи - это формирует верхнюю часть тела, плечевой пояс и руки. Многие женщины избегают этих упражнений, а зря - именно они дают красивый рельеф рук и плеч.",
    exercises: [
      "Классические отжимания",
      "Отжимания с упором на возвышение",
      "Жим гантелей лёжа",
      "Жим гантелей стоя",
      "Махи в стороны",
    ],
    keyPoint:
      "Лопатки сведены и опущены. Локти не расходятся в стороны шире 45°.",
  },
  {
    id: "pull",
    name: "Тяги",
    shortName: "Верх: тяга",
    icon: ArrowDownToLine,
    color: "blue" as const,
    muscles: ["Широчайшие", "Ромбовидные", "Бицепс", "Задние дельты"],
    description:
      "Противовес жимам. Тяги укрепляют спину, исправляют осанку и компенсируют сидячий образ жизни. Если ты проводишь день за компьютером - тяги в наклоне буквально «расправляют» твои плечи.",
    exercises: [
      "Тяга двух гантелей в наклоне",
      "Тяга одной гантели с упором",
      "Тяга широким хватом",
      "Сгибания с гантелями стоя",
      "Молотковые сгибания",
    ],
    keyPoint:
      "Тяни лопатками, а не руками. Локоть идёт вдоль корпуса, не в сторону.",
  },
  {
    id: "core",
    name: "Кор и стабилизация",
    shortName: "Кор",
    icon: Shield,
    color: "sky" as const,
    muscles: ["Прямая мышца живота", "Косые", "Поперечная", "Разгибатели"],
    description:
      "Кор - это не «пресс для кубиков». Это мышечный корсет, который стабилизирует позвоночник в каждом движении. Сильный кор = безопасные приседания, тяги и жимы. Без него всё остальное теряет эффективность.",
    exercises: [
      "Классическая планка",
      "Боковая планка",
      "Скручивания",
      "Мёртвый жук",
      "Скалолаз",
    ],
    keyPoint:
      "Поясница прижата к полу (в скручиваниях) или в нейтрали (в планке). Никакого прогиба.",
  },
  {
    id: "functional",
    name: "Кардио и функционалка",
    shortName: "Кардио",
    icon: Zap,
    color: "blue" as const,
    muscles: ["Всё тело", "Сердечно-сосудистая система"],
    description:
      "Движения, которые объединяют несколько паттернов и повышают пульс. Бёрпи - это приседание + отжимание + прыжок. Приседание с жимом - ноги + плечи. Эти упражнения сжигают максимум калорий и тренируют выносливость.",
    exercises: [
      "Jumping jacks",
      "Бёрпи",
      "Высокие колени",
      "Приседания с жимом",
      "Выпад с поворотом",
    ],
    keyPoint:
      "Техника важнее скорости. Лучше сделать медленно и правильно, чем быстро и травмоопасно.",
  },
];

function MovementPatternExplorer() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = MOVEMENT_PATTERNS[activeIdx];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      {/* Табы */}
      <div className="flex overflow-x-auto border-b border-white/10 scrollbar-hide">
        {MOVEMENT_PATTERNS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveIdx(i)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 shrink-0",
              i === activeIdx
                ? "border-sky-400 text-sky-400 bg-sky-500/[0.06]"
                : "border-transparent text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
            )}
          >
            <p.icon className="size-3.5" />
            <span className="hidden md:inline">{p.name}</span>
            <span className="md:hidden">{p.shortName}</span>
          </button>
        ))}
      </div>

      {/* Контент */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-5 md:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Описание */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl md:text-2xl font-oswald font-black uppercase tracking-tight text-white mb-1">
                {active.name}
              </h3>

              <p className="text-sm text-white/50 leading-relaxed">
                {active.description}
              </p>

              {/* Целевые мышцы */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">
                  Целевые мышцы
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {active.muscles.map((m, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400/70 border border-sky-500/10"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ключевая точка */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-500/[0.05] border border-sky-500/10">
                <Target className="size-4 text-sky-400/60 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/50 mb-0.5">
                    Ключевой фокус
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {active.keyPoint}
                  </p>
                </div>
              </div>
            </div>

            {/* Примеры упражнений */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">
                Примеры упражнений
              </p>
              <div className="space-y-1.5">
                {active.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <span className="text-[10px] font-bold text-sky-400/40 w-4 text-right shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs text-white/50">{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* Workout Anatomy - визуальный разбор структуры тренировки */

function WorkoutAnatomyVisual() {
  const steps = [
    {
      num: "01",
      title: "Выбери тренировку",
      desc: "На этой неделе у тебя 2–3 готовые сессии. Открой первую доступную.",
      detail: "Тренировка 1 • 35 мин • 5 упражнений",
      accent: false,
    },
    {
      num: "02",
      title: "Изучи упражнение",
      desc: "Для каждого - название, описание, техника и видео. Посмотри перед первым подходом.",
      detail: "Румынская тяга с гантелями • 3×12 • Отдых 60 сек",
      accent: true,
    },
    {
      num: "03",
      title: "Выполняй по плану",
      desc: "Подходы, повторения и отдых указаны. Следуй цифрам, контролируй технику.",
      detail: "Подход 1 из 3 → 12 повторений → отдых 60 сек",
      accent: false,
    },
    {
      num: "04",
      title: "Заверши и оцени",
      desc: "По завершении - оцени сложность и удовлетворённость. Это помогает подбирать нагрузку.",
      detail: "Тренировка завершена • Сложность: ⭐⭐⭐",
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {steps.map((step, i) => (
        <div
          key={i}
          className={cn(
            "relative rounded-2xl p-5 md:p-6 border transition-colors text-left",
            step.accent
              ? "bg-sky-500/[0.05] border-sky-500/15"
              : "bg-white/[0.02] border-white/8"
          )}
        >
          <span
            className={cn(
              "text-3xl font-oswald font-black tracking-tighter absolute top-4 right-5",
              step.accent ? "text-sky-400/15" : "text-white/5"
            )}
          >
            {step.num}
          </span>
          <h4 className="text-base font-bold text-white/85 mb-2">
            {step.title}
          </h4>
          <p className="text-sm text-white/40 leading-relaxed mb-3">
            {step.desc}
          </p>
          <div
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-lg inline-block",
              step.accent
                ? "bg-sky-500/10 text-sky-400/60"
                : "bg-white/5 text-white/25"
            )}
          >
            {step.detail}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Control Points Grid - 5 универсальных точек контроля */

function ControlPointsGrid() {
  const points = [
    {
      title: "Нейтральная спина",
      rule: "Сохраняй естественные изгибы позвоночника - без округления и прогиба",
      where: "Приседания, тяги, наклоны",
    },
    {
      title: "Колени за носками",
      rule: "Колени всегда смотрят туда же, куда и пальцы ног",
      where: "Приседания, выпады, прыжки",
    },
    {
      title: "Лопатки вниз",
      rule: "Плечи назад и вниз, грудь раскрыта - не поднимай плечи к ушам",
      where: "Жимы, тяги, махи",
    },
    {
      title: "Темп, не инерция",
      rule: "2 сек вверх, 2–3 сек вниз. Контролируй вес на каждом сантиметре",
      where: "Все силовые упражнения",
    },
    {
      title: "Кор включён",
      rule: "Слегка напряги живот, как при покашливании - это твой внутренний корсет",
      where: "Каждое упражнение",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {points.map((p, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 text-left",
              i === points.length - 1 && "md:col-span-2 md:max-w-[50%]"
            )}
          >
            <div className="size-7 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[11px] font-oswald font-black text-sky-400">
                {i + 1}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white/80 mb-0.5">
                {p.title}
              </h4>
              <p className="text-xs text-white/45 leading-relaxed">
                {p.rule}
              </p>
              <p className="text-[10px] text-sky-400/30 mt-1">{p.where}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Progression Ladder - визуальная лестница на примере приседаний */

function ProgressionLadder() {
  const levels = [
    {
      name: "Классические приседания",
      tag: "Базовое",
      desc: "Собственный вес. Освоение паттерна движения.",
      difficulty: 1,
    },
    {
      name: "Приседания с гантелями у плеч",
      tag: "+Вес",
      desc: "Добавляем нагрузку, сохраняя технику.",
      difficulty: 2,
    },
    {
      name: "Кубковые приседания",
      tag: "+Вес",
      desc: "Гантель у груди. Помогает держать спину вертикально.",
      difficulty: 2,
    },
    {
      name: "Приседания сумо",
      tag: "Вариация",
      desc: "Широкая постановка. Акцент на приводящие и ягодичные.",
      difficulty: 3,
    },
    {
      name: "Приседания с паузой",
      tag: "+Пауза",
      desc: "2 секунды в нижней точке. Убирает инерцию, усиливает нагрузку.",
      difficulty: 4,
    },
    {
      name: "Темповые приседания",
      tag: "+Темп",
      desc: "3 секунды вниз, 1 секунда вверх. Максимальное время под нагрузкой.",
      difficulty: 5,
    },
  ];

  return (
    <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">
        Пример прогрессии: приседания
      </p>
      <p className="text-[10px] text-white/15 mb-6">
        от базового движения к продвинутым вариациям
      </p>

      <div className="space-y-0">
        {levels.map((level, i) => (
          <div key={i} className="relative flex gap-4 md:gap-5">
            {/* Линия прогрессии */}
            <div className="flex flex-col items-center">
              <div
                className="size-3 rounded-full shrink-0 mt-2"
                style={{
                  backgroundColor: `hsl(199, ${60 + i * 6}%, ${60 - i * 4}%)`,
                  boxShadow: `0 0 8px hsla(199, ${60 + i * 6}%, ${60 - i * 4}%, 0.3)`,
                }}
              />
              {i < levels.length - 1 && (
                <div className="w-px flex-1 bg-gradient-to-b from-sky-500/20 to-sky-500/5 my-1" />
              )}
            </div>

            {/* Контент */}
            <div className={cn("pb-5", i === levels.length - 1 && "pb-0")}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-white/75">
                  {level.name}
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400/50">
                  {level.tag}
                </span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                {level.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* FAQ Item - раскрывающийся вопрос */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors text-left",
        open
          ? "bg-sky-500/[0.03] border-sky-500/12"
          : "bg-white/[0.02] border-white/8 hover:border-white/12"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 md:p-5 text-left"
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 mt-0.5 transition-transform text-white/30",
            open && "rotate-90 text-sky-400/60"
          )}
        />
        <span
          className={cn(
            "text-sm font-bold leading-snug transition-colors",
            open ? "text-sky-400/80" : "text-white/60"
          )}
        >
          {question}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-white/40 leading-relaxed px-4 md:px-5 pb-4 md:pb-5 pl-11 md:pl-12">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Platform Feature Row */

function PlatformFeatureRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="size-9 rounded-lg bg-sky-500/10 border border-sky-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-sky-400" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white/80 mb-0.5">{title}</h4>
        <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* Exercise Card Mockup - имитация карточки упражнения на платформе */

function ExerciseCardMockup() {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 shadow-2xl shadow-black/50 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3">
        <div className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400/60">
          2 / 5
        </span>
        <span className="text-[10px] text-white/15">
          Ноги: задняя цепь
        </span>
      </div>

      <h5 className="text-sm font-bold text-white/80 mb-1">
        Румынская тяга с гантелями
      </h5>
      <p className="text-[10px] text-white/30 leading-relaxed italic mb-4">
        Наклон корпуса с отведением таза назад, гантели скользят вдоль бёдер
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Подходы", value: "3" },
          { label: "Повторы", value: "12" },
          { label: "Отдых", value: "60с" },
        ].map((s, i) => (
          <div
            key={i}
            className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5"
          >
            <p className="text-xs font-bold text-white/60">{s.value}</p>
            <p className="text-[8px] text-white/20 uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Technique preview */}
      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-sky-400/40">
          Техника
        </p>
        <div className="space-y-1.5 text-[10px] text-white/30 leading-relaxed">
          <p>
            <span className="text-white/50 font-bold">1.</span> Стопы на ширине
            таза, гантели в руках
          </p>
          <p>
            <span className="text-white/50 font-bold">2.</span> Наклон вперёд,
            таз назад, колени мягкие
          </p>
          <p className="text-white/15">...</p>
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute -bottom-10 -right-10 size-32 bg-sky-500/5 blur-3xl rounded-full" />
    </div>
  );
}
