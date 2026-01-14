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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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

    switch (type) {
      case 'registration':
        return {
          title: 'При регистрации',
          steps: [
            'Проверка выполняется сразу после создания профиля',
            'Триггер: Первый вход пользователя в систему',
            'Файл: `lib/actions/achievements.ts` -> `checkAndUnlockAchievements`.'
          ],
          testing: '1. Создайте новый аккаунт. 2. Сразу после входа перейдите в раздел достижений — оно должно быть уже получено.'
        }
      case 'streak_days':
        return {
          title: 'Система серий (Streaks)',
          steps: [
            `Проверка текущего счетчика дней: \`diary_settings.streaks.current >= ${val}\``,
            'Триггер: При каждом сохранении записи в дневнике.',
            'Обновление: Если сегодня данных нет, а вчера были — стрик растет. Если был пропуск — сбрасывается.'
          ],
          testing: `1. Заполняйте дневник каждый день без пропусков. 2. На ${val}-й день при сохранении дневника достижение разблокируется. 3. Для быстрой проверки админом: вручную измените \`current_streak\` в БД и сохраните любую запись в дневнике.`
        }
      case 'water_daily':
      case 'steps_daily':
        const metric = type.split('_')[0]
        const field = metric === 'water' ? 'waterIntake' : 'steps'
        return {
          title: 'Ежедневные метрики',
          steps: [
            `Проверка: значение \`metrics.${field}\` в записи за текущую дату >= ${val}`,
            'Триггер: При сохранении дневника.',
            'Условие: Нужно ввести число, равное или больше цели, и нажать кнопку сохранения.'
          ],
          testing: `1. Откройте дневник за сегодня. 2. Введите ${val} в поле "${metric === 'water' ? 'Вода' : 'Шаги'}". 3. Нажмите "Сохранить". 4. Достижение должно появиться в уведомлении.`
        }
      case 'water_total':
      case 'steps_total':
        const totalMetric = type.split('_')[0]
        return {
          title: 'Накопительные метрики',
          steps: [
            `Система суммирует все показатели \`${totalMetric === 'water' ? 'воды' : 'шагов'}\` из всех записей пользователя`,
            `Цель: накопить ${val.toLocaleString('ru-RU')} единиц`,
            'Проверка выполняется при каждом открытии страницы прогресса/достижений.'
          ],
          testing: `1. Заполните дневник за несколько разных дат (например, вчера и сегодня). 2. Убедитесь, что сумма за все дни стала больше ${val}. 3. Перейдите на вкладку достижений — прогресс обновится и оно разблокируется.`
        }
      case 'achievement_count':
        return {
          title: 'Количество достижений',
          steps: [
            'Проверка: сколько других достижений уже разблокировано пользователем',
            `Цель: получить еще ${val === 0 ? 'все' : val} достижений`,
            'Триггер: любая новая разблокировка.'
          ],
          testing: `1. Получайте другие достижения по очереди. 2. Когда общее количество достигнутых (не считая этого) станет равно ${val}, это достижение откроется автоматически.`
        }
      case 'subscription_tier':
        return {
          title: 'Уровень подписки',
          steps: [
            `Проверка текущего тарифа в профиле (\`subscription_tier\`)`,
            `Требуемый уровень: "${val}" (или выше)`,
            'Триггер: При обновлении профиля, успешной оплате или просто при входе.'
          ],
          testing: `1. Оформите подписку уровня "${val}" (или выше). 2. Либо в админке пользователей изменить тариф вручную. 3. Зайдите в личный кабинет — достижение разблокируется.`
        }
      case 'profile_complete':
        return {
          title: 'Заполнение профиля',
          steps: [
            'Проверка: Имя, Телефон, Аватар (в профиле)',
            'Проверка: Вес, Рост, Возраст (в параметрах тела)',
            'Триггер: Кнопка "Сохранить" в настройках профиля.'
          ],
          testing: '1. Перейдите в настройки профиля. 2. Заполните абсолютно все поля (включая аватар и параметры тела). 3. Нажмите "Сохранить".'
        }
      case 'perfect_day':
        return {
          title: 'Идеальный день',
          steps: [
            'Проверка: все поставленные цели в дневнике выполнены (вода, шаги и т.д.)',
            'Проверка: все привычки на сегодня отмечены галочками',
            'Триггер: Сохранение дневника в конце дня.'
          ],
          testing: '1. Установите цели в настройках (например, 1000 шагов). 2. В дневнике выполните эти цели. 3. Отметите все привычки. 4. Нажмите "Сохранить".'
        }
      case 'weight_goal_reached':
        return {
          title: 'Достижение цели веса',
          steps: [
            'Сравнение: стартовый вес (самая первая запись) и текущий вес',
            'Условие: текущий вес должен быть равен или "пройти" цель из настроек',
            'Триггер: Сохранение новой записи веса.'
          ],
          testing: '1. Установите цель веса в настройках (например, 70 кг). 2. Запишите в дневник вес, который соответствует этой цели (меньше цели при похудении или больше при наборе). 3. Сохраните.'
        }
      case 'referral_joined':
        return {
          title: 'В команде',
          steps: [
            'Проверка использования реферального кода при регистрации',
            'Триггер: Успешное создание аккаунта через реферальную ссылку',
            'Условие: Пользователь должен быть приглашен кем-то'
          ],
          testing: '1. Скопируйте реферальный код/ссылку из любого аккаунта. 2. Зарегистрируйте новый аккаунт, используя этот код. 3. После входа достижение должно быть получено.'
        }
      case 'referral_mentor':
        return {
          title: 'Наставник',
          steps: [
            'Проверка количества активных рефералов (кто совершил покупку)',
            `Цель: ${val} приглашенных пользователей с оплатой`,
            'Триггер: Момент оплаты приглашенным пользователем'
          ],
          testing: `1. Пригласите друга по своему коду. 2. Друг должен оформить любую подписку. 3. Когда оплата друга пройдет, в вашем аккаунте (наставника) зачислится прогресс или сразу выдастся достижение (если цель ${val}).`
        }
      case 'perfect_streak':
        return {
          title: 'Серия идеальных дней',
          steps: [
            `Проверка: ${val} идеальных дней подряд`,
            'Идеальный день = выполнены все цели и все привычки',
            'Триггер: Сохранение дневника в конце дня'
          ],
          testing: `1. Выполняйте "Идеальный день" ${val} дней подряд. 2. На ${val}-й день при сохранении дневника вы получите это достижение.`
        }
      case 'energy_max':
        return {
          title: 'На пике формы',
          steps: [
            `Проверка: запись максимальной энергии (5/5) ${val} раз`,
            'Учитываются разные дни',
            'Триггер: Сохранение оценки энергии в дневнике'
          ],
          testing: `1. В дневнике установите ползунок энергии на максимум (5). 2. Повторите это в течение ${val} разных дней. 3. На ${val}-й раз достижение разблокируется.`
        }
      default:
        return {
          title: `Условие: ${type}`,
          steps: [
            `Технический тип: ${type}`,
            `Значение: ${val}`
          ],
          testing: 'Для этого достижения пока нет ручного сценария. Пожалуйста, обратитесь к разработчику.'
        }
    }
  }

  const techLogic = getTechnicalLogic(metadata)

  // Описание логики на основе метаданных
  const getLogicDescription = (meta: any) => {
    if (!meta) return 'Логика не указана'
    const type = meta.type
    const val = meta.value

    switch (type) {
      case 'registration': return 'При регистрации'
      case 'streak_days': return `Серия: ${val} дн.`
      case 'water_daily': return `Вода: ${val}мл/день`
      case 'water_total': return `Вода: ${val}мл всего`
      case 'steps_daily': return `Шаги: ${val}/день`
      case 'steps_total': return `Шаги: ${val} всего`
      case 'total_entries': return `Записей: ${val}`
      case 'monthly_entries': return `За месяц: ${val}`
      case 'achievement_count': return `Достижений: ${val === 0 ? 'все' : val}`
      case 'referral_mentor': return `Рефералы: ${val}`
      case 'profile_complete': return 'Профиль заполнен'
      case 'subscription_tier': return `Тариф: ${val}`
      case 'subscription_duration': return `Период: ${val} мес.`
      case 'perfect_day': return 'Идеальный день'
      case 'perfect_streak': return `Идеально: ${val} дн.`
      case 'weight_goal_reached': return 'Цель по весу'
      case 'energy_max': return `Макс. энергия: ${val}`
      default: return `${type}: ${val}`
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
        <div className="space-y-1.5">
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">{achievement.description}</p>
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-[10px] font-bold text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 transition-all w-fit px-2.5 py-1 rounded-lg outline-none cursor-pointer group/btn">
                <Code className="size-3 transition-transform group-hover/btn:scale-110" />
                <span>Тест и логика: {getLogicDescription(metadata)}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-visible shadow-none">
              <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#1a1a24] ring-1 ring-white/20 backdrop-blur-xl shadow-2xl p-8">
                <DialogHeader className="relative z-10 mb-8 text-left">
                  <DialogTitle className="text-2xl font-bold text-white font-oswald uppercase tracking-tight flex items-center gap-3">
                    <Code className="size-6 text-orange-400" />
                    Техническая логика
                  </DialogTitle>
                </DialogHeader>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                    <div className="p-2.5 rounded-xl bg-orange-500/10">
                      <Zap className="size-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">{techLogic.title}</h4>
                      <p className="text-[10px] text-white/40 font-mono">Type: {metadata?.type || 'unknown'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Алгоритм проверки</h5>
                    <div className="space-y-3">
                      {techLogic.steps.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="size-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">
                              {i + 1}
                            </div>
                            {i < techLogic.steps.length - 1 && <div className="w-px h-full bg-white/5 mt-2" />}
                          </div>
                          <p className="text-xs text-white/60 pt-1 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {techLogic.testing && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                      <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Check className="size-3" />
                        Инструкция для тестирования
                      </h5>
                      <p className="text-xs text-white/70 leading-relaxed italic pl-1">
                        {techLogic.testing}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center transition-all hover:opacity-70 active:scale-95 bg-white/5 rounded-full"
                >
                  <X className="size-4 text-white/40" />
                </button>
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
