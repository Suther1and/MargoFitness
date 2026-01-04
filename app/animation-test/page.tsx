'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence, LayoutGroup, Reorder, MotionConfig } from 'framer-motion'
import { ChevronDown, Trash2, Zap, Square, Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const springConfig = { stiffness: 260, damping: 30 }

export default function AnimationTestPageV11() {
  const [mounted, setMounted] = useState(false)
  const [isExp, setIsExp] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3'])
  const [gridItems, setGridItems] = useState<number[]>([])
  const [isTeleported, setIsTeleported] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Force GPU acceleration
    document.documentElement.style.transform = 'translateZ(0)'
    document.documentElement.style.willChange = 'transform'
  }, [])

  if (!mounted) return null

  return (
    <MotionConfig reducedMotion="never" transition={springConfig}>
      <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-32 font-sans overflow-x-hidden" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
      <header className="max-w-xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">V11: STRESS TEST</h1>
        <p className="text-white/40 text-sm">Здесь собраны все тяжелые тесты. Если они лагают — мы начинаем "чистку" проекта.</p>
      </header>

      <div className="max-w-md mx-auto space-y-16">
        
        {/* 1. DISCLOSURE */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">1. Height & Content</h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6">
            <button onClick={() => setIsExp(!isExp)} className="w-full flex items-center justify-between font-bold">
              <span>Expand Details</span>
              <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={springConfig}>
                <ChevronDown />
              </motion.div>
            </button>
            <AnimatePresence>
              {isExp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springConfig}
                  className="overflow-hidden"
                >
                  <div className="pt-6 space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ delay: 0.2, ...springConfig }} className="h-full bg-amber-500" />
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">Это тест на синхронизацию высоты и внутренних элементов.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 2. TABS */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">2. Floating Tabs</h2>
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6">
            <div className="flex relative bg-white/5 rounded-[1.5rem] p-1 mb-6">
              {[0, 1, 2].map((i) => (
                <button key={i} onClick={() => setActiveTab(i)} className="flex-1 py-3 relative z-10 text-[10px] font-black uppercase tracking-widest">
                  <span className={activeTab === i ? "text-black" : "text-white/40"}>Tab {i + 1}</span>
                  {activeTab === i && (
                    <motion.div layoutId="pill" className="absolute inset-0 bg-white rounded-xl -z-10" transition={springConfig} />
                  )}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springConfig}
                className="space-y-4"
              >
                {activeTab === 0 && (
                  <div className="space-y-3">
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                    <div className="h-3 bg-white/10 rounded-full w-[90%]" />
                    <div className="h-3 bg-white/10 rounded-full w-[95%]" />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl" />
                      <div className="h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl" />
                    </div>
                    <p className="text-xs text-white/40 mt-4">Tab 1: Если этот контент мерцает при переключении — проблема в AnimatePresence</p>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="space-y-3">
                    <div className="h-3 bg-white/10 rounded-full w-[85%]" />
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                    <div className="h-3 bg-white/10 rounded-full w-[80%]" />
                    <div className="aspect-video bg-white/5 rounded-2xl mt-4 flex items-center justify-center">
                      <Square className="text-white/20" size={32} />
                    </div>
                    <p className="text-xs text-white/40 mt-4">Tab 2: Большой контент для демонстрации лагов</p>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-3">
                    <div className="h-3 bg-white/10 rounded-full w-[75%]" />
                    <div className="h-3 bg-white/10 rounded-full w-[95%]" />
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-xl" />
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-4">Tab 3: Сетка элементов для стресс-теста</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 3. REORDER LIST */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">3. Drag & Drop List</h2>
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <Reorder.Item
                  key={item}
                  value={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={springConfig}
                  className="p-5 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-between cursor-grab active:cursor-grabbing"
                >
                  <span className="font-medium">{item}</span>
                  <button onClick={() => setItems(items.filter(i => i !== item))} className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
          <button 
            onClick={() => setItems([...items, `Item ${items.length + 1}`])}
            className="w-full py-4 bg-white/5 border border-dashed border-white/20 rounded-3xl text-[10px] font-black uppercase text-white/40"
          >
            + Add New
          </button>
        </section>

        {/* 4. HEAVY GRID */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">4. Staggered Grid (Heavy)</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setGridItems(Array.from({ length: 12 }, (_, i) => i))} className="flex-1 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-black text-[10px]">GENERATE 12</button>
            <button onClick={() => setGridItems([])} className="p-3 bg-white/5 rounded-xl"><RefreshCw size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <AnimatePresence>
              {gridItems.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ ...springConfig, delay: i * 0.05 }}
                  className="aspect-square bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center"
                >
                  <Zap size={16} className="text-amber-500/20" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* 5. TELEPORTATION */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">5. Magic Move</h2>
          <div className="flex gap-4 h-32">
            <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
              {!isTeleported && <motion.div layoutId="box" className="w-12 h-12 bg-amber-500 rounded-2xl shadow-2xl" transition={springConfig} />}
            </div>
            <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
              {isTeleported && <motion.div layoutId="box" className="w-12 h-12 bg-amber-500 rounded-2xl shadow-2xl" transition={springConfig} />}
            </div>
          </div>
          <button onClick={() => setIsTeleported(!isTeleported)} className="w-full py-4 bg-white text-black rounded-[2rem] font-black uppercase text-[10px]">MOVE OBJECT</button>
        </section>

      </div>
    </div>
    </MotionConfig>
  )
}
