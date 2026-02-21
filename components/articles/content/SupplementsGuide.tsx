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
  accentColor = "cyan",
  category = "default",
}: {
  cards: SupplementData[];
  accentColor?: string;
  category?: "fundamentals" | "beauty" | "sport" | "default";
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
    default: "bg-cyan-500",
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
  default: "from-white/[0.04] to-white/[0.01]",
};

const categoryColors: Record<string, { subtitle: string; brands: string }> = {
  fundamentals: { subtitle: "text-cyan-400/70", brands: "text-cyan-400/70" },
  beauty: { subtitle: "text-pink-400/70", brands: "text-pink-400/70" },
  sport: { subtitle: "text-blue-400/70", brands: "text-blue-400/70" },
  default: { subtitle: "text-cyan-400/70", brands: "text-cyan-400/70" },
};

function SupplementCard({ 
  data, 
  category = "default" 
}: { 
  data: SupplementData;
  category?: "fundamentals" | "beauty" | "sport" | "default";
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
    { label: "Добавки", width: "30%", opacity: "bg-cyan-500/15 border-cyan-500/20 text-cyan-400/70", desc: "Вишенка на торте" },
    { label: "Тренировки", width: "50%", opacity: "bg-cyan-500/20 border-cyan-500/25 text-cyan-400/80", desc: "Стимул для роста" },
    { label: "Питание", width: "70%", opacity: "bg-cyan-500/25 border-cyan-500/30 text-cyan-400/90", desc: "Строительный материал" },
    { label: "Сон и восстановление", width: "90%", opacity: "bg-cyan-500/30 border-cyan-500/35 text-cyan-300", desc: "Фундамент всего" },
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
      color: "amber",
      icon: AlertTriangle,
      items: [
        { name: "Железо", note: "только при подтверждённом дефиците (анализ!)" },
        { name: "Коллаген", note: "кожа и суставы, но исследования неоднозначны" },
        { name: "Цинк", note: "иммунитет, кожа - при нехватке в рационе" },
        { name: "B-витамины", note: "энергия, нервы - при стрессе и дефиците" },
      ],
    },
    {
      label: "Маркетинг больше науки",
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
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-16 pt-6 md:pt-24 text-left">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-cyan-400 text-black border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Биохакинг
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 12 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Гид по добавкам:{" "}
              <span className="text-cyan-400">
                что реально работает и стоит ли тратить деньги
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-cyan-500/30 pl-8 italic">
              Научный разбор БАДов и спортпита - без маркетинга. Конкретные добавки, дозировки и бренды, которым можно доверять.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2070&auto=format&fit=crop"
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
            </div>
          </div>
        </div>

        {/* Вступление */}
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Ты только начинаешь тренироваться, заходишь в аптеку или на маркетплейс - и видишь <span className="text-white/90 font-bold">сотни банок</span> с обещаниями: «сжигает жир», «ускоряет рост мышц», «заряжает энергией». Блогеры рекомендуют одно, подруга пьёт другое, а врач говорит третье. <span className="text-cyan-400/85 font-bold underline decoration-cyan-500/30 underline-offset-4">Как разобраться</span>, что из этого реально нужно?
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
            БАД расшифровывается как <span className="text-cyan-400/85 font-bold">биологически активная добавка</span>. Не лекарство, не замена еде, не волшебная пилюля. Это концентрированные нутриенты, которые ты <span className="text-white/85 font-bold">не добираешь из обычного питания</span>. Не более.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Если ты спишь по 5 часов, ешь фастфуд и не тренируешься - никакие добавки не помогут. Вот как устроена <span className="text-cyan-400/85 font-bold underline decoration-cyan-500/20 underline-offset-4">пирамида приоритетов</span>:
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

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Важно: «маркетинг больше науки» не значит «вредно». Это значит, что <span className="text-cyan-400/85 font-bold underline decoration-cyan-500/20 underline-offset-4">деньги лучше потратить на другое</span> - например, на качественный протеин или хорошую еду.
          </p>

          <EvidenceTierList />
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
            По спортпиту я рекомендую <span className="text-cyan-400/85 font-bold">Optimum Nutrition</span> как золотой стандарт и <span className="text-cyan-400/85 font-bold">Primecraft</span> как достойную российскую альтернативу.
          </p>

          <SupplementSlider cards={sportSupps} category="sport" />
        </section>

        {/* Блок платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-transparent border border-cyan-500/10 p-6 md:p-10">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/5 blur-[80px] rounded-full" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center">
                  <Activity className="size-4.5 text-cyan-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                  MargoFitness
                </p>
              </div>

              <h3 className="text-xl md:text-2xl font-oswald font-bold uppercase tracking-tight text-white mb-3">
                Отслеживай эффект от добавок{" "}
                <span className="text-cyan-400">в трекере</span>
              </h3>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                Начала пить магний и хочешь понять, улучшился ли сон? Добавила креатин и хочешь видеть рост силы? Виджеты трекера здоровья MargoFitness помогают отслеживать изменения и видеть, что реально работает для тебя.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <Moon className="size-5 text-cyan-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Трекер сна</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Начала пить магний - видишь, как меняется качество сна по графику
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <Zap className="size-5 text-cyan-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Энергия и настроение</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Ежедневная фиксация уровня энергии показывает тренды за недели и месяцы
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <TrendingUp className="size-5 text-cyan-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Аналитика</p>
                  <p className="text-xs text-white/40 leading-relaxed">
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
            <span className="text-cyan-400">Торт - это ты</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Никакая банка не заменит тренировки, сон и нормальную еду. Но когда фундамент есть - правильные добавки дают тот самый последний процент.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-cyan-500/15 mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}
