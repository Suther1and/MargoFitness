'use client'

import { useState } from 'react'
import { Achievement } from '@/types/database'
import { updateAchievementAdmin } from '@/lib/actions/achievements'
import { ACHIEVEMENT_CATEGORIES } from '@/types/database'
import { InlineNumberInput } from '../users/inline-edit-cell'
import { Input } from '@/components/ui/input'
import { useToast } from '@/contexts/toast-context'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trophy, HelpCircle, Edit2, Check, X, Code, Zap, Settings as SettingsIcon } from 'lucide-react'

interface AchievementRowProps {
  achievement: Achievement & { userCount: number }
}

export function AchievementRow({ achievement }: AchievementRowProps) {
  const { showSuccess, showError } = useToast()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(achievement.title)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveTitle = async () => {
    if (title === achievement.title) {
      setIsEditingTitle(false)
      return
    }
    
    setIsSaving(true)
    try {
      const res = await updateAchievementAdmin(achievement.id, { title })
      if (res.success) {
        showSuccess('Успешно', 'Название обновлено')
        setIsEditingTitle(false)
      } else {
        showError('Ошибка', 'Не удалось обновить название')
      }
    } catch (error) {
      showError('Ошибка', 'Произошла непредвиденная ошибка')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBonus = async (value: number) => {
    const res = await updateAchievementAdmin(achievement.id, { reward_amount: value })
    if (res.success) {
      showSuccess('Успешно', 'Количество бонусов обновлено')
    } else {
      showError('Ошибка', 'Не удалось обновить бонусы')
    }
  }

  const category = ACHIEVEMENT_CATEGORIES[achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES]

  const metadata = achievement.metadata as any

  // Техническое описание логики для админа
  const getTechnicalLogic = (meta: any) => {
    if (!meta) return { title: 'Нет данных', steps: [], testing: '' }
    
    const type = meta.type
    const val = meta.value

    const baseInfo = {
      trigger: 'checkAndUnlockAchievements (lib/actions/achievements.ts)',
      rpc: 'unlock_achievement_for_user (PostgreSQL RPC)',
      table: 'user_achievements'
    }

    switch (type) {
      case 'streak_days':
        return {
          title: 'Система серий (Streaks)',
          steps: [
            `Проверка: \`diary_settings.streaks.current >= ${val}\``,
            'Триггер: При каждом сохранении записи в дневнике.',
            'Файл: `lib/actions/diary.ts` -> `checkAndUnlockAchievements`.'
          ],
          testing: `1. Открыть БД. 2. Найти таблицу \`diary_settings\` для юзера. 3. Установить \`streaks -> current = ${val}\`. 4. Сохранить любую запись в дневнике на сайте.`
        }
      case 'water_daily':
      case 'steps_daily':
        const metric = type.split('_')[0]
        const field = metric === 'water' ? 'waterIntake' : 'steps'
        return {
          title: 'Ежедневные метрики',
          steps: [
            `Проверка: \`diary_entries.metrics.${field} >= ${val}\``,
            'Триггер: При сохранении дневника за текущий день.',
            'Важно: Учитывается только запись за "сегодня".'
          ],
          testing: `1. Открыть дневник. 2. Ввести значение ${val} в поле ${metric === 'water' ? 'Вода' : 'Шаги'}. 3. Нажать сохранить. 4. Достижение должно разблокироваться.`
        }
      case 'water_total':
      case 'steps_total':
        const totalMetric = type.split('_')[0]
        return {
          title: 'Накопительные метрики',
          steps: [
            `Проверка: \`RPC get_user_metrics_stats().total_${totalMetric} >= ${val}\``,
            'Триггер: При входе в раздел "Прогресс" или обновлении дневника.',
            'Логика: Суммируются данные из всех записей за всё время.'
          ],
          testing: `1. Добавить несколько записей в дневник за разные даты. 2. Сумма \`${totalMetric}\` должна стать >= ${val}. 3. Зайти в раздел достижений.`
        }
      case 'achievement_count':
        return {
          title: 'Мета-достижение',
          steps: [
            `Проверка: \`COUNT(user_achievements) >= ${val === 0 ? 'всех' : val}\``,
            'Исключение: Само это достижение не учитывается в расчете.',
            'Триггер: После разблокировки любого другого достижения.'
          ],
          testing: `1. Получить ${val === 0 ? 'все доступные' : val} других достижений. 2. Это достижение разблокируется автоматически последним.`
        }
      case 'subscription_tier':
        return {
          title: 'Уровень подписки',
          steps: [
            `Проверка: \`profiles.subscription_tier\` маппится на ${val}`,
            'Иерархия: free(0) < basic(1) < pro(2) < elite(3)',
            'Триггер: При обновлении профиля или после оплаты.'
          ],
          testing: `1. В админке пользователей изменить тариф юзера на \`${val}\`. 2. Зайти под этим юзером в дашборд.`
        }
      case 'profile_complete':
        return {
          title: 'Заполнение профиля',
          steps: [
            'Проверка (Profiles): `full_name`, `phone`, `avatar_url` IS NOT NULL',
            'Проверка (Settings): `weight`, `height`, `age` в `user_params` заданы',
            'Триггер: Сохранение настроек профиля.'
          ],
          testing: `1. Перейти в настройки профиля. 2. Заполнить все текстовые поля. 3. Загрузить аватар. 4. Указать вес, рост и возраст в параметрах тела. 5. Сохранить.`
        }
      case 'perfect_day':
        return {
          title: 'Идеальный день',
          steps: [
            'Проверка: Все цели из `diary_settings.widget_goals` достигнуты за сегодня',
            'Проверка: Все привычки на сегодня отмечены как выполненные',
            'Триггер: При сохранении дневника.'
          ],
          testing: `1. Настроить цели (например, 2000мл воды). 2. Выполнить все цели в дневнике. 3. Отметить все привычки. 4. Сохранить.`
        }
      case 'weight_goal_reached':
        return {
          title: 'Целевой вес',
          steps: [
            'Логика: Сравнение первого веса, текущего и `settings.goals.weight`.',
            'Поддержка: Работает как на похудение, так и на набор массы.',
            'Триггер: При записи нового веса в дневник.'
          ],
          testing: `1. Установить цель по весу в настройках (например, 70кг). 2. Записать в дневник вес, который равен или "прошел" цель относительно стартового.`
        }
      default:
        return {
          title: `Тип: ${type}`,
          steps: [
            `Техническое условие: \`${JSON.stringify(meta)}\``,
            'Обработка в `lib/actions/achievements.ts` -> `switch(meta.type)`.'
          ],
          testing: 'Проверьте соответствие типа метаданных коду в `lib/actions/achievements.ts`.'
        }
    }
  }

  const techLogic = getTechnicalLogic(metadata)

  // Описание логики на основе метаданных
  const getLogicDescription = (meta: any) => {
    if (!metadata) return 'Логика не указана'
    const type = metadata.type
    const val = metadata.value

    switch (type) {
      case 'registration': return 'Выдается при регистрации'
      case 'streak_days': return `Серия из ${val} дней подряд`
      case 'water_daily': return `Выпить ${val}мл воды за день`
      case 'water_total': return `Выпить ${val}мл воды всего`
      case 'steps_daily': return `Пройти ${val} шагов за день`
      case 'steps_total': return `Пройти ${val} шагов всего`
      case 'total_entries': return `Сделать ${val} записей в дневнике`
      case 'monthly_entries': return `Сделать ${val} записей за месяц`
      case 'achievement_count': return `Получить ${val === 0 ? 'все остальные' : val} достижений`
      case 'referral_mentor': return `Пригласить ${val} активных друзей`
      case 'profile_complete': return 'Полностью заполнить профиль'
      case 'subscription_tier': return `Оформить подписку уровня ${val}`
      case 'subscription_duration': return `Подписка на ${val} месяцев`
      case 'perfect_day': return 'Выполнить все цели за один день'
      case 'perfect_streak': return `Выполнять все цели ${val} дней подряд`
      case 'weight_goal_reached': return 'Достичь целевого веса'
      case 'energy_max': return `Записать максимальную энергию ${val} раз`
      default: return `Тип: ${type}, значение: ${val}`
    }
  }

  return (
    <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {achievement.icon_url ? (
              <Image 
                src={achievement.icon_url} 
                alt={achievement.title} 
                fill 
                className="object-contain p-2"
              />
            ) : (
              <span className="text-2xl">{achievement.icon || '🏆'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-8 text-sm bg-white/5 border-white/10 w-48"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  />
                  <button 
                    onClick={handleSaveTitle}
                    disabled={isSaving}
                    className="p-1 hover:text-emerald-400 transition-colors"
                  >
                    <Check className="size-4" />
                  </button>
                  <button 
                    onClick={() => { setTitle(achievement.title); setIsEditingTitle(false); }}
                    className="p-1 hover:text-rose-400 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-white truncate">{achievement.title}</h3>
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all"
                  >
                    <Edit2 className="size-3" />
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] text-white/40 font-mono mt-1">
              {achievement.icon_url?.replace('/achievements/', '') || 'emoji'}
            </p>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${category?.color || 'text-white/60'}`}>
            {category?.icon} {category?.label || achievement.category}
          </span>
        </div>
      </td>

      <td className="p-4 max-w-xs">
        <div className="space-y-1">
          <p className="text-xs text-white/70 line-clamp-2">{achievement.description}</p>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 text-[10px] text-white/30 bg-white/5 hover:bg-white/10 transition-colors w-fit px-2 py-0.5 rounded-md outline-none">
                <HelpCircle className="size-3" />
                <span>Логика: {getLogicDescription(metadata)}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-oswald uppercase tracking-wider">
                  <Code className="size-5 text-orange-400" />
                  Техническая логика
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Zap className="size-4 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{techLogic.title}</h4>
                    <p className="text-[10px] text-white/40 font-mono">Type: {metadata?.type || 'unknown'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Алгоритм проверки</h5>
                  <div className="space-y-2">
                    {techLogic.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="size-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                            {i + 1}
                          </div>
                          {i < techLogic.steps.length - 1 && <div className="w-px h-full bg-white/5 mt-1" />}
                        </div>
                        <p className="text-xs text-white/60 pt-0.5 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {techLogic.testing && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Как протестировать</h5>
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      {techLogic.testing}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                  <SettingsIcon className="size-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-blue-300 uppercase">Метаданные (JSON)</h5>
                    <pre className="text-[10px] font-mono text-white/40 bg-black/20 p-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </td>

      <td className="p-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-bold text-white">{achievement.userCount}</span>
          <span className="text-[10px] uppercase tracking-widest text-white/30">пользователей</span>
        </div>
      </td>

      <td className="p-4 text-right">
        <InlineNumberInput 
          value={achievement.reward_amount || 0}
          onSave={handleSaveBonus}
          suffix=" бонусов"
          min={0}
        />
      </td>
    </tr>
  )
}
