# 🚀 Быстрый старт MargoFitness

## ⚠️ ВАЖНО: Перезапустите сервер!

Чтобы Supabase заработал, необходимо перезапустить dev сервер:

```bash
# 1. Остановите текущий процесс
# Нажмите Ctrl+C в терминале где запущен npm run dev

# 2. Запустите снова
npm run dev

# 3. Откройте главную страницу
# http://localhost:3000
```

## ✅ Что уже настроено

### Технологии
- ✅ Next.js 15 с App Router
- ✅ TypeScript (строгая типизация)
- ✅ Tailwind CSS v4
- ✅ Shadcn/UI (Button, Card, Input)
- ✅ Lucide React (иконки)
- ✅ Supabase (полностью интегрирован!)

### Supabase
- ✅ Установлены пакеты: `@supabase/supabase-js`, `@supabase/ssr`
- ✅ Создан `.env.local` с вашими ключами
- ✅ Настроены клиенты в `lib/supabase.ts`
- ✅ Создан middleware в `middleware.ts`
- ✅ Примеры использования в `/examples`

## 📁 Структура проекта

```
MargoFitneess/
├── app/
│   ├── page.tsx              # Главная страница
│   ├── examples/page.tsx     # Примеры Supabase
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Стили + темы
├── components/
│   ├── ui/                   # Shadcn/UI компоненты
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── example-component.tsx
│   └── supabase-client-example.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Клиентский Supabase
│   │   └── server.ts        # Серверный Supabase
│   └── utils.ts             # cn() утилита
├── types/
│   └── supabase.ts          # TypeScript типы БД
├── middleware.ts            # Auth middleware
├── .env.local              # Переменные окружения
└── package.json
```

## 🎯 Следующие шаги

### 1. Проверьте подключение к Supabase
После перезапуска сервера откройте:
- http://localhost:3000/examples

Вы должны увидеть ✅ "Подключено к Supabase"

### 2. Создайте таблицы в Supabase

Перейдите в [SQL Editor](https://supabase.com/dashboard/project/yxzrenwkkntnhmdimhln/sql/new):

```sql
-- Пример: таблица профилей пользователей
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Включение RLS
alter table public.profiles enable row level security;

-- Политики доступа
create policy "Профили видны всем"
  on profiles for select
  using ( true );

create policy "Пользователи могут обновлять свой профиль"
  on profiles for update
  using ( auth.uid() = id );
```

### 3. Сгенерируйте TypeScript типы

```bash
# Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# Войдите в аккаунт
supabase login

# Сгенерируйте типы
npx supabase gen types typescript --project-id yxzrenwkkntnhmdimhln > types/supabase.ts
```

### 4. Установите дополнительные компоненты

```bash
# Формы
npx shadcn@latest add form dialog select

# Таблицы
npx shadcn@latest add table

# Навигация
npx shadcn@latest add tabs dropdown-menu

# Уведомления
npx shadcn@latest add toast
```

### 5. Добавьте валидацию форм

```bash
npm install react-hook-form @hookform/resolvers zod
```

## 📚 Полезные ссылки

- **Supabase Dashboard:** https://supabase.com/dashboard/project/yxzrenwkkntnhmdimhln
- **Документация Supabase:** https://supabase.com/docs
- **Shadcn/UI:** https://ui.shadcn.com
- **Next.js Docs:** https://nextjs.org/docs

## 💡 Примеры использования

### Клиентский компонент:
```typescript
"use client"
import { createClient } from "@/lib/supabase/client"

export function MyComponent() {
  const supabase = createClient()
  
  const loadData = async () => {
    const { data } = await supabase.from('profiles').select()
    console.log(data)
  }
  
  return <button onClick={loadData}>Загрузить</button>
}
```

### Серверный компонент:
```typescript
import { createClient } from "@/lib/supabase/server"

export default async function MyPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select()
  
  return <div>{/* ... */}</div>
}
```

## ❓ Проблемы?

1. **Supabase не подключается:**
   - Убедитесь, что перезапустили dev сервер
   - Проверьте файл `.env.local`
   - Откройте DevTools → Console для ошибок

2. **Типы не работают:**
   - Сгенерируйте типы командой выше
   - Перезапустите TypeScript сервер в VSCode

3. **Компоненты не импортируются:**
   - Проверьте, что используете алиас `@/`
   - Установите компонент через `npx shadcn@latest add`

---

**Готово к разработке!** 🎉

Начните с редактирования `app/page.tsx` или создайте новые страницы в директории `app/`.

