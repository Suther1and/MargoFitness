"use client";

import React, { useLayoutEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  Droplets,
  Sun,
  Activity,
  Zap,
  Moon,
  TrendingUp,
  Heart,
  Thermometer,
  FlaskConical,
  Microscope,
  AlertTriangle,
  CircleCheck,
  CircleX,
  Flame,
  Brain,
  Smile,
  CalendarCheck,
  Timer,
  Ban,
  Pill,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

// --- Deficiency Chart ---

interface DeficiencyBar {
  label: string;
  value: number;
  note: string;
}

const deficiencyData: DeficiencyBar[] = [
  { label: "Витамин D", value: 94, note: "не добирают норму" },
  { label: "Магний", value: 57, note: "ниже рекомендаций" },
  { label: "Фолат", value: 55, note: "ниже нормы" },
  { label: "Железо", value: 52, note: "ферритин < 40 нг/мл" },
  { label: "Витамин B12", value: 23, note: "ниже оптимума" },
];

function DeficiencyChart() {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
          <Microscope className="size-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-oswald font-black uppercase tracking-tight text-white">
            Дефицитный айсберг
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
            % активных женщин с дефицитами
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {deficiencyData.map((item, i) => (
          <div key={item.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm font-bold text-white/80">{item.label}</span>
              <span className="text-xs text-white/30">{item.note}</span>
            </div>
            <div className="relative h-7 md:h-8 rounded-lg bg-white/[0.03] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-cyan-500/40 to-cyan-400/60"
              />
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-cyan-300/90"
              >
                {item.value}%
              </motion.span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-white/25 mt-5 leading-relaxed italic">
        Данные: MDPI Nutrients 2023, Journal of Women&apos;s Sports Medicine 2024. Исследования проведены среди женщин с регулярной физической активностью (3+ тренировки/нед).
      </p>
    </div>
  );
}

// --- Reference Range Scale ---

interface RangeZone {
  label: string;
  color: string;
  from: number;
  to: number;
}

interface TestCardData {
  name: string;
  subtitle: string;
  icon: React.ElementType;
  unit: string;
  why: string;
  deficitSymptoms: string;
  labMin: number;
  labMax: number;
  optimalMin: number;
  optimalMax: number;
  scaleMin: number;
  scaleMax: number;
  zones: RangeZone[];
}

const baseTests: TestCardData[] = [
  {
    name: "Ферритин",
    subtitle: "Запас железа",
    icon: Droplets,
    unit: "нг/мл",
    why: "Главный маркер запасов железа. Гемоглобин может быть в норме, а ферритин уже истощён - и ты чувствуешь усталость, одышку на тренировках, выпадение волос. Именно ферритин показывает реальную картину.",
    deficitSymptoms: "Хроническая усталость, одышка при нагрузке, выпадение волос, ломкие ногти, бледность, снижение выносливости",
    labMin: 10,
    labMax: 120,
    optimalMin: 50,
    optimalMax: 100,
    scaleMin: 0,
    scaleMax: 150,
    zones: [
      { label: "Дефицит", color: "bg-rose-500/50", from: 0, to: 30 },
      { label: "Субоптимально", color: "bg-amber-500/40", from: 30, to: 50 },
      { label: "Оптимум", color: "bg-emerald-500/50", from: 50, to: 100 },
      { label: "Высокий", color: "bg-amber-500/30", from: 100, to: 150 },
    ],
  },
  {
    name: "Витамин D",
    subtitle: "25-OH витамин D",
    icon: Sun,
    unit: "нг/мл",
    why: "Влияет на мышечную силу, плотность костей, иммунитет и настроение. У 80% россиян дефицит из-за географии. При тренировках расход витамина D увеличивается.",
    deficitSymptoms: "Частые простуды, мышечная слабость, боли в костях, подавленное настроение, долгое восстановление после тренировок",
    labMin: 30,
    labMax: 100,
    optimalMin: 50,
    optimalMax: 80,
    scaleMin: 0,
    scaleMax: 120,
    zones: [
      { label: "Дефицит", color: "bg-rose-500/50", from: 0, to: 20 },
      { label: "Недостаточность", color: "bg-amber-500/40", from: 20, to: 40 },
      { label: "Оптимум", color: "bg-emerald-500/50", from: 40, to: 80 },
      { label: "Избыток", color: "bg-amber-500/30", from: 80, to: 120 },
    ],
  },
  {
    name: "ТТГ",
    subtitle: "Тиреотропный гормон",
    icon: Activity,
    unit: "мЕд/л",
    why: "Щитовидная железа - главный регулятор метаболизма. ТТГ в «нормальных» 3.8 мЕд/л уже может означать замедленный обмен веществ, отёки и невозможность сбросить вес. Оптимум для активных женщин значительно уже лабораторной нормы.",
    deficitSymptoms: "Необъяснимый набор веса, отёки, зябкость, сухая кожа, запоры, снижение пульса на тренировке, отсутствие прогресса",
    labMin: 0.4,
    labMax: 4.0,
    optimalMin: 0.5,
    optimalMax: 2.5,
    scaleMin: 0,
    scaleMax: 5,
    zones: [
      { label: "Гипертиреоз", color: "bg-rose-500/40", from: 0, to: 0.4 },
      { label: "Оптимум", color: "bg-emerald-500/50", from: 0.5, to: 2.5 },
      { label: "Субклинический", color: "bg-amber-500/40", from: 2.5, to: 4.0 },
      { label: "Гипотиреоз", color: "bg-rose-500/40", from: 4.0, to: 5 },
    ],
  },
  {
    name: "Гемоглобин",
    subtitle: "Общий анализ крови",
    icon: Heart,
    unit: "г/л",
    why: "Базовый маркер способности крови переносить кислород. Низкий гемоглобин = мышцы буквально задыхаются на тренировке. ОАК также покажет воспаление, инфекции и общее состояние организма.",
    deficitSymptoms: "Одышка, головокружение, бледность, учащённое сердцебиение, быстрая утомляемость, снижение работоспособности",
    labMin: 120,
    labMax: 150,
    optimalMin: 125,
    optimalMax: 145,
    scaleMin: 90,
    scaleMax: 170,
    zones: [
      { label: "Анемия", color: "bg-rose-500/50", from: 90, to: 120 },
      { label: "Оптимум", color: "bg-emerald-500/50", from: 120, to: 150 },
      { label: "Повышен", color: "bg-amber-500/30", from: 150, to: 170 },
    ],
  },
  {
    name: "Глюкоза",
    subtitle: "Натощак",
    icon: Flame,
    unit: "ммоль/л",
    why: "Скрытая инсулинорезистентность - одна из частых причин, почему вес не уходит несмотря на тренировки и диету. Глюкоза 5.6+ уже сигнализирует о проблеме, даже если «ещё не диабет».",
    deficitSymptoms: "Тяга к сладкому, сонливость после еды, «спасательный круг» на талии, скачки энергии в течение дня",
    labMin: 3.3,
    labMax: 5.5,
    optimalMin: 4.0,
    optimalMax: 5.0,
    scaleMin: 3,
    scaleMax: 7,
    zones: [
      { label: "Гипогликемия", color: "bg-rose-500/40", from: 3, to: 3.3 },
      { label: "Оптимум", color: "bg-emerald-500/50", from: 3.3, to: 5.5 },
      { label: "Преддиабет", color: "bg-amber-500/40", from: 5.5, to: 6.1 },
      { label: "Диабет", color: "bg-rose-500/50", from: 6.1, to: 7 },
    ],
  },
];

function ReferenceScale({ test }: { test: TestCardData }) {
  const totalRange = test.scaleMax - test.scaleMin;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
          Шкала ({test.unit})
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-white/30">
            <span className="size-2 rounded-full bg-white/20" /> Лаб. норма
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-cyan-400/60">
            <span className="size-2 rounded-full bg-cyan-400/60" /> Оптимум
          </span>
        </div>
      </div>

      <div className="relative h-6 rounded-full overflow-hidden bg-white/[0.03]">
        {test.zones.map((zone, i) => {
          const left = ((zone.from - test.scaleMin) / totalRange) * 100;
          const width = ((zone.to - zone.from) / totalRange) * 100;
          return (
            <div
              key={i}
              className={cn("absolute inset-y-0", zone.color)}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}

        {/* Optimal range marker */}
        <div
          className="absolute inset-y-0 border-2 border-cyan-400/50 rounded-full z-10"
          style={{
            left: `${((test.optimalMin - test.scaleMin) / totalRange) * 100}%`,
            width: `${((test.optimalMax - test.optimalMin) / totalRange) * 100}%`,
          }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-white/20">{test.scaleMin}</span>
        <span className="text-[10px] text-white/20">{test.scaleMax}</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {test.zones.map((zone, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[10px] text-white/30">
            <span className={cn("size-1.5 rounded-full", zone.color)} />
            {zone.label}: {zone.from}-{zone.to}
          </span>
        ))}
      </div>
    </div>
  );
}

function TestCard({ test }: { test: TestCardData }) {
  const Icon = test.icon;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center shrink-0">
          <Icon className="size-5 text-cyan-400" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white/90">{test.name}</h4>
          <p className="text-xs text-white/35">{test.subtitle}</p>
        </div>
      </div>

      <p className="text-sm text-white/60 leading-relaxed mb-3">{test.why}</p>

      <div className="rounded-xl bg-rose-500/[0.04] border border-rose-500/10 p-3 mb-1">
        <p className="text-xs text-white/40 leading-relaxed">
          <span className="text-rose-400/70 font-bold text-[10px] uppercase tracking-wider mr-1.5">
            Симптомы дефицита:
          </span>
          {test.deficitSymptoms}
        </p>
      </div>

      <ReferenceScale test={test} />
    </div>
  );
}

// --- Symptom Decoder ---

interface SymptomMatch {
  symptom: string;
  icon: React.ElementType;
  tests: string[];
  color: string;
}

const symptomDecoder: SymptomMatch[] = [
  {
    symptom: "Постоянная усталость, нет сил на тренировку",
    icon: Zap,
    tests: ["Ферритин", "ТТГ", "Витамин D", "Кортизол"],
    color: "cyan",
  },
  {
    symptom: "Выпадение волос, ломкие ногти",
    icon: Sparkles,
    tests: ["Ферритин", "ТТГ", "Цинк", "Витамин D"],
    color: "cyan",
  },
  {
    symptom: "Вес стоит на месте, несмотря на усилия",
    icon: TrendingUp,
    tests: ["ТТГ", "Глюкоза", "Кортизол", "Инсулин"],
    color: "cyan",
  },
  {
    symptom: "Частые простуды и долгое восстановление",
    icon: Thermometer,
    tests: ["Витамин D", "Ферритин", "ОАК (лейкоциты)", "Цинк"],
    color: "cyan",
  },
  {
    symptom: "Плохой сон, тревожность, судороги",
    icon: Moon,
    tests: ["Магний (в эритроцитах)", "Кортизол", "ТТГ", "B12"],
    color: "cyan",
  },
  {
    symptom: "Нарушения цикла, ПМС",
    icon: CalendarCheck,
    tests: ["Эстрадиол", "ЛГ/ФСГ", "Пролактин", "ТТГ"],
    color: "cyan",
  },
];

// --- Extended Panel ---

interface ExtendedTest {
  name: string;
  what: string;
  whoNeeds: string;
  icon: React.ElementType;
}

const extendedTests: ExtendedTest[] = [
  {
    name: "Кортизол (утренний)",
    what: "Маркер хронического стресса и перетренированности. Повышенный кортизол разрушает мышцы, задерживает воду и мешает жиросжиганию.",
    whoNeeds: "Если чувствуешь истощение, плохо восстанавливаешься, набираешь вес в области живота",
    icon: Brain,
  },
  {
    name: "hs-CRP (С-реактивный белок)",
    what: "Маркер системного воспаления. Хроническое скрытое воспаление замедляет прогресс, ухудшает восстановление и повышает риск травм.",
    whoNeeds: "Если боли в суставах, хроническая усталость, частые ОРВИ",
    icon: AlertTriangle,
  },
  {
    name: "Витамин B12 и фолат",
    what: "Критичны для энергии, нервной системы и кроветворения. B12 расходуется при стрессе и тренировках, а фолат важен для восстановления ДНК.",
    whoNeeds: "Если вегетарианка, при снижении когнитивных функций, покалывании в конечностях",
    icon: Zap,
  },
  {
    name: "Магний (в эритроцитах)",
    what: "Сывороточный магний неинформативен - он показывает лишь 1% запасов. Реальную картину даёт магний в эритроцитах. Дефицит = судороги, бессонница, тревожность.",
    whoNeeds: "Если мышечные судороги, бессонница, высокий стресс, интенсивные тренировки",
    icon: Moon,
  },
  {
    name: "Половые гормоны (эстрадиол, ЛГ, ФСГ)",
    what: "Нужны при нарушениях менструального цикла. Баланс этих гормонов напрямую влияет на композицию тела, настроение и восстановление.",
    whoNeeds: "Если нерегулярный цикл, отсутствие менструации, выраженный ПМС",
    icon: Heart,
  },
];

// --- Preparation Checklist ---

interface PrepRule {
  icon: React.ElementType;
  rule: string;
  detail: string;
  important?: boolean;
}

const prepRules: PrepRule[] = [
  {
    icon: Timer,
    rule: "Натощак, 8-12 часов голода",
    detail: "Воду пить можно и нужно. Ужин накануне - лёгкий, без алкоголя",
  },
  {
    icon: Sun,
    rule: "Утром до 10:00",
    detail: "Гормоны имеют суточные ритмы. Утренние значения - самые показательные",
  },
  {
    icon: Ban,
    rule: "День отдыха от тренировок",
    detail: "Тренировка накануне искажает ферритин, КФК, кортизол и воспалительные маркеры",
    important: true,
  },
  {
    icon: CalendarCheck,
    rule: "Учитывай фазу цикла",
    detail: "Половые гормоны - на 3-5 день цикла. Ферритин, D, ТТГ - в любой день",
  },
  {
    icon: Thermometer,
    rule: "Не на фоне болезни",
    detail: "ОРВИ, стресс и воспаления искажают большинство показателей. Подожди 2 недели после выздоровления",
  },
  {
    icon: Pill,
    rule: "Сообщи о добавках и лекарствах",
    detail: "Биотин искажает ТТГ, железо влияет на ферритин. Врач должен знать, что ты принимаешь",
  },
];

// --- Main Article ---

export default function LabControl({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "lab-control",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.8,
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-cyan-500/30"
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
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-16 pt-12 md:pt-24 text-left">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-white/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Биохакинг
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 10 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Лабораторный контроль:{" "}
              <span className="text-white/90">
                какие анализы <span className="text-cyan-400">важны для тебя</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-white/10 pl-8 italic">
              Приборная панель твоего тела. Какие цифры контролировать, как читать результаты и когда пора действовать.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579165466741-7f35e4755660?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Laboratory tests"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <article className="max-w-[860px] mx-auto px-4 md:px-0">

        {/* Дисклеймер */}
        <div className="rounded-2xl bg-amber-500/[0.04] border border-amber-500/12 p-5 mb-14">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-400/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400/80 mb-1">Важно</p>
              <p className="text-sm text-white/50 leading-relaxed">
                Эта статья носит <span className="text-white/70 font-medium">информационный характер</span> и не заменяет консультацию врача. Интерпретацию результатов анализов должен проводить специалист с учётом твоей индивидуальной ситуации. Референсные значения в статье приведены как ориентир, а не как диагноз.
              </p>
            </div>
          </div>
        </div>

        {/* Вступление */}
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Ты тренируешься три раза в неделю, следишь за питанием, пьёшь воду, ложишься вовремя - но <span className="text-white/90 font-bold">результат стоит на месте</span>. Вес не двигается, энергии нет, волосы сыпятся, а на тренировке одышка на втором подходе. Знакомо? Проблема может быть не в плане тренировок и не в силе воли. Она может быть <span className="text-cyan-400/85 font-bold underline decoration-cyan-500/30 underline-offset-4">в биохимии</span>.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Анализы крови - это приборная панель твоего тела. Ты же не водишь машину без спидометра и датчика топлива? Так почему тренируешься вслепую, не зная своих <span className="text-white/90 font-bold">реальных цифр</span>? Давай разберёмся, какие анализы стоит сдать, как их правильно читать и что делать с результатами.
          </p>
        </div>

        {/* Секция 1: Зачем сдавать, если «ничего не болит» */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Зачем сдавать, если «ничего не болит»
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Большинство дефицитов - <span className="text-cyan-400/85 font-bold">субклинические</span>. Это значит, что тебе не плохо настолько, чтобы пойти к врачу, но и не хорошо настолько, чтобы выкладываться на полную. Ты привыкаешь к состоянию «так себе» и начинаешь считать это нормой.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Представь, что твоя машина может ехать 180 км/ч, но из-за забитого фильтра выдаёт максимум 100. Ты этого не знаешь, потому что <span className="text-white/85 font-bold">никогда не видела показания</span>. Точно так же ферритин в 15 нг/мл формально «в норме», но твои мышцы <span className="text-cyan-400/85 font-bold">буквально голодают без кислорода</span>. А «нормальный» ТТГ в 3.8 мЕд/л может означать, что метаболизм работает на тормозе.
          </p>

          {/* Symptom Decoder */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                <FlaskConical className="size-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white/90">Декодер симптомов</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Если у тебя... - проверь
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {symptomDecoder.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl bg-white/[0.02] border border-white/5 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="size-4 text-cyan-400/60 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white/75 mb-2">{item.symptom}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.tests.map((test, j) => (
                            <span
                              key={j}
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/[0.08] border border-cyan-500/15 text-cyan-400/70"
                            >
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Секция 2: Дефицитный айсберг */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Дефицитный айсберг
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Исследования показывают масштаб проблемы: <span className="text-cyan-400/85 font-bold">большинство активных женщин</span> имеют дефициты ключевых нутриентов, даже если питаются «правильно». Физическая активность увеличивает расход витаминов и минералов, а потери с потом, микроповреждения мышц и ускоренный метаболизм требуют больше ресурсов, чем у людей с сидячим образом жизни.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Вот что показывают <span className="text-white/85 font-bold underline decoration-white/10 underline-offset-4">реальные данные</span> по женщинам с регулярными тренировками:
          </p>

          <DeficiencyChart />
        </section>

        {/* Секция 3: Базовая панель */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Базовая панель: 5 анализов для каждой
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Эти пять показателей дают <span className="text-cyan-400/85 font-bold">80% информации</span> о твоём здоровье в контексте фитнеса. Сдавай их минимум раз в полгода. Обрати внимание: <span className="text-white/85 font-bold">оптимальные значения для активных женщин</span> отличаются от стандартных лабораторных норм - и именно здесь кроется главная ловушка.
          </p>

          <p className="text-sm text-white/40 leading-relaxed mb-6 italic">
            На шкалах ниже: цветные зоны показывают состояние, а бирюзовая рамка - оптимальный диапазон для женщин с регулярными тренировками.
          </p>

          <div className="space-y-4">
            {baseTests.map((test, i) => (
              <TestCard key={i} test={test} />
            ))}
          </div>
        </section>

        {/* Секция 4: Расширенная панель */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Расширенная панель: для глубокого контроля
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Если базовая панель в норме, а симптомы остаются - копай глубже. Эти анализы помогут найти скрытые проблемы и <span className="text-cyan-400/85 font-bold">оптимизировать восстановление</span>.
          </p>

          <div className="space-y-3">
            {extendedTests.map((test, i) => {
              const Icon = test.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl bg-white/[0.02] border border-white/5 p-4 md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-cyan-400/70" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white/85 mb-1">{test.name}</h4>
                      <p className="text-sm text-white/50 leading-relaxed mb-2">{test.what}</p>
                      <p className="text-xs text-white/30 leading-relaxed">
                        <span className="text-cyan-400/50 font-bold uppercase tracking-wider text-[10px] mr-1">
                          Кому:
                        </span>
                        {test.whoNeeds}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl bg-cyan-500/[0.04] border border-cyan-500/10 p-4 mt-4">
            <p className="text-sm text-white/50 leading-relaxed">
              <span className="text-cyan-400/70 font-bold text-[10px] uppercase tracking-wider mr-1.5">
                Про гормоны цикла:
              </span>
              Эстрадиол, ЛГ и ФСГ - тема глубокая и заслуживает отдельного разговора. Если у тебя нарушения цикла, обязательно сдай эти анализы с врачом-гинекологом. Подробнее об этом мы расскажем в статье «Цикл и тренировки».
            </p>
          </div>
        </section>

        {/* Секция 5: Как правильно сдавать */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Как сдавать правильно
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Неправильная подготовка = <span className="text-white/85 font-bold">искажённые результаты</span> = ложные выводы. Это как взвешиваться после литра воды и ужина - цифра будет, но бесполезная. Вот <span className="text-cyan-400/85 font-bold">правила</span>, которые сделают твои анализы точными:
          </p>

          <div className="space-y-3">
            {prepRules.map((rule, i) => {
              const Icon = rule.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-4 rounded-xl p-4",
                    rule.important
                      ? "bg-amber-500/[0.04] border border-amber-500/10"
                      : "bg-white/[0.02] border border-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center shrink-0",
                      rule.important
                        ? "bg-amber-500/10 border border-amber-500/15"
                        : "bg-white/[0.04] border border-white/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        rule.important ? "text-amber-400/70" : "text-white/40"
                      )}
                    />
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-bold mb-0.5",
                      rule.important ? "text-amber-400/80" : "text-white/80"
                    )}>
                      {rule.rule}
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed">{rule.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CircleCheck className="size-4 text-emerald-400/60" />
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">
                  Частота
                </p>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                <span className="text-white/75 font-medium">Базовая панель</span> - 2 раза в год (весна и осень).{" "}
                <span className="text-white/75 font-medium">Расширенная</span> - 1 раз в год или при появлении симптомов.
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CircleX className="size-4 text-rose-400/60" />
                <p className="text-xs font-bold uppercase tracking-wider text-rose-400/70">
                  Когда не сдавать
                </p>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                Во время ОРВИ, в первые 2 дня менструации, после бессонной ночи, в период сильного стресса. Подожди 2 недели после выздоровления.
              </p>
            </div>
          </div>
        </section>

        {/* Блок платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-6 md:p-10">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/[0.03] blur-[80px] rounded-full" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Activity className="size-4.5 text-white/40" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  MargoFitness
                </p>
              </div>

              <h3 className="text-xl md:text-2xl font-oswald font-bold uppercase tracking-tight text-white mb-3">
                Анализы показали картину.{" "}
                <span className="text-cyan-400/80">Трекер покажет динамику</span>
              </h3>

              <p className="text-sm text-white/40 leading-relaxed mb-6">
                Анализы - это снимок. Но чтобы видеть, как твой организм реагирует на изменения, нужна ежедневная фиксация. Виджеты трекера здоровья MargoFitness помогут связать лабораторные данные с реальным самочувствием.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <Smile className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Настроение и энергия</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Низкий витамин D и магний часто = подавленное настроение. Трекер покажет корреляцию с приёмом добавок
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <Moon className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Качество сна</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Начала принимать магний по результатам анализов? Отслеживай, как меняется сон неделя за неделей
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <TrendingUp className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Вес и замеры</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    ТТГ скорректирован - вес тронулся? Графики покажут реальную динамику, а не колебания воды
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <Zap className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Тренировки</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Ферритин поднялся до оптимума - замечаешь, что выносливость на тренировке выросла? Оценки сложности это подтвердят
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Твоё тело говорит{" "}
            <span className="text-white/90">
              цифрами.{" "}
              <span className="text-cyan-400">Пора услышать</span>
            </span>
          </h2>
          <p className="text-white/20 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Один анализ крови может объяснить месяцы топтания на месте. Не тренируйся вслепую - знай свои цифры и действуй точно.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/15 transition-all hover:scale-[1.02] active:scale-[0.98] mb-2"
          >
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}
