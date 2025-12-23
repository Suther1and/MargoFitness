# Миграция 008: Интеграция ЮKassa

## Что добавляет эта миграция

### 1. Новые поля в таблице `products`
- `duration_months` - длительность подписки (1, 3, 6, 12)
- `discount_percentage` - процент скидки (0, 5, 10, 15)

### 2. Новые поля в таблице `profiles`
- `payment_method_id` - токен карты из ЮKassa
- `auto_renew_enabled` - включено ли автопродление
- `subscription_duration_months` - период текущей подписки
- `next_billing_date` - дата следующего списания
- `failed_payment_attempts` - счетчик неудачных попыток
- `last_payment_date` - дата последнего платежа

### 3. Новая таблица `payment_transactions`
История всех платежных транзакций с полями:
- Данные платежа (ID ЮKassa, сумма, валюта)
- Статус (pending, succeeded, canceled, failed)
- Тип (initial, recurring, upgrade, one_time)
- Метаданные

### 4. Продукты подписки
**12 продуктов** - 3 тарифа × 4 периода:

| Тариф | 1 мес | 3 мес (-5%) | 6 мес (-10%) | 12 мес (-15%) |
|-------|-------|-------------|--------------|---------------|
| Basic | 3999₽ | 11397₽ | 21594₽ | 40791₽ |
| Pro | 4499₽ | 12822₽ | 24294₽ | 45891₽ |
| Elite | 9999₽ | 28497₽ | 53994₽ | 101991₽ |

### 5. Дополнительно
- RLS политики для `payment_transactions`
- Индексы для оптимизации
- Функция `get_product_by_tier_and_duration()`
- Представление `subscription_products_view`

## Как применить миграцию

### Вариант 1: Через Supabase Dashboard (рекомендуется для первого раза)

1. Откройте ваш проект в Supabase Dashboard
2. Перейдите в `SQL Editor`
3. Создайте новый запрос
4. Скопируйте весь код из `008_ADD_YOOKASSA_INTEGRATION.sql`
5. Вставьте и нажмите `Run`
6. Дождитесь выполнения (появятся зеленые галочки и сообщения)

**Ожидаемый результат:**
```
✅ Successfully created 12 subscription products
✅ Successfully added payment fields to profiles
✅ Successfully created payment_transactions table
✅ Миграция 008 успешно завершена!
```

### Вариант 2: Через CLI (для продакшена)

```bash
# Если используете Supabase CLI
supabase db push --file database/migrations/008_ADD_YOOKASSA_INTEGRATION.sql

# Или через psql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < database/migrations/008_ADD_YOOKASSA_INTEGRATION.sql
```

## Проверка после миграции

### 1. Проверить новые поля в profiles

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'payment_method_id',
    'auto_renew_enabled',
    'subscription_duration_months',
    'next_billing_date',
    'failed_payment_attempts',
    'last_payment_date'
  );
```

**Ожидаем:** 6 строк

### 2. Проверить таблицу payment_transactions

```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'payment_transactions'
);
```

**Ожидаем:** `true`

### 3. Проверить продукты

```sql
SELECT tier_level, duration_months, price, discount_percentage
FROM products
WHERE type = 'subscription_tier'
ORDER BY tier_level, duration_months;
```

**Ожидаем:** 12 строк (3 тарифа × 4 периода)

### 4. Проверить представление

```sql
SELECT * FROM subscription_products_view LIMIT 5;
```

**Ожидаем:** Данные с расчетными полями (savings_amount, price_per_day)

## Откат миграции (если нужно)

**⚠️ ВНИМАНИЕ:** Это удалит все данные транзакций!

```sql
-- Удалить таблицу
DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Удалить представление
DROP VIEW IF EXISTS subscription_products_view CASCADE;

-- Удалить функцию
DROP FUNCTION IF EXISTS get_product_by_tier_and_duration CASCADE;

-- Удалить поля из profiles
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS payment_method_id,
  DROP COLUMN IF EXISTS auto_renew_enabled,
  DROP COLUMN IF EXISTS subscription_duration_months,
  DROP COLUMN IF EXISTS next_billing_date,
  DROP COLUMN IF EXISTS failed_payment_attempts,
  DROP COLUMN IF EXISTS last_payment_date;

-- Удалить поля из products
ALTER TABLE products
  DROP COLUMN IF EXISTS duration_months,
  DROP COLUMN IF EXISTS discount_percentage;

-- Удалить продукты
DELETE FROM products WHERE type = 'subscription_tier';
```

## Следующие шаги

После успешного применения миграции:

1. ✅ Обновить TypeScript типы (`types/supabase.ts`)
2. ⏭️ Установить зависимости: `npm install @a2seven/yoo-checkout`
3. ⏭️ Настроить `.env.local` с ключами ЮKassa
4. ⏭️ Создать сервисы для работы с платежами

## Полезные запросы

### Посмотреть все подписки с экономией

```sql
SELECT * FROM subscription_products_view;
```

### Найти продукт по тарифу и периоду

```sql
SELECT * FROM get_product_by_tier_and_duration(2, 6);
-- Вернет Pro 6 месяцев
```

### Посмотреть пользователей с автопродлением

```sql
SELECT id, email, subscription_tier, next_billing_date, auto_renew_enabled
FROM profiles
WHERE auto_renew_enabled = true
  AND subscription_status = 'active'
ORDER BY next_billing_date;
```

### История платежей пользователя

```sql
SELECT 
  pt.*,
  p.name as product_name
FROM payment_transactions pt
LEFT JOIN products p ON p.id = pt.product_id
WHERE pt.user_id = 'USER_ID_HERE'
ORDER BY pt.created_at DESC;
```

## Проблемы и решения

### Ошибка: "relation already exists"

Миграция уже применена. Если нужно применить повторно:
1. Сначала выполните откат (см. выше)
2. Затем примените миграцию заново

### Ошибка: "foreign key constraint"

Убедитесь что таблицы `profiles` и `products` существуют и имеют правильную структуру.

### Продуктов создалось меньше/больше 12

Проверьте что не было дублей. При повторном запуске старые продукты автоматически удаляются командой:
```sql
DELETE FROM products WHERE type = 'subscription_tier';
```

