# 🔐 Telegram Авторизация - MargoFitness

## ✅ Что реализовано (24 декабря 2025)

### Компоненты:
- ✅ `components/telegram-login-widget.tsx` - официальный Telegram Login Widget
- ✅ `components/oauth-buttons.tsx` - обновлен для поддержки Telegram
- ✅ API endpoints для обработки Telegram авторизации
- ✅ Миграция базы данных для Telegram полей

### Архитектура:

```
┌─────────────────┐
│  Пользователь   │
└────────┬────────┘
         │ Клик на "Telegram"
         ▼
┌─────────────────────────┐
│  TelegramLoginWidget    │
│  (Telegram Widget JS)   │
└────────┬────────────────┘
         │ Callback с данными
         ▼
┌─────────────────────────┐
│  /api/auth/telegram     │
│  - Проверка hash        │
│  - Создание/поиск user  │
│  - Генерация кода       │
└────────┬────────────────┘
         │ Возврат exchange code
         ▼
┌──────────────────────────┐
│  /api/auth/telegram/     │
│  exchange                │
│  - Проверка кода         │
│  - Создание сессии       │
└────────┬─────────────────┘
         │ Редирект с сессией
         ▼
┌─────────────────┐
│   Dashboard     │
└─────────────────┘
```

---

## 📋 Требования

### 1. Создать Telegram Bot

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)

2. Отправьте команду `/newbot`

3. Следуйте инструкциям:
   - Введите имя бота (например: `MargoFitness Auth Bot`)
   - Введите username (например: `margofitness_auth_bot`)

4. Сохраните **Bot Token** (например: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

5. Настройте домен для Login Widget:
   ```
   /setdomain
   Выберите бота
   Введите домен: yourdomain.com
   ```

### 2. Переменные окружения

Добавьте в `.env.local`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot

# Site URL (для редиректов)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Важно:**
- `TELEGRAM_BOT_TOKEN` - секретный токен (только на сервере)
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` - username бота (публичный)
- `NEXT_PUBLIC_SITE_URL` - ваш домен (для production)

---

## 🗄️ Миграция базы данных

### Применить миграцию:

```bash
# Подключитесь к Supabase SQL Editor
# Скопируйте и выполните содержимое файла:
database/migrations/010_ADD_TELEGRAM_AUTH.sql
```

### Что добавляет миграция:

1. **Таблица `auth_exchange_codes`:**
   - Хранит одноразовые коды для обмена на сессию
   - Автоматическое истечение через 5 минут
   - RLS политики для безопасности

2. **Поля в таблице `profiles`:**
   - `telegram_id` - уникальный ID пользователя Telegram
   - `telegram_username` - username пользователя Telegram

3. **Функция очистки:**
   - `cleanup_expired_exchange_codes()` - удаляет истекшие коды

---

## 🔧 Как это работает

### 1. Пользователь кликает на "Telegram"

```typescript
// components/oauth-buttons.tsx
const handleTelegramClick = () => {
  if (!telegramBotName) {
    alert("Telegram авторизация не настроена")
    return
  }
  setShowTelegramWidget(true)
}
```

### 2. Отображается Telegram Login Widget

```typescript
// components/telegram-login-widget.tsx
<script 
  src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="margofitness_auth_bot"
  data-size="large"
  data-onauth="onTelegramAuth(user)"
/>
```

### 3. Callback от Telegram

Telegram вызывает глобальную функцию `onTelegramAuth(user)` с данными:

```typescript
interface TelegramUser {
  id: number              // 123456789
  first_name: string      // "Иван"
  last_name?: string      // "Петров"
  username?: string       // "ivan_petrov"
  photo_url?: string      // "https://..."
  auth_date: number       // Unix timestamp
  hash: string            // Подпись для проверки
}
```

### 4. Отправка на сервер

```typescript
const response = await fetch('/api/auth/telegram', {
  method: 'POST',
  body: JSON.stringify(user)
})
```

### 5. Проверка подлинности (Backend)

```typescript
// app/api/auth/telegram/route.ts

// 1. Проверяем hash (подпись от Telegram)
function verifyTelegramAuth(data, botToken) {
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest()
  
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')
  
  return computedHash === data.hash
}

// 2. Проверяем время (не старше 24 часов)
if (currentTime - auth_date > 86400) {
  return error('expired')
}
```

### 6. Создание/поиск пользователя

```typescript
// Проверяем существующего пользователя
const existingProfile = await supabase
  .from('profiles')
  .select('*')
  .eq('telegram_id', telegramData.id)
  .single()

if (existingProfile) {
  // Обновляем данные
  await supabase
    .from('profiles')
    .update({ full_name, avatar_url, telegram_username })
    .eq('id', userId)
} else {
  // Создаем нового пользователя
  const { data: authData } = await supabase.auth.admin.createUser({
    email: `telegram_${telegramData.id}@telegram.local`,
    email_confirm: true,
    user_metadata: { ... }
  })
  
  // Создаем профиль
  await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      telegram_id: telegramData.id.toString(),
      telegram_username: telegramData.username,
      role: 'user',
      subscription_tier: 'free'
    })
}
```

### 7. Генерация кода обмена

```typescript
const exchangeCode = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 минут

