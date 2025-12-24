# 🚀 Telegram Auth - Быстрый старт

## За 5 минут до запуска

### 1️⃣ Создайте Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте: `/newbot`
3. Введите имя: `MargoFitness Auth Bot`
4. Введите username: `margofitness_auth_bot`
5. **Сохраните токен:** `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2️⃣ Зарегистрируйте домен

```
/setdomain
Выберите бота
Введите: yourdomain.com
```

**Для локальной разработки:**
```bash
# Установите ngrok
npm install -g ngrok

# Запустите
ngrok http 3000

# Скопируйте URL (например: abc123.ngrok.io)
# Зарегистрируйте его у BotFather
```

### 3️⃣ Добавьте переменные окружения

Создайте/обновите `.env.local`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# или для локальной разработки:
# NEXT_PUBLIC_SITE_URL=https://abc123.ngrok.io
```

### 4️⃣ Примените миграцию

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое `database/migrations/010_ADD_TELEGRAM_AUTH.sql`
4. Выполните SQL

### 5️⃣ Запустите приложение

```bash
npm run dev
```

Откройте: `http://localhost:3000/auth/login` (или ngrok URL)

### 6️⃣ Протестируйте

1. Кликните на кнопку **"Telegram"**
2. Нажмите **"Log in with Telegram"**
3. Подтвердите в Telegram
4. Вы будете перенаправлены на Dashboard ✅

---

## ✅ Готово!

Теперь пользователи могут входить через Telegram в 1 клик.

**Подробная документация:** `docs/TELEGRAM_AUTH_SETUP.md`

---

## 🐛 Проблемы?

### Widget не отображается
→ Проверьте, что домен зарегистрирован у BotFather

### "Bot domain invalid"
→ Используйте ngrok для localhost

### "Invalid hash"
→ Проверьте `TELEGRAM_BOT_TOKEN` в `.env.local`

---

**Нужна помощь?** См. полную документацию в `docs/TELEGRAM_AUTH_SETUP.md`

