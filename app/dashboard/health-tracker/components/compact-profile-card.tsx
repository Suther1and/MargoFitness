'use client'

import { Profile } from '@/types/database'

interface CompactProfileCardProps {
  profile: Profile
  onEditClick: () => void
}

export function CompactProfileCard({ profile, onEditClick }: CompactProfileCardProps) {
  const displayName = profile.full_name || 'Пользователь'
  
  return (
    <button 
      onClick={onEditClick}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3 flex items-end gap-3 transition-all hover:bg-white/[0.06] hover:ring-white/15 active:scale-[0.98] h-[76px]"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Avatar */}
      <div className="relative flex-shrink-0 z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-purple-500 p-[2px] transition-all group-hover:ring-2 group-hover:ring-orange-400/50">
          <div className="w-full h-full rounded-[10px] bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-start min-w-0 relative z-10">
        <span className="text-sm font-semibold text-white font-oswald uppercase tracking-tight truncate max-w-[120px]">
          {displayName}
        </span>
        <span className="text-[10px] text-white/40 font-medium">Профиль</span>
      </div>
      
      {/* Edit icon hint */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          <path d="m15 5 4 4"></path>
        </svg>
      </div>
    </button>
  )
}
