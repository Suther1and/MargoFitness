'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Share2 } from 'lucide-react'
import type { getReferralStats } from '@/lib/actions/referrals'
import { getReferralLevelVisuals } from '@/types/database'

interface ReferralSectionProps {
  referralLink: string
  stats: Awaited<ReturnType<typeof getReferralStats>>['data']
}

export function ReferralSection({ referralLink, stats }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false)

  if (!stats) return null

  // Получаем визуальные данные текущего уровня
  const currentLevelVisuals = getReferralLevelVisuals(stats.referralLevel)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (platform: 'whatsapp' | 'telegram' | 'vk') => {
    const text = 'Присоединяйся ко мне в MargoFitness! Получи 250 шагов в подарок при регистрации 🎁'
    const encodedText = encodeURIComponent(text)
    const encodedLink = encodeURIComponent(referralLink)

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedLink}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`,
      vk: `https://vk.com/share.php?url=${encodedLink}&title=${encodedText}`,
    }

    window.open(urls[platform], '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="size-5" />
          Реферальная программа
        </CardTitle>
        <CardDescription>
          Приглашайте друзей и получайте {stats.referralPercent}% с их покупок
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Карточка текущего уровня с прогресс-баром */}
        <div className="relative overflow-hidden rounded-lg border-0 shadow-md">
          {/* Фоновый слой (полупрозрачный) */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentLevelVisuals.color} opacity-30`} />
          
          {/* Прогресс слой (заполненная часть) */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${currentLevelVisuals.color} transition-all duration-500`}
            style={{ 
              width: `${stats.progress.nextLevel !== null ? stats.progress.progress : 100}%` 
            }}
          />
          
          {/* Контент поверх */}
          <div className="relative p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <span className="text-2xl">{currentLevelVisuals.icon}</span>
                </div>
                <div>
                  <div className="text-xs opacity-80">Реферальный уровень</div>
                  <div className="font-bold text-lg">{currentLevelVisuals.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80">Процент</div>
                <div className="text-2xl font-bold">{stats.referralPercent}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Реферальная ссылка */}
        <div>
          <label className="text-sm font-medium mb-2 block">Ваша реферальная ссылка</label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Кнопки шаринга */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            WhatsApp
          </Button>
          <Button
            onClick={() => handleShare('telegram')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Telegram
          </Button>
          <Button
            onClick={() => handleShare('vk')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            VK
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <div className="text-sm text-muted-foreground">Приглашено друзей</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
            <div className="text-sm text-muted-foreground">Совершили покупку</div>
          </div>
          <div className="rounded-lg border p-4 col-span-2">
            <div className="text-2xl font-bold">{stats.totalEarned.toLocaleString('ru-RU')} 👟</div>
            <div className="text-sm text-muted-foreground">Заработано всего</div>
          </div>
        </div>

        {/* Как это работает */}
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <div className="font-semibold">📋 Как это работает:</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Друг регистрируется по вашей ссылке → получает 250 шагов</li>
            <li>• Он покупает подписку → вы получаете 500 шагов (только первый друг!)</li>
            <li>• С каждой его покупки вы получаете {stats.referralPercent}% шагами</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}


