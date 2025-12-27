'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'

type Period = 30 | 60 | 180 | 365

interface PricingData {
  basic: string
  pro: string
  elite: string
  period: string
}

const PRICING: Record<Period, PricingData> = {
  30: { basic: '2,900', pro: '4,900', elite: '15,000', period: '/30 дней' },
  60: { basic: '5,500', pro: '9,300', elite: '28,500', period: '/60 дней' },
  180: { basic: '15,600', pro: '26,460', elite: '81,000', period: '/180 дней' },
  365: { basic: '29,200', pro: '49,490', elite: '151,500', period: '/365 дней' }
}

export function PricingSection() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(30)
  const priceBasicRef = useRef<HTMLSpanElement>(null)
  const priceProRef = useRef<HTMLSpanElement>(null)
  const priceEliteRef = useRef<HTMLSpanElement>(null)
  const periodRefs = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    const data = PRICING[30]
    if (priceBasicRef.current) priceBasicRef.current.innerText = data.basic + ' ₽'
    if (priceProRef.current) priceProRef.current.innerText = data.pro + ' ₽'
    if (priceEliteRef.current) priceEliteRef.current.innerText = data.elite + ' ₽'
    periodRefs.current.forEach(el => {
      if (el) el.innerText = data.period
    })
  }, [])

  const animateValue = (element: HTMLElement | null, value: string) => {
    if (!element) return
    
    element.style.transition = 'all 0.2s ease-in'
    element.style.opacity = '0'
    element.style.filter = 'blur(4px)'
    element.style.transform = 'translateY(5px)'
    
    setTimeout(() => {
      element.innerText = value + ' ₽'
      element.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      element.style.opacity = '1'
      element.style.filter = 'blur(0px)'
      element.style.transform = 'translateY(0)'
    }, 200)
  }

  const handlePeriodChange = (days: Period) => {
    const data = PRICING[days]
    
    animateValue(priceBasicRef.current, data.basic)
    animateValue(priceProRef.current, data.pro)
    animateValue(priceEliteRef.current, data.elite)
    
    periodRefs.current.forEach(el => {
      if (el) {
        el.style.transition = 'opacity 0.2s ease-in'
        el.style.opacity = '0'
        setTimeout(() => {
          el.innerText = data.period
          el.style.transition = 'opacity 0.3s ease-out'
          el.style.opacity = '1'
        }, 200)
      }
    })
    
    setSelectedPeriod(days)
  }

  return (
    <section className="pt-20 pb-20 relative overflow-hidden bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="bg-neutral-900 rounded-[3rem] px-6 py-16 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-3xl text-center mb-10">
            <span className="text-sm font-medium font-space tracking-widest uppercase mb-2 block text-white/50">
              Твоя инвестиция в себя
            </span>
            <h2 className="text-4xl sm:text-5xl tracking-tight mt-2 font-oswald font-normal text-white">
              ВЫБЕРИ СВОЙ ПУТЬ
            </h2>
            <p className="mt-4 font-inter max-w-xl mx-auto text-white/60">
              Гибкие тарифы для любых целей. Выбери срок подписки и начни трансформацию.
            </p>
          </div>
          
          <div className="relative z-10 flex justify-center mb-12">
            <div className="p-1.5 rounded-full inline-flex border backdrop-blur-sm border-white/10 bg-neutral-800/50">
              {([30, 60, 180, 365] as Period[]).map((days) => (
                <button
                  key={days}
                  onClick={() => handlePeriodChange(days)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                    selectedPeriod === days
                      ? 'shadow-md text-white bg-neutral-800'
                      : 'text-neutral-400 bg-transparent hover:text-white'
                  }`}
                >
                  {days} Дней
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            
            <div className="flex flex-col relative overflow-hidden rounded-3xl border p-8 backdrop-blur transition-all hover:bg-white/10 duration-300 bg-white/5 border-white/10">
              <div className="mb-6">
                <h3 className="text-xl font-medium tracking-wide font-oswald uppercase text-white">BASIC</h3>
                <p className="text-sm mt-2 font-space uppercase tracking-wider text-white/50">Для старта</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 overflow-hidden">
                  <span ref={priceBasicRef} className="text-4xl font-semibold tracking-tight font-oswald text-white block" />
                  <span ref={(el) => { if (el) periodRefs.current[0] = el }} className="text-sm font-space text-white/40" />
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>2 тренировки в неделю</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>База знаний (питание)</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/30">
                  <X className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-700" strokeWidth={2} />
                  <span>Доступ в чат</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/30">
                  <X className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-700" strokeWidth={2} />
                  <span>Обратная связь</span>
                </li>
              </ul>
              <button className="w-full mt-auto rounded-xl px-6 py-4 text-xs tracking-widest font-semibold uppercase transition border font-space bg-white/5 text-white hover:bg-white/20 border-white/10 hover:border-white/30">
                Выбрать Basic
              </button>
            </div>

            <div className="flex flex-col relative overflow-hidden rounded-3xl border p-8 shadow-2xl transform md:scale-105 z-10 bg-zinc-100 border-white/20">
              <div className="absolute top-6 right-6">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest border font-space text-white bg-pink-600 border-pink-500">
                  Хит продаж
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-medium tracking-wide font-oswald uppercase text-neutral-900">PRO</h3>
                <p className="text-sm mt-2 font-space uppercase tracking-wider text-neutral-500">Оптимальный выбор</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 overflow-hidden">
                  <span ref={priceProRef} className="text-5xl font-semibold tracking-tight font-oswald text-neutral-900 block" />
                  <span ref={(el) => { if (el) periodRefs.current[1] = el }} className="text-sm font-space text-neutral-400" />
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-inter text-neutral-700">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-pink-600" strokeWidth={2} />
                  <span>3 тренировки в неделю</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-neutral-700">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-pink-600" strokeWidth={2} />
                  <span>Закрытый Telegram чат</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-neutral-700">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-pink-600" strokeWidth={2} />
                  <span>Проверка техники упражнений</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-neutral-700">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-pink-600" strokeWidth={2} />
                  <span>Доступ ко всем материалам</span>
                </li>
              </ul>
              <button className="w-full mt-auto rounded-xl px-6 py-4 text-xs tracking-widest font-semibold uppercase transition font-space shadow-lg text-white bg-neutral-900 hover:bg-neutral-800 hover:shadow-neutral-900/20">
                Начать сейчас
              </button>
            </div>

            <div className="flex flex-col relative overflow-hidden rounded-3xl border p-8 backdrop-blur transition-all hover:bg-white/10 duration-300 bg-white/5 border-white/10">
              <div className="mb-6">
                <h3 className="text-xl font-medium tracking-wide font-oswald uppercase text-white">ELITE</h3>
                <p className="text-sm mt-2 font-space uppercase tracking-wider text-white/50">VIP Сопровождение</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 overflow-hidden">
                  <span ref={priceEliteRef} className="text-4xl font-semibold tracking-tight font-oswald text-white block" />
                  <span ref={(el) => { if (el) periodRefs.current[2] = el }} className="text-sm font-space text-white/40" />
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>Персональное ведение</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>Индивидуальный план питания</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>Прямая связь в мессенджерах</span>
                </li>
                <li className="flex items-start gap-3 text-sm font-inter text-white/80">
                  <Check className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] text-neutral-500" strokeWidth={2} />
                  <span>Видеозвонки раз в неделю</span>
                </li>
              </ul>
              <button className="w-full mt-auto rounded-xl px-6 py-4 text-xs tracking-widest font-semibold uppercase transition border font-space bg-white/5 text-white hover:bg-white/20 border-white/10 hover:border-white/30">
                Оставить заявку
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-center">
            <p className="text-sm font-inter text-white/40">
              Есть вопросы?{' '}
              <a href="#" className="underline transition-all text-white/80 hover:text-white decoration-white/30 hover:decoration-white">
                Напишите нам в поддержку
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

