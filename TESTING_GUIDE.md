# 🧪 Руководство по тестированию платежной системы

## 📋 Содержание

1. [Подготовка к тестированию](#подготовка)
2. [Тестирование через UI](#тестирование-через-ui)
3. [Тестирование API напрямую](#тестирование-api)
4. [Тестирование Cron Job](#тестирование-cron-job)
5. [Проверка в БД](#проверка-в-бд)
6. [Сценарии тестирования](#сценарии)

---

## 🔧 Подготовка

### 1. Проверьте переменные окружения

```bash
# .env.local должен содержать:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
YOOKASSA_SHOP_ID=mock_shop_id
YOOKASSA_SECRET_KEY=mock_secret_key
CRON_SECRET=dev_secret_key_12345
```

### 2. Запустите dev server

```bash
npm run dev
```

### 3. Залогиньтесь

Откройте `http://localhost:3000` и войдите как пользователь.

---

## 🎨 Тестирование через UI

### Сценарий 1: Покупка подписки

1. **Откройте** `/pricing`
2. **Выберите период:** 1, 3, 6 или 12 месяцев
3. **Выберите тариф:** Basic, Pro или Elite
4. **Нажмите** "Выбрать план"
5. **На странице оплаты:**
   - Проверьте детали продукта
   - Проверьте расчет цены и скидки
   - Оставьте галочку "Сохранить карту"
   - Нажмите "Оплатить"
6. **Результат:**
   - ✅ Появится сообщение "Оплата прошла успешно!"
   - ✅ Перенаправление на Dashboard
   - ✅ Статус: `active`
   - ✅ Тариф: выбранный
   - ✅ Карта: привязана

### Сценарий 2: Управление подпиской

1. **Откройте** `/dashboard`
2. **В секции "Управление подпиской":**
   - Проверьте информацию о подписке
   - Попробуйте отключить автопродление
   - Попробуйте включить обратно
   - Нажмите "Показать историю платежей"
3. **Результат:**
   - ✅ Switch автопродления работает
   - ✅ История показывает транзакции
   - ✅ Все поля обновляются

### Сценарий 3: Админ - отмена подписки

1. **Залогиньтесь как админ**
2. **Откройте** `/admin/users`
3. **Найдите пользователя** с активной подпиской
4. **Нажмите** "Отменить подписку"
5. **Подтвердите** действие
6. **Результат:**
   - ✅ Подписка сброшена к Free
   - ✅ Все поля обнулены
   - ✅ Страница обновилась

---

## 🔌 Тестирование API

### Тест 1: Создание платежа

```javascript
// Откройте Console (F12) на сайте
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'YOUR_PRODUCT_ID', // UUID из БД
    savePaymentMethod: true
  })
});

const data = await response.json();
console.log('Payment created:', data);
// Ожидается: { success: true, paymentId: "mock_...", ... }
```

### Тест 2: Имитация webhook

```javascript
const webhookData = {
  event: 'payment.succeeded',
  object: {
    id: 'PAYMENT_ID_FROM_TEST_1',
    status: 'succeeded',
    paid: true,
    amount: {
      value: '3999.00',
      currency: 'RUB'
    },
    payment_method: {
      type: 'bank_card',
      id: 'mock_payment_method_123',
      saved: true
    }
  }
};

const response = await fetch('/api/payments/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(webhookData)
});

const data = await response.json();
console.log('Webhook processed:', data);
// Ожидается: { success: true }
```

### Тест 3: Переключение автопродления

```javascript
const response = await fetch('/api/payments/toggle-auto-renew', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: false })
});

const data = await response.json();
console.log('Auto-renew toggled:', data);
// Ожидается: { success: true, autoRenewEnabled: false, ... }
```

### Тест 4: История транзакций

```javascript
const response = await fetch('/api/payments/transactions');
const data = await response.json();
console.log('Transactions:', data);
// Ожидается: массив транзакций
```

### Тест 5: Отмена подписки (админ)

```javascript
const response = await fetch('/api/payments/cancel-full', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'USER_ID_HERE' })
});

const data = await response.json();
console.log('Subscription canceled:', data);
// Ожидается: { success: true, ... }
```

---

## ⏰ Тестирование Cron Job

### Ручной запуск cron:

```bash
# В development (без секрета)
curl http://localhost:3000/api/cron/renew-subscriptions

# В production (с секретом)
curl -H "Authorization: Bearer dev_secret_key_12345" \
  http://localhost:3000/api/cron/renew-subscriptions
```

### Подготовка данных для теста:

```sql
-- В Supabase SQL Editor
-- 1. Установить next_billing_date на сегодня
UPDATE profiles
SET 
  next_billing_date = NOW()::date,
  auto_renew_enabled = true,
  payment_method_id = 'mock_payment_method_123'
WHERE id = 'YOUR_USER_ID';

-- 2. Запустить cron через curl (см. выше)

-- 3. Проверить результат
SELECT 
  subscription_status,
  subscription_expires_at,
  next_billing_date,
  last_payment_date
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

---

## 🗄️ Проверка в БД

### Проверить продукты:

```sql
SELECT 
  id,
  name,
  type,
  tier_level,
  duration_months,
  price,
  discount_percentage,
  is_active
FROM products
WHERE type = 'subscription_tier'
ORDER BY tier_level, duration_months;

-- Ожидается: 12 продуктов (3 тарифа x 4 периода)
```

### Проверить профиль после оплаты:

```sql
SELECT 
  email,
  subscription_status,
  subscription_tier,
  subscription_expires_at,
  payment_method_id,
  auto_renew_enabled,
  subscription_duration_months,
  next_billing_date,
  last_payment_date
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

**Ожидаемые значения после покупки Basic 1 месяц:**
- `subscription_status`: `active`
- `subscription_tier`: `basic`
- `subscription_expires_at`: через 30 дней
- `payment_method_id`: `mock_payment_method_123`
- `auto_renew_enabled`: `true`
- `subscription_duration_months`: `1`
- `next_billing_date`: через 30 дней
- `last_payment_date`: сегодня

### Проверить транзакции:

```sql
SELECT 
  yookassa_payment_id,
  status,
  amount,
  payment_type,
  created_at,
  updated_at
FROM payment_transactions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎯 Сценарии тестирования

### Сценарий A: Новый пользователь покупает подписку

1. Регистрация нового аккаунта
2. Переход на `/pricing`
3. Выбор Basic 1 месяц
4. Оплата с сохранением карты
5. Проверка активации в Dashboard

**Ожидаемый результат:**
- Подписка активна
- Карта привязана
- Автопродление включено
- Транзакция записана в БД

### Сценарий B: Пользователь отключает автопродление

1. Открыть Dashboard
2. Отключить автопродление
3. Проверить что статус остался `active`
4. Проверить что дата истечения не изменилась

**Ожидаемый результат:**
- `auto_renew_enabled`: `false`
- `subscription_status`: `active` (не изменился!)
- `subscription_expires_at`: не изменилась

### Сценарий C: Автоматическое продление подписки

1. Установить `next_billing_date` на сегодня (SQL)
2. Убедиться что `auto_renew_enabled = true`
3. Запустить cron job вручную
4. Проверить что подписка продлилась

**Ожидаемый результат:**
- Создана новая транзакция
- `subscription_expires_at` продлена на 30 дней
- `next_billing_date` обновлена
- `last_payment_date` = сегодня

### Сценарий D: Неудачное продление (2 попытки)

1. Установить `payment_method_id = 'invalid'`
2. Установить `next_billing_date` на сегодня
3. Запустить cron (1 попытка)
4. Проверить `failed_payment_attempts = 1`
5. Установить `next_billing_date` на завтра
6. Запустить cron на следующий день (2 попытка)
7. Проверить downgrade на Free

**Ожидаемый результат после 2 неудач:**
- `subscription_status`: `inactive`
- `subscription_tier`: `free`
- `failed_payment_attempts`: `2`

### Сценарий E: Админ отменяет подписку пользователя

1. Залогиниться как админ
2. Открыть `/admin/users`
3. Найти пользователя с активной подпиской
4. Нажать "Отменить подписку"
5. Подтвердить

**Ожидаемый результат:**
- Все поля подписки сброшены
- `subscription_tier`: `free`
- `subscription_status`: `inactive`
- `payment_method_id`: `null`

---

## ✅ Чек-лист перед production

- [ ] Все тесты UI пройдены
- [ ] Все тесты API пройдены
- [ ] Cron job работает локально
- [ ] Проверена БД после каждой операции
- [ ] Добавлены реальные ключи ЮKassa
- [ ] Настроен webhook в ЮKassa
- [ ] Добавлен CRON_SECRET в Vercel
- [ ] Настроен Vercel Cron Job
- [ ] Проверены логи cron в Vercel
- [ ] Настроен мониторинг ошибок

---

## 🐛 Troubleshooting

### Проблема: Продукты не загружаются

**Решение:**
```sql
-- Проверить что есть продукты
SELECT COUNT(*) FROM products WHERE type = 'subscription_tier';
-- Должно быть 12

-- Если нет, запустить INSERT из database/migrations/INSERT_PRODUCTS_ONLY.sql
```

### Проблема: Платеж создается но не активирует подписку

**Решение:**
1. Проверьте логи сервера (terminal)
2. Проверьте что webhook вызывается
3. Проверьте `payment_transactions` в БД - есть ли транзакция?
4. Проверьте использует ли API `service_role_key`

### Проблема: Cron не запускается

**Решение:**
1. Проверьте `vercel.json` в корне проекта
2. Проверьте что `CRON_SECRET` добавлен в Vercel Environment Variables
3. Смотрите Vercel Deployment Logs → Cron

### Проблема: Автопродление не работает

**Решение:**
```sql
-- Проверить данные пользователя
SELECT 
  auto_renew_enabled,
  payment_method_id,
  next_billing_date,
  subscription_status
FROM profiles
WHERE id = 'USER_ID';

-- Должно быть:
-- auto_renew_enabled = true
-- payment_method_id != null
-- next_billing_date = сегодня
-- subscription_status = 'active'
```

---

## 📊 Примеры ответов API

### Успешное создание платежа:

```json
{
  "success": true,
  "paymentId": "mock_1234567890_abc",
  "confirmationToken": "mock_token_mock_1234567890_abc",
  "amount": 3999.0,
  "currency": "RUB"
}
```

### Успешная обработка webhook:

```json
{
  "success": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Успешное выполнение cron:

```json
{
  "success": true,
  "message": "Processed 5 subscriptions",
  "stats": {
    "total": 5,
    "successful": 4,
    "failed": 1
  },
  "details": {
    "successful": ["user1@example.com", "user2@example.com"],
    "failed": ["user3@example.com"],
    "errors": ["user3@example.com: Payment declined"]
  }
}
```

---

## 📝 Логирование

### Что логируется:

- `[getProductById]` - загрузка продукта
- `[Cron]` - работа cron job
- `[autoRenewSubscription]` - автопродление
- `[processSuccessfulPayment]` - обработка успешного платежа

### Где смотреть логи:

- **Development:** Terminal где запущен `npm run dev`
- **Production (Vercel):** Vercel Dashboard → Deployments → Function Logs
- **Cron Logs:** Vercel Dashboard → Deployments → Cron

