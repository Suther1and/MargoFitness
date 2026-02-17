"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  ArrowRight,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ExerciseCard = ({ title, muscle, technique, errors, index }: any) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden mb-8">
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white font-oswald font-black">
          {index + 1}
        </div>
        <div>
          <h3 className="text-xl font-oswald font-black uppercase text-white leading-none">{title}</h3>
          <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1">{muscle}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h4 className="text-white/90 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Техника
          </h4>
          <ul className="space-y-2">
            {technique.map((item: string, i: number) => (
              <li key={i} className="text-white/60 text-sm leading-relaxed flex gap-2">
                <span className="text-rose-500">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-white/90 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Ошибки
          </h4>
          <ul className="space-y-2">
            {errors.map((item: string, i: number) => (
              <li key={i} className="text-white/40 text-sm leading-relaxed italic flex gap-2">
                <span className="opacity-50">—</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default function HowToStartHomeWorkoutsInstance() {
  return (
    <div className="text-white/90">
      <article className="max-w-3xl mx-auto">
        
        {/* INTRO */}
        <header className="mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-oswald font-black uppercase tracking-tighter leading-[1.1] text-white mb-8"
          >
            Как начать тренироваться дома: <br />
            <span className="text-rose-500">от нуля до первых результатов</span>
          </motion.h1>
          
          <p className="text-xl text-white/60 leading-relaxed italic border-l-2 border-rose-500/30 pl-6 mb-12">
            Ты откладываешь тренировки уже третий месяц? Абонемент в зал кажется слишком дорогим или далёким? Правда в том, что для реального результата тебе не нужен зал. Твоя гостиная, правильная программа и 40 минут три раза в неделю дадут больше, чем хаотичные походы в фитнес-клуб.
          </p>
        </header>

        {/* CONTENT SECTION 1 */}
        <section className="mb-20">
          <h2 className="text-2xl font-oswald font-black uppercase text-white mb-6 flex items-center gap-3">
            <Zap className="text-rose-500 w-6 h-6" /> Почему домашние тренировки работают
          </h2>
          <p className="text-white/70 leading-relaxed mb-6">
            Американский колледж спортивной медицины (ACSM) проводил исследования эффективности домашнего тренинга. Результат: при соблюдении методики прирост мышечной массы и снижение процента жира у новичков, тренирующихся дома, <span className="text-white font-bold">не отличается от результатов зала</span>.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
              <h4 className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest mb-4">Влияет на результат:</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Регулярность</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Правильная техника</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Прогрессивная перегрузка</li>
              </ul>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
              <h4 className="text-rose-400 font-bold uppercase text-[10px] tracking-widest mb-4">НЕ влияет:</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> Цена абонемента</li>
                <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> Количество тренажёров</li>
                <li className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> Дорогая одежда</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PHYSIOLOGY */}
        <section className="mb-20 bg-white/[0.02] rounded-[2.5rem] p-8 md:p-12 border border-white/5">
          <h2 className="text-2xl font-oswald font-black uppercase text-white mb-8">Женская физиология</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">1</div>
              <div>
                <h4 className="text-white font-bold mb-2">Медленные мышечные волокна</h4>
                <p className="text-white/50 text-sm leading-relaxed">У женщин больше волокон типа I (медленные, выносливые). Это значит, что ты отлично реагируешь на 10-15 повторений со средним весом — идеальный формат для дома.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold">2</div>
              <div>
                <h4 className="text-white font-bold mb-2">Метаболизм эстрогена</h4>
                <p className="text-white/50 text-sm leading-relaxed">Эстроген усиливает синтез коллагена. Это даёт преимущество в гибкости, но требует особого внимания к суставам и технике.</p>
              </div>
            </div>
          </div>
        </section>

        {/* EXERCISES */}
        <section className="mb-20">
          <h2 className="text-2xl font-oswald font-black uppercase text-white mb-8">Базовая техника</h2>
          <ExerciseCard 
            index={0}
            title="Приседания"
            muscle="Ягодицы и Квадрицепс"
            technique={[
              "Ноги на ширине плеч, носки слегка врозь",
              "Опускайся, как будто садишься на стул (таз назад)",
              "Спина прямая, взгляд перед собой",
              "Подъём — мощный толчок пятками"
            ]}
            errors={[
              "Колени заваливаются внутрь",
              "Отрыв пяток от пола",
              "Круглая спина"
            ]}
          />
          <ExerciseCard 
            index={1}
            title="Отжимания"
            muscle="Грудь, Плечи, Трицепс"
            technique={[
              "Тело — прямая линия от головы до пяток",
              "Локти под углом 45 градусов к телу",
              "Опускайся до касания грудью пола",
              "Напрягай пресс, не давай тазу провисать"
            ]}
            errors={[
              "Провисание таза",
              "Локти разведены слишком широко",
              "Неполная амплитуда"
            ]}
          />
        </section>

        {/* EQUIPMENT BOX */}
        <section className="bg-rose-500 rounded-[2.5rem] p-8 md:p-12 text-black mb-20">
          <h2 className="text-3xl font-oswald font-black uppercase mb-6">Минимальный инвентарь</h2>
          <p className="text-black/70 mb-8 font-medium">Тебе не нужна тонна железа. Начни с этого минимума:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
              <h4 className="font-black uppercase text-sm mb-2">Коврик (6-8 мм)</h4>
              <p className="text-xs text-black/60">Защита суставов и безопасность при планках.</p>
            </div>
            <div className="bg-black/5 p-6 rounded-2xl border border-black/10">
              <h4 className="font-black uppercase text-sm mb-2">Гантели (2-5 кг)</h4>
              <p className="text-xs text-black/60">Для прогрессивной перегрузки мышц.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <footer className="text-center py-20 border-t border-white/5">
          <h3 className="text-3xl font-oswald font-black uppercase text-white mb-6">Готова к первой тренировке?</h3>
          <p className="text-white/40 mb-10 max-w-md mx-auto">Не жди понедельника. Твой результат начинается с первого приседания в твоей гостиной.</p>
          <Link href="/dashboard/workouts">
            <Button size="lg" className="h-16 px-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-lg font-black uppercase tracking-widest transition-all">
              Начать сейчас
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </Link>
        </footer>

      </article>
    </div>
  );
}
