"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Wind,
  Footprints,
  Activity,
  ThermometerSun,
  OctagonAlert,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Lightbulb,
  Quote,
  Home,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

export default function SafetyBasics({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "safety-basics",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

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
                <Clock className="h-3.5 w-3.5" /> 6 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Техника безопасности:{" "}
              <span className="text-sky-400">
                как тренироваться дома без травм
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-sky-400/30 pl-8 italic">
              Твоя гостиная - это не зал с тренером и зеркалами. Здесь ты сама
              отвечаешь за свою безопасность. Простые правила, которые защитят
              тебя от 95% домашних травм.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Safe home workout"
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
            Дома кажется, что травмироваться невозможно. Но статистика говорит обратное:
            большинство бытовых спортивных травм происходят именно дома. И не
            из-за сложных упражнений, а <span className="text-white/90 font-bold">из-за мелочей</span> - холодных мышц, скользкого
            пола, неправильного дыхания.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Я собрала всё, что нужно знать, в одну статью. Это не список запретов, а простой <span className="text-sky-400/85 font-bold underline decoration-sky-500/30 underline-offset-4">набор привычек</span>, которые за пять минут станут частью твоей тренировки и <span className="text-white/90 font-bold">защитят тебя</span>.
          </p>
        </div>

        {/* Блок преимуществ платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-3xl bg-sky-500/[0.03] border border-sky-500/10 p-8 md:p-12">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-3 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                  <ShieldCheck className="size-3.5 text-sky-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Твоя безопасность - наш приоритет</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-oswald font-black uppercase tracking-tight text-white leading-tight">
                  Как MargoFitness <span className="text-sky-400">страхует тебя</span> на каждой тренировке
                </h2>
                
                <p className="text-lg text-white/60 leading-relaxed">
                  Мы понимаем, что дома нет тренера, который поправит твою спину. Поэтому мы встроили систему безопасности прямо в интерфейс платформы.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                        <Activity className="size-4 text-sky-400" />
                      </div>
                      <h4 className="font-bold text-white/90">Разбор техники</h4>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">
                      Каждое упражнение сопровождается детальным текстовым описанием ключевых точек контроля.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                        <Eye className="size-4 text-sky-400" />
                      </div>
                      <h4 className="font-bold text-white/90">Видео-инструкции</h4>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">
                      Наглядные видео с правильной амплитудой и акцентами на дыхании и положении суставов.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-2 relative">
                <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 font-montserrat shadow-2xl shadow-black/50 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-3">
                    <div className="size-1.5 rounded-full bg-sky-500 animate-pulse" />
                  </div>
                  
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400/50 mb-4">Техника выполнения</h5>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-white/80 uppercase tracking-tight">1. Исходное положение</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">Стопы на ширине плеч, носки слегка развернуты. Спина прямая, лопатки приведены.</p>
                    </div>
                    
                    <div className="space-y-1.5 border-l border-sky-500/30 pl-3 bg-sky-500/[0.02] py-1">
                      <p className="text-[11px] font-bold text-sky-400 uppercase tracking-tight">2. Движение</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">На вдохе опускайся вниз, отводя таз назад. Колени не выходят за носки.</p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-white/80 uppercase tracking-tight">3. Точка контроля</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">В нижней точке бедро параллельно полу. Вес тела на пятках.</p>
                    </div>
                  </div>

                  {/* Декоративный блюр */}
                  <div className="absolute -bottom-10 -right-10 size-32 bg-sky-500/5 blur-3xl rounded-full group-hover:bg-sky-500/10 transition-colors" />
                </div>
                
                {/* Внешние декоративные элементы */}
                <div className="absolute -top-4 -right-4 size-24 bg-sky-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-4 -left-4 size-24 bg-blue-500/10 blur-3xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Секция 1 - Пространство */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Home} title="Подготовь пространство" />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Прежде чем начать - оглянись. Тренировка дома требует минимум <span className="text-white/85 font-bold">2x2 метра</span> свободного пространства. Углы столов и лежащие на полу игрушки - это <span className="text-sky-400/85 font-semibold">топ причин</span> ушибов.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DoCard items={[
              "Убери всё лишнее из зоны тренировки",
              "Проверь, что пол сухой и не скользкий",
              "Используй коврик - он даёт сцепление и защищает суставы",
              "Убедись, что потолок позволяет поднять руки вверх",
            ]} />
            <DontCard items={[
              "Тренироваться на кафельном полу без коврика",
              "Заниматься в носках на гладком полу - опасно скользить",
              "Ставить стакан воды на полу рядом с ковриком",
              "Игнорировать мебель «где-то сзади»",
            ]} />
          </div>
        </section>

        {/* Секция 2 - Разминка */}
        <section className="mb-14 text-left">
          <SectionHeader icon={ThermometerSun} title="Разминка - не опция, а защита" />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Холодные мышцы - жёсткие мышцы. Жёсткие мышцы - это мышцы, которые <span className="text-white/90 font-bold">рвутся</span>. Разминка занимает <span className="text-sky-400/85 font-bold underline decoration-sky-500/20 underline-offset-4">5-7 минут</span>, но именно они защищают тебя от травм. Она поднимает температуру тканей, увеличивает приток крови к суставам и «включает» нервную систему. После неё ты двигаешься точнее, сильнее и безопаснее.
          </p>

          {/* Пошаговая разминка */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6">
              Структура разминки перед каждой тренировкой
            </p>

            <div className="space-y-0">
              {[
                {
                  time: "0–2 мин",
                  title: "Общий разогрев",
                  desc: "Ходьба на месте, лёгкие прыжки, подъёмы коленей. Цель - повысить пульс до 100–110 ударов.",
                  color: "sky" as const,
                },
                {
                  time: "2–4 мин",
                  title: "Суставная гимнастика",
                  desc: "Вращения в голеностопах, коленях, тазобедренных, плечевых суставах. Каждый сустав - по 10 вращений в каждую сторону.",
                  color: "sky" as const,
                },
                {
                  time: "4–5 мин",
                  title: "Динамическая растяжка",
                  desc: "Махи ногами, выпады с поворотом корпуса, наклоны. Не статика - а движение с полной амплитудой.",
                  color: "sky" as const,
                },
                {
                  time: "5–7 мин",
                  title: "Активация целевых мышц",
                  desc: "2–3 подхода целевого упражнения без веса или с минимальным весом. Мышцы «вспоминают» паттерн движения.",
                  color: "sky" as const,
                },
              ].map((step, i, arr) => (
                <WarmupStep key={i} {...step} isLast={i === arr.length - 1} />
              ))}
            </div>
          </div>

          {/* Предупреждение о статической растяжке */}
          <p className="text-sm text-white/30 italic leading-relaxed px-2">
            Не путай разминку со статической растяжкой. Садиться в шпагат или
            тянуться к носкам по 30 секунд - это заминка, а не разминка. Перед
            тренировкой нужны динамические движения, которые разогревают, а не
            расслабляют мышцы.
          </p>
        </section>

        {/* Секция 3 - Обувь */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Footprints} title="Обувь: босиком или в кроссовках?" />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Вопрос, который задают чаще всего. Ответ зависит от типа тренировки
            и поверхности. Вот простое правило:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <OptionCard
              title="Босиком / в носках с анти-скольжением"
              subtitle="Когда это работает"
              color="sky"
              items={[
                "Силовые упражнения на коврике",
                "Приседания, выпады, планки",
                "Работа на баланс и координацию",
                "Мягкое покрытие (ковёр, коврик)",
              ]}
              note="Лучшая связь стопы с полом, активация мелких мышц-стабилизаторов, естественная биомеханика."
            />
            <OptionCard
              title="Кроссовки с нескользящей подошвой"
              subtitle="Когда это нужно"
              color="blue"
              items={[
                "Прыжки, берпи, HIIT-упражнения",
                "Кардио-блоки с активной работой стоп",
                "Тренировки на жёстком полу (плитка, ламинат)",
                "Если есть проблемы со стопами или голеностопом",
              ]}
              note="Амортизация при ударных нагрузках, защита суставов, профилактика подошвенного фасциита."
            />
          </div>

          <p className="text-sm text-white/30 italic leading-relaxed">
            В тренировках MargoFitness основной формат - силовые с гантелями на
            коврике. Для них идеально подходит босиком или носки с силиконовыми
            точками. Если в тренировке есть прыжковый блок - обувай кроссовки на
            это время.
          </p>
        </section>

        {/* Секция 4 - Дыхание */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Wind} title="Дыхание: простое правило, которое меняет всё" />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Большинство новичков <span className="text-white/85 font-semibold italic">задерживают дыхание</span>. Это рефлекс, но именно он повышает давление и снижает силу. Правило максимально простое: <span className="text-sky-400/85 font-bold underline decoration-sky-500/20 underline-offset-4">выдох на усилии</span>.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Правило максимально простое:
          </p>

          {/* Визуальное правило дыхания */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 rounded-2xl overflow-hidden border border-white/10 mb-8">
            <div className="p-6 md:p-8 bg-sky-500/[0.05] border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <span className="text-lg font-oswald font-black text-sky-400">↑</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-sky-400/60">
                    Усилие (подъём, жим)
                  </p>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-oswald font-black text-sky-400 uppercase tracking-tight mb-2">
                Выдох
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                Когда ты преодолеваешь нагрузку - выдыхай. Это стабилизирует
                корпус и помогает развить максимальное усилие.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-lg font-oswald font-black text-white/30">↓</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                    Возврат (опускание)
                  </p>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-oswald font-black text-white/60 uppercase tracking-tight mb-2">
                Вдох
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                Когда возвращаешь вес в исходное положение - вдыхай. Тело
                расслабляется и набирает воздух для следующего повторения.
              </p>
            </div>
          </div>

          <div className="text-lg text-white/60 leading-relaxed mb-6">
            <p>
              Приседание: опускаешься вниз - <strong className="text-white/80">вдох</strong>, встаёшь - <strong className="text-white/80">выдох</strong>.
            </p>
            <p>
              Отжимание: опускаешься к полу - <strong className="text-white/80">вдох</strong>, выжимаешь себя вверх - <strong className="text-white/80">выдох</strong>.
            </p>
            <p>
              Планка: не задерживай дыхание, делай ровные <strong className="text-white/80">вдохи</strong> и <strong className="text-white/80">выдохи</strong>.
            </p>
            <p className="pt-4">
              Просто? Да. Но это правило защищает от скачков давления и
              головокружения, а ещё добавляет примерно 10–15% к твоей силе.
            </p>
          </div>
        </section>

        {/* Секция 5 - Красные флаги */}
        <section className="mb-14 text-left">
          <SectionHeader icon={OctagonAlert} title="Красные флаги: когда немедленно остановиться" />

          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Есть разница между «тяжело» и <span className="text-rose-400/90 font-bold">«опасно»</span>. Жжение в мышцах - это норма. А следующие сигналы - это причина <span className="text-white/85 font-bold underline decoration-white/10 underline-offset-4">остановить тренировку</span> сразу:
          </p>

          <div className="space-y-3 mb-8">
            {[
              {
                signal: "Острая боль в суставе",
                why: "Жжение в мышце - норма. Резкая, стреляющая боль в колене, плече, запястье - стоп. Это может быть повреждение связки или хряща.",
              },
              {
                signal: "Головокружение или потемнение в глазах",
                why: "Признак скачка давления или гипогликемии. Сядь, выпей воды, подожди. Если повторяется - обратись к врачу.",
              },
              {
                signal: "Онемение или покалывание",
                why: "Это нервный сигнал. Пережатый нерв или неправильная позиция. Не «разрабатывай» - останови движение и скорректируй технику.",
              },
              {
                signal: "Щелчок с болью",
                why: "Безболезненные щелчки в суставах - часто норма. Но если за щелчком следует боль или ограничение движения - заканчивай упражнение.",
              },
              {
                signal: "Тошнота или предобморочное состояние",
                why: "Возможно, ты перестаралась с интенсивностью, не позавтракала или занимаешься в душном помещении. Останови тренировку, проветри комнату.",
              },
            ].map((item, i) => (
              <RedFlagItem key={i} {...item} />
            ))}
          </div>

          <div className="rounded-2xl bg-sky-500/[0.04] border border-sky-500/12 p-6 md:p-8 text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="size-4 text-sky-400/80" />
                </div>
                <p className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-sky-400/70">
                  Совет от Марго
                </p>
              </div>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Правило «лучше недоделать, чем переделать» - это не слабость, а
                зрелость. Одна пропущенная тренировка из-за предосторожности -
                это ноль потерь. Одна травма из-за упрямства - это минус 2–6
                недель прогресса. Считай сама.
              </p>
            </div>
          </div>
        </section>

        {/* Резюме */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Главное
          </h2>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Безопасность - это не отдельный навык. Это привычка, которая
            встраивается в тренировку за пару недель. Через месяц ты не будешь
            думать о ней сознательно - она станет автоматической, как ремень
            безопасности в машине.
          </p>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
              {[
                { icon: Home, label: "Пространство", desc: "2×2 м, коврик, без препятствий" },
                { icon: ThermometerSun, label: "Разминка", desc: "5–7 мин перед тренировкой" },
                { icon: Footprints, label: "Стопы", desc: "Босиком или в кроссовках" },
                { icon: Wind, label: "Дыхание", desc: "Выдох на усилие, вдох на возврат" },
              ].map((item, i) => (
                <div key={i} className="flex items-center sm:flex-col sm:text-center gap-4 p-3 md:p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="size-10 md:size-11 rounded-xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center shrink-0">
                    <item.icon className="size-5 text-sky-400" />
                  </div>
                  <div className="flex flex-col sm:items-center">
                    <p className="text-sm font-bold text-white/90 mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-white/40 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Теперь ты готова
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Безопасность - это фундамент. А фундамент на месте. Время
            тренироваться.
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

function DoCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/12 p-5 md:p-6 text-left">
      <div className="flex items-center gap-2.5 mb-4">
        <CircleCheck className="size-4.5 text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">
          Делай
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-white/50 leading-relaxed">
            <span className="text-emerald-500/50 mt-1 shrink-0">+</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DontCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl bg-rose-500/[0.03] border border-rose-500/12 p-5 md:p-6 text-left">
      <div className="flex items-center gap-2.5 mb-4">
        <CircleX className="size-4.5 text-rose-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-rose-400/80">
          Не делай
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-white/50 leading-relaxed">
            <span className="text-rose-500/50 mt-1 shrink-0">−</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WarmupStep({
  time,
  title,
  desc,
  color,
  isLast,
}: {
  time: string;
  title: string;
  desc: string;
  color: "sky";
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4 md:gap-5">
      <div className="flex flex-col items-center">
        <div className="size-3 rounded-full bg-sky-400 shadow-[0_0_8px] shadow-sky-400/30 shrink-0 mt-1.5" />
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-sky-500/30 to-sky-500/5 my-1" />
        )}
      </div>
      <div className={cn("pb-6", isLast && "pb-0")}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/50 mb-0.5">
          {time}
        </p>
        <h4 className="text-base font-bold text-white/85 mb-1">{title}</h4>
        <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function OptionCard({
  title,
  subtitle,
  color,
  items,
  note,
}: {
  title: string;
  subtitle: string;
  color: "sky" | "blue";
  items: string[];
  note: string;
}) {
  const borderColor = color === "sky" ? "border-sky-500/15" : "border-blue-500/15";
  const bgColor = color === "sky" ? "bg-sky-500/[0.04]" : "bg-blue-500/[0.04]";
  const textColor = color === "sky" ? "text-sky-400" : "text-blue-400/40";
  const dotColor = color === "sky" ? "text-sky-500/50" : "text-blue-500/50";

  return (
    <div className={cn("rounded-2xl border p-5 md:p-6 text-left flex flex-col h-full", borderColor, bgColor)}>
      <p className={cn("text-[10px] font-black uppercase tracking-[0.15em] mb-2", textColor)}>
        {subtitle}
      </p>
      <h4 className="text-lg font-black font-oswald uppercase tracking-tight text-white/90 mb-5 leading-tight">{title}</h4>
      <ul className="space-y-3 mb-6 flex-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-white/50 leading-relaxed group">
            <div className={cn("size-1.5 rounded-full shrink-0 transition-colors", color === "sky" ? "bg-sky-500/40" : "bg-blue-500/40")} />
            <span className="translate-y-[0.5px]">{item}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/25 leading-relaxed border-t border-white/5 pt-3">
        {note}
      </p>
    </div>
  );
}

function RedFlagItem({ signal, why }: { signal: string; why: string }) {
  return (
    <div className="flex gap-3.5 p-4 md:p-5 rounded-xl border border-rose-500/8 bg-rose-500/[0.02] hover:bg-rose-500/[0.04] transition-colors text-left">
      <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <ShieldAlert className="size-4 text-rose-400" />
      </div>
      <div>
        <h4 className="text-base font-bold text-rose-400/90 mb-1">{signal}</h4>
        <p className="text-sm text-white/40 leading-relaxed">{why}</p>
      </div>
    </div>
  );
}