await supabase
  .from('auth_exchange_codes')
  .insert({
    code: exchangeCode,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    used: false
  })

return { success: true, exchangeCode }
```

### 8. Обмен кода на сессию

```typescript
// Frontend
const exchangeResponse = await fetch('/api/auth/telegram/exchange', {
  method: 'POST',
  body: JSON.stringify({ exchangeCode })
})

// Backend
const codeData = await supabase
  .from('auth_exchange_codes')
  .select('*')
  .eq('code', exchangeCode)
  .eq('used', false)
  .single()

// Помечаем код как использованный
await supabase
  .from('auth_exchange_codes')
  .update({ used: true })
  .eq('code', exchangeCode)

// Создаем magic link для сессии
const { data } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: `telegram_${codeData.user_id}@telegram.local`
})

return { actionLink: data.properties.action_link }
```

### 9. Редирект на Dashboard

```typescript
window.location.href = actionLink
// Пользователь автоматически авторизован
```

---

## 🎨 UI/UX

### Кнопка Telegram

```tsx
<Button onClick={handleTelegramClick}>
  <TelegramIcon />
  <span>Telegram</span>
</Button>
```

### Telegram Widget

После клика отображается официальный виджет:

```
┌──────────────────────────────┐
│ Нажмите кнопку ниже для      │
│ входа через Telegram         │
│                              │
│  ┌────────────────────────┐  │
│  │  [Telegram Icon]       │  │
│  │  Log in with Telegram  │  │
│  └────────────────────────┘  │
│                              │
│        Отмена                │
└──────────────────────────────┘
```

### Состояния загрузки

```tsx
{loading && (
  <div>Авторизация...</div>
)}
```

---

## 🧪 Тестирование

### Локальное тестирование

**Проблема:** Telegram Widget работает только на доменах, зарегистрированных у BotFather.

**Решение для локальной разработки:**

1. **Используйте ngrok:**
   ```bash
   ngrok http 3000
   ```
   
2. **Получите публичный URL:**
   ```
   https://abc123.ngrok.io
   ```

3. **Зарегистрируйте домен у BotFather:**
   ```
   /setdomain
   Выберите бота
   Введите: abc123.ngrok.io
   ```

4. **Обновите `.env.local`:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok.io
   ```

5. **Запустите приложение:**
   ```bash
   npm run dev
   ```

6. **Откройте в браузере:**
   ```
   https://abc123.ngrok.io/auth/login
   ```

### Production тестирование

1. **Задеплойте на Vercel/Netlify**

2. **Зарегистрируйте production домен:**
   ```
   /setdomain
   yourdomain.com
   ```

3. **Обновите переменные окружения:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

4. **Протестируйте:**
   - Перейдите на `/auth/login`
   - Кликните "Telegram"
   - Авторизуйтесь через Telegram
   - Проверьте редирект на `/dashboard`

---

## 🔒 Безопасность

### 1. Проверка подлинности

✅ **Hash verification** - проверяем подпись от Telegram
✅ **Timestamp check** - данные не старше 24 часов
✅ **Bot token** - хранится только на сервере

### 2. Одноразовые коды

✅ **Exchange codes** - используются только один раз
✅ **Expiration** - истекают через 5 минут
✅ **Database flag** - помечаются как `used`

### 3. RLS политики

✅ **auth_exchange_codes** - только authenticated пользователи
✅ **profiles** - доступ только к своим данным

### 4. HTTPS

⚠️ **Обязательно** используйте HTTPS в production
⚠️ Telegram Widget не работает на HTTP (кроме localhost)

---

## 📊 База данных

### Таблица `auth_exchange_codes`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary key |
| `code` | TEXT | Одноразовый код (32 байта hex) |
| `user_id` | UUID | Foreign key → auth.users |
| `expires_at` | TIMESTAMPTZ | Время истечения (5 минут) |
| `used` | BOOLEAN | Флаг использования |
| `created_at` | TIMESTAMPTZ | Время создания |

### Таблица `profiles` (новые поля)

| Поле | Тип | Описание |
|------|-----|----------|
| `telegram_id` | TEXT | Уникальный ID Telegram |
| `telegram_username` | TEXT | Username Telegram |

### Индексы

