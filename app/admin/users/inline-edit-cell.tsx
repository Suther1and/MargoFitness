'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, Plus, Minus, X, Check, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineSelectProps {
  value: string
  options: { value: string; label: string; className?: string }[]
  onSave: (value: string) => Promise<void>
  displayClassName?: string
}

export function InlineSelect({ value, options, onSave, displayClassName }: InlineSelectProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSelect = async (newValue: string) => {
    if (newValue === value) return
    setIsLoading(true)
    try {
      await onSave(newValue)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentOption = options.find(opt => opt.value === value)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95 ring-1 flex items-center gap-2",
            displayClassName || 'bg-white/5 text-white ring-white/10',
            isLoading && "opacity-50"
          )}
          disabled={isLoading}
        >
          {isLoading ? '...' : currentOption?.label || value}
          <ChevronDown className="size-3 opacity-40" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white min-w-[160px] p-2 rounded-2xl shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]">
        {options.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "cursor-pointer px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-1 last:mb-0",
              "hover:bg-white/5 focus:bg-white/5 focus:text-white outline-none",
              option.className
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface FilterSelectProps {
  name: string
  defaultValue: string
  options: { value: string; label: string; className?: string }[]
  placeholder: string
}

export function FilterSelect({ name, defaultValue, options, placeholder }: FilterSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    router.push(`?${params.toString()}`)
  }

  const currentOption = options.find(opt => opt.value === defaultValue)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button 
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all cursor-pointer min-w-[100px] hover:bg-white/10 flex items-center justify-between gap-2"
        >
          <span>{currentOption?.label || placeholder}</span>
          <ChevronDown className="size-3 opacity-40" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white min-w-[160px] p-2 rounded-2xl shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)]">
        <DropdownMenuItem 
          onClick={() => handleSelect('all')}
          className={cn(
            "cursor-pointer px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-1 outline-none",
            defaultValue === 'all' ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/60"
          )}
        >
          {placeholder}
        </DropdownMenuItem>
        {options.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "cursor-pointer px-3 py-2.5 rounded-xl text-xs font-medium transition-all mb-1 last:mb-0 outline-none",
              defaultValue === option.value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/60",
              option.className
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface InlineNumberInputProps {
  value: number
  onSave: (value: number) => Promise<void>
  min?: number
  max?: number
  suffix?: string
}

export function InlineNumberInput({ value, onSave, min, max, suffix }: InlineNumberInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    const numValue = parseInt(editValue)
    if (isNaN(numValue) || numValue === value) {
      setIsEditing(false)
      setEditValue(value.toString())
      return
    }
    
    if (min !== undefined && numValue < min) {
      setEditValue(value.toString())
      setIsEditing(false)
      return
    }
    
    if (max !== undefined && numValue > max) {
      setEditValue(value.toString())
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onSave(numValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving:', error)
      setEditValue(value.toString())
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value.toString())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        min={min}
        max={max}
        className="w-24 h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl focus:ring-orange-500/50"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-xs font-medium text-white/80 hover:bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 transition-all active:scale-95"
    >
      {value.toLocaleString('ru-RU')} {suffix || ''}
    </button>
  )
}

interface InlineDateInputProps {
  value: string | null
  onSave: (value: string | null) => Promise<void>
  disabled?: boolean
  disabledMessage?: string
}

export function InlineDateInput({ value, onSave, disabled, disabledMessage }: InlineDateInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${d}.${m}.${y}`
  }

  const parseDate = (str: string) => {
    const [d, m, y] = str.split('.').map(Number)
    if (!d || !m || !y) return null
    const date = new Date(y, m - 1, d)
    return isNaN(date.getTime()) ? null : date
  }

  useEffect(() => {
    if (isEditing) {
      const initialDate = value ? new Date(value) : new Date()
      setEditValue(formatDate(initialDate))
    }
  }, [isEditing, value])

  const adjustDate = (days: number) => {
    const current = parseDate(editValue) || new Date()
    const newDate = new Date(current.getTime() + days * 24 * 60 * 60 * 1000)
    setEditValue(formatDate(newDate))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    
    let formatted = val
    if (val.length > 2) formatted = val.slice(0, 2) + '.' + val.slice(2)
    if (val.length > 4) formatted = formatted.slice(0, 5) + '.' + val.slice(4)
    
    setEditValue(formatted)
  }

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    // ВАЖНО: Останавливаем всплытие, чтобы не триггерить закрытие шторки
    if (e) {
      e.stopPropagation();
    }
    
    const parsed = parseDate(editValue)
    if (!parsed) {
      if (!editValue) {
        await onSave(null)
        setIsEditing(false)
      }
      return
    }

    parsed.setHours(23, 59, 59, 999)
    const newValue = parsed.toISOString()
    
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onSave(newValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave(e)
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setIsEditing(false)
    }
  }

  const isExpired = mounted ? (value ? new Date(value) < new Date() : true) : false

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) setIsEditing(true)
        }}
        disabled={disabled}
        title={disabled ? disabledMessage : ''}
        className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all active:scale-95",
          disabled && "opacity-40 cursor-not-allowed grayscale",
          !value 
            ? "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            : isExpired 
              ? "bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10" 
              : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        <span className="text-xs font-medium">
          {value ? formatDate(new Date(value)) : 'Нет срока'}
        </span>
        {!disabled && <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-1" />}
      </button>

      {isEditing && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[8px] animate-in fade-in duration-300 flex items-center justify-center p-4" 
            onClick={() => setIsEditing(false)}
          >
            <div 
              className={cn(
                "relative z-[9999] w-full max-w-[360px] bg-[#1a1a24] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-orange-500/10 ring-1 ring-orange-500/20">
                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white uppercase tracking-wider font-oswald">Срок подписки</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Управление доступом</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Adjust Grid */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '7 дн', val: 7 },
                    { label: '1 мес', val: 30 },
                    { label: '3 мес', val: 90 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => adjustDate(item.val)}
                      className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all group active:scale-95"
                    >
                      <div className="flex items-center gap-1 text-white group-hover:text-orange-400 mb-0.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '7 дн', val: -7 },
                    { label: '1 мес', val: -30 },
                    { label: '3 мес', val: -90 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => adjustDate(item.val)}
                      className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group active:scale-95"
                    >
                      <div className="flex items-center gap-1 text-white/40 group-hover:text-rose-400 mb-0.5">
                        <Minus className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input */}
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Clock className="w-5 h-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <Input
                    type="text"
                    value={editValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="ДД.ММ.ГГГГ"
                    disabled={isLoading}
                    className="w-full pl-12 pr-5 h-14 text-base bg-white/5 border-white/10 text-white rounded-[1.25rem] focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-medium tracking-widest"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(e)
                    }}
                    disabled={isLoading}
                    className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-[1.25rem] text-base font-bold shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    {isLoading ? '...' : 'Применить'}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave(null).then(() => setIsEditing(false))
                    }}
                    disabled={isLoading}
                    variant="ghost"
                    className="h-14 px-6 hover:bg-rose-500/10 hover:text-rose-400 text-white/20 rounded-[1.25rem] text-sm font-bold transition-all"
                  >
                    Сброс
                  </Button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
                <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-bold">
                  {(() => {
                    const parsed = parseDate(editValue)
                    if (!parsed) return 'Введите корректную дату'
                    const now = new Date()
                    now.setHours(0, 0, 0, 0)
                    const diffTime = parsed.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    let statusText = ''
                    if (diffDays < 0) statusText = `Истекла ${Math.abs(diffDays)} дн. назад`
                    else if (diffDays === 0) statusText = 'Истекает сегодня'
                    else statusText = `Осталось: ${diffDays} дн.`

                    return `Новая дата: ${editValue}`
                  })()}
                </p>
                <p className="text-[10px] text-orange-500/60 uppercase tracking-widest font-bold">
                  {(() => {
                    const parsed = parseDate(editValue)
                    if (!parsed) return ''
                    const now = new Date()
                    now.setHours(0, 0, 0, 0)
                    const diffTime = parsed.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    if (diffDays < 0) return `Истекла ${Math.abs(diffDays)} дн. назад`
                    if (diffDays === 0) return 'Истекает сегодня'
                    return `Доступ на ${diffDays} дн.`
                  })()}
                </p>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
