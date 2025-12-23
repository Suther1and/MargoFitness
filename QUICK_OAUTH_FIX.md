# ⚡ Быстрое решение проблемы с Google OAuth

## ✅ Что было исправлено

1. **Улучшен callback route** (`app/auth/callback/route.ts`)
   - Добавлено автоматическое создание профиля
   - Подробное логирование для отладки
   - Обработка ошибок

2. **Исправлена ошибка гидратации React** (`app/layout.tsx`)
   - Добавлен `suppressHydrationWarning`

## 🎯 Быстрая проверка (5 минут)

### 1. Проверьте Supabase Dashboard

Откройте [Supabase Dashboard](https://app.supabase.com/) → ваш проект:

**Authentication → URL Configuration:**
```
✅ Redirect URLs должны содержать:
   http://localhost:3000/auth/callback
   http://localhost:3000/**
```

**Authentication → Providers → Google:**
```
✅ Enabled: ON
✅ Client ID: заполнен
✅ Client Secret: заполнен
```

### 2. Проверьте Google Cloud Console

Откройте [Google Cloud Console](https://console.cloud.google.com/):

**APIs & Services → Credentials → OAuth 2.0 Client IDs:**
```
✅ Authorized redirect URIs должны содержать:
   https://ваш-проект.supabase.co/auth/v1/callback
```

**ВАЖНО**: Это должен быть URL Supabase, а не localhost!

### 3. Тестирование

1. **Откройте инкогнито** (чтобы не было кеша)

2. **Откройте консоль** (F12)

3. **Перейдите на**:
   ```
   http://localhost:3000/auth/login
   ```

4. **Нажмите "Google"** и авторизуйтесь

5. **Проверьте консоль** - должны быть логи:
   ```
   [Callback] Received callback with code: YES
   [Callback] Session created for user: ...
   [Callback] Profile check: ...
   [Callback] Redirecting to: /dashboard
   ```

## 🐛 Если все еще не работает

### Вариант 1: Пересоздайте триггер

Откройте **Supabase Dashboard → SQL Editor** и выполните:

```sql
-- Удаляем старый триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Создаем новый
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    'inactive',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Вариант 2: Проверьте существующего пользователя

Если пользователь уже создан в `auth.users`, но нет профиля:

```sql
-- Проверка пользователей без профилей
SELECT au.id, au.email 
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Если нашли пользователя без профиля, создайте вручную:
INSERT INTO public.profiles (id, email, role, subscription_status, subscription_tier)
SELECT id, email, 'user', 'inactive', 'free'
FROM auth.users
WHERE id = 'ваш-user-id';
```

### Вариант 3: Проверьте переменные окружения

Создайте файл `.env.local` в корне проекта (если его нет):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

Перезапустите сервер:
```bash
npm run dev
```

## 📊 Что проверить в Supabase

После попытки входа через Google:

1. **Authentication → Users**
   - ✅ Пользователь должен появиться в списке

2. **Table Editor → profiles**
   - ✅ Должна быть запись с тем же ID

3. Если пользователь есть, но профиля нет:
   - Callback route создаст его автоматически при следующем входе
   - Или создайте вручную через SQL (см. Вариант 2 выше)

## 🎓 Дополнительная информация

Подробная документация: `GOOGLE_OAUTH_DEBUG.md`

---

**Готово к тестированию!** 🚀

