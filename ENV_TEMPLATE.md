# 🔐 Переменные окружения для Telegram Auth

## Файл: `.env.local`

Создайте файл `.env.local` в корне проекта и добавьте следующие переменные:

```env
# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ============================================
# Site Configuration
# ============================================
# Production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Или для локальной разработки с ngrok
# NEXT_PUBLIC_SITE_URL=https://abc123.ngrok.io

# ============================================
# Telegram Bot Configuration
# ============================================
# Bot Token от @BotFather (СЕКРЕТНЫЙ - только на сервере)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Bot ID (первая часть токена до двоеточия - публичный)
NEXT_PUBLIC_TELEGRAM_BOT_ID=1234567890

# Username бота (публичный - используется на клиенте)
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot

# ============================================
# Yandex ID OAuth Configuration
# ============================================
# Yandex OAuth Client ID (публичный)
YANDEX_CLIENT_ID=your_client_id_here

# Yandex OAuth Client Secret (СЕКРЕТНЫЙ - только на сервере)
YANDEX_CLIENT_SECRET=your_client_secret_here

# ============================================
# YooKassa Payment Gateway (опционально)
# ============================================
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key

# ============================================
# Email Service (опционально)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com

# ============================================
# Development
# ============================================
NODE_ENV=development
```

---

## 📝 Как получить значения

### 1. Supabase
1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в **Settings → API**
4. Скопируйте:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Telegram Bot
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Получите:
   - **Bot Token** → `TELEGRAM_BOT_TOKEN`
   - **Username** → `NEXT_PUBLIC_TELEGRAM_BOT_NAME`

### 3. Site URL
- **Production:** Ваш реальный домен
- **Development:** 
  - Установите ngrok: `npm install -g ngrok`
  - Запустите: `ngrok http 3000`
  - Скопируйте URL: `https://abc123.ngrok.io`

---

## ⚠️ Важные замечания

### Секретные переменные (БЕЗ `NEXT_PUBLIC_`)
- `TELEGRAM_BOT_TOKEN` - **НЕ ПУБЛИКУЙТЕ!**
- `YOOKASSA_SECRET_KEY` - **НЕ ПУБЛИКУЙТЕ!**
- `SMTP_PASSWORD` - **НЕ ПУБЛИКУЙТЕ!**

Эти переменные доступны **только на сервере** (API routes, Server Components).

### Публичные переменные (С `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` - безопасно публиковать
- `NEXT_PUBLIC_SITE_URL` - безопасно публиковать
- `NEXT_PUBLIC_SUPABASE_URL` - безопасно публиковать
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - безопасно публиковать (это публичный ключ)

Эти переменные доступны **на клиенте и сервере**.

---

## 🚀 Production деплой

### Vercel
1. Перейдите в **Settings → Environment Variables**
2. Добавьте все переменные из `.env.local`
3. Выберите окружение: **Production**
4. Сохраните

### Netlify
1. Перейдите в **Site settings → Build & deploy → Environment**
2. Добавьте все переменные
3. Сохраните

### Railway / Render
1. Откройте настройки проекта
2. Добавьте Environment Variables
3. Сохраните и передеплойте

---

## ✅ Проверка

После добавления переменных:

```bash
# Перезапустите сервер
npm run dev

# Проверьте в консоли браузера
console.log(process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME)
// Должно вывести: "margofitness_auth_bot"

# Проверьте на сервере (в API route)
console.log(process.env.TELEGRAM_BOT_TOKEN)
// Должно вывести токен
```

---

## 🐛 Troubleshooting

### "Bot name not provided"
→ Проверьте `NEXT_PUBLIC_TELEGRAM_BOT_NAME` в `.env.local`  
→ Перезапустите сервер: `npm run dev`

### "Bot token not configured"
→ Проверьте `TELEGRAM_BOT_TOKEN` в `.env.local`  
→ Убедитесь, что нет опечаток

### "Invalid hash"
→ Проверьте, что `TELEGRAM_BOT_TOKEN` скопирован полностью  
→ Проверьте, что нет лишних пробелов

---

## 📚 Дополнительно

- **Документация Next.js:** [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- **Документация Telegram:** [Bot API](https://core.telegram.org/bots/api)
- **Документация Supabase:** [Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

---

**Дата:** 24 декабря 2025  
**Версия:** 1.0.0

