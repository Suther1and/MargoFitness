# Тестирование Payment API

## Цель
Проверить что все API endpoints работают в mock-режиме

## Предусловия
- ✅ Сервер запущен (`npm run dev`)
- ✅ Миграция БД применена
- ✅ Пользователь залогинен в приложении
- ✅ Mock-ключи в `.env.local`

---

## Тест 1: Создание платежа (CREATE)

### Запрос через браузер Console (F12)

```javascript
// В браузере на странице http://localhost:3000/pricing
// Откройте Console (F12) и выполните:

const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 'получите_id_из_БД', // см. ниже как получить
    savePaymentMethod: true
  })
});

const data = await response.json();
console.log('Payment created:', data);
```

### Как получить productId из БД:

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните:
```sql
SELECT id, name, price FROM products 
WHERE type = 'subscription_tier' AND tier_level = 1 AND duration_months = 1
LIMIT 1;
```
3. Скопируйте `id` и вставьте в запрос выше

### Ожидаемый результат:

```json
{
  "success": true,
  "paymentId": "mock_1234567890_abc123",
  "confirmationToken": "mock_token_mock_1234567890_abc123",
  "amount": "3999.00",
  "currency": "RUB"
}
```

### Что проверяем:
- ✅ API отвечает 200
- ✅ Возвращает mock payment ID
- ✅ Возвращает confirmation token
- ✅ Сумма совпадает с продуктом

---

## Тест 2: Проверка транзакции в БД

После теста 1 выполните в Supabase SQL Editor:

```sql
SELECT 
  id, 
  yookassa_payment_id,
  amount,
  status,
  payment_type,
  created_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 1;
```

### Ожидаемый результат:
- ✅ Есть запись с `yookassa_payment_id` начинающимся с `mock_`
- ✅ `status` = 'pending'
- ✅ `payment_type` = 'initial'
- ✅ `amount` = цена продукта

---

## Тест 3: Имитация Webhook (SUCCESS)

### Запрос через Console:

```javascript
// Имитируем успешный платеж
const webhookData = {
  event: 'payment.succeeded',
  object: {
    id: 'ВСТАВЬТЕ_payment_id_из_теста_1',
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
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(webhookData)
});

const data = await response.json();
console.log('Webhook processed:', data);
```

### Ожидаемый результат:

```json
{
  "success": true
}
```

### Проверка в БД:

```sql
-- Проверить транзакцию
SELECT status, payment_method_id 
FROM payment_transactions 
WHERE yookassa_payment_id = 'ВАШ_payment_id';

-- Проверить подписку пользователя
SELECT 
  subscription_tier,
  subscription_status,
  subscription_expires_at,
  payment_method_id,
  auto_renew_enabled
FROM profiles 
WHERE id = auth.uid();
```

### Что проверяем:
- ✅ Транзакция: status = 'succeeded'
- ✅ Профиль: tier обновлен (basic/pro/elite)
- ✅ Профиль: subscription_status = 'active'
- ✅ Профиль: есть expires_at (через N месяцев)
- ✅ Профиль: payment_method_id сохранен
- ✅ Профиль: auto_renew_enabled = true

---

## Тест 4: Отмена подписки

```javascript
const response = await fetch('/api/payments/cancel-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log('Subscription canceled:', data);
```

### Ожидаемый результат:

```json
{
  "success": true,
  "message": "Подписка отменена. Доступ сохранится до ДД.ММ.ГГГГ",
  "expiresAt": "2025-01-23T..."
}
```

### Проверка в БД:

```sql
SELECT 
  subscription_status,
  auto_renew_enabled,
  subscription_expires_at
FROM profiles 
WHERE id = auth.uid();
```

### Что проверяем:
- ✅ subscription_status = 'canceled'
- ✅ auto_renew_enabled = false
- ✅ expires_at НЕ изменилась (доступ сохранен)

---

## Тест 5: Включение автопродления обратно

```javascript
const response = await fetch('/api/payments/toggle-auto-renew', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    enabled: true
  })
});

const data = await response.json();
console.log('Auto-renew toggled:', data);
```

### Ожидаемый результат:

```json
{
  "success": true,
  "autoRenewEnabled": true,
  "message": "Автопродление включено..."
}
```

### Проверка в БД:

```sql
SELECT 
  subscription_status,
  auto_renew_enabled
FROM profiles 
WHERE id = auth.uid();
```

### Что проверяем:
- ✅ auto_renew_enabled = true
- ✅ subscription_status = 'active'

---

## Тест 6: Конвертация дней при апгрейде

**Подготовка:** Нужна активная подписка (сделайте тесты 1-3 если еще нет)

### Получить ID нового продукта (выше уровнем):

```sql
-- Если сейчас Basic (tier_level=1), найти Pro
SELECT id, name, price, tier_level, duration_months 
FROM products 
WHERE type = 'subscription_tier' AND tier_level = 2 AND duration_months = 6
LIMIT 1;
```

### Запрос:

```javascript
const response = await fetch('/api/payments/upgrade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    newProductId: 'ID_PRO_ПРОДУКТА'
  })
});

const data = await response.json();
console.log('Upgrade result:', data);
```

### Ожидаемый результат:

```json
{
  "success": true,
  "paid": true,
  "conversion": {
    "baseDays": 180,
    "convertedDays": 28,
    "totalDays": 208,
    "remainderValue": 3799,
    "newDayPrice": 134.97,
    "details": { ... }
  },
  "message": "Апгрейд успешен! Вы получили 208 дней подписки Pro 6 месяцев"
}
```

### Что проверяем:
- ✅ Математика конвертации работает
- ✅ baseDays = новый период × 30
- ✅ convertedDays > 0 (бонусные дни из остатка)
- ✅ Если есть payment_method_id → paid = true (автосписание)

---

## Чеклист тестирования

После выполнения всех тестов отметьте:

- [ ] Тест 1: Create payment - OK
- [ ] Тест 2: Transaction saved in DB - OK
- [ ] Тест 3: Webhook processed - OK
- [ ] Тест 4: Cancel subscription - OK
- [ ] Тест 5: Toggle auto-renew - OK
- [ ] Тест 6: Upgrade with conversion - OK

## Возможные ошибки и решения

### Ошибка: "Unauthorized"
**Решение:** Залогиньтесь в приложении перед тестированием

### Ошибка: "Product not found"
**Решение:** Убедитесь что продукты созданы в БД (миграция 008)

### Ошибка: "Transaction not found" в webhook
**Решение:** Используйте правильный payment_id из теста 1

### Ошибка: "No active subscription"
**Решение:** Сначала пройдите тесты 1-3 чтобы создать подписку

---

## Следующие шаги после тестирования

Если все тесты прошли успешно:
1. ✅ API работает в mock-режиме
2. ✅ Можно переходить к созданию UI компонентов
3. ✅ Позже подключим реальные ключи ЮKassa

Если есть ошибки:
- Скопируйте сообщение об ошибке
- Проверьте консоль сервера (терминал где `npm run dev`)
- Сообщите мне для исправления

