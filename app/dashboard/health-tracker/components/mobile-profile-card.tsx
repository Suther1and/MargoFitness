'use client'

import { useState } from 'react'
import { Profile } from '@/types/database'
import { LogOut, Mail, Phone, User, Copy, Check, Camera, Settings, Crown, Edit, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTierDisplayName } from '@/lib/access-control'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

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

  const memberSince = profile.created_at 
    ? format(new Date(profile.created_at), 'LLLL yyyy', { locale: ru })
    : 'ноябрь 2025'

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Styles from profile-tab.tsx for Free/Default subscription card
  const subStyles = {
    card: 'linear-gradient(165deg, #171717 0%, #0a0a0a 40%, #000000 100%)',
    pattern: 'rgba(255, 255, 255, 0.03)',
    accent: 'text-white/60',
    border: 'rgba(255, 255, 255, 0.1)',
    badge: 'bg-white/5 border-white/10 text-white/40',
    badgeDot: 'bg-white/20 shadow-[0_0_6px_rgba(255,255,255,0.2)]',
    glow: 'bg-white/5',
    shimmer: 'rgba(255, 255, 255, 0.03)',
    status: 'text-white/40',
    btnPrimary: 'bg-white hover:bg-neutral-200 text-black border-transparent',
    btnSecondary: 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border-white/10',
  }

  // Bonus card pattern for dots
  const bonusPattern = 'rgba(255, 255, 255, 0.15)'

  return (
    <div className="w-full relative group">
      {/* Dynamic Style for Pattern */}
      <style jsx>{`
        .sub-card {
          background: ${subStyles.card};
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
        .sub-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.15;
          background-image: linear-gradient(45deg, ${subStyles.pattern} 25%, transparent 25%, transparent 50%, ${subStyles.pattern} 50%, ${subStyles.pattern} 75%, transparent 75%, transparent);
          background-size: 20px 20px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 90%);
          z-index: 1;
        }
        .dots-pattern {
          position: absolute; 
          inset: 0; 
          pointer-events: none;
          background-image: radial-gradient(circle at 1px 1px, ${bonusPattern} 1px, transparent 0);
          background-size: 20px 20px;
          opacity: 0.3;
          z-index: 1;
        }
        .sub-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          padding: 1.5px;
          background: linear-gradient(180deg, ${subStyles.border}, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 25;
        }
        @keyframes subShimmer {
          0% { transform: translateX(-150%) rotate(25deg); }
          20% { transform: translateX(150%) rotate(25deg); }
          100% { transform: translateX(150%) rotate(25deg); }
        }
        .sub-shine {
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(90deg, transparent, ${subStyles.shimmer}, transparent);
          animation: subShimmer 6s infinite ease-in-out;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Main Card */}
      <div className="sub-card w-full rounded-[2rem] p-6 relative group min-h-[200px] flex flex-col justify-between">
        <div className="sub-pattern"></div>
        <div className="dots-pattern"></div>
        <div className="sub-shine"></div>
        
        {/* Ambient Glows */}
        <div className={cn("absolute -right-10 -top-10 w-48 h-48 blur-[80px] rounded-full pointer-events-none mix-blend-screen opacity-50", subStyles.glow)}></div>
        <div className={cn("absolute -left-10 bottom-0 w-40 h-40 blur-[60px] rounded-full pointer-events-none opacity-20", subStyles.glow)}></div>

        <div className="relative z-10 flex flex-col h-full gap-6">
          
          {/* Header Row: Title & Badge */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className={cn("p-1.5 rounded-lg bg-black/40 border border-white/5 shadow-sm")}>
                <User className={cn("w-4 h-4 opacity-80", subStyles.status)} />
              </div>
              <span className={cn("text-[11px] font-black uppercase tracking-widest opacity-60 font-montserrat", subStyles.status)}>Профиль</span>
            </div>
            
            {/* Subscription Badge (Tier) */}
            <div className={cn("relative overflow-hidden backdrop-blur-md border rounded-lg px-2.5 h-6 flex items-center justify-center", subStyles.badge)}>
              <span className="text-[10px] font-black tracking-widest relative z-10 uppercase font-montserrat leading-none">
                {tierDisplayName}
              </span>
            </div>
          </div>

          {/* Body: Avatar & Info */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
             <div className="relative group/avatar shrink-0">
              <div 
                className={cn(
                  "relative w-20 h-20 rounded-full p-[2px] ring-2 ring-offset-2 ring-offset-black/50 overflow-hidden transition-all ring-white/10"
                )}
              >
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName} 
                    className="w-full h-full rounded-full object-cover grayscale brightness-90 contrast-125" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                    <User className="w-8 h-8 text-white/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Member Since */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-black font-oswald text-white/90 uppercase tracking-tight leading-none truncate drop-shadow-lg">
                    {displayName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-white/40">
                    <span className="text-[9px] font-bold uppercase tracking-widest font-montserrat">Участник с {memberSince}</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid gap-2 mt-auto">
             {displayEmail && (
               <div 
                 onClick={() => handleCopy(displayEmail, 'email')}
                 className="flex items-center justify-between gap-3 group/item cursor-pointer"
               >
                 <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs font-medium text-white/60 truncate font-montserrat tracking-wide">{displayEmail}</span>
                 </div>
                 {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/10 group-hover/item:text-white/40 transition-colors opacity-0 group-hover/item:opacity-100" />
                  )}
               </div>
             )}

             {displayPhone && (
               <div 
                 onClick={() => handleCopy(displayPhone, 'phone')}
                 className="flex items-center justify-between gap-3 group/item cursor-pointer"
               >
                 <div className="flex items-center gap-3 min-w-0">
                    <Phone className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-xs font-medium text-white/60 truncate font-montserrat tracking-wide">{displayPhone}</span>
                 </div>
                 {copiedField === 'phone' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/10 group-hover/item:text-white/40 transition-colors opacity-0 group-hover/item:opacity-100" />
                  )}
               </div>
             )}
          </div>

          {/* Actions - Edit & Logout */}
          <div className="pt-2 flex gap-3">
             <button 
                onClick={onEditClick}
                className={cn(
                  "relative text-[10px] font-black uppercase tracking-wider h-10 px-3 rounded-xl flex items-center justify-center gap-2 transition-all flex-1 active:scale-95 font-montserrat shadow-xl",
                  subStyles.btnPrimary
                )}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Настроить</span>
              </button>

             <a 
                href="/auth/logout"
                className={cn(
                  "relative border text-[10px] font-black uppercase tracking-wider h-10 px-3 rounded-xl flex items-center justify-center gap-2 transition-all flex-1 active:scale-95 font-montserrat",
                  subStyles.btnSecondary
                )}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </a>
          </div>

        </div>
      </div>
    </div>
  )
}
