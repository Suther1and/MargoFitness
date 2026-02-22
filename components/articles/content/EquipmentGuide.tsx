"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ArrowRight,
  Quote,
  Lightbulb,
  Dumbbell,
  ShoppingBag,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Layers,
  Ruler,
  Wallet,
  ArrowUpDown,
  Replace,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useArticleReadTracking } from "@/app/dashboard/health-tracker/hooks/use-article-read-tracking";
import { markArticleAsRead } from "@/lib/actions/articles";

type Priority = "must" | "recommended" | "optional";

interface EquipmentItem {
  name: string;
  priority: Priority;
  priceRange: string;
  description: string;
  howToChoose: string;
  alternatives: string[];
  usedFor: string;
  image?: string;
}

const EQUIPMENT: EquipmentItem[] = [
  {
    name: "Коврик",
    priority: "must",
    priceRange: "800–2 500 ₽",
    description:
      "Основа любой домашней тренировки. Защищает суставы, даёт сцепление с полом, обозначает рабочую зону - психологически это важно.",
    howToChoose:
      "Толщина 8–12 мм для силовых (тоньше - колени будут болеть на полу). Материал - TPE или NBR, они не впитывают пот и не скользят. Длина - минимум 180 см. Ширина стандарт - 61 см, для комфорта можно 80 см.",
    alternatives: [
      "Сложенное вдвое одеяло (временно)",
      "Туристический каремат",
    ],
    usedFor: "Все упражнения на полу: планки, скручивания, ягодичные мосты, растяжка",
  },
  {
    name: "Гантели",
    priority: "must",
    priceRange: "1 500–8 000 ₽",
    description:
      "Главный инструмент в тренировках MargoFitness. 80% упражнений в программе используют гантели - от приседаний до жимов.",
    howToChoose:
      "Начни с двух пар: 2 кг и 4 кг - этого достаточно для старта. Через 2–3 месяца добавь 5–6 кг. Неопреновые - удобные, не скользят, тихие. Виниловые - дешевле. Разборные - экономят место и деньги, но менять вес между подходами дольше.",
    alternatives: [
      "Бутылки с водой 0.5–1.5 л (1–1.5 кг каждая)",
      "Бутылка 5 л (5 кг) для приседаний и становых",
      "Рюкзак с книгами",
    ],
    usedFor:
      "Приседания, выпады, жимы, тяги, подъёмы на бицепс, разведения - большинство упражнений программы",
  },
  {
    name: "Стул или диван",
    priority: "must",
    priceRange: "0 ₽ - уже есть дома",
    description:
      "Опора для болгарских выпадов, отжиманий с возвышением, обратных отжиманий на трицепс и упражнений на баланс.",
    howToChoose:
      "Устойчивый, без колёсиков. Высота сиденья 40–50 см. Диван подходит для большинства упражнений. Для болгарских выпадов нужна жёсткая опора - стул лучше.",
    alternatives: [
      "Устойчивая тумба или ступенька",
      "Край кровати (для некоторых упражнений)",
    ],
    usedFor: "Болгарские выпады, обратные отжимания, степ-апы, наклонные отжимания",
  },
  {
    name: "Фитнес-резинка",
    priority: "recommended",
    priceRange: "400–1 500 ₽ (набор)",
    description:
      "Создаёт сопротивление без гравитации - идеально для активации ягодиц и мелких мышц-стабилизаторов, которые гантели не нагружают.",
    howToChoose:
      "Набор из 3 резинок разной жёсткости (лёгкая, средняя, тяжёлая). Тканевые - не скатываются, не рвутся, не тянут волоски. Латексные дешевле, но менее комфортны.",
    alternatives: [
      "Колготки, завязанные узлом (минимальное сопротивление)",
      "Эспандер",
    ],
    usedFor: "Разведение ног, ягодичные мосты с резинкой, ходьба в приседе, активация ягодиц в разминке",
  },
  {
    name: "Бодибар",
    priority: "optional",
    priceRange: "1 200–3 000 ₽",
    description:
      "Утяжелённая палка 3–10 кг. Удобна для приседаний на плечах, наклонов, ротаций корпуса. Даёт ощущение штанги без штанги.",
    howToChoose:
      "Для начинающих - 5 кг. Длина 120 см - стандарт. Резиновое покрытие на концах защитит пол. Если бюджет ограничен - это первое, от чего можно отказаться.",
    alternatives: [
      "Швабра или палка с утяжелением (повесить рюкзак)",
      "Гантели вместо бодибара в большинстве упражнений",
    ],
    usedFor: "Приседания, good morning, ротации, становая с прямыми ногами",
  },
  {
    name: "Полотенце",
    priority: "optional",
    priceRange: "0 ₽",
    description:
      "Не только для пота. Полотенце используется как слайдер для упражнений на гладком полу и как помощник для растяжки.",
    howToChoose:
      "Обычное банное полотенце. На ламинате и плитке оно работает как слайдер - подложи под стопу и делай скользящие выпады или сгибания ног.",
    alternatives: [],
    usedFor: "Скользящие выпады, сгибания ног лёжа, помощь при растяжке",
  },
];

