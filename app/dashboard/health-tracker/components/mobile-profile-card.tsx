'use client'

import { Profile } from '@/types/database'
import { LogOut, Mail, Phone, User, Settings, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTierDisplayName } from '@/lib/access-control'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface MobileProfileCardProps {
  profile: Profile
  onEditClick: () => void
}

export function MobileProfileCard({ profile, onEditClick }: MobileProfileCardProps) {
  const displayName = profile.full_name || 'Пользователь'
  const displayEmail = profile.email && !profile.email.includes('@telegram.local') ? profile.email : 'не указана'
  const displayPhone = profile.phone || 'не указан'
  const tierDisplayName = getTierDisplayName(profile.subscription_tier)

  const memberSince = profile.created_at 
    ? format(new Date(profile.created_at), 'LLLL yyyy', { locale: ru })
    : 'ноябрь 2025'

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
      `}</style>

      {/* Main Card */}
      <div className="sub-card w-full rounded-[2rem] p-6 relative group min-h-[200px] flex flex-col justify-between">
        <div className="sub-pattern"></div>
        <div className="dots-pattern"></div>
        
        {/* Profile Logo - Right Side Decoration */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none z-0 rotate-12">
          <svg width="220" height="293" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32.3416 21.6839C31.0369 19.78 31.832 17.6778 32.6011 15.6446C32.8174 15.072 33.0222 14.5312 33.1743 14.0059C34.0497 10.9751 34.5521 7.43853 31.6367 4.1855C28.3815 0.553684 22.9174 0.0317505 17.9984 0C13.0821 0.0317505 7.61748 0.553684 4.36284 4.1855C1.44738 7.43853 1.94925 10.9751 2.82516 14.0059C2.97677 14.5312 3.1815 15.072 3.3984 15.6446C4.16752 17.6778 4.96264 19.78 3.65791 21.6839C0.560407 26.202 -0.650816 31.5099 0.335758 36.2474C1.2172 40.4819 3.7481 44.0051 7.654 46.436C8.68373 47.0966 14.2015 47.662 18 47.662C21.8008 47.662 27.3224 47.096 28.3449 46.4371C32.2519 44.0062 34.7828 40.4825 35.6648 36.2474C36.6503 31.5104 35.4391 26.202 32.3416 21.6839ZM26.3026 15.4124C25.6209 16.7726 24.8922 17.4494 23.183 16.8846C21.5584 16.3471 20.0551 15.9894 17.9995 15.9894C15.9439 15.9894 14.4405 16.3471 12.8159 16.8846C11.1073 17.4494 10.378 16.7726 9.69631 15.4124C8.67709 13.3792 7.86758 11.3561 9.14686 8.96868C10.2756 6.86145 13.5508 5.60759 17.9192 5.60759C17.9735 5.60759 18.0282 5.60759 18.0814 5.60759C22.4482 5.60759 25.7233 6.86145 26.8521 8.96868C28.1314 11.3561 27.3218 13.3792 26.3026 15.4124Z" fill="#D95912" />
            <path d="M16.7723 19.2676C17.4453 19.7413 18.0874 20.1258 18.6681 20.5995C20.6253 22.1683 24.5387 26.8852 24.8451 29.3704C25.0284 30.9975 24.9028 31.9123 24.9028 31.9123C24.3792 34.3165 23.1573 36.1865 23.07 36.3646C22.8082 37.166 24.8147 35.392 25.4265 34.6727C25.9335 33.8956 26.2124 33.1589 26.2124 32.2569C26.2124 32.1974 26.2124 31.6337 26.2124 31.5445C26.2739 31.5742 26.8229 32.5356 26.8229 32.5356C27.8703 34.9399 28.3939 35.9552 28.3939 38.4415C28.4247 41.7255 26.8648 44.2405 24.2038 46.1937C23.4399 46.7556 22.5032 47.2468 21.5867 47.5729C22.9018 46.3898 23.6232 44.9213 23.3476 43.206C23.1336 41.8455 22.3696 40.7802 21.3596 39.8924C21.2674 40.3067 21.2378 40.7506 21.0533 41.1351C20.4727 42.2885 18.9128 42.5253 17.9335 41.6671C16.4658 40.365 16.007 38.708 16.1595 36.8442C16.3133 35.0981 17.9642 31.6653 17.9642 31.5475C17.6579 31.6368 8.88165 37.7903 12.9488 45.8094C13.3154 46.5485 13.6132 47.099 14.2554 47.662C14.0106 47.5727 14.0498 47.615 13.805 47.5257C11.4812 46.6676 9.55469 45.3071 8.27042 43.2063C7.20013 41.4602 6.95533 39.5664 7.1694 37.5848C7.56676 34.1819 9.15739 31.3716 11.6032 28.9447C13.2541 27.3176 14.6922 25.5418 15.7933 23.5303C16.2829 22.6126 16.6803 21.6663 16.7713 20.6308C16.8033 20.2155 16.7723 19.8008 16.7723 19.2676Z" fill="white" />
          </svg>
        </div>
        
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
             <div className="flex items-center justify-between gap-3 group/item transition-colors">
               <div className="flex items-center gap-3 min-w-0">
                  <Mail className={cn("w-3.5 h-3.5", displayEmail !== 'не указана' ? "text-white/30" : "text-white/10")} />
                  <span className={cn(
                    "text-xs font-medium truncate font-montserrat tracking-wide",
                    displayEmail !== 'не указана' ? "text-white/60" : "text-white/20 italic"
                  )}>
                    {displayEmail}
                  </span>
               </div>
             </div>

             <div className="flex items-center justify-between gap-3 group/item transition-colors">
               <div className="flex items-center gap-3 min-w-0">
                  <Phone className={cn("w-3.5 h-3.5", displayPhone !== 'не указан' ? "text-white/30" : "text-white/10")} />
                  <span className={cn(
                    "text-xs font-medium truncate font-montserrat tracking-wide",
                    displayPhone !== 'не указан' ? "text-white/60" : "text-white/20 italic"
                  )}>
                    {displayPhone}
                  </span>
               </div>
             </div>
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
