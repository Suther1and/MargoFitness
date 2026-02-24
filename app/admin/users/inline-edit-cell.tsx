'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, Plus, Minus, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:brightness-110 active:scale-95 ring-1 ${displayClassName || 'bg-white/5 text-white ring-white/10'} ${isLoading ? 'opacity-50' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '...' : currentOption?.label || value}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1a1a24] border-white/10 text-white">
        {options.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`cursor-pointer hover:bg-white/5 focus:bg-white/5 transition-colors ${option.className}`}
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
  const [editValue, setEditValue] = useState('') // Формат ДД.ММ.ГГГГ
  const [isLoading, setIsLoading] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [popupPosition, setPopupPosition] = useState<'top' | 'bottom'>('top')

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
    if (isEditing && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
      
      if (rect.top < 400) {
        setPopupPosition('bottom')
      } else {
        setPopupPosition('top')
      }
      
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

  const handleSave = async () => {
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
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const isExpired = value ? new Date(value) < new Date() : true

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsEditing(true)}
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
          <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300" onClick={() => setIsEditing(false)} />
          <div 
            style={{
              position: 'absolute',
              top: popupPosition === 'top' ? coords.top - 12 : coords.top + 44,
              left: coords.left + (coords.width / 2),
              transform: 'translateX(-50%)',
              transformOrigin: popupPosition === 'top' ? 'bottom center' : 'top center'
            }}
            className={cn(
              "z-[9999] min-w-[320px] bg-[#1a1a24] border border-white/10 rounded-[2rem] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200",
              popupPosition === 'top' ? "-translate-y-full" : ""
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-wider font-oswald">Срок подписки</span>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Adjust Grid */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '7 дн', val: 7 },
                  { label: '1 мес', val: 30 },
                  { label: '3 мес', val: 90 }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => adjustDate(item.val)}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-0.5 text-white group-hover:text-orange-400 mb-0.5">
                      <Plus className="w-3 h-3" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '7 дн', val: -7 },
                  { label: '1 мес', val: -30 },
                  { label: '3 мес', val: -90 }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => adjustDate(item.val)}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-0.5 text-white/40 group-hover:text-rose-400 mb-0.5">
                      <Minus className="w-3 h-3" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Input */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <Input
                  type="text"
                  value={editValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ДД.ММ.ГГГГ"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 h-12 text-sm bg-white/5 border-white/10 text-white rounded-2xl focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-medium tracking-wider"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  {isLoading ? '...' : 'Применить'}
                </Button>
                <Button
                  onClick={() => onSave(null).then(() => setIsEditing(false))}
                  disabled={isLoading}
                  variant="ghost"
                  className="h-12 px-4 hover:bg-rose-500/10 hover:text-rose-400 text-white/20 rounded-2xl text-xs font-bold transition-all"
                >
                  Сброс
                </Button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center space-y-1">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
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

                  return `Новая дата: ${editValue} • ${statusText}`
                })()}
              </p>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
