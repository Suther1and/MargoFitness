"use client";

import React from "react";
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
              Без подсчёта каждой калории и сложных формул. Простые принципы,
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
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Давай я скажу тебе кое-что, что тебе, возможно, не говорили: ни одна
            тренировка в мире не «сожжёт» плохое питание. Ты можешь пахать в
            зале или дома по часу каждый день — но если твоё тело получает больше
            энергии, чем тратит, оно будет запасать. Это не мнение, это физика.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Но у этой медали есть и обратная сторона: просто меньше есть — тоже
            не решение. И сейчас я объясню почему, а заодно дам три
            фундаментальных правила, которые реально работают. Без трекеров, без
            взвешивания еды, без ощущения, что ты на диете.
          </p>
        </div>

        {/* ПРАВИЛО 1 — Дефицит калорий */}
        <RuleSection number={1} title="Дефицит калорий — единственная причина похудения" accentColor="amber">
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Представь своё тело как банковский счёт. Еда — это доход. Всё, что
            ты делаешь в течение дня — от дыхания до тренировки — это расходы.
            Если доход больше расходов, остаток откладывается в «сбережения».
            Только вместо денег — жир.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            <strong className="text-white/80">Дефицит калорий</strong> — это
            когда ты тратишь чуть больше энергии, чем получаешь с едой. Не
            голодание. Не «мало ем». А мягкая, устойчивая разница, при которой
            тело начинает использовать свои запасы.
          </p>

          {/* Интерактивный калькулятор калорий */}
          <CalorieCalculator />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            И вот что важно: для этого не нужно считать каждую калорию.
            Достаточно понимать принцип и менять привычки постепенно. Убрала
            сладкий кофе утром — минус 200 ккал. Заменила белый хлеб на цельнозерновой — ещё минус
            80. Уже дефицит. Без страданий.
          </p>
        </RuleSection>

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
              шоколадка — 550. Тренировками невозможно компенсировать
              систематическое переедание.
            </p>
          </div>
        </div>

        {/* ПРАВИЛО 2 — Почему тренировки не для похудения */}
        <RuleSection number={2} title="Тренировки не для похудения. Но без них нельзя" accentColor="amber">
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Звучит как противоречие? Сейчас объясню. Тренировки сжигают
            сравнительно мало калорий — гораздо меньше, чем кажется. Основной
            расход энергии идёт на поддержание жизни: работу сердца, мозга,
            температуру тела. Это называется{" "}
            <strong className="text-white/80">базовый метаболизм</strong>, и на
            него уходит 60–70% всей энергии за день.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Но вот что тренировки делают по-настоящему:
          </p>

          <div className="space-y-3 mb-8">
            {[
              {
                title: "Сохраняют мышцы",
                text: "При дефиците калорий тело готово «съесть» мышцы, а не жир. Силовые тренировки дают сигнал: мышцы нужны, не трогай их. Тело начинает расходовать именно жировые запасы.",
              },
              {
                title: "Разгоняют метаболизм",
                text: "Мышечная ткань потребляет энергию даже в покое. Чем больше мышц — тем больше калорий ты сжигаешь, просто сидя на диване. Тренировки увеличивают твой «базовый расход».",
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
              выглядишь. Одно без другого — это половина пути.»
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

        {/* ПРАВИЛО 3 — Почему нельзя просто мало есть */}
        <RuleSection number={3} title="Почему «просто меньше есть» — это ловушка" accentColor="amber">
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Вот тут начинается самое интересное. Ты думаешь: «Окей, мне нужен
            дефицит. Значит, буду есть совсем мало — и похудею быстрее». Логично?
            Нет. Это ловушка, в которую попадают миллионы девушек.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Когда ты резко урезаешь калории без тренировок, тело включает
            аварийный режим. И вот что происходит:
          </p>

          {/* Каскад последствий */}
          <div className="relative pl-8 md:pl-10 mb-10 text-left">
            <div className="absolute left-3 md:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/30 via-rose-500/30 to-rose-500/10" />

            {[
              {
                step: "1–2 неделя",
                title: "Тело теряет воду и мышцы",
                text: "Вес падает быстро, и ты радуешься. Но это не жир — это вода и мышечная ткань. Зеркало пока не меняется.",
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
                text: "Вес встаёт, хотя ты ешь мало. Тело адаптировалось. Настроение на нуле, энергии нет. И однажды ты срываешься — потому что организм требует еду.",
                severity: "high" as const,
              },
              {
                step: "После срыва",
                title: "Вес возвращается с запасом",
                text: "Метаболизм ещё замедлен, а ты ешь как раньше. Результат — ты набираешь больше, чем потеряла. Мышц стало меньше, жира — больше. Это называется эффект йо-йо.",
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
                  Диеты на 800–1200 ккал без физической нагрузки — это не
                  похудение, а разрушение. Ты теряешь мышцы, замедляешь
                  метаболизм и создаёшь условия для набора веса в будущем.
                  Правильный подход — мягкий дефицит + тренировки, которые
                  защищают мышцы.
                </p>
              </div>
            </div>
          </div>
        </RuleSection>

        {/* Резюме — собираем всё вместе */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Собираем всё вместе
          </h2>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Три правила. Простые, но фундаментальные. Если ты запомнишь только
            их — ты уже будешь знать больше, чем 90% девушек, которые ищут ответы
            в TikTok.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <SummaryCard
              number="01"
              text="Дефицит калорий — единственный механизм похудения. Не продукты, не время суток, не магические диеты."
            />
            <SummaryCard
              number="02"
              text="Тренировки нужны не для сжигания калорий, а для защиты мышц, метаболизма и формы тела."
            />
            <SummaryCard
              number="03"
              text="Резкое ограничение еды без тренировок ведёт к потере мышц, замедлению метаболизма и эффекту йо-йо."
            />
          </div>

          <p className="text-lg text-white/60 leading-relaxed">
            Не нужно перестраивать жизнь за один день. Начни с одного изменения
            на этой неделе. Замени один перекус. Добавь одну тренировку. Дай телу
            сигнал, что ты меняешь правила игры — мягко, но уверенно.
          </p>
        </section>

        {/* Совет от Марго */}
        <div className="my-10 rounded-[2.5rem] md:rounded-[3.5rem] bg-amber-500/[0.04] border border-amber-500/10 p-6 md:p-8 text-left">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="size-4 text-amber-400/80" />
              </div>
              <p className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-amber-400/70">
                Совет от Марго
              </p>
            </div>
            <p className="text-sm md:text-base text-white/60 leading-relaxed">
              Если ты только в начале пути — не пытайся быть идеальной. Идеально
              — это враг хорошо. Одна тренировка в неделю лучше нуля. Один
              здоровый ужин лучше, чем ещё одна неделя откладывания «на
              понедельник». Твоё тело благодарит за каждый шаг, даже самый
              маленький.
            </p>
          </div>
        </div>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Первый шаг — самый важный
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Теория без практики не стоит ничего. Попробуй свою первую тренировку
            — и почувствуй разницу.
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

function CalorieCalculator() {
  const [height, setHeight] = React.useState<string>("");
  const [weight, setWeight] = React.useState<string>("");
  const [age, setAge] = React.useState<string>("");
  const [activityLevel, setActivityLevel] = React.useState<number>(1.55);

  const activityOptions = [
    { label: "Низкая", value: 1.375, desc: "1-2 тренировки в неделю" },
    { label: "Средняя", value: 1.55, desc: "3-4 тренировки в неделю" },
    { label: "Высокая", value: 1.725, desc: "5+ тренировок в неделю" },
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
    <div className="max-w-[600px] mx-auto rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden mb-8 shadow-xl">
      {/* Header + Inputs — single compact strip */}
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

      {/* Activity selector — compact row */}
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

function SummaryCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="p-5 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] text-left">
      <span className="text-3xl font-oswald font-black text-amber-400/30 leading-none">
        {number}
      </span>
      <p className="text-sm text-white/55 leading-relaxed mt-3">{text}</p>
    </div>
  );
}
