# 🔧 Руководство по исправлению OAuth авторизации

**Дата:** 25 декабря 2025  
**Статус:** Исправлено

## 🐛 Обнаруженные проблемы

### 1. Google OAuth перекидывает на localhost
**Причина:** Использование `window.location.origin` вместо правильного production URL  
**Статус:** ✅ Исправлено

### 2. Яндекс выдает ошибку "invalid_scope"
**Причина:** Запрошены неподдерживаемые scope `login:email login:info login:avatar`  
**Статус:** ✅ Исправлено

### 3. Telegram не работает по реферальной ссылке
**Причина:** Реферальный код должен сохраняться в localStorage  
**Статус:** ✅ Уже работает корректно

---

## ✅ Что было исправлено

### 1. Google OAuth (`components/oauth-buttons.tsx`)

**Было:**
```typescript
const callbackUrl = `${window.location.origin}/auth/callback?redirect=${redirectTo}${referralCode ? `&ref=${referralCode}` : ''}`
```

**Стало:**
```typescript
// Используем NEXT_PUBLIC_SITE_URL для правильного production redirect
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
const callbackUrl = `${siteUrl}/auth/callback?redirect=${redirectTo}${referralCode ? `&ref=${referralCode}` : ''}`

// Сохраняем реферальный код в localStorage перед OAuth redirect
if (referralCode) {
  localStorage.setItem('pending_referral_code', referralCode)
}
```

### 2. Яндекс OAuth (`app/api/auth/yandex/init/route.ts`)

**Было:**
```typescript
yandexAuthUrl.searchParams.set('scope', 'login:email login:info login:avatar')
```

**Стало:**
```typescript
// Для Яндекс ID используем пустой scope или только разрешенные в настройках приложения
// Базовая информация о пользователе доступна по умолчанию
// Если нужны дополнительные права, настройте их в консоли Яндекс ID
// yandexAuthUrl.searchParams.set('scope', '')
```

### 3. Telegram OAuth
Уже работает корректно! Реферальный код сохраняется в localStorage и обрабатывается в API.

---

## 🔧 Настройка OAuth провайдеров

### Google OAuth

#### 1. Настройка в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите или создайте проект
3. Перейдите в **APIs & Services → Credentials**
4. Создайте **OAuth 2.0 Client ID**

#### 2. Важно! Authorized redirect URIs

**Для Supabase Auth добавьте:**
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

**НЕ добавляйте:**
```
http://localhost:3000/auth/callback  ❌
https://yourdomain.com/auth/callback ❌
```

Supabase обрабатывает OAuth самостоятельно и перенаправляет на ваш домен через свой callback.

#### 3. Настройка в Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. **Authentication → Providers → Google**
3. Включите Google provider
4. Вставьте:
   - **Client ID** из Google Console
   - **Client Secret** из Google Console
5. **Site URL:** `https://yourdomain.com` (ваш production домен)
6. **Redirect URLs:** Добавьте `https://yourdomain.com/**`

#### 4. Переменные окружения

```env
# .env.local
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Важно:** `NEXT_PUBLIC_SITE_URL` должен совпадать с **Site URL** в Supabase!

---

### Яндекс OAuth

#### 1. Создание приложения в Яндекс ID

1. Откройте [Яндекс OAuth](https://oauth.yandex.ru/)
2. Нажмите **Зарегистрировать новое приложение**
3. Заполните информацию:
   - **Название:** MargoFitness
   - **Права доступа:** 
     - НЕ выбирайте ничего, если не уверены
     - Базовая информация доступна по умолчанию
4. **Callback URI #1:** `https://yourdomain.com/api/auth/yandex/callback`

#### 2. Важно! Про Scope

Яндекс ID **не использует** старые scope типа `login:email login:info login:avatar`.

**Правильные варианты:**
- Пустой scope (по умолчанию дает базовую информацию)
- Только те scope, которые вы явно разрешили в настройках приложения

**Что доступно по умолчанию:**
- `id` - ID пользователя
- `login` - логин
- `client_id` - ID приложения
- `display_name` - отображаемое имя
- `real_name` - полное имя
- `first_name` - имя
- `last_name` - фамилия
- `default_email` - email (если разрешен)

#### 3. Переменные окружения

```env
# .env.local
YANDEX_CLIENT_ID=your_client_id
YANDEX_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 4. Тестирование

```bash
# Проверьте что переменные загружены
echo $YANDEX_CLIENT_ID

# Откройте в браузере
https://yourdomain.com/auth

# Нажмите "Yandex"
# Если видите "invalid_scope" - проверьте настройки приложения в Яндекс OAuth
```

---

### Telegram OAuth

#### 1. Создание бота

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Получите **Bot Token**

#### 2. Настройка домена

```bash
# Отправьте @BotFather
/setdomain

# Выберите вашего бота

