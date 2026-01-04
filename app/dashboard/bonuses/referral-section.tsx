'use client'

import { useState, useEffect } from 'react'
import type { getReferralStats } from '@/lib/actions/referrals'
import { getReferralLevelVisuals } from '@/types/database'

interface ReferralSectionProps {
  referralLink: string
  stats: Awaited<ReturnType<typeof getReferralStats>>['data']
}

// Функция для получения цветов реферального уровня
const getReferralLevelColors = (level: number) => {
  const colors = {
    1: { // Bronze
      bgGradient: 'from-amber-900/40 to-orange-900/40',
      ring: 'ring-amber-700/50',
      progress: 'from-amber-500 to-orange-600',
    },
    2: { // Silver
      bgGradient: 'from-slate-600/40 to-slate-700/40',
      ring: 'ring-slate-500/50',
      progress: 'from-slate-400 to-slate-500',
    },
    3: { // Gold
      bgGradient: 'from-yellow-600/40 to-amber-700/40',
      ring: 'ring-yellow-500/50',
      progress: 'from-yellow-400 to-amber-500',
    },
    4: { // Platinum
      bgGradient: 'from-cyan-700/40 to-blue-800/40',
      ring: 'ring-cyan-500/50',
      progress: 'from-cyan-400 to-blue-500',
    },
  }
  return colors[level as keyof typeof colors] || colors[1]
}

export function ReferralSection({ referralLink, stats }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(() => {
    if (typeof window === 'undefined') return false
    return typeof navigator.share === 'function'
  })

  if (!stats) return null

  // Получаем визуальные данные текущего уровня
  const currentLevelVisuals = getReferralLevelVisuals(stats.referralLevel)
  const colors = getReferralLevelColors(stats.referralLevel)

  const shareText = 'Присоединяйся ко мне в MargoFitness! Получи 250 шагов в подарок при регистрации 🎁'

  const handleCopy = async () => {
    const textToCopy = `${shareText}\n${referralLink}`
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MargoFitness',
          text: shareText,
          url: referralLink,
        })
      } catch (err) {
        // Пользователь отменил шаринг или ошибка
        console.log('Share cancelled or error:', err)
      }
    }
  }

  const handleShare = async (platform: 'whatsapp' | 'telegram' | 'vk') => {
    const encodedText = encodeURIComponent(shareText)
    const encodedLink = encodeURIComponent(referralLink)

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedLink}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`,
      vk: `https://vk.com/share.php?url=${encodedLink}&title=${encodedText}`,
    }

    window.open(urls[platform], '_blank')
  }

  return (
    <div className="relative rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none overflow-hidden rounded-3xl" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Заголовок */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <h2 className="text-xl md:text-2xl font-semibold text-white">Реферальная программа</h2>
          </div>
          <p className="text-sm text-white/60">
            Приглашайте друзей и получайте {stats.referralPercent}% с их покупок
          </p>
        </div>

        {/* Карточка текущего уровня - динамический цвет на основе уровня */}
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors.bgGradient} ring-1 ${colors.ring} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <span className="text-2xl">{currentLevelVisuals.icon}</span>
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Реферальный уровень</div>
                <div className="font-bold text-lg text-white">{currentLevelVisuals.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 uppercase tracking-wider font-medium">Процент</div>
              <div className="text-2xl font-bold text-white">{stats.referralPercent}%</div>
            </div>
          </div>
          
          {/* Прогресс до следующего уровня */}
          {stats.progress.nextLevel !== null && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>До следующего уровня</span>
                <span className="font-medium">{stats.progress.remaining.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${colors.progress} transition-all duration-500`}
                  style={{ width: `${stats.progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Реферальная ссылка */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-white/60 block">
            Ваша реферальная ссылка
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 flex-shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <input
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono text-white/90 focus:outline-none overflow-hidden text-ellipsis"
              />
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition active:scale-95"
              style={{ touchAction: 'manipulation' }}
              title="Скопировать"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
            {canShare && (
              <button
                onClick={handleNativeShare}
                className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/10 ring-1 ring-purple-400/30 flex items-center justify-center text-purple-300 hover:bg-purple-500/20 hover:ring-purple-400/40 transition active:scale-95"
                style={{ touchAction: 'manipulation' }}
                title="Поделиться"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Кнопки шаринга */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500/15 ring-1 ring-green-400/30 px-3 py-3 text-xs font-medium transition-all hover:bg-green-500/25 hover:ring-green-400/40 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#86EFAC"/>
            </svg>
            <span className="text-white hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={() => handleShare('telegram')}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 ring-1 ring-blue-400/30 px-3 py-3 text-xs font-medium transition-all hover:bg-blue-500/25 hover:ring-blue-400/40 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
              <path d="M48 1.7004L40.4074 46.0017C40.4074 46.0017 39.345 49.0733 36.4267 47.6002L18.9084 32.0543L18.8272 32.0085C21.1935 29.5494 39.5429 10.4546 40.3449 9.58905C41.5863 8.24856 40.8156 7.45053 39.3742 8.46313L12.2698 28.3849L1.81298 24.3128C1.81298 24.3128 0.167387 23.6353 0.00907665 22.1622C-0.151317 20.6867 1.86714 19.8887 1.86714 19.8887L44.4963 0.533499C44.4963 0.533499 48 -1.2482 48 1.7004V1.7004Z" fill="#93C5FD"/>
            </svg>
            <span className="text-white hidden sm:inline">Telegram</span>
          </button>
          <button
            onClick={() => handleShare('vk')}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/15 ring-1 ring-blue-500/30 px-3 py-3 text-xs font-medium transition-all hover:bg-blue-600/25 hover:ring-blue-500/40 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 57 36" fill="none">
              <path d="M31.0456 36C11.5709 36 0.462836 22.4865 0 0H9.75515C10.0756 16.5045 17.2673 23.4955 22.9638 24.9369V0H32.1493V14.2342C37.7745 13.6216 43.6846 7.13513 45.6783 0H54.8638C54.1125 3.70048 52.6149 7.20425 50.4647 10.2921C48.3145 13.38 45.5578 15.9856 42.3673 17.9459C45.9287 19.7371 49.0744 22.2724 51.5967 25.3845C54.119 28.4965 55.9606 32.1146 57 36H46.8888C45.9558 32.6253 44.0594 29.6044 41.4374 27.3158C38.8154 25.0273 35.5844 23.573 32.1493 23.1351V36H31.0456Z" fill="#93C5FD"/>
            </svg>
            <span className="text-white hidden sm:inline">VK</span>
          </button>
        </div>

        {/* Статистика в одну строку */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-2xl font-bold text-white font-oswald">{stats.totalReferrals}</div>
            <div className="text-xs text-white/60 mt-1">Приглашено</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-2xl font-bold text-white font-oswald">{stats.activeReferrals}</div>
            <div className="text-xs text-white/60 mt-1">Купили</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-oswald">{stats.totalEarned.toLocaleString('ru-RU')}</span>
              <span className="text-lg">👟</span>
            </div>
            <div className="text-xs text-white/60 mt-1">Заработано</div>
          </div>
        </div>

        {/* Как это работает */}
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Как это работает
          </div>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>Друг регистрируется по вашей ссылке → получает 250 шагов</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>Он покупает подписку → вы получаете 500 шагов (только первый друг!)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-300 flex-shrink-0">•</span>
              <span>С каждой его покупки вы получаете {stats.referralPercent}% шагами</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


