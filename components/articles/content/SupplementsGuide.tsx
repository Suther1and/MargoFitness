"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FlaskConical,
  Pill,
  Dumbbell,
  Heart,
  Brain,
  Moon,
  Droplets,
  Flame,
  Zap,
  TrendingUp,
  Activity,
  Star,
  ExternalLink,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Sun,
  Fish,
  Apple,
  BrainCircuit,
  Coffee,
  Leaf,
  Smile,
  Focus,
  Timer,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

// --- Types ---

interface SupplementData {
  name: string;
  subtitle: string;
  whatItDoes: string;
  whoNeeds: string;
  dosage: string;
  form: string;
  brands: string;
  wbLink: string;
  ozonLink: string;
  image?: string;
}

// --- SupplementSlider ---

function SupplementSlider({
  cards,
  accentColor = "emerald",
  category = "default",
}: {
  cards: SupplementData[];
  accentColor?: string;
  category?: "fundamentals" | "beauty" | "sport" | "biohacking" | "default";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeftPos - walk;
      }
    });
  };

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 376;
    if (window.innerWidth < 768) {
      return (window.innerWidth - 32) / 1.1;
    }
    return 376;
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    const scrollTo =
      direction === "left"
        ? scrollRef.current.scrollLeft - (cardWidth + 16)
        : scrollRef.current.scrollLeft + (cardWidth + 16);
    scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    const gap = 16;
    const scrollLeft = scrollRef.current.scrollLeft;
    
    // На мобильных отступ 16px, на десктопе 0
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const offset = isMobile ? 16 : 0;
    
    const index = Math.round((scrollLeft - offset) / (cardWidth + gap));
    setCurrentSlide(Math.max(0, Math.min(index, cards.length - 1)));
  };

  const getDotsCount = () => {
    if (typeof window === "undefined") return cards.length;
    // На десктопе помещается 2 карточки, значит буллетов должно быть N - 1
    if (window.innerWidth >= 768) {
      return Math.max(1, cards.length - 1);
    }
    // На мобильных одна карточка, значит буллетов N
    return cards.length;
  };

  const dotColors: Record<string, string> = {
    fundamentals: "bg-cyan-500",
    beauty: "bg-pink-500",
    sport: "bg-blue-500",
    biohacking: "bg-emerald-500",
    default: "bg-emerald-500",
  };

  const activeDotColor = dotColors[category] || dotColors.default;

  return (
    <div className="relative">
      <div className="hidden md:flex items-center gap-2 justify-end mb-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll("left")}
          className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft className="size-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scroll("right")}
          className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <ArrowRight className="size-4" />
        </motion.button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 scrollbar-hide select-none",
          "px-4 md:px-0",
          isDragging
            ? "cursor-grabbing"
            : "cursor-grab md:snap-none snap-x snap-mandatory"
        )}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="snap-start shrink-0 first:ml-0"
            style={{
              width: typeof window !== "undefined" && window.innerWidth < 768 
                ? "calc(100vw - 64px)" 
                : "376px"
            }}
          >
            <SupplementCard data={card} category={category} />
          </div>
        ))}
        <div className="md:hidden w-4 shrink-0" />
      </div>

      <div className="flex justify-center gap-1.5 mt-2">
        {Array.from({ length: getDotsCount() }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (scrollRef.current) {
                const cardWidth = getCardWidth();
                const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
                const offset = isMobile ? 16 : 0;
                scrollRef.current.scrollTo({
                  left: i * (cardWidth + 16),
                  behavior: "smooth",
                });
              }
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              currentSlide === i
                ? cn("w-5", activeDotColor)
                : "w-1.5 bg-white/10 hover:bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// --- SupplementCard ---

const categoryGradients: Record<string, string> = {
  fundamentals: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  beauty: "from-pink-500/20 via-pink-500/5 to-transparent",
  sport: "from-blue-600/25 via-blue-600/5 to-transparent",
  biohacking: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  default: "from-emerald-500/10 via-emerald-500/5 to-transparent",
};

const categoryColors: Record<string, { subtitle: string; brands: string }> = {
  fundamentals: { subtitle: "text-cyan-400/70", brands: "text-cyan-400/70" },
  beauty: { subtitle: "text-pink-400/70", brands: "text-pink-400/70" },
  sport: { subtitle: "text-blue-400/70", brands: "text-blue-400/70" },
  biohacking: { subtitle: "text-white/40", brands: "text-emerald-400/60" },
  default: { subtitle: "text-white/40", brands: "text-emerald-400/60" },
};

function SupplementCard({ 
  data, 
  category = "default" 
}: { 
  data: SupplementData;
  category?: "fundamentals" | "beauty" | "sport" | "biohacking" | "default";
}) {
  const gradientClass = categoryGradients[category] || categoryGradients.default;
  const colors = categoryColors[category] || categoryColors.default;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col h-full hover:border-white/20 transition-all group">
      <div className={cn(
        "h-56 flex items-center justify-center border-b border-white/5 relative overflow-hidden bg-gradient-to-br",
        gradientClass
      )}>
        {data.image ? (
          <div className="relative w-full h-full flex items-center justify-center p-6">
            <img
              src={data.image}
              alt={data.name}
              className="h-full w-auto object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] will-change-transform backface-hidden"
              style={{ transform: "translateZ(0)" }}
            />
            {/* Световой блик на фоне для объема */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 blur-[50px] rounded-full pointer-events-none" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/15">
            <ImageIcon className="size-8" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Фото продукта
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold text-white/90 mb-0.5">
          {data.name}
        </h4>
        <p className={cn("text-[11px] font-medium mb-3", colors.subtitle)}>
          {data.subtitle}
        </p>

        <p className="text-xs text-white/50 leading-relaxed mb-3">
          {data.whatItDoes}
        </p>

        <div className="flex flex-col gap-3 mb-4 text-[10px] mt-auto">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-white/25 font-bold uppercase tracking-wider">
                Кому
              </span>
              <p className="text-white/50 mt-0.5">
                {data.whoNeeds}
              </p>
            </div>
            <div className="flex flex-col text-right shrink-0 min-w-[80px]">
              <span className="text-white/25 font-bold uppercase tracking-wider">
                Дозировка
              </span>
              <p className="text-white/50 mt-0.5">
                {data.dosage}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col min-w-0">
              <span className="text-white/25 font-bold uppercase tracking-wider">
                Форма
              </span>
              <p className="text-white/50 mt-0.5">
                {data.form}
              </p>
            </div>
            <div className="flex flex-col text-right min-w-0">
              <span className="text-white/25 font-bold uppercase tracking-wider">
                Бренды
              </span>
              <p className={cn("font-medium mt-0.5", colors.brands)}>
                {data.brands}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          {data.wbLink && data.wbLink !== "#" && (
            <a
              href={data.wbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-violet-500/10 border border-violet-500/15 text-violet-400/80 text-[10px] font-bold uppercase tracking-wider hover:bg-violet-500/20 transition-colors group/btn"
            >
              Wildberries
              <ExternalLink className="size-2.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>
          )}
          {data.ozonLink && data.ozonLink !== "#" && (
            <a
              href={data.ozonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400/80 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors group/btn"
            >
              Ozon
              <ExternalLink className="size-2.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// --- PriorityPyramid ---

function PriorityPyramid() {
  const levels = [
    { label: "Добавки", width: "30%", opacity: "bg-white/5 border-white/10 text-emerald-400/70", desc: "Вишенка на торте" },
    { label: "Тренировки", width: "50%", opacity: "bg-white/[0.07] border-white/10 text-white/80", desc: "Стимул для роста" },
    { label: "Питание", width: "70%", opacity: "bg-white/10 border-white/10 text-white/90", desc: "Строительный материал" },
    { label: "Сон и восстановление", width: "90%", opacity: "bg-emerald-500/20 border-emerald-500/20 text-white", desc: "Фундамент всего" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {levels.map((level, i) => (
        <div key={i} className="flex flex-col items-center" style={{ width: level.width }}>
          <div
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-center transition-all",
              level.opacity
            )}
          >
            <p className="text-sm font-bold">{level.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{level.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- EvidenceTierList ---

function EvidenceTierList() {
  const tiers = [
    {
      label: "Доказано работает",
      color: "emerald",
      icon: CheckCircle2,
      items: [
        { name: "Витамин D3", note: "дефицит у 80% россиян, влияет на всё" },
        { name: "Омега-3", note: "воспаление, суставы, мозг, сердце" },
        { name: "Магний", note: "сон, мышцы, нервная система" },
        { name: "Креатин", note: "сила и энергия, мета-анализы подтверждают" },
        { name: "Протеин", note: "строительный материал, если не добираешь из еды" },
      ],
    },
    {
      label: "Работает в контексте",
      color: "cyan",
      icon: AlertTriangle,
      items: [
        { name: "Железо", note: "только при подтверждённом дефиците (анализ!)" },
        { name: "Коллаген", note: "кожа и суставы, но исследования неоднозначны" },
        { name: "Цинк", note: "иммунитет, кожа - при нехватке в рационе" },
        { name: "B-витамины", note: "энергия, нервы - при стрессе и дефиците" },
      ],
    },
    {
      label: "Маркетинг",
      color: "zinc",
      icon: MinusCircle,
      items: [
        { name: "BCAA", note: "при достаточном белке - бесполезны" },
        { name: "L-карнитин", note: "мета-анализ 37 РКИ: эффект минимальный" },
        { name: "Жиросжигатели", note: "опасны или неэффективны, часто оба" },
      ],
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; dot: string }> = {
    emerald: { border: "border-emerald-500/15", bg: "bg-emerald-500/[0.04]", text: "text-emerald-400", dot: "bg-emerald-400" },
    amber: { border: "border-amber-500/15", bg: "bg-amber-500/[0.04]", text: "text-amber-400", dot: "bg-amber-400" },
    zinc: { border: "border-white/10", bg: "bg-white/[0.02]", text: "text-white/40", dot: "bg-white/30" },
    pink: { border: "border-pink-500/15", bg: "bg-pink-500/[0.04]", text: "text-pink-400", dot: "bg-pink-400" },
    blue: { border: "border-blue-500/15", bg: "bg-blue-500/[0.04]", text: "text-blue-400", dot: "bg-blue-400" },
    cyan: { border: "border-cyan-500/15", bg: "bg-cyan-500/[0.04]", text: "text-cyan-400", dot: "bg-cyan-400" },
  };

  return (
    <div className="space-y-4">
      {tiers.map((tier, i) => {
        const c = colorMap[tier.color];
        return (
          <div key={i} className={cn("rounded-2xl border p-4 md:p-5", c.border, c.bg)}>
            <div className="flex items-center gap-2.5 mb-3">
              <tier.icon className={cn("size-4", c.text)} />
              <h4 className={cn("text-sm font-bold uppercase tracking-wider", c.text)}>
                {tier.label}
              </h4>
            </div>
            <div className="space-y-2">
              {tier.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <div className={cn("size-1.5 rounded-full mt-1.5 shrink-0", c.dot)} />
                  <p className="text-sm text-white/60">
                    <span className="text-white/80 font-medium">{item.name}</span>
                    <span className="text-white/35"> - {item.note}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Supplement Data ---

const fundamentals: SupplementData[] = [
  {
    name: "Витамин D3 + K2",
    subtitle: "Солнечный гормон",
    whatItDoes: "Регулирует усвоение кальция, поддерживает иммунитет, влияет на настроение и энергию. Дефицит у 80% россиян из-за недостатка солнца.",
    whoNeeds: "Практически всем",
    dosage: "2 000-5 000 МЕ/день",
    form: "D3 + K2 (MK-7)",
    brands: "GLS, Solgar, Now Foods",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/d3-k2.png",
  },
  {
    name: "Омега-3 (EPA/DHA)",
    subtitle: "Противовоспалительный щит",
    whatItDoes: "Снижает воспаление после тренировок, поддерживает суставы, мозг и сердце. Организм не производит сам - только из пищи или добавок.",
    whoNeeds: "Если ешь рыбу < 3 раз/нед",
    dosage: "1 000-2 000 мг EPA+DHA",
    form: "Триглицеридная",
    brands: "GLS, Solgar, Nordic Naturals",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/omega3.png",
  },
  {
    name: "Магний",
    subtitle: "Минерал спокойствия",
    whatItDoes: "Расслабляет мышцы после тренировок, улучшает сон, снижает тревожность. Участвует в 300+ реакциях организма.",
    whoNeeds: "При стрессе, судорогах, бессоннице",
    dosage: "300-400 мг/день",
    form: "Цитрат или бисглицинат",
    brands: "GLS, Now Foods, Doctor's Best",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/magnesium.png",
  },
  {
    name: "Железо",
    subtitle: "Только по анализам",
    whatItDoes: "Переносит кислород к мышцам. Дефицит = усталость, одышка на тренировках, слабость. Но избыток токсичен - сдай ферритин перед приёмом.",
    whoNeeds: "При дефиците (ферритин < 30)",
    dosage: "25-50 мг/день",
    form: "Бисглицинат (мягкая)",
    brands: "GLS, Solgar Gentle Iron",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/iron.png",
  },
  {
    name: "Витамины группы B",
    subtitle: "Энергия и нервы",
    whatItDoes: "Участвуют в производстве энергии, работе нервной системы, метаболизме белков и жиров. Расходуются при стрессе и тренировках.",
    whoNeeds: "При высоком стрессе, вегетарианцам",
    dosage: "1 капсула/день",
    form: "B-комплекс",
    brands: "GLS, Now B-50, Solgar B-Complex",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/b-complex.png",
  },
];

const beauty: SupplementData[] = [
  {
    name: "Opti-Women",
    subtitle: "Мультивитамин для активных",
    whatItDoes: "Комплекс из 23 витаминов и минералов, разработанный для женщин с активным образом жизни. Покрывает базовые потребности одной капсулой.",
    whoNeeds: "Как базовое покрытие дефицитов",
    dosage: "1 капсула/день",
    form: "Комплекс",
    brands: "Optimum Nutrition",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/opti-women.png",
  },
  {
    name: "Коллаген",
    subtitle: "Кожа, суставы, связки",
    whatItDoes: "Основной белок соединительной ткани. Исследования показывают улучшение эластичности кожи и уменьшение морщин при приёме 5-10 г/день. Принимай с витамином C для усвоения.",
    whoNeeds: "После 25 лет, при нагрузке на суставы",
    dosage: "5-10 г/день",
    form: "Гидролизованный (пептиды)",
    brands: "GLS, Solgar, Sports Research",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/collagen.png",
  },
  {
    name: "Цинк",
    subtitle: "Иммунитет и кожа",
    whatItDoes: "Участвует в синтезе белка, заживлении, иммунитете. Расходуется при потоотделении на тренировках. Влияет на состояние кожи и волос.",
    whoNeeds: "При частых простудах, проблемной коже",
    dosage: "15-25 мг/день",
    form: "Пиколинат или бисглицинат",
    brands: "GLS, Now Foods, Solgar",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/zinc.png",
  },
  {
    name: "Биотин",
    subtitle: "Волосы и ногти",
    whatItDoes: "Витамин B7 - участвует в метаболизме и влияет на рост волос, крепость ногтей. Эффект заметен через 2-3 месяца регулярного приёма.",
    whoNeeds: "При выпадении волос, ломких ногтях",
    dosage: "5 000 мкг/день",
    form: "Шипучка",
    brands: "GLS, Mein Herz, Эвалар",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/biotin.png",
  },
];

const sportSupps: SupplementData[] = [
  {
    name: "Сывороточный протеин",
    subtitle: "Строительный материал",
    whatItDoes: "Концентрированный белок для восстановления мышц. 1 порция = ~25 г белка. Не «химия», а обычное молоко без воды, жира и лактозы.",
    whoNeeds: "Если не добираешь 1.6 г белка/кг",
    dosage: "1-2 порции/день",
    form: "Whey / Whey Isolate",
    brands: "Optimum Nutrition, Primecraft, S.A.N.",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/whey-protein.png",
  },
  {
    name: "Креатин моногидрат",
    subtitle: "Сила и энергия",
    whatItDoes: "Самая изученная добавка в мире. Увеличивает запасы АТФ в мышцах = больше силы и выносливости. Мета-анализы подтверждают рост сухой массы.",
    whoNeeds: "Всем, кто тренируется с весами",
    dosage: "3-5 г/день, каждый день",
    form: "Моногидрат (порошок)",
    brands: "Optimum Nutrition, Primecraft, Now Foods",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/creatine.png",
  },
  {
    name: "Электролиты",
    subtitle: "Баланс при нагрузках",
    whatItDoes: "Натрий, калий, магний - теряются с потом. Дефицит = судороги, головокружение, падение работоспособности. Особенно важны летом и при интенсивных тренировках.",
    whoNeeds: "При интенсивном потоотделении",
    dosage: "1 порция во время тренировки",
    form: "Порошок для растворения",
    brands: "Primecraft, GLS, Liquid IV",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/electrolytes.png",
  },
  {
    name: "BCAA",
    subtitle: "Честный разбор",
    whatItDoes: "Три аминокислоты (лейцин, изолейцин, валин). Если ты ешь достаточно белка (1.6+ г/кг) - BCAA бесполезны, так как ты получаешь их из еды. Имеют смысл только при низком потреблении белка.",
    whoNeeds: "Только при дефиците белка",
    dosage: "5-10 г/тренировку",
    form: "Порошок или капсулы",
    brands: "Optimum Nutrition, Primecraft, GLS",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/bcaa.png",
  },
  {
    name: "L-карнитин",
    subtitle: "Скромный помощник",
    whatItDoes: "Переносит жирные кислоты в митохондрии. Мета-анализ 37 исследований: эффект на жиросжигание есть, но скромный. Не волшебная таблетка, а лёгкая поддержка при тренировках.",
    whoNeeds: "При активном жиросжигании",
    dosage: "1 000-2 000 мг/день",
    form: "L-тартрат или ацетил",
    brands: "GLS, Now Foods, Primecraft",
    wbLink: "#",
    ozonLink: "#",
    image: "/supplements/l-carnitine.png",
  },
];

const biohackingProducts = [
  {
    name: "Фисташки",
    subtitle: "Серотониновая бомба",
    desc: "Рекордсмен по содержанию триптофана и мелатонина. Помогают выравнивать цикл сна и повышать уровень «гормона счастья» без скачков сахара.",
    tip: "Съедай 30г за 2 часа до сна для лучшего эффекта.",
    impact: "Настроение и сон",
    icon: Smile,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    category: "brain",
    image: "/supplements/pistachios.png",
  },
  {
    name: "Тёмный шоколад (85%+)",
    subtitle: "Нейропротектор",
    desc: "Флавоноиды какао стимулируют выработку BDNF — белка, отвечающего за рост новых нейронов. Улучшает рабочую память и скорость реакции.",
    tip: "Достаточно 20г в первой половине дня.",
    impact: "Когнитивные функции",
    icon: BrainCircuit,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    category: "brain",
    image: "/supplements/dark-chocolate.png",
  },
  {
    name: "Зелёный чай (Матча)",
    subtitle: "Спокойная концентрация",
    desc: "Комбинация L-теанина и кофеина. Теанин сглаживает «кофеиновый удар», создавая состояние глубокого фокуса без тревожности.",
    impact: "Фокус и энергия",
    tip: "Взбей с кокосовым молоком для долгой энергии.",
    icon: Leaf,
    color: "text-green-400",
    bg: "bg-green-500/10",
    category: "brain",
    image: "/supplements/matcha.png",
  },
  {
    name: "Жирная дикая рыба",
    subtitle: "Мембранное топливо",
    desc: "Источник фосфолипидов и Омега-3, которые максимально эффективно встраиваются в мембраны клеток мозга, ускоряя передачу сигналов.",
    impact: "Скорость мышления",
    tip: "Выбирай мелкую рыбу (сельдь, скумбрия) — в ней меньше ртути.",
    icon: Fish,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    category: "brain",
    image: "/supplements/wild-fish.png",
  },
  {
    name: "Куркума + Чёрный перец",
    subtitle: "Природный детокс",
    desc: "Куркумин в связке with пиперином снижает системное воспаление в организме, которое является главной причиной быстрой утомляемости.",
    impact: "Противовоспаление",
    tip: "Перец повышает усвоение куркумина на 2000%.",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    category: "health",
    image: "/supplements/turmeric.png",
  },
  {
    name: "Черника / Голубика",
    subtitle: "Антоциановый щит",
    desc: "Мощные антиоксиданты, которые проникают через гематоэнцефалический барьер и защищают мозг от окислительного стресса и старения.",
    impact: "Долголетие мозга",
    tip: "Замороженная ягода сохраняет все свойства.",
    icon: ShieldCheck,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    category: "health",
    image: "/supplements/blueberries.png",
  },
  {
    name: "Брокколи (проростки)",
    subtitle: "Сульфорафановый взрыв",
    desc: "Содержат сульфорафан — вещество, активирующее путь Nrf2, который запускает мощнейшую внутреннюю систему детоксикации клеток.",
    impact: "Клеточный детокс",
    tip: "Ешь сырыми, термическая обработка убивает фермент.",
    icon: Activity,
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    category: "health",
    image: "/supplements/broccoli.png",
  },
  {
    name: "Субпродукты (печень)",
    subtitle: "Мультивитамин от природы",
    desc: "Концентрат витаминов группы B, железа и витамина A в самой доступной форме. Поддерживают высокий уровень энергии и кроветворение.",
    impact: "Энергия и кровь",
    tip: "Достаточно есть 1-2 раза в неделю для закрытия дефицитов.",
    icon: Activity,
    color: "text-red-400",
    bg: "bg-red-500/10",
    category: "health",
    image: "/supplements/liver.png",
  },
];

// --- BiohackingProductItem ---

function BiohackingProductItem({ item, index }: { item: typeof biohackingProducts[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      layout
      className="relative border-b border-white/5 last:border-0 overflow-hidden"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 py-6 cursor-pointer group select-none"
      >
        {/* Номер и иконка */}
        <div className="relative flex items-center justify-center size-12 shrink-0">
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-oswald font-black text-white/[0.03] group-hover:text-white/[0.06] transition-colors">
            {index + 1}
          </span>
          <div className={cn("size-10 rounded-xl flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110", item.bg)}>
            <item.icon className={cn("size-5", item.color)} />
          </div>
        </div>

        {/* Заголовок и категория */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-oswald font-black text-white uppercase tracking-tight truncate group-hover:text-white transition-colors">
              {item.name}
            </h4>
            <ChevronLeft className={cn(
              "size-4 text-white/20 transition-transform duration-500",
              isOpen ? "-rotate-90" : "rotate-180"
            )} />
          </div>
          <p className={cn("text-[9px] font-black uppercase tracking-[0.2em]", item.color)}>
            {item.impact}
          </p>
        </div>

        {/* Индикатор раскрытия (динамический) */}
        {!isOpen && (
          <div className="hidden md:flex items-center gap-6 overflow-hidden">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-white/5 uppercase tracking-widest group-hover:text-white/20 transition-colors duration-500">
                {item.subtitle}
              </p>
              <div className={cn("h-px w-0 group-hover:w-full transition-all duration-700 ease-out mt-1", 
                item.color.replace('text-', 'bg-').replace('/10', '')
              )} />
            </div>
          </div>
        )}
      </div>

      {/* Раскрывающаяся часть */}
      <motion.div
        initial={false}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="overflow-hidden"
      >
        <div className="flex flex-col md:flex-row gap-8 pb-6 pl-16 pr-4">
          <div className="flex-1 flex flex-col min-h-[140px]">
            <p className="text-base text-white/50 leading-relaxed mb-8 font-medium">
              {item.desc}
            </p>
            
            <div className="relative pl-6 border-l-2 border-white/10 py-1">
              <div className={cn("absolute -left-[2px] top-0 h-full w-[2px]", 
                item.color.replace('text-', 'bg-').replace('/10', '')
              )} />
              <p className="text-sm text-white/40 italic leading-relaxed">
                <span className={cn("not-italic font-black uppercase tracking-tighter text-[10px] mr-2", item.color)}>
                  Pro Tip:
                </span>
                {item.tip}
              </p>
            </div>
          </div>

          <div className="relative size-40 shrink-0 flex items-center justify-center self-center md:self-end mb-2">
            <div className={cn("absolute inset-0 opacity-20 blur-[40px] rounded-full", item.bg)} />
            {item.image && !imageError ? (
              <img
                src={item.image}
                alt={item.name}
                onError={() => setImageError(true)}
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />
            ) : (
              <item.icon className={cn("size-20 relative z-10 opacity-20", item.color)} />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Article ---

export default function SupplementsGuide({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "supplements-guide",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-emerald-500/30"
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
              <span className="bg-white/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Биохакинг
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-white/5 text-white/40 border border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 12 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Гид по добавкам:{" "}
              <span className="text-white/90">
                что реально работает и <span className="text-emerald-400">стоит ли тратить деньги</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-white/10 pl-8 italic">
              Научный разбор БАДов и спортпита - без маркетинга. Конкретные добавки, дозировки и бренды, которым можно доверять.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop"
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

        {/* Дисклеймер */}
        <div className="rounded-2xl bg-amber-500/[0.04] border border-amber-500/12 p-5 mb-14">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-5 text-amber-400/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-400/80 mb-1">Важно</p>
              <p className="text-sm text-white/50 leading-relaxed">
                Эта статья носит <span className="text-white/70 font-medium">информационный характер</span> и не является медицинской рекомендацией. Перед приёмом любых добавок проконсультируйся с врачом. Некоторые добавки могут взаимодействовать с лекарствами или быть противопоказаны при определённых состояниях.
              </p>
              <div className="h-px w-full bg-amber-500/10 my-4" />
              <p className="text-sm text-white/50 leading-relaxed italic">
                Изображения продуктов приведены для примера. Реальный вид упаковки может отличаться в зависимости от производителя, региона и актуальных обновлений бренда.
              </p>
            </div>
          </div>
        </div>

        {/* Вступление */}
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Ты только начинаешь тренироваться, заходишь в аптеку или на маркетплейс - и видишь <span className="text-white/90 font-bold">сотни банок</span> с обещаниями: «сжигает жир», «ускоряет рост мышц», «заряжает энергией». Блогеры рекомендуют одно, подруга пьёт другое, а врач говорит третье. <span className="text-emerald-400/85 font-bold underline decoration-emerald-500/30 underline-offset-4">Как разобраться</span>, что из этого реально нужно?
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Я хочу дать тебе честную карту. Без рекламы, без завышенных обещаний. Только наука, здравый смысл и конкретные продукты, которые я могу рекомендовать. И сразу главное - <span className="text-white/90 font-bold">добавки не заменят тренировки и питание</span>. Они лишь дополняют то, что ты уже делаешь.
          </p>
        </div>

        {/* Секция 1: Добавки - не волшебные таблетки */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Добавки - это не волшебные таблетки
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            БАД расшифровывается как <span className="text-emerald-400/85 font-bold">биологически активная добавка</span>. Не лекарство, не замена еде, не волшебная пилюля. Это концентрированные нутриенты, которые ты <span className="text-white/85 font-bold">не добираешь из обычного питания</span>. Не более.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Если ты спишь по 5 часов, ешь фастфуд и не тренируешься - никакие добавки не помогут. Вот как устроена <span className="text-emerald-400/85 font-bold underline decoration-emerald-500/20 underline-offset-4">пирамида приоритетов</span>:
          </p>

          <PriorityPyramid />

          <p className="text-sm text-white/35 mt-3 italic text-center">
            Чем шире уровень - тем больше его вклад в результат
          </p>
        </section>

        {/* Секция 2: Научный рейтинг */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Научный рейтинг: что реально работает
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Не все добавки одинаково полезны. Одни подтверждены десятками мета-анализов, другие - только маркетинговыми бюджетами. Вот <span className="text-white/85 font-bold">честная классификация</span> по уровню научной доказательности.
          </p>

          <EvidenceTierList />

          <p className="text-sm text-white/35 mt-4 italic text-center">
            Важно: «маркетинг» не значит «вредно». Это значит, что деньги лучше потратить на другое — например, на качественный протеин или хорошую еду.
          </p>
        </section>

        {/* Секция 3: Фундамент */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
            Фундамент: здоровье и восстановление
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Эти добавки закрывают <span className="text-cyan-400/85 font-bold">базовые дефициты</span>, которые есть у большинства людей в нашем климате и ритме жизни. Начни с них, остальное - по желанию.
          </p>

          <SupplementSlider cards={fundamentals} category="fundamentals" />
        </section>

        {/* Секция 4: Красота и молодость */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
            Красота и молодость
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Эти добавки работают изнутри: кожа, волосы, суставы. Эффект <span className="text-white/85 font-bold">не мгновенный</span> - заметишь через 2-3 месяца регулярного приёма. Но результат накопительный и стойкий.
          </p>

          <SupplementSlider cards={beauty} category="beauty" />
        </section>

        {/* Секция 5: Спортивное питание */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
            Спортивное питание
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-3">
            Спортпит - это <span className="text-white/90 font-bold">не химия</span>. Протеин - это молоко без воды. Креатин - вещество, которое и так есть в твоих мышцах. Главное - выбирать проверенных производителей и не верить в магию.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            По спортпиту я рекомендую <span className="text-emerald-400/85 font-bold">Optimum Nutrition</span> как золотой стандарт и <span className="text-emerald-400/85 font-bold">Primecraft</span> как достойную российскую альтернативу.
          </p>

          <SupplementSlider cards={sportSupps} category="sport" />
        </section>

        {/* Секция 6: Биохакинг через продукты */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
            Биохакинг через продукты
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-10">
            Биохакинг — это не только таблетки. Это <span className="text-emerald-400/85 font-bold">функциональное питание</span>. Некоторые привычные продукты содержат такие концентрации активных веществ, что работают на уровне мощных нутрицевтиков.
          </p>

          <div className="space-y-8">
            {/* Группа 1: Мозг и когнитивные функции */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-oswald font-black uppercase tracking-[0.2em] text-amber-500/90 flex items-center gap-3">
                  <Brain className="size-6" /> Мозг и фокус
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
              </div>
              
              <div className="flex flex-col border-t border-white/5">
                {biohackingProducts.filter(p => p.category === 'brain').map((item, i) => (
                  <BiohackingProductItem key={i} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* Группа 2: Здоровье и долголетие */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-oswald font-black uppercase tracking-[0.2em] text-emerald-500/90 flex items-center gap-3">
                  <Heart className="size-6" /> Здоровье и долголетие
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
              </div>
              
              <div className="flex flex-col border-t border-white/5">
                {biohackingProducts.filter(p => p.category === 'health').map((item, i) => (
                  <BiohackingProductItem key={i} item={item} index={i} />
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-white/35 mt-16 italic text-center">
            «Твоя пища должна быть твоим лекарством, а твоё лекарство — твоей пищей» — Гиппократ был первым биохакером в истории.
          </p>
        </section>

        {/* Блок платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-6 md:p-10">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/[0.03] blur-[80px] rounded-full" />

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
                Отслеживай эффект от добавок{" "}
                <span className="text-emerald-400/80">в трекере</span>
              </h3>

              <p className="text-sm text-white/40 leading-relaxed mb-6">
                Начала пить магний и хочешь понять, улучшился ли сон? Добавила креатин и хочешь видеть рост силы? Виджеты трекера здоровья MargoFitness помогают отслеживать изменения и видеть, что реально работает для тебя.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <Moon className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Трекер сна</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Начала пить магний - видишь, как меняется качество сна по графику
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <Zap className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Энергия и настроение</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Ежедневная фиксация уровня энергии показывает тренды за недели и месяцы
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <TrendingUp className="size-5 text-white/20 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Аналитика</p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Сравнивай периоды «до» и «после» начала приёма добавок
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Добавки - вишенка.{" "}
            <span className="text-white/90">Торт - <span className="text-emerald-400">это ты</span></span>
          </h2>
          <p className="text-white/20 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Никакая банка не заменит тренировки, сон и нормальную еду. Но когда фундамент есть - правильные добавки дают тот самый последний процент.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}