# Введите домен (БЕЗ https://)
yourdomain.com
```

**Важно:** Telegram Login Widget работает только с публичными доменами, не с localhost!

Для локальной разработки используйте **ngrok**:
```bash
ngrok http 3000
# Получите URL: https://abc123.ngrok.io
# Установите его в /setdomain
```

#### 3. Переменные окружения

```env
# .env.local
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
NEXT_PUBLIC_TELEGRAM_BOT_ID=1234567890
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Для локальной разработки с ngrok
# NEXT_PUBLIC_SITE_URL=https://abc123.ngrok.io
```

#### 4. Реферальная система

Telegram OAuth **уже поддерживает** реферальные ссылки!

**Как это работает:**
1. Пользователь переходит по ссылке: `https://yourdomain.com/auth?ref=ABC123`
2. Реферальный код сохраняется в `localStorage`
3. При авторизации через Telegram код передается в API
4. API обрабатывает реферал и начисляет бонусы

**Код работает автоматически**, ничего настраивать не нужно!

---

## 🧪 Тестирование

### 1. Проверка переменных окружения

```bash
# Проверьте что все переменные загружены
npm run dev

# В консоли браузера
console.log(process.env.NEXT_PUBLIC_SITE_URL)
// Должно показать: "https://yourdomain.com"
```

### 2. Тест Google OAuth

1. Откройте `https://yourdomain.com/auth`
2. Нажмите **Google**
3. Должен открыться Google OAuth
4. После авторизации должен вернуть на `https://yourdomain.com/dashboard`
5. **НЕ должен** перекидывать на localhost!

### 3. Тест Яндекс OAuth

1. Откройте `https://yourdomain.com/auth`
2. Нажмите **Yandex**
3. Должен открыться Яндекс OAuth
4. **НЕ должен** показывать "invalid_scope"
5. После авторизации должен вернуть на dashboard

### 4. Тест Telegram + Реферал

1. Создайте реферальную ссылку в dashboard
2. Откройте ссылку в браузере: `https://yourdomain.com/auth?ref=YOUR_CODE`
3. Нажмите **Telegram**
4. Авторизуйтесь через Telegram
5. Проверьте бонусный баланс - должно быть начислено 500 шагов (250 приветственных + 250 за реферал)

---

## 🔍 Troubleshooting

### Google OAuth все еще перекидывает на localhost

**Причина:** В Supabase Dashboard **Site URL** указан localhost

**Решение:**
1. Откройте Supabase Dashboard
2. **Authentication → URL Configuration**
3. **Site URL:** измените на `https://yourdomain.com`
4. **Redirect URLs:** добавьте `https://yourdomain.com/**`
5. Сохраните

### Яндекс OAuth показывает "invalid_scope"

**Причина:** В настройках приложения Яндекс ID не разрешены запрошенные scope

**Решение:**
1. Откройте [Яндекс OAuth Console](https://oauth.yandex.ru/)
2. Выберите ваше приложение
3. **НЕ выбирайте** дополнительные права доступа
4. Базовой информации достаточно
5. В коде scope уже **убран** (см. исправления выше)

### Telegram реферал не работает

**Проверьте:**
1. `NEXT_PUBLIC_SITE_URL` установлен правильно
2. Реферальный код валидный (проверьте в БД)
3. Смотрите console.log в Network tab браузера
4. Проверьте что localStorage не заблокирован

**Код в `telegram-login-widget.tsx` уже правильный:**
```typescript
// Сохраняем реферальный код перед авторизацией
useEffect(() => {
  if (referralCode) {
    localStorage.setItem('telegram_ref_code', referralCode)
  }
}, [referralCode])

// Передаем в API
const response = await fetch('/api/auth/telegram', {
  body: JSON.stringify({
    ...user,
    ref_code: localStorage.getItem('telegram_ref_code') || undefined
  })
})
```

### NEXT_PUBLIC_SITE_URL не работает

**Причина:** Переменные окружения не перезагружены

**Решение:**
```bash
# Остановите сервер (Ctrl+C)
# Перезапустите
npm run dev
```

**Для production (Vercel):**
1. Откройте **Settings → Environment Variables**
2. Добавьте `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
3. **Redeploy** приложение

---

## 📚 Дополнительные ресурсы

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Яндекс OAuth Documentation](https://yandex.ru/dev/id/doc/ru/)
- [Telegram Login Widget](https://core.telegram.org/widgets/login)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## ✅ Checklist перед деплоем

- [ ] `NEXT_PUBLIC_SITE_URL` установлен в `.env.local` и Vercel
- [ ] Google OAuth Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- [ ] Supabase Site URL: `https://yourdomain.com`
- [ ] Supabase Redirect URLs: `https://yourdomain.com/**`
- [ ] Яндекс OAuth Callback URI: `https://yourdomain.com/api/auth/yandex/callback`
- [ ] Яндекс OAuth scope: **убран** или пустой
- [ ] Telegram Bot domain: `yourdomain.com` (через `/setdomain`)
- [ ] Все environment variables добавлены в Vercel
- [ ] Протестированы все 3 провайдера на production

---

**Дата последнего обновления:** 25 декабря 2025  
**Автор:** AI Assistant  
**Версия:** 1.0.0