export default function EquipmentGuide({
  onBack,
  metadata,
}: {
  onBack: () => void;
  metadata?: any;
}) {
  const { elementRef } = useArticleReadTracking({
    articleId: metadata?.id || "equipment-guide",
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
                <Clock className="h-3.5 w-3.5" /> 9 мин чтения
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-oswald font-black text-white uppercase tracking-tighter leading-[0.95] mb-8">
              Гид по оборудованию:{" "}
              <span className="text-rose-400">
                как собрать домашний зал
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-montserrat font-medium border-l-2 border-rose-400/30 pl-8 italic">
              Полный список инвентаря MargoFitness - что купить обязательно,
              что можно заменить тем, что уже есть дома, и как не переплатить.
            </p>
          </div>

          <div className="relative h-64 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale opacity-60"
              alt="Home gym equipment"
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
            Одна из лучших вещей в домашних тренировках - тебе <span className="text-white/90 font-bold">не нужен зал</span>,
            забитый тренажёрами. Все программы MargoFitness построены на
            минимальном инвентаре, который помещается в угол комнаты.
          </p>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed">
            Но «минимальный» не значит «любой». <span className="text-rose-400/85 font-bold underline decoration-rose-500/30 underline-offset-4">Правильно подобранные</span> гантели
            дадут результат. В этом гиде - конкретные рекомендации: что именно купить, какой вес
            выбрать, на чём можно сэкономить, а на чём <span className="text-white/90 font-bold">нельзя</span>.
          </p>
        </div>

        {/* Визуальная карта приоритетов */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-2">
            Что тебе понадобится
          </h2>
          <p className="text-base text-white/70 mb-8">
            Весь инвентарь разделён на <span className="text-white/85 font-bold">три категории</span>. Начни с обязательного -
            остальное добавишь по мере роста.
          </p>

          {/* Три колонки приоритетов */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <PriorityColumn
              priority="must"
              label="Обязательно"
              items={EQUIPMENT.filter((e) => e.priority === "must")}
              desc="Без этого невозможно выполнить программу"
            />
            <PriorityColumn
              priority="recommended"
              label="Рекомендуется"
              items={EQUIPMENT.filter((e) => e.priority === "recommended")}
              desc="Расширяет возможности и добавляет разнообразие"
            />
            <PriorityColumn
              priority="optional"
              label="По желанию"
              items={EQUIPMENT.filter((e) => e.priority === "optional")}
              desc="Приятный бонус, но не критично"
            />
          </div>

          {/* Общий бюджет */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center">
                  <Wallet className="size-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                    Минимальный набор
                  </p>
                  <p className="text-lg font-bold text-white/80">
                    Коврик + 2 пары гантелей
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-oswald font-black text-rose-400">
                  2 300
                </span>
                <span className="text-sm text-white/30">- 10 500 ₽</span>
              </div>
            </div>
            <p className="text-xs text-white/25 mt-3 leading-relaxed">
              Разброс зависит от бренда и материала. На маркетплейсах реально
              собрать хороший набор за 3 000–5 000 ₽. Это дешевле, чем один
              месяц абонемента в зал.
            </p>
          </div>
        </section>

        {/* Детальные карточки оборудования */}
        <section className="mb-14 text-left">
          <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white mb-2">
            Подробно о каждом предмете
          </h2>
          <p className="text-base text-white/40 mb-8">
            Нажми на карточку, чтобы развернуть рекомендации по выбору и
            альтернативы.
          </p>

          <div className="space-y-3">
            {EQUIPMENT.map((item, i) => (
              <EquipmentCard key={i} item={item} />
            ))}
          </div>

          <p className="text-sm text-white/30 italic leading-relaxed px-2 mt-6">
            Замены работают на старте, но для долгосрочного прогресса
            гантели стоит приобрести. Бутылки не дают точного контроля
            веса, а неудобный хват ухудшает технику и снижает эффективность.
          </p>
        </section>

        {/* Секция - Как выбрать вес гантелей */}
        <section className="mb-14 text-left">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
              <ArrowUpDown className="size-5 text-rose-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
              Как выбрать вес гантелей
            </h2>
          </div>

          <p className="text-lg text-white/70 leading-relaxed mb-8">
            Самый частый вопрос: <span className="text-white/85 font-bold italic">«Какой вес мне нужен?»</span>. Ответ зависит от
            группы мышц - верх и низ тела работают с <span className="text-rose-400/85 font-bold underline decoration-rose-500/20 underline-offset-4">разным весом</span>.
          </p>

          {/* Таблица весов по группам мышц */}
          <div className="rounded-2xl border border-white/10 overflow-hidden mb-8">
            <div className="grid grid-cols-4 text-center">
              <div className="p-3 md:p-4 bg-white/[0.02] border-b border-r border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Группа мышц
                </span>
              </div>
              <div className="p-3 md:p-4 bg-white/[0.02] border-b border-r border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Старт
                </span>
              </div>
              <div className="p-3 md:p-4 bg-white/[0.02] border-b border-r border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  3 месяца
                </span>
              </div>
              <div className="p-3 md:p-4 bg-rose-500/[0.04] border-b border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400/60">
                  6+ месяцев
                </span>
              </div>
            </div>

            {[
              {
                group: "Плечи, руки",
                start: "1–2 кг",
                mid: "2–3 кг",
                adv: "3–5 кг",
              },
              {
                group: "Спина, грудь",
                start: "2–3 кг",
                mid: "3–5 кг",
                adv: "5–7 кг",
              },
              {
                group: "Ноги, ягодицы",
                start: "3–4 кг",
                mid: "4–6 кг",
                adv: "6–8 кг",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 text-center border-b border-white/5 last:border-b-0"
              >
                <div className="p-3 md:p-4 text-left border-r border-white/10 text-sm font-medium text-white/50">
                  {row.group}
                </div>
                <div className="p-3 md:p-4 border-r border-white/10 text-sm text-white/40">
                  {row.start}
                </div>
                <div className="p-3 md:p-4 border-r border-white/10 text-sm text-white/40">
                  {row.mid}
                </div>
                <div className="p-3 md:p-4 text-sm font-medium text-rose-400 bg-rose-500/[0.02]">
                  {row.adv}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-rose-500/[0.04] border border-rose-500/12 p-5 md:p-6 text-left">
            <div className="flex gap-3.5">
              <Lightbulb className="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/55 leading-relaxed mb-2">
                  <strong className="text-rose-400/80">Правило выбора веса:</strong>{" "}
                  ты должна выполнить 12–15 повторений с правильной техникой,
                  но последние 2–3 повторения должны быть тяжёлыми. Если легко - вес
                  мал. Если техника ломается на 8-м повторении - вес велик.
                </p>
                <p className="text-sm text-white/55 leading-relaxed">
                  <strong className="text-rose-400/80">Оптимальная первая покупка:</strong>{" "}
                  две пары - 2 кг и 4 кг. Этого достаточно для всех упражнений
                  программы на первые 2–3 месяца.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Блок связи с программой */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 md:p-12 text-left group">
            <div className="absolute -inset-24 bg-rose-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Sparkles className="size-3.5 text-rose-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Твой следующий шаг</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-oswald font-black uppercase tracking-tight text-white leading-[0.95]">
                  Инвентарь готов? <br />
                  <span className="text-rose-400/85">Пора в дело</span>
                </h2>
                
                <p className="text-lg text-white/70 leading-relaxed">
                  Все тренировки MargoFitness адаптированы под тот набор оборудования, о котором мы только что говорили. <span className="text-white/85 font-bold">Никаких лишних тренажёров</span> - только ты, гантели и результат.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Check className="size-4 text-rose-400" />
                    <span className="text-xs font-bold text-white/70">Видео-инструкции</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <Check className="size-4 text-rose-400" />
                    <span className="text-xs font-bold text-white/70">Таймеры отдыха</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                      <Dumbbell className="size-6 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Ближайшая цель</p>
                      <h4 className="text-xl font-oswald font-black text-white uppercase">Full Body: Сила и Рельеф</h4>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-sm text-white/40">Длительность</span>
                      <span className="text-sm font-bold text-white/80">45 мин</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-sm text-white/40">Сложность</span>
                      <div className="flex gap-1">
                        <Star className="size-3 fill-rose-500 text-rose-500" />
                        <Star className="size-3 fill-rose-500 text-rose-500" />
                        <Star className="size-3 text-white/20" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={onBack}
                    className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Перейти к тренировкам
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                {/* Декоративные элементы */}
                <div className="absolute -top-6 -right-6 size-32 bg-rose-500/10 blur-3xl rounded-full -z-10" />
                <div className="absolute -bottom-6 -left-6 size-32 bg-rose-500/5 blur-3xl rounded-full -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Секция - Ошибки при покупке */}
        <section className="mb-14 text-left">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
              <ShoppingBag className="size-5 text-rose-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-oswald font-black uppercase tracking-tight text-white">
              5 ошибок при покупке инвентаря
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                mistake: "Купить сразу всё",
                fix: "Начни с коврика и одной пары гантелей. Через месяц поймёшь, что реально нужно. Бодибар и резинки могут вообще не пригодиться на твоём этапе.",
              },
              {
                mistake: "Взять слишком лёгкий вес «на всякий случай»",
                fix: "Гантели 0.5–1 кг - это для реабилитации, не для тренировок. Минимум 2 кг для верха тела и 3–4 кг для ног, иначе нагрузки не будет.",
              },
              {
                mistake: "Купить дорогой коврик, но тонкий",
                fix: "Толщина важнее бренда. Коврик 4 мм за 3 000 ₽ хуже коврика 10 мм за 1 200 ₽. Колени скажут спасибо.",
              },
              {
                mistake: "Выбрать разборные гантели для HIIT-тренировок",
                fix: "Разборные экономят деньги, но переключать вес между подходами за 15 секунд - нереально. Для круговых тренировок лучше фиксированные.",
              },
              {
                mistake: "Игнорировать поверхность пола",
                fix: "На скользком ламинате нужен коврик с текстурированной нижней стороной. На ковре наоборот - нужна гладкая нижняя сторона, чтобы не «тормозить».",
              },
            ].map((item, i) => (
              <MistakeCard key={i} index={i + 1} {...item} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-4 text-center py-8 md:py-12 border-t border-white/5 mt-8 md:mt-20 pb-32">
          <h2 className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter text-white mb-6">
            Инвентарь - это инвестиция
            <br />
            <span className="text-rose-400">в себя</span>
          </h2>
          <p className="text-white/40 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 px-4">
            Стоимость полного домашнего зала - как 2–3 месяца абонемента в
            фитнес-клуб. Только этот зал останется с тобой навсегда.
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

function PriorityColumn({
  priority,
  label,
  items,
  desc,
}: {
  priority: Priority;
  label: string;
  items: EquipmentItem[];
  desc: string;
}) {
  const styles = {
    must: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/[0.04]",
      badge: "bg-rose-500 text-white",
      dot: "bg-rose-400",
    },
    recommended: {
      border: "border-white/10",
      bg: "bg-white/[0.02]",
      badge: "bg-white/10 text-white/60",
      dot: "bg-white/30",
    },
    optional: {
      border: "border-white/8",
      bg: "bg-white/[0.01]",
      badge: "bg-white/5 text-white/40",
      dot: "bg-white/15",
    },
  };

  const s = styles[priority];

  return (
    <div className={cn("rounded-2xl border p-5 md:p-6 text-left", s.border, s.bg)}>
      <span
        className={cn(
          "inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-3",
          s.badge
        )}
      >
        {label}
      </span>
      <p className="text-xs text-white/25 leading-relaxed mb-4">{desc}</p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <div className={cn("size-1.5 rounded-full shrink-0", s.dot)} />
            <span className="text-sm text-white/60 font-medium">
              {item.name}
            </span>
            <span className="text-[10px] text-white/20 ml-auto whitespace-nowrap">
              {item.priceRange}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EquipmentCard({ item }: { item: EquipmentItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const priorityLabel = {
    must: { text: "Обязательно", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    recommended: {
      text: "Рекомендуется",
      color: "text-white/50 bg-white/5 border-white/10",
    },
    optional: {
      text: "По желанию",
      color: "text-white/30 bg-white/[0.03] border-white/8",
    },
  };

  const p = priorityLabel[item.priority];

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 overflow-hidden transition-all",
        isOpen ? "bg-white/[0.03]" : "bg-white/[0.01] hover:bg-white/[0.02]"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
      >
        <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
          <Dumbbell className="size-5 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base md:text-lg font-bold text-white/90 truncate">
              {item.name}
            </h4>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0",
                p.color
              )}
            >
              {p.text}
            </span>
          </div>
          <p className="text-xs text-white/30 truncate">{item.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:block text-sm font-medium text-white/30">
            {item.priceRange}
          </span>
          {isOpen ? (
            <ChevronUp className="size-4 text-white/20" />
          ) : (
            <ChevronDown className="size-4 text-white/20" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-4">
              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/50 mb-2">
                    Как выбрать
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.howToChoose}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Используется для
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {item.usedFor}
                  </p>
                </div>
              </div>

              {item.alternatives.length > 0 && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Чем заменить
                  </p>
                  <ul className="space-y-1.5">
                    {item.alternatives.map((alt, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-white/40"
                      >
                        <Replace className="size-3 text-rose-400/30 shrink-0" />
                        {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MistakeCard({
  index,
  mistake,
  fix,
}: {
  index: number;
  mistake: string;
  fix: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 md:p-6 text-left">
      <div className="flex items-start gap-3.5">
        <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-oswald font-black text-white/25">
            {index}
          </span>
        </div>
        <div>
          <h4 className="text-base font-bold text-white/70 mb-1.5">
            {mistake}
          </h4>
          <p className="text-sm text-white/40 leading-relaxed">{fix}</p>
        </div>
      </div>
    </div>
  );
}
