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
          className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${displayClassName || ''} ${isLoading ? 'opacity-50' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : currentOption?.label || value}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(option => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={option.className}
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
        className="w-24 h-7 text-sm"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      {value} {suffix || ''}
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
        className="w-48 h-7 text-sm"
        autoFocus
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      {value ? new Date(value).toLocaleDateString('ru-RU') : '—'}
    </button>
  )
}

