"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Dumbbell,
  Activity,
  Zap,
  Scale,
  XCircle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

export default function WomensBodyMyths({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "womens-body-myths",
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
                <Clock className="h-3.5 w-3.5" /> 7 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Мифы о женском теле:{" "}
              <span className="text-sky-400">
                почему ты не «перекачаешься»
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-sky-400/30 pl-8 italic">
              Страх взять в руки гантели тяжелее розовых 2-килограммовых — главный враг упругого тела. Разбираем физиологию, разбиваем стереотипы и объясняем, почему силовые тренировки делают тебя более женственной.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Woman lifting weights"
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
            <span className="font-bold text-white/90">«Я не хочу быть похожей на мужика»</span>, <span className="font-bold text-white/90">«мне бы только чуть-чуть подтянуть, без объёмов»</span>, <span className="font-bold text-white/90">«от приседаний у меня сразу растут огромные ноги»</span>. Это топ-3 страха, которые заставляют женщин часами бегать на эллипсе и избегать силовых тренировок.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Но физиология работает иначе. Женское тело создано не для того, чтобы обрастать горами мышц, а для выносливости и сохранения энергии. Давай посмотрим на факты, а не на глянцевые журналы из 2000-х.
          </p>
        </div>

        {/* Секция 1 — Гормоны */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Activity} title="Главный ограничитель: Тестостерон" />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Мышцы не растут просто от того, что ты подняла гантель. Для их гипертрофии (значительного увеличения в объёме) нужен мужской половой гормон — тестостерон. И вот здесь кроется главный секрет:
          </p>

          <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 md:p-10 mb-8 overflow-hidden relative">
            <div className="absolute -right-20 -top-20 size-64 bg-sky-500/10 blur-3xl rounded-full" />
            
            <h3 className="text-xl font-oswald font-black uppercase text-white mb-6 relative z-10">Сравнение уровня тестостерона</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-sky-400 uppercase tracking-wider">Мужчины</span>
                  <span className="text-2xl font-black font-oswald text-white">300 – 1000 <span className="text-sm text-white/40 font-sans">нг/дл</span></span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Женщины</span>
                  <span className="text-2xl font-black font-oswald text-white">15 – 70 <span className="text-sm text-white/40 font-sans">нг/дл</span></span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "7%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-white/30 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 relative z-10">
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                В женском организме тестостерона в <strong className="text-sky-400">15-20 раз меньше</strong>. Без фармакологической поддержки (допинга) женщина физически не способна нарастить мышечную массу по мужскому типу.
              </p>
            </div>
          </div>
        </section>

        {/* Секция 2 — Миф против Реальности */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Zap} title="Разрушитель мифов: Тонус против Массы" />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            «Я хочу просто привести мышцы в тонус» — фраза, не имеющая медицинского смысла. В физиологии нет процесса «тонизирования». Есть только два состояния: мышца либо растёт (гипертрофия), либо разрушается (атрофия), либо сохраняет текущий объём при снижении жировой прослойки.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MythBusterCard 
              myth="От силовых я стану квадратной и массивной."
              reality="Массивность даёт жир поверх мышц, а не сами мышцы. Силовые уплотняют мышечную ткань и сжигают жир — ты становишься компактнее."
            />
            <MythBusterCard 
              myth="Чтобы похудеть, нужно делать 50 повторений с лёгким весом."
              reality="Многоповторка с лёгким весом тренирует выносливость. Для рельефа и упругости нужны веса, с которыми тебе тяжело на 12-15 повторении."
            />
            <MythBusterCard 
              myth="Если я брошу качаться, мышцы превратятся в жир."
              reality="Мышцы и жир — это разные ткани. Они не могут превращаться друг в друга. Без нагрузки мышцы просто уменьшатся в объёме."
            />
            <MythBusterCard 
              myth="Кардио лучше сжигает жир, чем силовые."
              reality="Кардио сжигает калории только пока ты бежишь. Силовые разгоняют метаболизм: ты будешь тратить больше энергии даже во сне."
            />
          </div>
        </section>

        {/* Цитата */}
        <blockquote className="relative my-14 pl-8 text-left">
          <div className="absolute left-0 top-6 bottom-[-8px] w-0.5 bg-sky-400/40" />
          <Quote className="absolute -left-3 -top-1 size-6 text-sky-400/30 p-0.5" />
          <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
            «Женщины-бодибилдеры из интернета, которых все так боятся, годами сидят на строжайших диетах, тренируются по 3 часа в день и используют гормональную терапию. Случайно "перекачаться", тренируясь дома 3 раза в неделю — это как случайно стать космонавтом, пару раз посмотрев на звёзды.»
          </p>
          <footer className="flex items-center gap-4">
            <div className="relative w-14 h-14 -ml-1 -my-2 shrink-0 rounded-full border-2 border-sky-500/20 overflow-hidden shadow-lg shadow-sky-500/20">
              <img 
                src="/images/avatars/margo.png" 
                alt="Марго" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest text-white/90 leading-none">Марго</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-white/30 mt-1">Основатель MargoFitness</span>
            </div>
          </footer>
        </blockquote>

        {/* Секция 3 — Таймлайн трансформации */}
        <section className="mb-14 text-left">
          <SectionHeader icon={TrendingUp} title="Что на самом деле произойдёт с твоим телом" />

          <p className="text-lg text-white/60 leading-relaxed mb-10">
            Если ты начнёшь регулярно делать силовые тренировки дома (даже с обычными гантелями по 3–5 кг), твоя трансформация будет выглядеть так:
          </p>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-500/50 before:via-sky-500/20 before:to-transparent">
            <TimelineItem 
              month="Месяц 1"
              title="Нейромышечная адаптация"
              desc="Ты станешь сильнее, но визуально мышцы почти не изменятся. Тело просто учится включать в работу больше мышечных волокон. Уйдёт отёчность."
            />
            <TimelineItem 
              month="Месяцы 2-3"
              title="Уплотнение (Тот самый тонус)"
              desc="Мышцы становятся плотнее на ощупь. Появляются красивые очертания плеч, приподнимаются ягодицы. За счёт роста плотности ткани метаболизм ускоряется."
            />
            <TimelineItem 
              month="Месяцы 4-6"
              title="Рекомпозиция"
              desc="Жировая прослойка истончается, а под ней — красивый мышечный корсет. Ты можешь весить столько же, но носить одежду на размер меньше, так как мышцы компактнее жира."
            />
          </div>
        </section>

        {/* Секция 4 — Весы */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Scale} title="Почему после тренировок весы могут показать плюс" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-lg text-white/60 leading-relaxed">
                Самая частая причина паники: «Я начала заниматься с гантелями, и через неделю прибавила 1.5 кг! Я перекачалась!». 
              </p>
              <p className="text-lg text-white/60 leading-relaxed">
                Нет, ты не нарастила 1.5 кг мышц за неделю (вспомни график тестостерона). То, что ты видишь на весах — это вода. Силовые тренировки вызывают микроповреждения мышечных волокон. В ответ на это тело запускает процесс восстановления, который всегда сопровождается локальным воспалением и задержкой жидкости.
              </p>
              <p className="text-lg text-white/60 leading-relaxed">
                Кроме того, мышцы запасают гликоген (энергию) для будущих тренировок, а каждый грамм гликогена связывает 3 грамма воды. Это естественный, здоровый процесс. Через 2-3 недели адаптации водный баланс нормализуется, отёк уйдет, и ты увидишь реальный результат.
              </p>
            </div>
            
            <div className="lg:col-span-2">
               <div className="rounded-2xl bg-sky-500/[0.04] border border-sky-500/12 p-6 md:p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Activity className="size-5 text-sky-400 shrink-0 mt-0.5" />
                  <h4 className="font-bold text-white/90">Как отслеживать прогресс?</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 mt-1 shrink-0">—</span>
                    Спрячь весы на первый месяц
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 mt-1 shrink-0">—</span>
                    Сделай фото «до» в белье
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 mt-1 shrink-0">—</span>
                    Замеряй объемы (талия, бёдра) раз в 2 недели
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 mt-1 shrink-0">—</span>
                    Ориентируйся на то, как сидит одежда
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Совет от Марго */}
        <div className="rounded-2xl bg-sky-500/[0.04] border border-sky-500/12 p-6 md:p-8 text-left mb-14">
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
              Не бойся увеличивать рабочие веса. Если ты легко делаешь 20 приседаний с 5 кг — это уже кардио. Чтобы ягодицы обрели форму, им нужен стимул. Бери 8 кг и делай 12 качественных, тяжелых повторений. Именно это строит упругое тело.
            </p>
          </div>
        </div>

        {/* Стратегия */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Dumbbell} title="Стратегия: Как тренироваться для рельефа" />
          
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Если ты готова отбросить страхи и начать строить упругое тело, вот три правила, которые должны стать основой твоих тренировок. Без них даже самые тяжелые гантели не дадут результата.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StrategyCard 
              step="01"
              title="Базовые упражнения"
              desc="Изолированные упражнения (махи ногами или сгибания рук) тратят мало калорий и слабо стимулируют гормональную систему. Выбирай базу: приседания, выпады, тяги, отжимания. Они включают сразу несколько мышечных групп."
            />
            <StrategyCard 
              step="02"
              title="Прогрессивная нагрузка"
              desc="Тело быстро привыкает к рутине. Если месяц подряд ты делаешь приседания с гантелью 5 кг — мышцы перестанут реагировать. Увеличивай вес, добавляй повторения или замедляй темп выполнения."
            />
            <StrategyCard 
              step="03"
              title="Восстановление"
              desc="Мышцы растут и уплотняются не на тренировке, а во время отдыха и сна. Ежедневные силовые без выходных приведут только к перетренированности и отекам. Давай мышцам минимум 48 часов на восстановление."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Отбрось страхи
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Твоё тело намного сильнее, чем ты думаешь. Бери гантели и давай сделаем его упругим.
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

function MythBusterCard({ myth, reality }: { myth: string; reality: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col h-full">
      <div className="p-5 bg-rose-500/[0.05] border-b border-white/5">
        <div className="flex items-start gap-3">
          <XCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400/70 mb-1">Миф</p>
            <p className="text-sm font-bold text-white/90">{myth}</p>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 bg-sky-500/[0.02]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-400/70 mb-1">Правда</p>
            <p className="text-sm text-white/60 leading-relaxed">{reality}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ month, title, desc }: { month: string; title: string; desc: string }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#09090b] bg-sky-500 shadow-[0_0_0_2px_rgba(14,165,233,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
        <div className="size-2 rounded-full bg-white" />
      </div>
      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-sky-500/30 transition-colors">
        <span className="inline-block px-3 py-1 mb-3 text-[10px] font-black text-sky-400 uppercase tracking-widest rounded-full bg-sky-500/10 border border-sky-500/20">
          {month}
        </span>
        <h4 className="text-lg font-bold text-white/90 mb-2">{title}</h4>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StrategyCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8 flex flex-col h-full relative overflow-hidden group hover:bg-white/[0.05] transition-colors">
      <div className="absolute -right-4 -top-6 text-8xl font-black font-oswald text-white/[0.03] group-hover:text-sky-500/[0.05] transition-colors pointer-events-none">
        {step}
      </div>
      <div className="mb-6 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Шаг {step}</span>
      </div>
      <h4 className="text-lg font-bold font-oswald uppercase tracking-tight text-white/90 mb-3 relative z-10">{title}</h4>
      <p className="text-sm text-white/50 leading-relaxed relative z-10">{desc}</p>
    </div>
  );
}
