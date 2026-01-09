'use client'

import { Profile } from '@/types/database'
import { getTierDisplayName } from '@/lib/access-control'
import { getMonthGenitiveCase } from '@/lib/utils'

interface DesktopProfileCardProps {
  profile: Profile
  onEditClick: () => void
}

export function DesktopProfileCard({ profile, onEditClick }: DesktopProfileCardProps) {
  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : null
  const displayPhone = profile.phone || null
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)

  const tierColors = {
    free: {
      bg: 'bg-gray-500/15',
      text: 'text-gray-200',
      ring: 'ring-gray-400/30',
      icon: 'text-gray-300',
    },
    basic: {
      bg: 'bg-amber-700/15',
      text: 'text-amber-200',
      ring: 'ring-amber-700/30',
      icon: 'text-orange-300',
    },
    pro: {
      bg: 'bg-purple-500/15',
      text: 'text-purple-200',
      ring: 'ring-purple-400/30',
      icon: 'text-purple-300',
    },
    elite: {
      bg: 'bg-yellow-400/15',
      text: 'text-yellow-200',
      ring: 'ring-yellow-400/30',
      icon: 'text-yellow-400',
    }
  }
  
  const currentTierColors = tierColors[profile.subscription_tier as keyof typeof tierColors] || tierColors.free

  return (
    <section className="group relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 pt-5 px-6 pb-6 md:hover:ring-white/20 md:hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Avatar */}
        <button 
          className="relative flex-shrink-0 group/avatar" 
          style={{ touchAction: 'manipulation' }}
          onClick={onEditClick}
        >
          <div className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all group-hover/avatar:ring-2 group-hover/avatar:ring-orange-400/50 active:scale-95">
            <div className="w-full h-full rounded-[18px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          {/* Edit overlay on hover */}
          <div className="absolute inset-0 rounded-[20px] bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </div>
        </button>

        {/* Info */}
        <div className="space-y-3 w-full text-center">
          <div>
            <h3 className="text-xl font-semibold text-white font-oswald uppercase tracking-tight">
              {displayName}
            </h3>
            
            <div className="flex items-center gap-2 mt-2 justify-center">
              <div className={`inline-flex items-center gap-1.5 rounded-full ${currentTierColors.bg} px-2.5 py-1 text-xs ${currentTierColors.text} ring-1 ${currentTierColors.ring}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentTierColors.icon}>
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
                <span className="font-medium">{tierDisplayName}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {/* Phone */}
            <button 
              className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-2 px-3 transition-all hover:bg-white/[0.04] active:scale-95" 
              style={{ touchAction: 'manipulation' }}
              onClick={onEditClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-300 flex-shrink-0">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="pointer-events-none truncate text-center flex-1">{displayPhone || 'Не указан'}</span>
            </button>
            
            {/* Email */}
            {displayEmail && (
              <button 
                className="flex items-center gap-2 text-xs text-white/60 w-full rounded-lg py-2 px-3 transition-all hover:bg-white/[0.04] active:scale-95" 
                style={{ touchAction: 'manipulation' }}
                onClick={onEditClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300 flex-shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span className="truncate pointer-events-none text-center flex-1">{displayEmail}</span>
              </button>
            )}
          </div>

          {/* Logout Button */}
          <a 
            href="/auth/logout" 
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-red-500/10 ring-1 ring-red-400/30 px-3 py-2 transition-all hover:bg-red-500/15 hover:ring-red-400/40 active:scale-95 text-xs mt-3" 
            style={{ touchAction: 'manipulation' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="text-red-200/90 font-medium">Выход</span>
          </a>
        </div>
      </div>
    </section>
  )
}
