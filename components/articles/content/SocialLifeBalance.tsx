"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Quote,
  Lightbulb,
  Wine,
  UtensilsCrossed,
  Plane,
  Users,
  AlertTriangle,
  Timer,
  Droplets,
  Brain,
  Heart,
  Flame,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  BarChart3,
  CalendarCheck,
  GlassWater,
  Moon,
  Zap,
  Check,
  X,
  CircleAlert,
  Salad,
  Ham,
  Martini,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

export default function SocialLifeBalance({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "social-life-balance",
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
                <Clock className="h-3.5 w-3.5" /> 9 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Социальная жизнь и режим:{" "}
              <span className="text-amber-400">
                рестораны, гости и отпуск без вреда
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-amber-400/30 pl-8 italic">
              Фитнес, который заставляет отказываться от жизни — долго не
              продержится. Разбираемся, как совмещать тренировки, правильное
              питание и нормальную социальную жизнь.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Restaurant dinner"
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
            День рождения подруги. Корпоратив. Отпуск в Турции с all-inclusive.
            Ужин с мужем в хорошем ресторане. Шашлыки на даче с семьёй. Знакомая
            ситуация? Ты стараешься следить за питанием и тренироваться — и тут
            жизнь подбрасывает события, которые, казалось бы, несовместимы с
            режимом.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            И вот ключевое: они совместимы. Режим, который рушится от одного
            ужина в ресторане — это не режим, а тюрьма. А я строю MargoFitness
            на другом принципе: фитнес встраивается в жизнь, а не заменяет её.
            Сейчас расскажу как.
          </p>
        </div>

        {/* Секция 1 — Рестораны */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={UtensilsCrossed}
            title="Ресторан — не враг, если знаешь правила"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Главная ошибка — отношение «или я на диете, или я ем что хочу».
            Такое чёрно-белое мышление приводит к тому, что ты либо сидишь с
            салатом и злишься, либо срываешься на весь стол. Ни то, ни другое не
            работает.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            В ресторане работает система «навигации» — простые правила, которые
            позволяют получить удовольствие от еды и не откатиться в прогрессе.
          </p>

          {/* Навигатор по меню */}
          <MenuNavigator />

          <p className="text-lg text-white/60 leading-relaxed mt-8 mb-6">
            Суть не в том, чтобы считать калории за столом. Суть в том, чтобы
            осознанно выбирать: что я хочу, что мне нужно, и от чего я могу
            отказаться без сожаления.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              {
                title: "До ресторана",
                items: [
                  "Не голодай весь день «чтобы наесться»",
                  "Лёгкий обед с белком и овощами",
                  "Посмотри меню заранее, если возможно",
                ],
                accent: "amber",
              },
              {
                title: "В ресторане",
                items: [
                  "Начни с воды, а не с хлебной корзинки",
                  "Белок + овощи — основа, гарнир — дополнение",
                  "Ешь медленно, разговаривай, наслаждайся",
                ],
                accent: "amber",
              },
              {
                title: "После ресторана",
                items: [
                  "Не компенсируй на следующий день голоданием",
                  "Вернись к обычному режиму питания",
                  "Один ужин не отменяет недели работы",
                ],
                accent: "amber",
              },
            ].map((phase, i) => (
              <PhaseCard key={i} {...phase} />
            ))}
          </div>
        </section>

        {/* Секция 2 — Алкоголь */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Wine}
            title="Алкоголь и тренировки: полная правда"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Это тема, которую многие фитнес-блогеры обходят стороной или дают
            размытые ответы. Я дам конкретные. Алкоголь — не абсолютное зло. Но
            если ты тренируешься ради результата, тебе нужно понимать, что
            именно он делает с твоим телом.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Вот что происходит с организмом после того, как ты выпила:
          </p>

          {/* Таймлайн метаболизма алкоголя (в новом дизайне каскада) */}
          <div className="relative pl-8 md:pl-10 mb-10 text-left">
            <div className="absolute left-3 md:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/30 via-amber-500/20 to-transparent" />

            {[
              {
                step: "0–30 мин",
                title: "Попадание в кровь",
                text: "Алкоголь всасывается через стенки желудка. На пустой желудок — за 15 минут. С едой — за 30–45.",
                severity: "low" as const,
              },
              {
                step: "30 мин – 2 часа",
                title: "Пик концентрации",
                text: "Печень начинает расщеплять этанол. Скорость — ~10 мл чистого спирта в час. Всё остальное «ждёт в очереди».",
                severity: "medium" as const,
              },
              {
                step: "2–6 часов",
                title: "Активная переработка",
                text: "Печень работает на полную. Жиросжигание полностью заблокировано — все ресурсы уходят на алкоголь.",
                severity: "high" as const,
              },
              {
                step: "6–12 часов",
                title: "Обезвоживание и токсины",
                text: "Ацетальдегид (продукт распада) отравляет клетки. Головная боль, тошнота, слабость — это его работа.",
                severity: "critical" as const,
              },
              {
                step: "12–24 часа",
                title: "Восстановление",
                text: "Тело всё ещё компенсирует урон. Мышечный синтез подавлен. Гормон роста снижен. Сон предыдущей ночи — нерестаоративный.",
                severity: "medium" as const,
              },
              {
                step: "24–48 часов",
                title: "Возврат к норме",
                text: "Метаболизм постепенно нормализуется. Жиросжигание возобновляется. Полное восстановление гормонального фона.",
                severity: "low" as const,
              },
            ].map((item, i) => (
              <CascadeStep key={i} {...item} />
            ))}
          </div>

          <p className="text-lg text-white/60 leading-relaxed mt-8 mb-6">
            Но это ещё не всё. Алкоголь бьёт по тренировочному процессу
            сразу в нескольких направлениях:
          </p>

          {/* Карточки воздействия */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {[
              {
                icon: Flame,
                title: "Жиросжигание на паузе",
                value: "до 48 часов",
                desc: "Печень переключается на расщепление алкоголя. Всё остальное — включая жир — откладывается в очередь. Жиросжигание блокируется полностью.",
                color: "rose" as const,
              },
              {
                icon: Zap,
                title: "Синтез белка подавлен",
                value: "до –37%",
                desc: "Исследование в American Journal of Physiology: даже умеренное употребление снижает синтез мышечного белка на 24–37%. Мышцы не восстанавливаются.",
                color: "violet" as const,
              },
              {
                icon: Moon,
                title: "Сон разрушен",
                value: "до –40% REM",
                desc: "Алкоголь помогает заснуть, но подавляет фазу глубокого сна (REM) до 40%. Именно в этой фазе происходит восстановление мышц и нервной системы.",
                color: "blue" as const,
              },
              {
                icon: Droplets,
                title: "Обезвоживание",
                value: "до –3% массы тела",
                desc: "Алкоголь — мощный диуретик. Потеря даже 2% воды снижает силу на 10–20% и координацию на 25%. Суставы и связки теряют защиту.",
                color: "sky" as const,
              },
            ].map((item, i) => (
              <ImpactCard key={i} {...item} />
            ))}
          </div>

          {/* СТОП-БЛОК — Тренировка после алкоголя */}
          <div className="relative rounded-[2rem] overflow-hidden border-2 border-rose-500/30 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.08] to-transparent" />
            <div className="relative p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <ShieldAlert className="size-6 text-rose-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400/60 mb-0.5">
                    Абсолютное правило
                  </p>
                  <h3 className="text-xl md:text-2xl font-oswald font-black uppercase tracking-tight text-rose-400">
                    Выпила — не тренируйся на следующий день
                  </h3>
                </div>
              </div>

              <p className="text-base text-white/60 leading-relaxed mb-6">
                Это не рекомендация, а правило безопасности. Тренировка на
                следующий день после алкоголя — это не «компенсация», а прямой
                путь к травме.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    reason: "Обезвоживание",
                    detail:
                      "Связки и суставы недостаточно смазаны. Риск растяжений и вывихов возрастает в 2–3 раза.",
                  },
                  {
                    reason: "Нарушенная координация",
                    detail:
                      "Даже если ты «чувствуешь себя нормально», нервная система ещё не восстановилась. Техника страдает.",
                  },
                  {
                    reason: "Перегруженное сердце",
                    detail:
                      "Алкоголь повышает ЧСС на 10–15 уд/мин на следующий день. Тренировка создаёт двойную нагрузку на сердце.",
                  },
                  {
                    reason: "Нулевая эффективность",
                    detail:
                      "Мышцы не могут нормально сокращаться и восстанавливаться. Ты тратишь время, но не получаешь результата.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/10"
                  >
                    <CircleAlert className="size-4 text-rose-400/60 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-rose-400/80 mb-0.5">
                        {item.reason}
                      </p>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-sm text-white/50 leading-relaxed">
                  <strong className="text-white/80">
                    Что делать вместо тренировки:
                  </strong>{" "}
                  пить воду (2–3 литра за день), погулять 30–40 минут на свежем
                  воздухе, нормально поесть (белок + сложные углеводы), лечь
                  спать пораньше. Тренировку перенеси на день. Один пропуск
                  ничего не стоит — одна травма стоит недели.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Секция 3 — В гостях */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Users} title="В гостях и на праздниках" />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Гости — это другая ситуация. В ресторане ты выбираешь из меню. В
            гостях ты ешь то, что приготовил хозяин. И здесь включается
            социальное давление: «Попробуй вот это», «Почему так мало ешь?»,
            «Ты что, на диете?».
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Давай разделим это на два сценария — ты в гостях и гости у тебя.
          </p>

          {/* Табы: в гостях / дома */}
          <GuestTabs />
        </section>

        {/* Секция 4 — Отпуск */}
        <section className="mb-14 text-left">
          <SectionHeader icon={Plane} title="Отпуск: как не потерять прогресс за 7–14 дней" />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Отпуск — это самый длинный перерыв, с которым сталкивается любой
            тренирующийся. Одна-две недели all-inclusive, где жизнь состоит из
            шведского стола, коктейлей у бассейна и полного отсутствия режима.
          </p>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Хорошая новость: за 7–14 дней ты физически не потеряешь мышцы.
            Исследования показывают, что заметная потеря мышечной массы
            начинается после 3–4 недель полного бездействия. Плохая новость:
            ты можешь набрать 2–4 кг за счёт воды, жира и гликогена — и
            психологически это ударит сильно, даже если реальный урон
            минимальный.
          </p>

          {/* Визуальная неделя отпуска */}
          <VacationWeekComparison />

          <p className="text-xs text-white/20 mt-4 text-center italic">
            Стратегия отпуска — не контроль, а баланс.
          </p>

          <blockquote className="relative my-10 pl-8 text-left">
            <div className="absolute left-0 top-6 bottom-[-8px] w-0.5 bg-amber-400/40" />
            <Quote className="absolute -left-3 -top-1 size-6 text-amber-400/30 p-0.5" />
            <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
              «Отпуск — это не пауза в прогрессе. Это часть жизни, ради которой
              ты тренируешься. Наслаждайся, двигайся, ешь вкусно — и не вини
              себя ни за один круассан.»
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
        </section>

        {/* Секция 5 — Блок платформы */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/15 p-8 md:p-12 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] via-white/[0.01] to-transparent" />
            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-amber-500/5 blur-[80px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Sparkles className="size-3.5 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Как MargoFitness помогает
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
                Контроль без контроля:{" "}
                <span className="text-amber-400">
                  инструменты для реальной жизни
                </span>
              </h3>

              <p className="text-base text-white/50 leading-relaxed mb-8 max-w-2xl">
                Платформа MargoFitness создана для того, чтобы вписать фитнес в
                твою жизнь — а не наоборот. Вот что помогает оставаться в форме
                даже в насыщенные социальные периоды:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <GlassWater className="size-4.5 text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80">
                      Трекер воды и питания
                    </h4>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Отслеживай водный баланс и качество питания — особенно в дни
                    с алкоголем и ресторанами. Визуальные данные помогают не
                    «забить», а осознанно вернуться к режиму.
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <CalendarCheck className="size-4.5 text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80">
                      Гибкий график тренировок
                    </h4>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Пропустила тренировку после вечеринки? Перенеси на другой
                    день. Программа не сломается от одного пропуска — она
                    адаптируется к твоему ритму.
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <BarChart3 className="size-4.5 text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80">
                      Статистика и тренды
                    </h4>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Видишь общую картину за неделю, месяц, год. Один «плохой»
                    день на фоне трёх хороших недель — это шум, а не
                    катастрофа. Графики помогают не паниковать.
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                      <TrendingUp className="size-4.5 text-amber-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white/80">
                      Трекер веса с трендами
                    </h4>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">
                    После отпуска весы покажут +2 кг. Трекер покажет, что за
                    последние 3 месяца тренд — минус 4 кг. Контекст решает всё.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Секция 6 — Возвращение к режиму */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={TrendingUp}
            title="Как вернуться после «загула» без чувства вины"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Неделя отпуска. Три корпоратива подряд. Новогодние праздники. Так
            или иначе, будут периоды, когда ты отклонишься от режима. И вот
            здесь самая опасная ловушка — не сам «загул», а то, что ты делаешь
            после.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10 mb-8">
            <div className="p-6 md:p-8 bg-rose-500/[0.03] border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-2.5 mb-5">
                <X className="size-4.5 text-rose-400/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400/60">
                  Деструктивная реакция
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "Голодание «чтобы компенсировать»",
                  "Двойная тренировка «чтобы сжечь»",
                  "Чувство вины и самобичевание",
                  "Решение «начать с понедельника заново»",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/35 leading-relaxed"
                  >
                    <X className="size-3.5 text-rose-400/30 shrink-0 mt-1" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-emerald-500/[0.03]">
              <div className="flex items-center gap-2.5 mb-5">
                <Check className="size-4.5 text-emerald-400/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/60">
                  Здоровая реакция
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "Обычный завтрак на следующее утро",
                  "Плановая тренировка (через день, не сразу)",
                  "Принятие: это часть нормальной жизни",
                  "Возврат к режиму, а не новый «старт»",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-emerald-400/50 leading-relaxed"
                  >
                    <Check className="size-3.5 text-emerald-400/30 shrink-0 mt-1" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Ключевая мысль: результат определяется не отдельными днями, а общей
            тенденцией за месяцы. Один ужин в ресторане — это 0.3% от всех
            приёмов пищи за год. Даже неделя отпуска — это 2% от года. Если
            остальные 98% ты в режиме — никакой отпуск не сломает прогресс.
          </p>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Живи полноценно.
            <br />
            <span className="text-amber-400">Тренируйся осознанно.</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Фитнес, который не мешает жить — единственный фитнес, который
            работает долго.
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

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-amber-400" />
      </div>
      <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}

function MenuNavigator() {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      name: "Закуски",
      icon: <Salad className="size-3.5" />,
      good: [
        "Карпаччо из говядины",
        "Тартар из тунца",
        "Овощные салаты (без майонеза)",
        "Брускетты с томатами",
      ],
      caution: [
        "Салат «Цезарь» (соус калорийный)",
        "Крем-супы на сливках",
        "Сырные тарелки (жирные, но хотя бы белок)",
      ],
      avoid: [
        "Жареные луковые кольца",
        "Куриные наггетсы",
        "Хлебная корзинка с маслом",
      ],
    },
    {
      name: "Основное",
      icon: <Ham className="size-3.5" />,
      good: [
        "Стейк (любой прожарки)",
        "Рыба на гриле",
        "Куриная грудка с гарниром",
        "Морепродукты на гриле",
      ],
      caution: [
        "Паста (большая порция углеводов)",
        "Ризотто (рис + масло + сыр)",
        "Бургер (можно без булки)",
      ],
      avoid: [
        "Блюда в панировке и фритюре",
        "Блюда в сливочных соусах",
        "Комбо-сеты с картошкой фри",
      ],
    },
    {
      name: "Напитки",
      icon: <Martini className="size-3.5" />,
      good: [
        "Вода (с лимоном, мятой)",
        "Чай / американо без сахара",
        "Сухое вино (150 мл ≈ 120 ккал)",
      ],
      caution: [
        "Пиво (калорийное + вздутие)",
        "Сок (фруктоза, много калорий)",
        "Латте / капучино (молоко + сироп)",
      ],
      avoid: [
        "Коктейли с сиропами (300–500 ккал)",
        "Лимонады и газировки",
        "Мохито, Пина Колада, Лонг Айленд",
      ],
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="flex border-b border-white/5">
        {categories.map((c, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeCategory === i
                ? "text-amber-400"
                : "text-white/25 hover:text-white/40"
            )}
          >
            {activeCategory === i && (
              <motion.div
                layoutId="menu-tab"
                className="absolute inset-0 bg-amber-500/[0.06] border-b-2 border-amber-400"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {c.icon} {c.name}
            </span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[280px] md:min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-5 md:p-6 absolute inset-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                    Хороший выбор
                  </span>
                </div>
                <ul className="space-y-2">
                  {categories[activeCategory].good.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-white/50 leading-relaxed flex items-start gap-2"
                    >
                      <Check className="size-3 text-emerald-400/50 shrink-0 mt-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                    С оговорками
                  </span>
                </div>
                <ul className="space-y-2">
                  {categories[activeCategory].caution.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-white/50 leading-relaxed flex items-start gap-2"
                    >
                      <AlertTriangle className="size-3 text-amber-400/50 shrink-0 mt-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400/70">
                    Лучше обойти
                  </span>
                </div>
                <ul className="space-y-2">
                  {categories[activeCategory].avoid.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-white/50 leading-relaxed flex items-start gap-2"
                    >
                      <X className="size-3 text-rose-400/50 shrink-0 mt-1" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
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

function ImpactCard({
  icon: Icon,
  title,
  value,
  desc,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  desc: string;
  color: "rose" | "violet" | "blue" | "sky";
}) {
  const styles = {
    rose: "bg-rose-500/[0.04] border-rose-500/12 text-rose-400",
    violet: "bg-violet-500/[0.04] border-violet-500/12 text-violet-400",
    blue: "bg-blue-500/[0.04] border-blue-500/12 text-blue-400",
    sky: "bg-sky-500/[0.04] border-sky-500/12 text-sky-400",
  };
  const iconBg = {
    rose: "bg-rose-500/10 border-rose-500/15",
    violet: "bg-violet-500/10 border-violet-500/15",
    blue: "bg-blue-500/10 border-blue-500/15",
    sky: "bg-sky-500/10 border-sky-500/15",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6 text-left",
        styles[color].split(" ").slice(0, 2).join(" ")
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "size-9 rounded-lg border flex items-center justify-center",
            iconBg[color]
          )}
        >
          <Icon className={cn("size-4.5", styles[color].split(" ")[2])} />
        </div>
        <div>
          <h4
            className={cn(
              "text-sm font-bold",
              styles[color].split(" ")[2]
            )}
          >
            {title}
          </h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            {value}
          </p>
        </div>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function DrinkZoneCard({
  level,
  amount,
  impact,
  color,
}: {
  level: string;
  amount: string;
  impact: string;
  color: "emerald" | "amber" | "rose";
}) {
  const styles = {
    emerald: {
      bg: "bg-emerald-500/[0.04]",
      border: "border-emerald-500/15",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    amber: {
      bg: "bg-amber-500/[0.04]",
      border: "border-amber-500/15",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    rose: {
      bg: "bg-rose-500/[0.04]",
      border: "border-rose-500/15",
      text: "text-rose-400",
      dot: "bg-rose-400",
    },
  };

  const s = styles[color];

  return (
    <div className={cn("rounded-xl border p-4 md:p-5 text-left", s.bg, s.border)}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("size-2.5 rounded-full", s.dot)} />
        <span className={cn("text-xs font-bold uppercase tracking-widest", s.text)}>
          {level}
        </span>
        <span className="text-xs text-white/25 ml-auto">{amount}</span>
      </div>
      <p className="text-sm text-white/45 leading-relaxed">{impact}</p>
    </div>
  );
}

function GuestTabs() {
  const [activeTab, setActiveTab] = useState<"visiting" | "hosting">("visiting");

  const visitingItems = [
    {
      title: "Поешь до выхода",
      desc: "Лёгкий перекус с белком за час до мероприятия. Творог, яйца, горсть орехов. Ты придёшь не голодной и не набросишься на канапе.",
    },
    {
      title: "Не извиняйся за выбор",
      desc: "«Спасибо, мне достаточно» — это полное предложение. Ты никому не обязана объяснять, почему не хочешь третий кусок торта. Если спрашивают — «я слежу за питанием» звучит нормально.",
    },
    {
      title: "Выбирай белок и овощи",
      desc: "На любом столе есть мясо, рыба, салаты. Положи их в основу тарелки. Оливье и шуба — в дополнение, не наоборот.",
    },
    {
      title: "Алкоголь — осознанно",
      desc: "Один бокал сухого вина за весь вечер. Между алкогольными порциями — стакан воды. Это снижает общий объём выпитого и замедляет опьянение.",
    },
    {
      title: "Не компенсируй потом",
      desc: "Переела в гостях? Нормально. Завтра — обычный день, обычная еда, обычная тренировка (если не пила). Никаких «разгрузочных дней» и голодания.",
    },
  ];

  const hostingItems = [
    {
      title: "Готовь то, что подходит и тебе",
      desc: "Запечённое мясо, рыба на гриле, овощные салаты, фрукты — это нормальный праздничный стол. Гости не заметят, что ты «на режиме», а ты будешь есть то, что не противоречит целям.",
    },
    {
      title: "Десерт — один, но хороший",
      desc: "Один красивый торт лучше, чем пять видов печенья. И гостям приятнее, и ты контролируешь порцию.",
    },
    {
      title: "Напитки — предложи альтернативу",
      desc: "Поставь на стол воду с мятой и лимоном, домашний лимонад без сахара. Многие гости сами рады, когда есть безалкогольный вариант.",
    },
    {
      title: "Не бойся быть «скучной хозяйкой»",
      desc: "Здоровая еда — не скучная. Стейк с овощами гриль впечатляет больше, чем тазик оливье. Качество вместо количества.",
    },
    {
      title: "Контейнеры для гостей",
      desc: "Если после праздника осталось много еды, которую тебе не стоит есть всю неделю — раздай её гостям с собой. И им приятно, и у тебя дома не будет лишних соблазнов.",
    },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[
          { id: "visiting" as const, label: "Ты в гостях" },
          { id: "hosting" as const, label: "Гости у тебя" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id
                ? "text-amber-400"
                : "text-white/25 hover:text-white/40"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="guest-tab"
                className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Скрытый слой для фиксации высоты по максимальному контенту */}
        <div className="invisible pointer-events-none" aria-hidden="true">
          <div className="space-y-4">
            {(visitingItems.length >= hostingItems.length
              ? visitingItems
              : hostingItems
            ).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 md:p-5 rounded-xl border border-transparent"
              >
                <div className="size-8 shrink-0" />
                <div>
                  <h4 className="text-base font-bold mb-1">Placeholder</h4>
                  <p className="text-sm leading-relaxed">
                    {/* Используем длинный текст для гарантии высоты */}
                    {visitingItems[i]?.desc || hostingItems[i]?.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "visiting" ? (
            <motion.div
              key="visiting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 absolute inset-0"
            >
              {visitingItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 md:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-oswald font-black text-amber-400">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white/85 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="hosting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 absolute inset-0"
            >
              {hostingItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 md:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-oswald font-black text-amber-400">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white/85 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VacationWeekComparison() {
  const timeSlots = [
    { time: "Завтрак", icon: <Utensils className="size-3.5" /> },
    { time: "День", icon: <Plane className="size-3.5" /> },
    { time: "Обед", icon: <Salad className="size-3.5" /> },
    { time: "Вечер", icon: <Moon className="size-3.5" /> },
    { time: "Ужин", icon: <Wine className="size-3.5" /> },
  ];

  const chaotic: { action: string; problem?: string }[] = [
    { action: "Шведский стол: 2 тарелки + выпечка + сок", problem: "~1 200 ккал за один завтрак" },
    { action: "Лежишь у бассейна, коктейль в 12:00", problem: "Алкоголь на жаре + обезвоживание" },
    { action: "Шведский стол снова: паста, пицца, десерт", problem: "Ещё 1 000–1 400 ккал" },
    { action: "Сон → снова бассейн → мороженое", problem: "Нулевая активность, скачки сахара" },
    { action: "Ресторан: закуски + основное + вино + десерт", problem: "~1 500 ккал + алкоголь" },
  ];

  const strategic: { action: string; why?: string }[] = [
    { action: "1 тарелка: яйца, овощи, сыр, кофе", why: "Белок с утра = сытость до обеда" },
    { action: "Прогулка 30 мин или плавание", why: "Метаболизм не «засыпает»" },
    { action: "1 тарелка: мясо/рыба + овощи + гарнир", why: "Белок в каждый приём — защита мышц" },
    { action: "Активность: пляж, волейбол, прогулка", why: "Движение вместо тренировки" },
    { action: "Ресторан: основное + бокал вина", why: "Наслаждаешься, но без «добивки» десертом" },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
      <div className="p-5 md:p-6 pb-3 md:pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
          Типичный день отпуска: два подхода
        </p>
      </div>

      {/* Заголовки колонок */}
      <div className="grid grid-cols-[100px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] border-b border-white/10">
        <div className="p-3 md:p-4" />
        <div className="p-3 md:p-4 border-l border-white/10 bg-rose-500/[0.04]">
          <div className="flex items-center gap-2">
            <X className="size-3.5 text-rose-400/60" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400/60">
              Без стратегии
            </span>
          </div>
        </div>
        <div className="p-3 md:p-4 border-l border-white/10 bg-emerald-500/[0.04]">
          <div className="flex items-center gap-2">
            <Check className="size-3.5 text-emerald-400/60" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
              Со стратегией
            </span>
          </div>
        </div>
      </div>

      {/* Строки */}
      {timeSlots.map((slot, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] border-b border-white/5 last:border-b-0"
        >
          <div className="p-3 md:p-4 flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <span className="text-white/40">{slot.icon}</span>
            </div>
            <span className="text-xs font-bold text-white/30">
              {slot.time}
            </span>
          </div>

          <div className="p-3 md:p-4 border-l border-white/5">
            <p className="text-xs text-white/50 leading-relaxed">
              {chaotic[i].action}
            </p>
            {chaotic[i].problem && (
              <p className="text-[10px] text-rose-400/50 mt-1 leading-snug">
                {chaotic[i].problem}
              </p>
            )}
          </div>

          <div className="p-3 md:p-4 border-l border-white/5">
            <p className="text-xs text-white/50 leading-relaxed">
              {strategic[i].action}
            </p>
            {strategic[i].why && (
              <p className="text-[10px] text-emerald-400/50 mt-1 leading-snug">
                {strategic[i].why}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Итог */}
      <div className="grid grid-cols-[100px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] border-t border-white/10">
        <div className="p-3 md:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            Итог дня
          </span>
        </div>
        <div className="p-3 md:p-4 border-l border-white/10 bg-rose-500/[0.03]">
          <p className="text-xs font-bold text-rose-400/70">~4 500–5 000 ккал</p>
          <p className="text-[10px] text-white/25 mt-0.5">
            Движение: минимум. Алкоголь: ежедневно. За неделю: +3–4 кг.
          </p>
        </div>
        <div className="p-3 md:p-4 border-l border-white/10 bg-emerald-500/[0.03]">
          <p className="text-xs font-bold text-emerald-400/70">~2 200–2 800 ккал</p>
          <p className="text-[10px] text-white/25 mt-0.5">
            Движение: 30–40 мин. Алкоголь: через день. За неделю: +0.5–1 кг (вода).
          </p>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  title,
  items,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5 text-left">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/50 mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-white/45 leading-relaxed"
          >
            <div className="size-1.5 rounded-full bg-amber-400/30 shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VacationRuleCard({
  index,
  rule,
  detail,
}: {
  index: number;
  rule: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4 p-4 md:p-5 rounded-xl border border-amber-500/8 bg-amber-500/[0.02] hover:bg-amber-500/[0.04] transition-colors text-left">
      <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-oswald font-black text-amber-400">
          {index}
        </span>
      </div>
      <div>
        <h4 className="text-base font-bold text-amber-400/90 mb-1">{rule}</h4>
        <p className="text-sm text-white/40 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
