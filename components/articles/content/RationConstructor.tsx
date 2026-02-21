"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Scale,
  Utensils,
  Target,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Camera,
  BarChart3,
  TrendingUp,
  Flame,
  Scan,
  Eye,
  EyeOff,
  Zap,
  Heart,
  Brain,
  Sparkles,
  Search,
  Database,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

// --- MacroImpactBars ---

function MacroImpactBars() {
  const metrics = [
    {
      label: "Состав тела",
      icon: Target,
      caloriesOnly: 45,
      withMacros: 82,
      unit: "% эффективности",
    },
    {
      label: "Энергия в течение дня",
      icon: Zap,
      caloriesOnly: 35,
      withMacros: 78,
      unit: "% стабильности",
    },
    {
      label: "Настроение и сон",
      icon: Heart,
      caloriesOnly: 40,
      withMacros: 72,
      unit: "% качества",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-7">
      <div className="flex items-center gap-6 mb-5 text-[10px] font-bold uppercase tracking-widest text-white/30">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-white/20" />
          <span>Только калории</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-amber-400" />
          <span>Калории + БЖУ</span>
        </div>
      </div>

      <div className="space-y-5">
        {metrics.map((m, i) => (
          <div key={i}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <m.icon className="size-4 text-white/30" />
              <span className="text-sm font-medium text-white/60">{m.label}</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.caloriesOnly}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full bg-white/15 rounded-full"
                />
              </div>
              <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.withMacros}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MacroRatioPresets ---

function MacroRatioPresets() {
  const presets = [
    {
      goal: "Похудение",
      desc: "Дефицит 15-20%, акцент на белок для сохранения мышц",
      protein: 40,
      fat: 30,
      carb: 30,
      gramsP: 120,
      gramsF: 53,
      gramsC: 113,
      kcal: "~1 400",
      accent: "rose",
    },
    {
      goal: "Поддержание",
      desc: "Баланс макросов для стабильного веса и энергии",
      protein: 30,
      fat: 30,
      carb: 40,
      gramsP: 105,
      gramsF: 58,
      gramsC: 175,
      kcal: "~1 750",
      accent: "amber",
    },
    {
      goal: "Рекомпозиция",
      desc: "Лёгкий дефицит + высокий белок для замены жира мышцами",
      protein: 40,
      fat: 25,
      carb: 35,
      gramsP: 128,
      gramsF: 44,
      gramsC: 140,
      kcal: "~1 500",
      accent: "sky",
    },
  ];

  const colorMap: Record<string, { bar: string; text: string; border: string; bg: string }> = {
    rose: { bar: "bg-rose-400", text: "text-rose-400", border: "border-rose-500/15", bg: "bg-rose-500/[0.04]" },
    amber: { bar: "bg-amber-400", text: "text-amber-400", border: "border-amber-500/15", bg: "bg-amber-500/[0.04]" },
    sky: { bar: "bg-sky-400", text: "text-sky-400", border: "border-sky-500/15", bg: "bg-sky-500/[0.04]" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {presets.map((p, i) => {
        const c = colorMap[p.accent];
        return (
          <div key={i} className={cn("rounded-2xl border p-5", c.border, c.bg)}>
            <h4 className={cn("text-base font-bold mb-1", c.text)}>{p.goal}</h4>
            <p className="text-xs text-white/40 leading-relaxed mb-4">{p.desc}</p>

            <div className="h-3 rounded-full overflow-hidden flex mb-3">
              <div className="bg-rose-400 h-full" style={{ width: `${p.protein}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${p.fat}%` }} />
              <div className="bg-sky-400 h-full" style={{ width: `${p.carb}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/70">Б</span>
                <p className="text-sm font-bold text-white/80">{p.protein}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">Ж</span>
                <p className="text-sm font-bold text-white/80">{p.fat}%</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400/70">У</span>
                <p className="text-sm font-bold text-white/80">{p.carb}%</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">Пример для 60 кг</p>
              <p className="text-xs text-white/50">
                {p.gramsP}г Б / {p.gramsF}г Ж / {p.gramsC}г У
              </p>
              <p className="text-xs text-white/30 mt-0.5">{p.kcal} ккал</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- PortionReality ---

function PortionReality() {
  const items = [
    {
      product: "Арахисовая паста",
      eyeAmount: '«1 ст. л.» на глаз',
      realAmount: "30г вместо 15г",
      eyeKcal: 188,
      realKcal: 94,
      diff: "+94",
    },
    {
      product: "Оливковое масло",
      eyeAmount: '«Чуть-чуть» на сковороду',
      realAmount: "30мл вместо 10мл",
      eyeKcal: 270,
      realKcal: 90,
      diff: "+180",
    },
    {
      product: "Овсянка (сухая)",
      eyeAmount: '«Горсть» в тарелку',
      realAmount: "80г вместо 40г",
      eyeKcal: 282,
      realKcal: 141,
      diff: "+141",
    },
    {
      product: "Сыр",
      eyeAmount: '«Пару кусочков»',
      realAmount: "60г вместо 30г",
      eyeKcal: 210,
      realKcal: 105,
      diff: "+105",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:bg-white/[0.04] transition-colors">
          <p className="text-sm font-bold text-white/80 mb-2">{item.product}</p>

          <div className="flex items-center gap-3 mb-1.5">
            <EyeOff className="size-3.5 text-white/25 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-white/40">{item.eyeAmount}</p>
              <p className="text-xs text-white/50 tabular-nums">{item.eyeKcal} ккал</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Eye className="size-3.5 text-amber-400/60 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-amber-400/70">{item.realAmount}</p>
              <p className="text-xs text-white/50 tabular-nums">{item.realKcal} ккал</p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs font-bold text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {item.diff} ккал
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- ToolCards ---

function ToolCards() {
  const tools = [
    {
      name: "FatSecret",
      tagline: "Точность и контроль",
      color: "emerald" as const,
      features: [
        { icon: Database, text: "Огромная база продуктов" },
        { icon: Scan, text: "Сканер штрих-кодов" },
        { icon: BarChart3, text: "Детальная статистика БЖУ" },
      ],
      pros: "Бесплатный, точные данные, большое сообщество",
      cons: "Ручной ввод, устаревший интерфейс",
      best: "Когда важна максимальная точность",
    },
    {
      name: "CalAI",
      tagline: "Скорость и удобство",
      color: "violet" as const,
      features: [
        { icon: Camera, text: "Распознавание по фото" },
        { icon: Sparkles, text: "AI-определение порций" },
        { icon: Smartphone, text: "Современный интерфейс" },
      ],
      pros: "Быстрый ввод, AI-точность порций, минимум действий",
      cons: "Платная подписка, меньше база",
      best: "Когда лень вводить вручную",
    },
  ];

  const accent = {
    emerald: {
      border: "border-emerald-500/15",
      bg: "bg-emerald-500/[0.04]",
      text: "text-emerald-400",
      icon: "text-emerald-400/60 bg-emerald-500/10 border-emerald-500/15",
    },
    violet: {
      border: "border-violet-500/15",
      bg: "bg-violet-500/[0.04]",
      text: "text-violet-400",
      icon: "text-violet-400/60 bg-violet-500/10 border-violet-500/15",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tools.map((tool, i) => {
        const a = accent[tool.color];
        return (
          <div key={i} className={cn("rounded-2xl border p-5", a.border, a.bg)}>
            <div className="flex items-center gap-3 mb-1">
              <h4 className={cn("text-lg font-bold", a.text)}>{tool.name}</h4>
            </div>
            <p className="text-xs text-white/35 mb-4">{tool.tagline}</p>

            <div className="space-y-2.5 mb-4">
              {tool.features.map((f, j) => (
                <div key={j} className="flex items-center gap-2.5">
                  <div className={cn("size-7 rounded-lg flex items-center justify-center border shrink-0", a.icon)}>
                    <f.icon className="size-3.5" />
                  </div>
                  <span className="text-sm text-white/60">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3 space-y-1.5">
              <p className="text-xs text-white/40">
                <span className="text-emerald-400/70 font-medium">+</span> {tool.pros}
              </p>
              <p className="text-xs text-white/40">
                <span className="text-rose-400/70 font-medium">−</span> {tool.cons}
              </p>
              <p className="text-xs text-white/50 italic mt-2">{tool.best}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- MistakeImpact ---

function MistakeImpact() {
  const mistakes = [
    {
      mistake: "Не считать масло при готовке",
      impact: 180,
      severity: "high",
      tip: "1 ст. л. масла = 120-180 ккал",
    },
    {
      mistake: "Забыть про соусы и заправки",
      impact: 120,
      severity: "medium",
      tip: "Кетчуп, майонез, соевый - всё считается",
    },
    {
      mistake: "Оценивать порцию «на глаз»",
      impact: 250,
      severity: "high",
      tip: "Глазомер ошибается на 30-50%",
    },
    {
      mistake: "Не считать «перекусы»",
      impact: 300,
      severity: "critical",
      tip: "3 печеньки + латте = полноценный приём пищи",
    },
    {
      mistake: "Считать только основные приёмы",
      impact: 200,
      severity: "medium",
      tip: "Орешки, фрукты, напитки - часть рациона",
    },
  ];

  const severityColors = {
    medium: "from-amber-500 to-amber-400",
    high: "from-orange-500 to-orange-400",
    critical: "from-rose-500 to-rose-400",
  };

  const maxImpact = 350;

  return (
    <div className="space-y-3">
      {mistakes.map((m, i) => (
        <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm font-medium text-white/70">{m.mistake}</p>
            <span className="text-sm font-bold text-rose-400 tabular-nums shrink-0 whitespace-nowrap">
              +{m.impact} ккал
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(m.impact / maxImpact) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className={cn("h-full rounded-full bg-gradient-to-r", severityColors[m.severity as keyof typeof severityColors])}
            />
          </div>
          <p className="text-xs text-white/35">{m.tip}</p>
        </div>
      ))}
    </div>
  );
}

// --- Main Article ---

export default function RationConstructor({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "ration-constructor",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

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
                <Clock className="h-3.5 w-3.5" /> 8 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Конструктор рациона:{" "}
              <span className="text-amber-400">как считать КБЖУ и не сойти с ума</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-amber-500/30 pl-8 italic">
              Практический гайд по подсчёту макронутриентов - без фанатизма, с инструментами и лайфхаками, которые реально работают.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080&auto=format&fit=crop"
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

        {/* Вступление */}
        <div className="space-y-6 mb-14 text-left">
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            «Считай КБЖУ» - самый популярный совет в фитнесе. И самый бесполезный, если за ним не стоит понимание <span className="text-white/90 font-bold">как</span> это делать в реальной жизни. Не в лаборатории, не в Instagram-сторис нутрициолога, а на твоей кухне, с твоим расписанием и твоей любовью к шоколаду.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Я хочу показать тебе систему, которая работает <span className="text-amber-400/85 font-bold underline decoration-amber-500/30 underline-offset-4">без одержимости</span>. Без взвешивания каждой виноградины и без чувства вины от незаписанного перекуса. Потому что подсчёт КБЖУ - это инструмент, а не приговор.
          </p>
        </div>

        {/* Секция 1: Зачем считать макросы */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Зачем считать макросы, а не только калории
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Можно худеть на 1 500 ккал из пончиков. Технически - да, дефицит есть, вес уйдёт. Но вместе с весом уйдут <span className="text-white/90 font-bold">мышцы</span>, <span className="text-white/90 font-bold">энергия</span> и <span className="text-white/90 font-bold">желание жить</span>. Потому что калории - это количество топлива, а макросы - его <span className="text-amber-400/85 font-bold underline decoration-amber-500/30 underline-offset-4">качество</span>.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Рандомизированное исследование Journal of the International Society of Sports Nutrition (2021) показало: при одинаковом дефиците калорий группа с <span className="text-amber-400/85 font-bold">гибким распределением макросов</span> набрала +1.7 кг сухой мышечной массы после диеты, тогда как группа с жёстким подходом <span className="text-white/85 font-bold">потеряла</span> 0.7 кг. Одинаковые калории - <span className="text-amber-400/85 font-bold underline decoration-amber-500/20 underline-offset-4">противоположные результаты</span>.
          </p>

          <MacroImpactBars />

          <p className="text-sm text-white/35 mt-3 italic">
            Визуализация на основе мета-анализа исследований по гибкому подходу к питанию (JISSN, 2021)
          </p>
        </section>

        {/* Секция 2: Твоя формула */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Твоя формула: как рассчитать норму Б/Ж/У
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Сначала тебе нужно знать свою <span className="text-amber-400/85 font-bold">норму калорий</span>. Если ты ещё не считала - в нашей статье «Основы питания» есть удобный калькулятор, который рассчитает всё за тебя за 30 секунд.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Дальше всё зависит от цели. Универсальных пропорций не существует, но есть проверенные ориентиры для каждого сценария. Вот три базовых распределения - выбери то, которое подходит тебе <span className="text-white/85 font-bold underline decoration-white/10 underline-offset-4">прямо сейчас</span>.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Белок - <span className="text-rose-400/80 font-bold">1.6-2.2 г на кг веса</span> (главный макрос для тела). Жиры - <span className="text-amber-400/80 font-bold">не ниже 0.8 г на кг</span> (гормоны, кожа, усвоение витаминов). Остальное - углеводы, твоё <span className="text-sky-400/80 font-bold">топливо</span> для тренировок и мозга.
          </p>

          <MacroRatioPresets />
        </section>

        {/* Секция 3: Практика */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Практика: как считать и не умереть
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Теория готова, но как это работает в реальной жизни? Три навыка, которые нужно освоить - и дальше всё пойдёт на автопилоте.
          </p>

          <div className="space-y-6 mb-8">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="size-4.5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/90 mb-2">Кухонные весы - первые 2-3 недели</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Да, первое время придётся взвешивать. Это не навсегда - через 2-3 недели твой глазомер <span className="text-amber-400/85 font-medium">откалибруется</span>. Ты начнёшь на автомате понимать, сколько весит порция риса или куриная грудка. Но на старте весы - обязательны, потому что глазомер врёт.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="size-4.5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/90 mb-2">Читай этикетки правильно</h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-2">
                    Смотри на <span className="text-white/80 font-medium">«на 100 г»</span>, а не на порцию - производители любят занижать размер порции. Интересный факт: FDA (американский регулятор) допускает <span className="text-amber-400/85 font-medium">отклонение до 20%</span> от заявленной калорийности на этикетке. Исследование в PubMed подтвердило, что реальная калорийность снеков может отличаться от указанной значительно.
                  </p>
                  <p className="text-xs text-white/35 italic">Это не повод параноить, а повод не гнаться за идеальной точностью</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Utensils className="size-4.5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/90 mb-2">Метод «готовка блока»</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Приготовь блюдо целиком, взвесь <span className="text-white/80 font-medium">общий вес</span>, посчитай общее КБЖУ всех ингредиентов и раздели на порции. Теперь ты знаешь точное КБЖУ каждой порции. Это работает для супов, каш, запеканок - всего, где ингредиенты смешиваются.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            А вот насколько сильно <span className="text-amber-400/85 font-bold">глазомер отличается от реальности</span>. Эти цифры - не для запугивания, а чтобы ты понимала, зачем первые недели стоит взвешивать.
          </p>

          <PortionReality />
        </section>

        {/* Секция 4: Инструменты */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Инструменты: FatSecret, CalAI и как выбрать
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Вести подсчёт на бумажке - путь к провалу. Тебе нужно приложение, которое возьмёт рутину на себя. Два лучших варианта, каждый для своего сценария.
          </p>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            <span className="text-emerald-400/85 font-bold">FatSecret</span> - для тех, кто хочет контролировать каждый грамм и не платить за это. <span className="text-violet-400/85 font-bold">CalAI</span> - для тех, кому важна скорость: сфотографировала тарелку, AI всё определил за тебя. Можно комбинировать: CalAI для обедов на ходу, FatSecret для домашней готовки.
          </p>

          <ToolCards />

          <div className="mt-6 rounded-xl bg-amber-500/[0.04] border border-amber-500/12 p-4">
            <p className="text-sm text-white/50 leading-relaxed">
              <span className="text-amber-400/70 font-bold text-xs uppercase tracking-wider">Кстати</span>
              <br />
              В MargoFitness ты можешь трекать <span className="text-white/70 font-medium">калории</span> и <span className="text-white/70 font-medium">качество питания</span> прямо в виджетах трекера здоровья - для общей картины этого достаточно. Для детального подсчёта БЖУ используй FatSecret или CalAI - они для этого и созданы.
            </p>
          </div>
        </section>

        {/* Секция 5: Ловушки и 80/20 */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Ловушки подсчёта и правило 80/20
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-4">
            Самые коварные калории - те, которые ты <span className="text-amber-400/85 font-bold underline decoration-amber-500/20 underline-offset-4">не замечаешь</span>. Вот пять ловушек, которые могут стоить тебе 500-1000 «невидимых» килокалорий в день.
          </p>

          <MistakeImpact />

          <div className="mt-8 space-y-4">
            <p className="text-lg text-white/70 leading-relaxed">
              Теперь главное. Ты прочитала про весы, этикетки, ошибки - и, возможно, думаешь: «Это же сумасшедший дом». Нет. Потому что есть <span className="text-amber-400/85 font-bold">правило 80/20</span>.
            </p>

            <div className="rounded-2xl bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-transparent border border-amber-500/10 p-6 md:p-8">
              <h3 className="text-xl font-oswald font-bold uppercase tracking-tight text-white mb-3">
                80% точности = 100% результата
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Если ты считаешь КБЖУ в 80% приёмов пищи с примерной (не идеальной) точностью - ты <span className="text-white/80 font-medium">уже получаешь результат</span>. Перфекционизм в подсчёте приводит к выгоранию, а выгорание - к полному отказу от контроля. Гибкий подход эффективнее жёсткого.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400 mb-1">3-4</p>
                  <p className="text-xs text-white/40">недели активного подсчёта</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400 mb-1">80%</p>
                  <p className="text-xs text-white/40">точности достаточно</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400 mb-1">∞</p>
                  <p className="text-xs text-white/40">пищевая грамотность навсегда</p>
                </div>
              </div>
            </div>

            <p className="text-lg text-white/70 leading-relaxed">
              После 3-4 недель осознанного подсчёта формируется <span className="text-white/85 font-bold">пищевая интуиция</span>. Ты начинаешь понимать, сколько белка в порции курицы, не доставая весы. Сколько углеводов в тарелке пасты, не открывая приложение. Это навык, который <span className="text-amber-400/85 font-bold underline decoration-amber-500/20 underline-offset-4">остаётся с тобой навсегда</span>.
            </p>
          </div>
        </section>

        {/* Блок платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-transparent border border-amber-500/10 p-6 md:p-10">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/5 blur-[80px] rounded-full" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                  <Activity className="size-4.5 text-amber-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/70">
                  MargoFitness
                </p>
              </div>

              <h3 className="text-xl md:text-2xl font-oswald font-bold uppercase tracking-tight text-white mb-3">
                Контроль питания - часть{" "}
                <span className="text-amber-400">общей системы</span>
              </h3>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                Подсчёт КБЖУ - один кусочек пазла. В MargoFitness питание встроено в единую экосистему с тренировками и трекером здоровья, чтобы ты видела полную картину.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <Flame className="size-5 text-amber-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Виджет калорий</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Ежедневный трекинг калорийности с настраиваемой целью
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <TrendingUp className="size-5 text-amber-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Качество питания</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Оценка рациона по шкале - без фанатизма, но с осознанностью
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-4">
                  <BarChart3 className="size-5 text-amber-400/60 mb-2" />
                  <p className="text-sm font-medium text-white/70 mb-1">Аналитика и тренды</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Графики за неделю, месяц и год - видишь, как питание влияет на результат
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Считай умно,{" "}
            <span className="text-amber-400">не фанатично</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            3-4 недели осознанного подсчёта дадут тебе навык, который останется на всю жизнь. Начни сегодня - и скоро ты будешь понимать свой рацион без приложений.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-amber-500/15 mb-2">
            Начать тренировку <ArrowRight className="size-4" />
          </button>
        </section>

        <div ref={elementRef} className="h-4 w-full" />
      </article>
    </motion.div>
  );
}
