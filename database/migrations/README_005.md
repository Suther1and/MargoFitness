# Миграция 005: Admin Users RLS

## Что делает
Добавляет RLS политики для админ-панели управления пользователями:
- Админы могут видеть все профили
- Админы могут редактировать все профили

## Как выполнить

### В Supabase Dashboard:
1. Откройте **SQL Editor**
2. Скопируйте содержимое `005_ADMIN_USERS_RLS.sql`
3. Нажмите **Run**
4. Убедитесь в успешном выполнении

### Через CLI (альтернатива):
```bash
supabase db execute -f database/migrations/005_ADMIN_USERS_RLS.sql
```

## Проверка
После выполнения:
1. Войдите как админ
2. Откройте `/admin/users`
3. Вы должны видеть список всех пользователей
4. Попробуйте отредактировать пользователя

## Откат (если нужен)
```sql
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
```

---
**Дата:** 23 декабря 2025

