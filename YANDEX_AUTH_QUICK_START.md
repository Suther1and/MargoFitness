# ⚡ Yandex ID OAuth - Быстрый старт

Краткое руководство по запуску авторизации через Yandex ID за 5 минут.

## 🎯 Быстрая установка (3 шага)

### 1️⃣ Переменные окружения

Добавьте в `.env.local`:

```env
YANDEX_CLIENT_ID=81370b983cd64ba79bc49dc8d9b215e1
YANDEX_CLIENT_SECRET=ee66c653113e4ceab2fa7f64d4ceff87
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2️⃣ Миграция базы данных

Выполните в Supabase SQL Editor:

```sql
-- Добавить поле yandex_id
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS yandex_id TEXT UNIQUE;

-- Создать индекс
CREATE INDEX IF NOT EXISTS idx_profiles_yandex_id 
ON profiles(yandex_id);
```

### 3️⃣ Перезапуск

```bash
npm run dev
```

## ✅ Готово!

Откройте `/auth` и протестируйте кнопку **Yandex**.

## 📝 Что было реализовано

### Файлы созданы:
- ✅ `app/api/auth/yandex/init/route.ts` - инициация OAuth
- ✅ `app/api/auth/yandex/callback/route.ts` - обработка callback
- ✅ `database/migrations/012_ADD_YANDEX_AUTH.sql` - миграция БД

### Файлы обновлены:
- ✅ `components/oauth-buttons.tsx` - рабочая кнопка Yandex
- ✅ `types/supabase.ts` - добавлено поле yandex_id
- ✅ `ENV_TEMPLATE.md` - документация переменных

## 🔧 Настройка Yandex приложения

**Redirect URI в Yandex OAuth:**
```
https://yourdomain.com/api/auth/yandex/callback
```

**Права доступа (Permissions):**
- `login:email` ✓
- `login:info` ✓
- `login:avatar` (опционально)

## 🎨 OAuth Flow

```mermaid
graph LR
    A[Кнопка Yandex] --> B[/init endpoint]
    B --> C[Yandex OAuth]
    C --> D[/callback endpoint]
    D --> E[Supabase Auth]
    E --> F[Dashboard]
```

## 🐛 Частые проблемы

| Проблема | Решение |
|----------|---------|
| "OAuth not configured" | Проверьте переменные в `.env.local` |
| "Invalid redirect_uri" | Обновите Redirect URI в Yandex OAuth |
| "Token exchange failed" | Проверьте CLIENT_SECRET |

## 📖 Полная документация

Подробная документация доступна в:
- `APPLY_MIGRATION_012.md` - полное руководство
- `ENV_TEMPLATE.md` - все переменные окружения

## 🚀 Деплой на Vercel

```bash
# Добавьте переменные в Vercel Dashboard:
YANDEX_CLIENT_ID=81370b983cd64ba79bc49dc8d9b215e1
YANDEX_CLIENT_SECRET=ee66c653113e4ceab2fa7f64d4ceff87
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
```

---

**Нужна помощь?** Смотрите `APPLY_MIGRATION_012.md` для детального troubleshooting.

