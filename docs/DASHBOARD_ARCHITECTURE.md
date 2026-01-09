# 🏗️ Архитектура Dashboard - Гайд для ИИ

> **Важно для ИИ:** Этот документ описывает текущую архитектуру Dashboard после миграции на Health Tracker. Старый `dashboard-client.tsx` (1880 строк) был удален.

## 📋 Краткая история миграции

### До миграции (удалено):
- ❌ `app/dashboard/dashboard-client.tsx` - монолитный компонент 1880 строк
- ❌ `app/dashboard/profile-edit-wrapper.tsx` - обертка с автоматическим открытием модалки
- ❌ Роут `/dashboard/health-tracker` - старый адрес трекера здоровья

### После миграции (текущее):
- ✅ `app/dashboard/page.tsx` - серверный компонент (загрузка данных)
- ✅ `app/dashboard/health-tracker-content.tsx` - клиентский компонент (UI + логика)
- ✅ `app/dashboard/health-tracker/` - модуль с компонентами, хуками, утилитами
- ✅ Роут `/dashboard` - теперь открывает Health Tracker

---

## 🎯 Текущая структура

### Роут: `/dashboard`

```
/dashboard
    ├── page.tsx                    # Server Component
    ├── health-tracker-content.tsx  # Client Component  
    ├── bonuses/                    # Независимый роут
    │   └── page.tsx
    └── health-tracker/             # Модуль компонентов
        ├── components/
        ├── hooks/
        ├── types.ts
        └── utils/
```

---

## 📄 Файловая структура в деталях

### 1. Server Component: `app/dashboard/page.tsx`

**Ответственность:** Загрузка данных на сервере

```typescript
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/actions/profile'
import { getBonusStats } from '@/lib/actions/bonuses'
import { HealthTrackerContent } from './health-tracker-content'

export default async function DashboardPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const bonusStatsResult = await getBonusStats(profile.id)
  const bonusStats = bonusStatsResult.success ? (bonusStatsResult.data ?? null) : null

  return <HealthTrackerContent profile={profile} bonusStats={bonusStats} />
}
```

**Что делает:**
- Загружает `profile` через Server Action
- Загружает `bonusStats` через Server Action
- Редиректит на `/auth/login` если пользователь не авторизован
- Передает данные в клиентский компонент

---

### 2. Client Component: `app/dashboard/health-tracker-content.tsx`

**Ответственность:** UI, состояние, интерактивность

**Размер:** ~920 строк чистого кода

**Структура:**

#### Импорты (строки 1-58):
```typescript
// UI библиотеки
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Settings, Activity, ... } from 'lucide-react'

// Глобальные модалки
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { SubscriptionRenewalModal } from '@/components/subscription-renewal-modal'
import { SubscriptionUpgradeModal } from '@/components/subscription-upgrade-modal'

// Компоненты Health Tracker
import { WaterCardH } from './health-tracker/components/water-card-h'
import { DesktopProfileCard } from './health-tracker/components/desktop-profile-card'
// ... и другие

// Хуки
import { useTrackerSettings } from './health-tracker/hooks/use-tracker-settings'
import { useHabits } from './health-tracker/hooks/use-habits'
// ... и другие
```

#### State Management (строки 84-144):
```typescript
export function HealthTrackerContent({ 
  profile: initialProfile, 
  bonusStats: initialBonusStats 
}: { profile: any | null, bonusStats: any | null }) {
  
  // Профиль и бонусы
  const [profile, setProfile] = useState<any | null>(initialProfile)
  const [bonusStats, setBonusStats] = useState<any | null>(initialBonusStats)
  
  // Модалки (desktop)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  
  // Табы и UI
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | ...>('overview')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Хуки для данных
  const { settings, isLoaded: isSettingsLoaded } = useTrackerSettings(userId)
  const { habits, isLoaded: isHabitsLoaded } = useHabits(userId)
  const { metrics, updateMetric } = useHealthDiary({ userId, selectedDate })
  
  // ... остальная логика
}
```

#### Модалки (строки 892-916):
```typescript
{/* Desktop Modals */}
{profile && (
  <>
    <ProfileEditDialog
      open={profileDialogOpen}
      onOpenChange={setProfileDialogOpen}
      profile={profile}
    />
    
    <SubscriptionRenewalModal
      open={renewalModalOpen}
      onOpenChange={setRenewalModalOpen}
      currentTier={profile.subscription_tier}
      currentExpires={profile.subscription_expires_at}
      userId={profile.id}
    />
    
    <SubscriptionUpgradeModal
      open={upgradeModalOpen}
      onOpenChange={setUpgradeModalOpen}
      currentTier={profile.subscription_tier}
      userId={profile.id}
    />
  </>
)}
```

---

### 3. Модуль: `app/dashboard/health-tracker/`

**Это НЕ роут!** Это модуль с переиспользуемыми компонентами.

