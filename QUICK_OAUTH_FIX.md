# ⚡ Быстрое исправление OAuth (25 декабря)

## 🔴 Google - перекидывает на localhost

**Проблема:** Supabase Site URL не установлен

**Решение (1 минута):**

1. Откройте [Supabase Dashboard](https://app.supabase.com/project/yxzrenwkkntnhmdimhln)
2. **Authentication → URL Configuration**
3. Установите:
   - **Site URL:** `https://margo-fitneess.vercel.app`
   - **Redirect URLs:** `https://margo-fitneess.vercel.app/**`
4. Сохраните

✅ **Callback URL правильный:** `https://yxzrenwkkntnhmdimhln.supabase.co/auth/v1/callback`

---

## 🟢 Яндекс - работает ✅

Реферальный код применяется правильно.

---

## 🔴 Telegram - виджет закрывается

**Проблема:** Домен не настроен в @BotFather

**Решение (2 минуты):**

### 1. Настройте домен в Telegram:
```
Откройте @BotFather в Telegram
Отправьте: /setdomain
Выберите вашего бота
Введите: margo-fitneess.vercel.app
```

### 2. Добавьте переменные в Vercel:

**Settings → Environment Variables:**
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
NEXT_PUBLIC_TELEGRAM_BOT_NAME=ваш_bot_username
NEXT_PUBLIC_TELEGRAM_BOT_ID=первая_часть_токена_до_двоеточия
```

Пример:
- Token: `123456789:ABCdef...` 
- Bot ID: `123456789`
- Bot Name: `margofitness_auth_bot`

### 3. Redeploy в Vercel

После добавления переменных сделайте redeploy.

---

## ✅ Итого:

1. **Google:** Установить Site URL в Supabase → `https://margo-fitneess.vercel.app`
2. **Telegram:** `/setdomain` в @BotFather + добавить переменные в Vercel
3. **Redeploy** в Vercel

---

**Время:** 3-5 минут  
**После этого все будет работать** ✅

