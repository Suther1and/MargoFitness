# ⚡ Быстрый деплой (5 минут)

## 1️⃣ Supabase - примените миграцию

Откройте [Supabase SQL Editor](https://app.supabase.com) и выполните:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS yandex_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_yandex_id ON profiles(yandex_id);
```

## 2️⃣ Vercel - импортируйте проект

1. Откройте https://vercel.com/new
2. Импортируйте GitHub репозиторий MargoFitness
3. Не нажимайте Deploy! Сначала добавьте переменные ⬇️

## 3️⃣ Добавьте переменные окружения

**Settings → Environment Variables** → добавьте:

### Минимум (обязательно):
```env
NEXT_PUBLIC_SUPABASE_URL=https://yxzrenwkkntnhmdimhln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ_из_supabase
NEXT_PUBLIC_SITE_URL=https://margofitness.pro

YANDEX_CLIENT_ID=81370b983cd64ba79bc49dc8d9b215e1
YANDEX_CLIENT_SECRET=ee66c653113e4ceab2fa7f64d4ceff87
```

### Если используете Telegram:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot
```

### Если используете платежи:
```env
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=ваш_secret_key
```

## 4️⃣ Deploy

Нажмите **Deploy** и ждите 2-3 минуты ☕

## 5️⃣ Настройте домен

**Settings → Domains:**
1. Добавьте `margofitness.pro`
2. Скопируйте DNS записи
3. Добавьте их у регистратора домена
4. Ждите 5-30 минут

## 6️⃣ Обновите Yandex Redirect URI

Откройте https://oauth.yandex.ru/ → ваше приложение:

**Redirect URI:**
```
https://margofitness.pro/api/auth/yandex/callback
```

Сохраните.

## ✅ Готово!

Откройте https://margofitness.pro и протестируйте:
- ✅ Авторизация через Email
- ✅ Авторизация через Google
- ✅ Авторизация через Yandex 🆕
- ✅ Авторизация через Telegram

---

## 🐛 Проблемы?

**"OAuth not configured"**  
→ Проверьте переменные в Vercel, redeploy проект

**"Invalid redirect_uri"**  
→ Обновите Redirect URI в Yandex OAuth

**"Database error"**  
→ Примените миграцию в Supabase (шаг 1)

---

**Подробная инструкция:** `DEPLOY_CHECKLIST.md`  
**Troubleshooting:** `VERCEL_DEPLOY_GUIDE.md`