```
health-tracker/
├── components/
│   ├── desktop-profile-card.tsx       # 152 строки - карточка профиля
│   ├── desktop-subscription-card.tsx  # 200 строк - карточка подписки  
│   ├── desktop-bonus-card.tsx         # 172 строки - карточка бонусов
│   ├── profile-tab.tsx                # Мобильная вкладка профиля
│   ├── water-card-h.tsx               # Виджет воды
│   ├── steps-card-h.tsx               # Виджет шагов
│   ├── habits-card.tsx                # Карточка привычек
│   ├── achievements-card.tsx          # Карточка достижений
│   ├── stats-tab.tsx                  # Вкладка статистики
│   └── ... (остальные компоненты)
├── hooks/
│   ├── use-tracker-settings.ts        # Настройки трекера
│   ├── use-habits.ts                  # Привычки
│   ├── use-health-diary.ts            # Дневник здоровья
│   └── ...
├── types.ts                           # TypeScript типы
└── utils/
    ├── date-formatters.ts             # Форматирование дат
    ├── widget-helpers.ts              # Хелперы виджетов
    └── ...
```

---

## 🎨 Компоненты для управления профилем и подпиской

### Desktop Profile Card

**Файл:** `app/dashboard/health-tracker/components/desktop-profile-card.tsx`

**Props:**
```typescript
interface DesktopProfileCardProps {
  profile: Profile
  onEditClick: () => void  // Открывает ProfileEditDialog
}
```

**Использование:**
```typescript
<DesktopProfileCard 
  profile={profile} 
  onEditClick={() => setProfileDialogOpen(true)}
/>
```

**Что показывает:**
- Аватар пользователя
- Имя, email, телефон
- Уровень подписки (Free, Basic, Pro, Elite)
- Кнопка "Редактировать профиль"

---

### Desktop Subscription Card

**Файл:** `app/dashboard/health-tracker/components/desktop-subscription-card.tsx`

**Props:**
```typescript
interface DesktopSubscriptionCardProps {
  profile: Profile
  onRenewalClick: () => void   // Открывает SubscriptionRenewalModal
  onUpgradeClick: () => void   // Открывает SubscriptionUpgradeModal
}
```

**Использование:**
```typescript
<DesktopSubscriptionCard 
  profile={profile}
  onRenewalClick={() => setRenewalModalOpen(true)}
  onUpgradeClick={() => setUpgradeModalOpen(true)}
/>
```

**Что показывает:**
- Текущий тариф и дата окончания
- Дни до окончания подписки
- Информация о привязанной карте (если есть `payment_method_id`)
- Переключатель автопродления
- Кнопки "Продлить" и "Повысить тариф"

---

### Desktop Bonus Card

**Файл:** `app/dashboard/health-tracker/components/desktop-bonus-card.tsx`

**Props:**
```typescript
interface DesktopBonusCardProps {
  bonusStats: {
    account: UserBonus
    levelData: CashbackLevel
    progress: ReturnType<typeof calculateLevelProgress>
  } | null
  profile: Profile
}
```

**Использование:**
```typescript
<DesktopBonusCard 
  bonusStats={bonusStats}
  profile={profile}
/>
```

**Что показывает:**
- Баланс бонусных шагов
- Текущий уровень кешбэка
- Прогресс до следующего уровня
- Реферальный код
- Ссылка на `/dashboard/bonuses`

---

### Profile Tab (Mobile)

**Файл:** `app/dashboard/health-tracker/components/profile-tab.tsx`

**Props:**
```typescript
interface ProfileTabProps {
  profile: Profile
  bonusStats: { ... } | null
}
```

**Что показывает:**
- Все то же самое, что Desktop карточки
- Но в формате мобильной вкладки
- Внутри управляет своими модалками:
  ```typescript
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [renewalModalOpen, setRenewalModalOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  ```

---

## 🔄 Глобальные модалки

Эти компоненты живут в `/components` и переиспользуются везде.

### ProfileEditDialog

**Файл:** `components/profile-edit-dialog.tsx`

**Props:**
```typescript
interface ProfileEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  isFirstTime?: boolean  // Опционально для первого входа
}
```

**Функционал:**
- Редактирование имени, email, телефона
- Загрузка/удаление аватара
- Валидация данных
- Автосохранение при закрытии

**❌ НЕ используется ProfileEditDialogWrapper** - удален как мертвый код.

---

### SubscriptionRenewalModal

**Файл:** `components/subscription-renewal-modal.tsx`

**Props:**
```typescript
interface SubscriptionRenewalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: 'free' | 'basic' | 'pro' | 'elite'
  currentExpires: string | null
  userId: string
}
```

**Функционал:**
- Выбор периода продления (1, 3, 6, 12 месяцев)
- Автоматический расчет скидок
- Показ итоговой суммы
- Переход на страницу оплаты

---

### SubscriptionUpgradeModal

**Файл:** `components/subscription-upgrade-modal.tsx`