```sql
CREATE INDEX idx_auth_exchange_codes_code ON auth_exchange_codes(code);
CREATE INDEX idx_auth_exchange_codes_user_id ON auth_exchange_codes(user_id);
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
```

---

## 🐛 Возможные проблемы

### 1. Widget не отображается

**Причина:** Домен не зарегистрирован у BotFather

**Решение:**
```
/setdomain
yourdomain.com
```

### 2. "Bot domain invalid"

**Причина:** Используете localhost без ngrok

**Решение:** Используйте ngrok для локальной разработки

### 3. "Invalid hash"

**Причина:** Неверный `TELEGRAM_BOT_TOKEN`

**Решение:** Проверьте токен в `.env.local`

### 4. "Exchange code expired"

**Причина:** Код истек (5 минут)

**Решение:** Авторизуйтесь заново

### 5. "Session creation failed"

**Причина:** Проблема с Supabase Auth

**Решение:** 
- Проверьте логи Supabase
- Убедитесь, что миграция применена
- Проверьте RLS политики

---

## 📈 Мониторинг

### Логи

```typescript
// Frontend
console.log('[Telegram Widget] Auth callback received')

// Backend
console.log('[Telegram Auth] Received data:', { id, username })
console.log('[Telegram Auth] User created:', userId)
console.log('[Telegram Exchange] Session created')
```

### Метрики

Отслеживайте в Supabase Dashboard:
- Количество новых пользователей через Telegram
- Ошибки авторизации
- Истекшие коды обмена

### Очистка

Периодически запускайте функцию очистки:

```sql
SELECT cleanup_expired_exchange_codes();
```

Или настройте cron job:

```sql
-- В pg_cron (если доступно)
SELECT cron.schedule(
  'cleanup-exchange-codes',
  '0 * * * *', -- Каждый час
  'SELECT cleanup_expired_exchange_codes()'
);
```

---

## 🎯 Преимущества Telegram Auth

✅ **Быстрая регистрация** - 1 клик, без ввода email/пароля
✅ **Безопасность** - криптографическая подпись от Telegram
✅ **Удобство** - пользователи уже авторизованы в Telegram
✅ **Данные профиля** - автоматически получаем имя, фото, username
✅ **Без SMS** - не нужна верификация телефона
✅ **Официальный виджет** - поддержка от Telegram

---

## 📝 Дополнительные возможности

### 1. Связывание аккаунтов

Позвольте пользователям связать Telegram с существующим email аккаунтом:

```typescript
// Проверяем, есть ли пользователь с таким email
const existingUser = await supabase
  .from('profiles')
  .select('*')
  .eq('email', userEmail)
  .single()

if (existingUser && !existingUser.telegram_id) {
  // Обновляем профиль, добавляя Telegram ID
  await supabase
    .from('profiles')
    .update({
      telegram_id: telegramData.id,
      telegram_username: telegramData.username
    })
    .eq('id', existingUser.id)
}
```

### 2. Telegram уведомления

Используйте Telegram Bot для отправки уведомлений:

```typescript
async function sendTelegramNotification(telegramId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramId,
      text: message,
      parse_mode: 'HTML'
    })
  })
}
```

### 3. Telegram Mini App

Интегрируйте с Telegram Mini Apps для полноценного опыта в Telegram:

```typescript
// Проверяем, запущено ли приложение в Telegram
if (window.Telegram?.WebApp) {
  const webApp = window.Telegram.WebApp
  webApp.ready()
  
  // Получаем данные пользователя
  const initData = webApp.initDataUnsafe
  console.log('Telegram User:', initData.user)
}
```

---

## 🔄 Миграция существующих пользователей

Если у вас уже есть пользователи с email, позвольте им привязать Telegram:

```typescript
// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return (
    <div>
      <h2>Привязать Telegram</h2>
      <TelegramLoginWidget
        botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME!}
        onAuth={async (user) => {
          // Обновляем текущий профиль
          await fetch('/api/profile/link-telegram', {
            method: 'POST',
            body: JSON.stringify(user)
          })
        }}
      />
    </div>
  )
}
```

---

## 📚 Ресурсы

- [Telegram Login Widget Docs](https://core.telegram.org/widgets/login)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

## ✅ Чеклист для запуска

- [ ] Создан Telegram Bot через @BotFather
- [ ] Получен Bot Token
- [ ] Зарегистрирован домен через `/setdomain`
- [ ] Добавлены переменные окружения
- [ ] Применена миграция `010_ADD_TELEGRAM_AUTH.sql`
- [ ] Протестирована авторизация (ngrok или production)
- [ ] Проверено создание профиля в БД
- [ ] Проверен редирект на dashboard
- [ ] Настроен мониторинг и логирование

---

**Дата:** 24 декабря 2025  
**Статус:** ✅ Полностью реализовано и готово к использованию  
**Версия:** 1.0.0

