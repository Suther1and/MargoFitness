'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

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
}

export function InlineDateInput({ value, onSave }: InlineDateInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(
    value ? new Date(value).toISOString().slice(0, 16) : ''
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    const newValue = editValue ? new Date(editValue).toISOString() : null
    
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
      setEditValue(value ? new Date(value).toISOString().slice(0, 16) : '')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(value ? new Date(value).toISOString().slice(0, 16) : '')
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        type="datetime-local"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-48 h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl focus:ring-orange-500/50"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-xs font-medium text-white/60 hover:bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 transition-all active:scale-95"
    >
      {value ? new Date(value).toLocaleDateString('ru-RU') : '—'}
    </button>
  )
}