**Props:**
```typescript
interface SubscriptionUpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTier: 'free' | 'basic' | 'pro' | 'elite'
  userId: string
}
```

**Функционал:**
- Выбор нового тарифа (только выше текущего)
- Умная конвертация оставшихся дней
- Расчет стоимости апгрейда
- Переход на страницу оплаты

---

## 📊 Сравнение: Старое vs Новое

### Старая архитектура (удалено):

```
dashboard-client.tsx (1880 строк монолита)
│
├── Профиль (встроен прямо в код)
├── Бонусы (встроен прямо в код)
├── Подписка (встроен прямо в код)
├── Тренировки (встроен прямо в код)
└── Примитивная статистика

Минусы:
❌ Сложно поддерживать
❌ Невозможно переиспользовать компоненты
❌ Все в одном файле
❌ Плохая производительность
❌ Сложно тестировать
```

### Новая архитектура (текущая):

```
health-tracker-content.tsx (920 строк)
│
├── Импорт готовых компонентов:
│   ├── DesktopProfileCard (152 строки)
│   ├── DesktopSubscriptionCard (200 строк)
│   ├── DesktopBonusCard (172 строки)
│   └── ProfileTab (512 строк)
│
├── Импорт глобальных модалок:
│   ├── ProfileEditDialog
│   ├── SubscriptionRenewalModal
│   └── SubscriptionUpgradeModal
│
└── Health Tracker функционал:
    ├── Виджеты метрик (вода, шаги, вес, сон, кофеин, настроение)
    ├── Система привычек с трекингом
    ├── Полноценная статистика с графиками
    ├── Достижения и геймификация
    └── Фото-прогресс

Плюсы:
✅ Модульная архитектура
✅ Переиспользуемые компоненты
✅ Разделение ответственности
✅ Отличная производительность
✅ Легко тестировать
✅ Легко расширять
```

---

## 🛠️ Инструкции для ИИ

### ❌ НЕ делай это:

1. **НЕ создавай новый `dashboard-client.tsx`**
   - Этот файл был удален намеренно
   - Используй существующую модульную архитектуру

2. **НЕ используй `ProfileEditDialogWrapper`**
   - Этот wrapper был удален как мертвый код
   - Используй `ProfileEditDialog` напрямую с ручным управлением состоянием

3. **НЕ создавай роут `/dashboard/health-tracker`**
   - Теперь все доступно по адресу `/dashboard`
   - `health-tracker/` это модуль, а не роут

4. **НЕ дублируй логику профиля/подписки/бонусов**
   - Используй готовые компоненты из `health-tracker/components/`
   - Используй готовые модалки из `/components`

### ✅ Делай это:

1. **Используй существующие компоненты:**
   ```typescript
   import { DesktopProfileCard } from '@/app/dashboard/health-tracker/components/desktop-profile-card'
   import { ProfileEditDialog } from '@/components/profile-edit-dialog'
   
   const [open, setOpen] = useState(false)
   
   <DesktopProfileCard onEditClick={() => setOpen(true)} />
   <ProfileEditDialog open={open} onOpenChange={setOpen} profile={profile} />
   ```

2. **Загружай данные на сервере:**
   ```typescript
   // В Server Component
   const profile = await getCurrentProfile()
   const bonusStats = await getBonusStats(profile.id)
   
   return <ClientComponent profile={profile} bonusStats={bonusStats} />
   ```

3. **Управляй состоянием модалок явно:**
   ```typescript
   const [profileDialogOpen, setProfileDialogOpen] = useState(false)
   const [renewalModalOpen, setRenewalModalOpen] = useState(false)
   
   // Открывать по событию
   <button onClick={() => setProfileDialogOpen(true)}>Редактировать</button>
   ```

4. **Переиспользуй компоненты в новых местах:**
   - Desktop карточки можно использовать в других местах
   - Модалки уже глобальные
   - Виджеты метрик можно добавлять куда угодно

---

## 📚 Связанная документация

- `docs/guides/PAYMENT_SYSTEM.md` - платежная система
- `docs/guides/YOOKASSA_PAYMENTS.md` - рекуррентные платежи
- `docs/guides/BONUS_SYSTEM.md` - система бонусов
- `docs/guides/ACHIEVEMENTS_SYSTEM.md` - система достижений
- `docs/HEALTH_TRACKER_INTEGRATION_DONE.md` - интеграция health tracker с БД

---

## 🎯 Итого

**Health Tracker** - это полнофункциональный дашборд с:
- ✅ Трекингом метрик здоровья
- ✅ Управлением профилем
- ✅ Управлением подпиской
- ✅ Бонусной системой
- ✅ Системой достижений
- ✅ Статистикой и аналитикой

**Доступен по адресу:** `/dashboard`

**Архитектура:** Модульная, чистая, легко расширяемая

**Код:** 920 строк основной логики + переиспользуемые компоненты

**Удалено:** 1880 строк монолитного кода ✅
