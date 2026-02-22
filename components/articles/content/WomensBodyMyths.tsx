"use client";

import React, { useLayoutEffect } from "react";
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
              Страх взять в руки гантели тяжелее розовых 2-килограммовых - главный враг упругого тела. Разбираем физиологию, разбиваем стереотипы и объясняем, почему силовые тренировки делают тебя более женственной.
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
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            <span className="font-bold text-white/90">«Я не хочу быть похожей на мужика»</span>, <span className="font-bold text-white/90">«мне бы только чуть-чуть подтянуть»</span>, <span className="font-bold text-white/90">«от приседаний у меня растут огромные ноги»</span>. Это топ-3 страха, которые заставляют женщин избегать силовых тренировок.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Но физиология работает иначе. Женское тело создано для <span className="text-white/90 font-bold underline decoration-sky-500/30 underline-offset-4">выносливости</span> и сохранения энергии. Давай посмотрим на <span className="text-sky-400/85 font-bold">факты</span>, а не на глянцевые журналы из 2000-х.
          </p>
        </div>

        {/* Секция 1 - Гормоны */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Activity} title="Главный ограничитель: Тестостерон" />

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Мышцы не растут просто от того, что ты подняла гантель. Для их гипертрофии нужен мужской половой гормон - <span className="text-white/85 font-bold">тестостерон</span>. И вот здесь кроется главный секрет:
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

        {/* Секция 2 - Миф против Реальности */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Zap} title="Разрушитель мифов: Тонус против Массы" />

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            «Я хочу просто привести мышцы в тонус» - фраза, не имеющая медицинского смысла. Есть только два состояния: мышца либо <span className="text-sky-400/85 font-bold">растёт</span>, либо <span className="text-sky-400/85 font-bold">разрушается</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <MythBusterCard 
              myth="От силовых я стану «квадратной»"
              reality="Массивность даёт жир поверх мышц, а не сами мышцы. Силовые уплотняют мышечную ткань и сжигают жир - ты становишься компактнее."
            />
            <MythBusterCard 
              myth="Для рельефа нужны легкие веса"
              reality="Многоповторка с лёгким весом тренирует только выносливость. Для рельефа нужны веса, с которыми тебе тяжело на 12-15 повторении."
            />
            <MythBusterCard 
              myth="Если бросить, мышцы станут жиром"
              reality="Мышцы и жир - разные ткани. Они не могут превращаться друг в друга. Без нагрузки мышцы просто уменьшатся в объёме."
            />
            <MythBusterCard 
              myth="Кардио лучше сжигает жир"
              reality="Кардио сжигает калории только пока ты бежишь. Силовые разгоняют метаболизм: ты будешь тратить больше энергии даже во сне."
            />
          </div>
        </section>

        {/* Секция 5 - Блок платформы */}
        <section className="mb-14 text-left">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500/[0.08] via-sky-500/[0.02] to-transparent border border-sky-500/10 p-6 md:p-10">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                  <Activity className="size-3.5 text-sky-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Прогресс без весов</span>
                </div>
                
                <h2 className="text-3xl font-oswald font-black uppercase tracking-tight text-white leading-tight">
                  Отслеживай <br /> <span className="text-sky-400">реальные</span> изменения
                </h2>
                
                <p className="text-base text-white/60 leading-relaxed">
                  Цифра на весах может демотивировать. Поэтому в <strong className="text-white">веб-платформу MargoFitness</strong> встроен полноценный трекер здоровья. Это функционал, который специально создан для того, чтобы показывать твою настоящую трансформацию тела, а не просто колебания воды.
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3 text-sky-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white/90">Фото До/После:</span>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">Сравнивай изменения в специальном виджете.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3 text-sky-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white/90">Трекинг объёмов:</span>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">Платформа сама построит графики и покажет прогресс.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3 text-sky-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white/90">Умный график веса:</span>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">Сглаживаем дневные колебания воды и показываем тренд.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="relative mt-4 lg:-mt-6 flex flex-col lg:items-end">
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 lg:hidden" />
                <div className="relative w-full rounded-2xl border border-white/10 bg-[#09090b]/80 shadow-2xl overflow-hidden backdrop-blur-xl max-w-sm lg:ml-auto mb-4">
                  {/* Мокап интерфейса */}
                  <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Scale className="size-3.5 text-sky-400" />
                      <span className="text-xs font-bold text-white/80">Твои замеры</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Март</span>
                      <span className="relative flex size-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Талия</span>
                        <span className="text-sky-400 font-bold">-4 см</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 w-[75%] rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Бёдра</span>
                        <span className="text-sky-400 font-bold">-2.5 см</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 w-[45%] rounded-full" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Текущий вес</span>
                          <span className="text-lg font-oswald font-black text-white">64.2 кг</span>
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          В норме (ИМТ 21.5)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => {
                   document.querySelector('[data-tab="workouts"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }} className="inline-flex justify-between items-center px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-sky-500/10 hover:border-sky-500/30 text-white hover:text-sky-400 font-bold text-xs uppercase tracking-widest transition-all w-full max-w-sm lg:ml-auto group">
                  Перейти к трекеру 
                  <div className="size-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                    <ArrowRight className="size-3.5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Секция 3 - Таймлайн трансформации */}
        <section className="mb-14 text-left">
          <SectionHeader icon={TrendingUp} title="Что на самом деле произойдёт с твоим телом" />

          <p className="text-lg text-white/70 leading-relaxed mb-10">
            Если ты начнёшь регулярно делать силовые тренировки дома, твоя <span className="text-sky-400/85 font-bold underline decoration-sky-500/20 underline-offset-4">трансформация</span> будет выглядеть так:
          </p>

          <div className="flex flex-col">
            <PhaseItem 
              step="01"
              time="Месяц 1"
              title="Нейромышечная адаптация"
              desc="Ты станешь сильнее, но визуально мышцы почти не изменятся. Тело просто учится включать в работу больше мышечных волокон. Уйдёт отёчность."
            />
            <PhaseItem 
              step="02"
              time="Месяцы 2-3"
              title="Уплотнение (Тот самый тонус)"
              desc="Мышцы становятся плотнее на ощупь. Появляются красивые очертания плеч, приподнимаются ягодицы. За счёт роста плотности ткани метаболизм ускоряется."
            />
            <PhaseItem 
              step="03"
              time="Месяцы 4-6"
              title="Рекомпозиция"
              desc="Жировая прослойка истончается, а под ней - красивый мышечный корсет. Ты можешь весить столько же, но носить одежду на размер меньше, так как мышцы компактнее жира."
              isLast
            />
          </div>
        </section>

        {/* Секция 4 - Весы */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Scale} title="Почему после тренировок весы могут показать плюс" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-6">
              <p className="text-lg text-white/70 leading-relaxed">
                Самая частая причина паники: <span className="text-white/85 font-bold italic">«Я начала заниматься, и прибавила 1.5 кг!»</span>. 
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                Нет, ты не нарастила мышцы за неделю. То, что ты видишь на весах - это <span className="text-sky-400/85 font-bold">вода</span>. Силовые тренировки вызывают микроповреждения волокон, что сопровождается <span className="text-white/85 font-semibold underline decoration-white/10 underline-offset-4">задержкой жидкости</span>.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                Через 2-3 недели адаптации водный баланс нормализуется, отёк уйдет, и ты увидишь <span className="text-sky-400/85 font-bold">реальный результат</span>.
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
                    <span className="text-sky-500/50 shrink-0 flex items-center justify-center h-5">-</span>
                    <span>Спрячь весы на первый месяц</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 shrink-0 flex items-center justify-center h-5">-</span>
                    <span>Сделай фото «до» в белье</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 shrink-0 flex items-center justify-center h-5">-</span>
                    <span>Замеряй объемы (талия, бёдра) раз в 2 недели</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                    <span className="text-sky-500/50 shrink-0 flex items-center justify-center h-5">-</span>
                    <span>Ориентируйся на то, как сидит одежда</span>
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
              Не бойся увеличивать рабочие веса. Если ты легко делаешь 20 приседаний с 5 кг - это уже кардио. Чтобы ягодицы обрели форму, им нужен стимул. Бери 8 кг и делай 12 качественных, тяжелых повторений. Именно это строит упругое тело.
            </p>
          </div>
        </div>

        {/* Стратегия */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Dumbbell} title="Стратегия: Как тренироваться для рельефа" />
          
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Если ты готова отбросить страхи и начать строить упругое тело, вот три правила, которые должны стать основой твоих тренировок. Без них даже самые тяжелые гантели не дадут результата.
          </p>

          <div className="space-y-4">
            <StrategyItem 
              step="01"
              title="Базовые упражнения"
              desc="Изолированные упражнения (махи ногами или сгибания рук) тратят мало калорий и слабо стимулируют гормональную систему. Выбирай базу: приседания, выпады, тяги, отжимания. Они включают сразу несколько мышечных групп."
            />
            <StrategyItem 
              step="02"
              title="Прогрессивная нагрузка"
              desc="Тело быстро привыкает к рутине. Если месяц подряд ты делаешь приседания с гантелью 5 кг - мышцы перестанут реагировать. Увеличивай вес, добавляй повторения или замедляй темп выполнения."
            />
            <StrategyItem 
              step="03"
              title="Восстановление"
              desc="Мышцы растут и уплотняются не на тренировке, а во время отдыха и сна. Ежедневные силовые без выходных приведут только к перетренированности и отекам. Давай мышцам минимум 48 часов на восстановление."
            />
          </div>
        </section>

        {/* Цитата */}
        <blockquote className="relative my-14 pl-8 text-left">
          <div className="absolute left-0 top-6 bottom-[-8px] w-0.5 bg-sky-400/40" />
          <Quote className="absolute -left-3 -top-1 size-6 text-sky-400/30 p-0.5" />
          <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
            «Женщины-бодибилдеры из интернета, которых все так боятся, годами сидят на строжайших диетах, тренируются по 3 часа в день и используют гормональную терапию. Случайно "перекачаться", тренируясь дома 3 раза в неделю - это как случайно стать космонавтом, пару раз посмотрев на звёзды.»
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col h-full hover:border-sky-500/30 transition-colors group relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
            <XCircle className="size-3.5 text-rose-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Миф</span>
          </div>
          <p className="text-base md:text-lg font-oswald font-black uppercase tracking-tight text-white/90 leading-tight">{myth}</p>
        </div>
        
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4">
            <CheckCircle2 className="size-3.5 text-sky-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Реальность</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{reality}</p>
        </div>
      </div>
    </div>
  );
}

function PhaseItem({ step, time, title, desc, isLast }: { step: string; time: string; title: string; desc: string; isLast?: boolean }) {
  return (
    <div className="relative pl-8 md:pl-10 pb-8 last:pb-0 group">
      {!isLast && (
        <div className="absolute left-[3px] md:left-[5px] top-2 bottom-0 w-[2px] bg-sky-500/10" />
      )}
      <div className="absolute left-[-2px] md:left-0 top-1.5 size-3 z-10">
        <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-20" />
        <div className="relative size-3 rounded-full border-2 border-[#09090b] bg-sky-400 ring-4 ring-sky-500/20 group-hover:ring-sky-500/40 transition-all" />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Фаза {step}</span>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{time}</span>
      </div>
      <h4 className="text-base md:text-lg font-bold text-white/90 mb-2">{title}</h4>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </div>
  );
}

function StrategyItem({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors items-start">
      <div className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-oswald font-black text-xl shrink-0">
        {step}
      </div>
      <div>
        <h4 className="text-lg font-bold font-oswald uppercase tracking-tight text-white/90 mb-2">{title}</h4>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
