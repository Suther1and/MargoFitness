'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import { LogOut, Mail, Phone, User, Copy, Check, Camera, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getTierDisplayName } from '@/lib/access-control'

interface MobileProfileCardProps {
  profile: Profile
  onEditClick: () => void
}

export function MobileProfileCard({ profile, onEditClick }: MobileProfileCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : null
  const displayPhone = profile.phone || null
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Styles configuration based on Tier (matching SubscriptionCard premium aesthetic)
  const getTheme = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          card: 'bg-gradient-to-br from-[#120f0a] via-[#1c1608] to-[#0a0905]',
          border: 'border-yellow-500/20',
          accent: 'text-yellow-400',
          badge: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
          glow: 'bg-yellow-500/10',
          ring: 'ring-yellow-500/30',
          pattern: 'rgba(234, 179, 8, 0.1)',
          button: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-200 border-yellow-500/20',
          logout: 'text-yellow-700 hover:text-red-400'
        }
      case 'pro':
        return {
          card: 'bg-gradient-to-br from-[#100a16] via-[#1a1025] to-[#050308]',
          border: 'border-purple-500/20',
          accent: 'text-purple-400',
          badge: 'bg-purple-500/10 border-purple-500/20 text-purple-200',
          glow: 'bg-purple-500/10',
          ring: 'ring-purple-500/30',
          pattern: 'rgba(168, 85, 247, 0.1)',
          button: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border-purple-500/20',
          logout: 'text-purple-700 hover:text-red-400'
        }
      case 'basic':
        return {
          card: 'bg-gradient-to-br from-[#160b05] via-[#211005] to-[#080402]',
          border: 'border-orange-500/20',
          accent: 'text-orange-400',
          badge: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
          glow: 'bg-orange-500/10',
          ring: 'ring-orange-500/30',
          pattern: 'rgba(249, 115, 22, 0.1)',
          button: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 border-orange-500/20',
          logout: 'text-orange-700 hover:text-red-400'
        }
      default:
        return {
          card: 'bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#050505]',
          border: 'border-white/10',
          accent: 'text-white/80',
          badge: 'bg-white/5 border-white/10 text-white/60',
          glow: 'bg-white/5',
          ring: 'ring-white/10',
          pattern: 'rgba(255, 255, 255, 0.05)',
          button: 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10',
          logout: 'text-white/40 hover:text-red-400'
        }
    }
  }

  const theme = getTheme(profile.subscription_tier)

  return (
    <div className="w-full relative group">
      {/* Dynamic Style for Pattern */}
      <style jsx>{`
        .profile-pattern-overlay {
          background-image: radial-gradient(circle at 1px 1px, ${theme.pattern} 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Main Card */}
      <div className={cn(
        "relative overflow-hidden rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 shadow-2xl min-h-[220px]",
        theme.card,
        theme.border
      )}>
        
        {/* Ambient Glows */}
        <div className={cn("absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-40 pointer-events-none", theme.glow)} />
        <div className={cn("absolute -bottom-20 -left-20 w-64 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none", theme.glow)} />
        <div className="absolute inset-0 profile-pattern-overlay opacity-50 pointer-events-none" />

        <div className="relative z-10 p-6 flex flex-col h-full gap-6">
          
          {/* Header Row: Avatar + Main Info + Actions */}
          <div className="flex items-start gap-5">
            {/* Avatar Section */}
            <div className="relative group/avatar shrink-0">
              <button 
                onClick={onEditClick}
                className={cn(
                  "relative w-20 h-20 rounded-full p-[2px] ring-2 ring-offset-2 ring-offset-black/50 overflow-hidden transition-all active:scale-95",
                  theme.ring
                )}
              >
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                    <User className="w-8 h-8 text-white/20" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <Camera className="w-6 h-6 text-white/80" />
                </div>
              </button>
              
              {/* Online/Status Indicator (Optional, cosmetic) */}
              <div className={cn(
                "absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/10"
              )}>
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", theme.accent.replace('text-', 'bg-'))} />
              </div>
            </div>

            {/* Name & Tier */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black font-oswald text-white uppercase tracking-tight leading-none truncate pr-2">
                    {displayName}
                  </h2>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.15em] w-fit",
                    theme.badge
                  )}>
                    {tierDisplayName}
                  </div>
                </div>
                
                {/* Edit Button (Mobile optimized) */}
                <button 
                  onClick={onEditClick}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors active:scale-95"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Contact Details */}
          <div className="space-y-3">
            {displayEmail && (
              <div 
                onClick={() => handleCopy(displayEmail, 'email')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 active:scale-[0.98] transition-all cursor-pointer group/item hover:bg-white/[0.05]"
              >
                <div className={cn("p-2 rounded-xl bg-white/5 shrink-0", theme.accent)}>
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider font-montserrat">Email</span>
                  <span className="text-xs font-medium text-white/80 truncate font-montserrat tracking-wide">{displayEmail}</span>
                </div>
                <div className="pr-1">
                  {copiedField === 'email' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/10 group-hover/item:text-white/40 transition-colors" />
                  )}
                </div>
              </div>
            )}

            {displayPhone && (
              <div 
                onClick={() => handleCopy(displayPhone, 'phone')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 active:scale-[0.98] transition-all cursor-pointer group/item hover:bg-white/[0.05]"
              >
                <div className={cn("p-2 rounded-xl bg-white/5 shrink-0", theme.accent)}>
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider font-montserrat">Телефон</span>
                  <span className="text-xs font-medium text-white/80 truncate font-montserrat tracking-wide">{displayPhone}</span>
                </div>
                <div className="pr-1">
                  {copiedField === 'phone' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/10 group-hover/item:text-white/40 transition-colors" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <a 
            href="/auth/logout"
            className={cn(
              "flex items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all active:scale-[0.98] mt-auto",
              "bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20 group/logout"
            )}
          >
            <LogOut className="w-4 h-4 text-red-400/60 group-hover/logout:text-red-400 transition-colors" />
            <span className="text-[10px] font-black text-red-400/60 group-hover/logout:text-red-400 uppercase tracking-[0.2em] transition-colors">
              Выйти из аккаунта
            </span>
          </a>

        </div>
      </div>
    </div>
  )
}
