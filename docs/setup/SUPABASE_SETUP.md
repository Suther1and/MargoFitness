# Настройка Supabase

Этот файл содержит инструкции по настройке Supabase для проекта MargoFitness.

## ✅ Уже настроено:

1. ✅ Установлены зависимости: `@supabase/supabase-js`, `@supabase/ssr`
2. ✅ Создан файл `.env.local` с переменными окружения
3. ✅ Настроены клиенты Supabase в `lib/supabase.ts`
4. ✅ Создан middleware для обработки аутентификации
5. ✅ Созданы примеры использования в `/examples`

## Текущие данные проекта:

- **Project URL:** https://yxzrenwkkntnhmdimhln.supabase.co
- **Project ID:** yxzrenwkkntnhmdimhln

## Следующие шаги:

## Шаг 1: Перезапустите dev сервер

Чтобы переменные окружения применились, перезапустите сервер:

1. Остановите текущий процесс (Ctrl+C в терминале)
2. Запустите снова: `npm run dev`

## Шаг 2: Создание таблиц

Пример SQL для создания таблицы пользователей:

```sql
-- Создание таблицы профилей пользователей
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Включение RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Политика: пользователи могут просматривать все профили
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Политика: пользователи могут обновлять только свой профиль
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Триггер для автоматического создания профиля при регистрации
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Шаг 3: Генерация типов

После создания таблиц сгенерируйте TypeScript типы:

```bash
# Установка Supabase CLI (если еще не установлен)
npm install -g supabase

# Вход в аккаунт
supabase login

# Связывание с проектом
supabase link --project-ref yxzrenwkkntnhmdimhln

# Генерация типов
npx supabase gen types typescript --project-id yxzrenwkkntnhmdimhln > types/supabase.ts
```

Типы автоматически будут использоваться в Supabase клиентах благодаря дженерикам.

## Пример использования

### В клиентском компоненте:

```typescript
"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function MyComponent() {
  const [data, setData] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('profiles').select()
      setData(data || [])
    }
    loadData()
  }, [])

  return <div>{/* ... */}</div>
}
```

### В серверном компоненте:

```typescript
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select()

  return <div>{/* ... */}</div>
}
```

## Полезные ссылки

- [Документация Supabase](https://supabase.com/docs)
- [Next.js с Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

