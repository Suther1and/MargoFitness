# Полезные команды

## Разработка

```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск production сервера
npm start

# Проверка кода (линтинг)
npm run lint
```

## Установка компонентов Shadcn/UI

```bash
# Установка отдельных компонентов
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast

# Установка нескольких компонентов сразу
npx shadcn@latest add button card input form --yes
```

## Supabase

```bash
# Установка Supabase CLI глобально
npm install -g supabase

# Вход в аккаунт
supabase login

# Связывание с проектом
supabase link --project-ref your-project-ref

# Генерация TypeScript типов
supabase gen types typescript --local > types/supabase.ts

# Установка Supabase клиентских библиотек
npm install @supabase/supabase-js @supabase/ssr
```

## TypeScript

```bash
# Проверка типов
npx tsc --noEmit

# Просмотр всех ошибок типизации
npx tsc --noEmit --pretty
```

## Полезные пакеты для установки

```bash
# Работа с датами
npm install date-fns

# Работа с формами
npm install react-hook-form @hookform/resolvers zod

# Анимации
npm install framer-motion

# Графики
npm install recharts

# Работа с изображениями
npm install sharp

# Валидация
npm install zod
```

## Git

```bash
# Инициализация репозитория
git init

# Первый коммит
git add .
git commit -m "Initial commit"

# Добавление remote и push
git remote add origin your-repo-url
git branch -M main
git push -u origin main
```

## Продакшен

```bash
# Vercel (рекомендуется для Next.js)
npm install -g vercel
vercel login
vercel

# Docker (если нужен контейнер)
# Создайте Dockerfile и .dockerignore
docker build -t margofitness .
docker run -p 3000:3000 margofitness
```

