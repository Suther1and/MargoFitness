# ⚡ Быстрое исправление промокодов

## Проблема
Ошибка при создании промокода из-за несоответствия типов между кодом и базой данных.

## Решение

### 1️⃣ Применить миграцию в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Скопируйте содержимое `database/migrations/015_FIX_PROMO_CODE_ENUM.sql`
3. Вставьте и нажмите **Run**

### 2️⃣ Задеплоить изменения

```bash
git add .
git commit -m "fix: исправлена система промокодов"
git push
```

### 3️⃣ Проверить

1. Откройте `/admin/promo-codes`
2. Создайте промокод: `NEWYEAR2025`, 10%
3. ✅ Должно работать без ошибок!

## Что исправлено

✅ **8 файлов обновлено:**
- `types/supabase.ts` - типы
- `lib/actions/promo-codes.ts` - серверные действия
- `lib/services/price-calculator.ts` - расчет цен
- `app/admin/promo-codes/create-promo-dialog.tsx` - форма создания
- `app/admin/promo-codes/promo-codes-list.tsx` - список
- `app/payment/[productId]/promo-input.tsx` - применение
- `app/payment/[productId]/redirect-payment.tsx` - отображение
- `app/payment/[productId]/yookassa-widget.tsx` - виджет оплаты

✅ **1 миграция создана:**
- `database/migrations/015_FIX_PROMO_CODE_ENUM.sql`

---

**Подробности:** см. `PROMO_CODE_FIX.md`

