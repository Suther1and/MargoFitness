"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Quote,
  Lightbulb,
  Brain,
  Repeat,
  Flame,
  Target,
  Zap,
  CalendarCheck,
  Users,
  Heart,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

export default function HabitMagic({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "habit-magic",
    onRead: async (id) => {
      await markArticleAsRead(id);
    },
    threshold: 0.5,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white selection:bg-rose-500/30"
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
              <span className="bg-rose-500 text-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Основы
              </span>
              {metadata?.access_level && (
                <span className="hidden md:inline-block bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {metadata.access_level}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                <Clock className="h-3.5 w-3.5" /> 8 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Магия привычек:{" "}
              <span className="text-rose-400">
                как не бросить тренировки через неделю
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-rose-400/30 pl-8 italic">
              Сила воли — конечный ресурс. Привычка — бесконечный. Разбираемся,
              как превратить тренировки из «надо» в «просто часть моего дня».
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Workout habit"
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
            Каждый январь — одна и та же история. Миллионы людей покупают
            абонементы, скачивают приложения, клянутся себе: «В этот раз точно».
            А через 6 недель 50% из них уже бросили. К концу года — до 80%.
          </p>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            И дело не в лени. Не в нехватке мотивации. И уж точно не в том, что
            с тобой что-то не так. Дело в подходе. Люди пытаются тренироваться
            через силу воли — а сила воли работает как аккумулятор: утром
            полная, к вечеру на нуле. Те, кто тренируются годами, не обладают
            сверхсилой. Они просто превратили тренировку в привычку — действие,
            которое не требует волевого решения каждый раз.
          </p>
        </div>

        {/* Секция 1 — Почему бросают */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Brain}
            title="Почему на самом деле бросают"
            number="01"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Исследование Университета Айовы (2024) изучило 1 134 новичка и
            выявило главную причину: люди полагаются на мотивацию вместо системы.
            Мотивация — это эмоция. Она приходит и уходит. Привычка — это
            автопилот. Она работает даже когда настроения нет.
          </p>

          {/* Визуальное сравнение: Мотивация vs Привычка */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10 mb-8">
            <div className="p-6 md:p-8 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Flame className="size-5 text-orange-400/60" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white/40">
                  Мотивация
                </h4>
              </div>

              <div className="space-y-4">
                {/* Волнообразный график мотивации */}
                <div className="h-16 flex items-end gap-[3px]">
                  {[85, 70, 90, 55, 40, 65, 30, 20, 45, 15, 10, 25, 8, 5, 12, 3].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-orange-500/20 to-orange-500/40 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <p className="text-xs text-white/25 text-center">
                  Волнообразная, непредсказуемая, угасающая
                </p>
              </div>

              <ul className="mt-5 space-y-2">
                {[
                  "Зависит от настроения и погоды",
                  "Требует волевого решения каждый раз",
                  "Истощается к вечеру",
                  "Не работает в плохие дни",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/35 leading-relaxed">
                    <X className="size-3.5 text-white/15 shrink-0 mt-1" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 md:p-8 bg-rose-500/[0.03]">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center">
                  <Repeat className="size-5 text-rose-400" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-rose-400/80">
                  Привычка
                </h4>
              </div>

              <div className="space-y-4">
                {/* Стабильный график привычки */}
                <div className="h-16 flex items-end gap-[3px]">
                  {[15, 20, 25, 30, 38, 42, 50, 55, 60, 62, 65, 68, 70, 72, 75, 78].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-rose-500/30 to-rose-500/60 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <p className="text-xs text-rose-400/40 text-center">
                  Растущая, стабильная, автоматическая
                </p>
              </div>

              <ul className="mt-5 space-y-2">
                {[
                  "Работает на автопилоте",
                  "Не требует ежедневного решения",
                  "Усиливается со временем",
                  "Работает даже в плохие дни",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-400/60 leading-relaxed">
                    <CheckCircle2 className="size-3.5 text-rose-400/40 shrink-0 mt-1" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-lg text-white/60 leading-relaxed">
            Участники того же исследования, которые использовали привычки
            подготовки (собрать форму с вечера) и привычки запуска (тренироваться
            сразу после определённого действия), занимались в 3 раза чаще тех,
            кто просто «пытался не пропускать».
          </p>
        </section>

        {/* Секция 2 — Петля привычки */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Repeat}
            title="Петля привычки: как это работает"
            number="02"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Любая привычка — это цикл из четырёх элементов. Понимая этот
            механизм, ты можешь «запрограммировать» тренировку так же, как
            сейчас запрограммирована чистка зубов — ты не принимаешь решение
            чистить зубы каждое утро, ты просто делаешь это.
          </p>

          {/* Петля привычки — 4 шага */}
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-10 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  step: "1",
                  title: "Сигнал",
                  subtitle: "Что запускает",
                  desc: "Конкретный триггер: время, место, действие. Например: «После того как отведу ребёнка в сад» или «Будильник в 7:15».",
                  icon: Zap,
                  color: "rose",
                },
                {
                  step: "2",
                  title: "Желание",
                  subtitle: "Что мотивирует",
                  desc: "Не сама тренировка, а чувство после неё: энергия, гордость, спокойствие. Визуализируй результат, а не процесс.",
                  icon: Heart,
                  color: "rose",
                },
                {
                  step: "3",
                  title: "Действие",
                  subtitle: "Что делаешь",
                  desc: "Максимально простое начало. Не «часовая тренировка», а «надеть кроссовки и сделать 5 приседаний». Порог входа = ноль.",
                  icon: Target,
                  color: "rose",
                },
                {
                  step: "4",
                  title: "Награда",
                  subtitle: "Что получаешь",
                  desc: "Мозгу нужно подкрепление. Отметка в трекере, чашка любимого чая, 5 минут с книгой — маленькое удовольствие сразу после.",
                  icon: Sparkles,
                  color: "rose",
                },
              ].map((item, i) => (
                <HabitLoopCard key={i} {...item} />
              ))}
            </div>

            {/* Стрелка цикла */}
            <div className="hidden md:flex items-center justify-center mt-6">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/15">
                <Repeat className="size-3.5 text-rose-400/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400/50">
                  Повторяй → Автоматизируй → Не думай
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Цитата */}
        <blockquote className="relative my-14 pl-8 text-left">
          <div className="absolute left-0 top-6 bottom-[-8px] w-0.5 bg-rose-400/40" />
          <Quote className="absolute -left-3 -top-1 size-6 text-rose-400/30 p-0.5" />
          <p className="text-xl md:text-2xl font-medium text-white/80 leading-relaxed italic mb-8">
            «Я не тренирую людей через силу. Я помогаю встроить движение в жизнь
            так, чтобы оно стало таким же естественным, как утренний кофе. Когда
            тренировка перестаёт быть подвигом — начинается настоящий прогресс.»
          </p>
          <footer className="flex items-center gap-4">
            <div className="relative w-14 h-14 -ml-1 -my-2 shrink-0 rounded-full border-2 border-rose-500/20 overflow-hidden shadow-lg shadow-rose-500/20">
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

        {/* Секция 3 — Правило 66 дней */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={CalendarCheck}
            title="Миф 21 дня и реальность 66"
            number="03"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-6">
            «Привычка формируется за 21 день» — это миф из книги 1960-х.
            Мета-анализ 2024 года (27 исследований, тысячи участников) показал
            реальную картину:
          </p>

          {/* Таймлайн формирования привычки */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8 mb-8">
            <div className="space-y-6">
              <TimelinePhase
                phase="Фаза сопротивления"
                days="1–21 день"
                percent={25}
                desc="Каждая тренировка — сознательное решение. Мозг сопротивляется новому. Здесь бросает большинство. Твоя задача: не пропускать, даже если делаешь минимум."
                status="danger"
              />
              <TimelinePhase
                phase="Фаза привыкания"
                days="22–66 дней"
                percent={60}
                desc="Становится легче. Ты замечаешь, что иногда начинаешь тренировку «не думая». Пропуск вызывает дискомфорт — это хороший знак."
                status="warning"
              />
              <TimelinePhase
                phase="Фаза автоматизма"
                days="66+ дней"
                percent={90}
                desc="Привычка сформирована. Тренировка становится частью идентичности — ты не «человек, который тренируется», ты просто такая. Это необратимо."
                status="success"
              />
            </div>

            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-xs text-white/25 leading-relaxed text-center">
                Данные: мета-анализ 27 исследований, Европейский журнал социальной
                психологии. Медиана — 66 дней, диапазон 18–254 дня в зависимости
                от сложности привычки.
              </p>
            </div>
          </div>

          <p className="text-lg text-white/60 leading-relaxed">
            Ключевой вывод: первые 3 недели — самые тяжёлые. Если ты их
            прошла — дальше будет только легче. Это не мотивационная фраза, а
            нейробиология: нейронные связи буквально укрепляются с каждым
            повторением.
          </p>
        </section>

        {/* Секция 4 — 5 стратегий */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Target}
            title="5 стратегий, которые реально работают"
            number="04"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Не абстрактные советы «будь дисциплинированной», а конкретные
            техники, подтверждённые исследованиями.
          </p>

          <div className="space-y-4">
            <StrategyCard
              number="01"
              title="Правило двух минут"
              desc="Любая привычка начинается с версии, которая занимает 2 минуты. Не «45-минутная тренировка», а «надень форму и сделай 5 приседаний». Если после этого захочешь продолжить — продолжай. Нет — ты всё равно победила. Мозг запомнил: ты тренируешься."
              insight="Исследование: когда порог входа снижается до 2 минут, вероятность выполнения вырастает на 70%."
            />
            <StrategyCard
              number="02"
              title="Привязка к якорю"
              desc="Прикрепи тренировку к действию, которое ты уже делаешь каждый день. «После утреннего кофе — коврик». «Ребёнок уснул — 20 минут для себя». Якорь создаёт автоматический сигнал, и тебе не нужно помнить или планировать."
              insight="Привычки инициации (habit stacking) увеличивают частоту тренировок в 2–3 раза по данным Iowa State University."
            />
            <StrategyCard
              number="03"
              title="Подготовь среду"
              desc="Коврик разложен с вечера. Форма лежит на стуле. Гантели стоят на виду. Каждый визуальный барьер, который ты убираешь — это минус одно волевое решение. А у тебя их ограниченное количество в день."
              insight="Привычки подготовки (preparation habits) — второй по силе предиктор долгосрочной регулярности."
            />
            <StrategyCard
              number="04"
              title="Правило «никогда не два раза подряд»"
              desc="Пропустила тренировку? Бывает. Пропустила две подряд? Это начало конца привычки. Одно правило: после пропуска — следующая тренировка обязательна. Даже если на 10 минут. Даже если в плохом настроении."
              insight="Исследования показывают: один пропуск не влияет на формирование привычки. Два подряд — снижают вероятность продолжения на 60%."
            />
            <StrategyCard
              number="05"
              title="Сделай приятно, а не больно"
              desc="Если ты ненавидишь тренировку — ты её бросишь, это неизбежно. Выбирай формат, который нравится. Включай любимую музыку. Тренируйся в красивой форме. Мозг формирует привычки только к тому, что приносит хоть каплю удовольствия."
              insight="Участники, которые выбирали тренировки по удовольствию, а не по «эффективности», показали на 200% большую регулярность."
            />
          </div>
        </section>

        {/* Секция 5 — Платформа MargoFitness */}
        <section className="mb-14 text-left">
          <div className="rounded-[2rem] bg-gradient-to-br from-rose-500/[0.06] via-white/[0.02] to-transparent border border-rose-500/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-rose-500/5 blur-[80px]" />

            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400/50 mb-3">
                Как MargoFitness помогает
              </p>
              <h3 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-4">
                Платформа, которая строит привычки,{" "}
                <span className="text-rose-400">а не наказывает за пропуски</span>
              </h3>

              <p className="text-base text-white/50 leading-relaxed mb-8 max-w-2xl">
                Большинство фитнес-приложений работают по принципу «пропустил —
                потерял серию». Это демотивирует. MargoFitness работает иначе:
                мы помогаем встроить тренировки и здоровые привычки в твою жизнь,
                а не заставляем выполнять план любой ценой.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PlatformFeature
                  icon={CalendarCheck}
                  title="Трекер привычек"
                  desc="Отслеживай не только тренировки, но и сон, воду, шаги, питание. Визуальные серии формируют петлю награды — каждая отмеченная привычка подкрепляет следующую."
                />
                <PlatformFeature
                  icon={Users}
                  title="Сообщество"
                  desc="Ты не одна. Когда видишь, что другие девочки тренируются, делятся прогрессом и поддерживают друг друга — это мощнейший социальный триггер для твоей привычки."
                />
                <PlatformFeature
                  icon={BarChart3}
                  title="Прогресс без давления"
                  desc="Мягкие напоминания вместо агрессивных уведомлений. Статистика, которая показывает рост, а не подсчитывает промахи. Система, которая работает с тобой, а не против."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Секция 6 — Что делать с пропуском */}
        <section className="mb-14 text-left">
          <SectionHeader
            icon={Heart}
            title="Пропустила тренировку — и что теперь?"
            number="05"
          />

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Главная причина, по которой люди бросают после пропуска — стыд.
            «Всё, сорвалась, какой смысл продолжать». Это когнитивное
            искажение называется «эффект какого чёрта» (what-the-hell effect).
            Вот как с ним работать:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7 text-left">
              <div className="flex items-center gap-2.5 mb-4">
                <X className="size-4.5 text-white/20" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                  Как думают те, кто бросает
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "«Пропустила = провал»",
                  "«Нужно начинать сначала»",
                  "«У меня нет дисциплины»",
                  "«Все усилия пропали»",
                ].map((text, i) => (
                  <p key={i} className="text-sm text-white/30 italic leading-relaxed pl-4 border-l border-white/5">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-6 md:p-7 text-left">
              <div className="flex items-center gap-2.5 mb-4">
                <CheckCircle2 className="size-4.5 text-rose-400/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400/60">
                  Как думают те, кто остаётся
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "«Один пропуск — это статистический шум»",
                  "«Продолжаю с того места, где остановилась»",
                  "«Даже 5 минут — это тренировка»",
                  "«Я строю систему, а не серию»",
                ].map((text, i) => (
                  <p key={i} className="text-sm text-rose-400/50 italic leading-relaxed pl-4 border-l border-rose-500/20">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/12 p-6 md:p-8 text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="size-4 text-rose-400/80" />
                </div>
                <p className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-rose-400/70">
                  Совет от Марго
                </p>
              </div>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                У меня есть клиентки, которые тренируются уже два года. И знаешь,
                что у них общего? Каждая из них пропускала тренировки. Не раз и не
                два. Но они возвращались. Не с понедельника, не с нового месяца —
                на следующий день. Это единственное, что отличает тех, кто
                добился результата.
              </p>
            </div>
          </div>
        </section>

        {/* Резюме — чеклист */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-6">
            Твой чеклист на первые 66 дней
          </h2>

          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Не пытайся внедрить всё сразу. Выбери 2–3 пункта и начни с них.
            Остальные добавишь, когда первые станут автоматическими.
          </p>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8">
            <div className="space-y-0">
              {[
                "Выбери конкретное время и якорное действие для тренировки",
                "Подготовь форму и коврик с вечера",
                "Начинай с 2 минут — не с часа",
                "После тренировки — маленькая награда (чай, отметка в трекере)",
                "Не пропускай два раза подряд — это красная линия",
                "Найди сообщество или подругу для взаимной поддержки",
                "Отслеживай прогресс — даже минимальный",
                "Если не хочется — делай минимум, но делай",
              ].map((item, i) => (
                <ChecklistItem key={i} index={i + 1} text={item} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Начни сегодня.
            <br />
            <span className="text-rose-400">Не с понедельника.</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            66 дней — и тренировка станет частью тебя. Первый шаг — самый
            маленький. Сделай его прямо сейчас.
          </p>
          <button className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-rose-500/15 mb-2">
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
  number,
}: {
  icon: React.ElementType;
  title: string;
  number: string;
}) {
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-rose-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/40 leading-none mb-1">
          Часть {number}
        </p>
        <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function HabitLoopCard({
  step,
  title,
  subtitle,
  desc,
  icon: Icon,
}: {
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/8 p-5 md:p-6 hover:bg-white/[0.04] transition-colors text-left">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center">
          <span className="text-xs font-oswald font-black text-rose-400">
            {step}
          </span>
        </div>
        <div>
          <h4 className="text-base font-bold text-white/85 leading-none">
            {title}
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function TimelinePhase({
  phase,
  days,
  percent,
  desc,
  status,
}: {
  phase: string;
  days: string;
  percent: number;
  desc: string;
  status: "danger" | "warning" | "success";
}) {
  const colors = {
    danger: {
      bar: "bg-rose-500/60",
      text: "text-rose-400",
      bg: "bg-rose-500/[0.06]",
      border: "border-rose-500/15",
      dot: "bg-rose-500 shadow-rose-500/30",
    },
    warning: {
      bar: "bg-amber-500/60",
      text: "text-amber-400",
      bg: "bg-amber-500/[0.06]",
      border: "border-amber-500/15",
      dot: "bg-amber-500 shadow-amber-500/30",
    },
    success: {
      bar: "bg-emerald-500/60",
      text: "text-emerald-400",
      bg: "bg-emerald-500/[0.06]",
      border: "border-emerald-500/15",
      dot: "bg-emerald-500 shadow-emerald-500/30",
    },
  };

  const c = colors[status];

  return (
    <div className={cn("rounded-xl border p-5 md:p-6", c.bg, c.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("size-2.5 rounded-full shadow-[0_0_6px]", c.dot)} />
          <h4 className={cn("text-sm font-bold", c.text)}>{phase}</h4>
        </div>
        <span className="text-xs font-bold text-white/30">{days}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 mb-3 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", c.bar)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function StrategyCard({
  number,
  title,
  desc,
  insight,
}: {
  number: string;
  title: string;
  desc: string;
  insight: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-6 md:p-7 text-left">
      <div className="flex items-start gap-4">
        <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
          <span className="text-sm font-oswald font-black text-rose-400">
            {number}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg md:text-xl font-bold text-white/90 mb-2">
            {title}
          </h4>
          <p className="text-sm text-white/45 leading-relaxed mb-4">{desc}</p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/[0.04] border border-rose-500/8">
            <TrendingUp className="size-3.5 text-rose-400/50 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-400/50 leading-relaxed italic">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformFeature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-5 md:p-6 text-left">
      <div className="size-9 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center mb-3">
        <Icon className="size-4.5 text-rose-400" />
      </div>
      <h4 className="text-sm font-bold text-white/80 mb-1.5">{title}</h4>
      <p className="text-xs text-white/35 leading-relaxed">{desc}</p>
    </div>
  );
}

function ChecklistItem({ index, text }: { index: number; text: string }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-b-0">
      <div className="size-7 rounded-lg bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-oswald font-black text-rose-400">
          {index}
        </span>
      </div>
      <p className="text-sm md:text-base text-white/55 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
