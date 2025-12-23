# Настройка Webhook для ЮKassa

## 📋 Что такое Webhook?

Webhook - это URL, на который ЮKassa отправляет уведомления о статусе платежей.
Это необходимо для автоматической активации подписок после успешной оплаты.

---

## 🔧 Настройка в ЮKassa

### 1. Получите доступ к ЮKassa

1. Зарегистрируйтесь как ИП
2. Подключите ЮKassa на [yookassa.ru](https://yookassa.ru/)
3. Получите `shopId` и `secretKey` в личном кабинете

### 2. Добавьте webhook URL

**В личном кабинете ЮKassa:**

1. Перейдите в **Настройки** → **Уведомления**
2. Добавьте URL: `https://your-domain.com/api/payments/webhook`
3. Выберите события:
   - ✅ `payment.succeeded` - успешная оплата
   - ✅ `payment.canceled` - отмена платежа
   - ✅ `payment.waiting_for_capture` - ожидание подтверждения
4. Сохраните настройки

### 3. Получите секрет webhook

ЮKassa сгенерирует секретный ключ для проверки подлинности уведомлений.

**Добавьте его в Environment Variables:**

```bash
# В Vercel или в .env.local
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret_from_yookassa
```

---

## 🧪 Тестирование Webhook

### В development режиме:

Webhook не работает на `localhost` т.к. ЮKassa не может достучаться до вашего компьютера.

**Решения:**

1. **Используйте ngrok:**
   ```bash
   # Установите ngrok
   npm install -g ngrok
   
   # Запустите туннель
   ngrok http 3000
   
   # Используйте ngrok URL в ЮKassa:
   https://abc123.ngrok.io/api/payments/webhook
   ```

2. **Используйте mock mode (наш текущий подход):**
   - Платежи создаются локально
   - Webhook вызывается вручную через fetch
   - Реальная ЮKassa не используется

### Проверка webhook вручную:

```bash
# Отправить тестовое уведомление
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.succeeded",
    "object": {
      "id": "test_payment_id_123",
      "status": "succeeded",
      "paid": true,
      "amount": {
        "value": "3999.00",
        "currency": "RUB"
      },
      "payment_method": {
        "type": "bank_card",
        "id": "test_card_123",
        "saved": true
      }
    }
  }'
```

---

## 🔒 Безопасность Webhook

### Проверка подписи (когда подключите реальную ЮKassa):

```typescript
// В lib/services/yookassa.ts уже реализовано
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return hash === signature
}
```

### Использование в route:

```typescript
// app/api/payments/webhook/route.ts
const signature = request.headers.get('X-Yookassa-Signature')
const isValid = verifyWebhookSignature(
  JSON.stringify(body),
  signature,
  process.env.YOOKASSA_WEBHOOK_SECRET!
)

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
}
```

---

## 📊 Обработка событий

### События которые мы обрабатываем:

#### 1. `payment.succeeded`
```json
{
  "event": "payment.succeeded",
  "object": {
    "id": "payment_id",
    "status": "succeeded",
    "paid": true,
    "amount": { "value": "3999.00", "currency": "RUB" },
    "payment_method": {
      "type": "bank_card",
      "id": "card_id",
      "saved": true
    }
  }
}
```

**Действия:**
- Находим транзакцию по `payment_id`
- Обновляем статус на `succeeded`
- Активируем подписку пользователя
- Сохраняем `payment_method_id` если `saved = true`

#### 2. `payment.canceled`
```json
{
  "event": "payment.canceled",
  "object": {
    "id": "payment_id",
    "status": "canceled",
    "cancellation_details": {
      "reason": "user_canceled"
    }
  }
}
```

**Действия:**
- Обновляем статус транзакции на `canceled`
- Не активируем подписку

#### 3. `payment.waiting_for_capture`
```json
{
  "event": "payment.waiting_for_capture",
  "object": {
    "id": "payment_id",
    "status": "waiting_for_capture"
  }
}
```

**Действия:**
- Обновляем статус транзакции на `pending`
- Ждем финального события

---

## 🐛 Troubleshooting

### Webhook не приходят:

1. **Проверьте URL:**
   - Должен быть публично доступен
   - HTTPS обязателен в production
   - Путь: `/api/payments/webhook`

2. **Проверьте настройки в ЮKassa:**
   - URL добавлен?
   - События выбраны?
   - Webhook активирован?

3. **Проверьте логи:**
   - ЮKassa → История уведомлений
   - Vercel → Function Logs
   - Terminal (в dev режиме)

### Ошибка "Invalid signature":

1. Проверьте что `YOOKASSA_WEBHOOK_SECRET` совпадает с ЮKassa
2. Проверьте формат подписи (должна быть в заголовке `X-Yookassa-Signature`)
3. Проверьте что body отправляется как raw JSON

### Транзакция не активирует подписку:

1. Проверьте что `payment_id` есть в БД:
   ```sql
   SELECT * FROM payment_transactions 
   WHERE yookassa_payment_id = 'YOUR_PAYMENT_ID';
   ```

2. Проверьте логи сервера на ошибки
3. Проверьте что используется `service_role_key` в API route

---

## 📝 Примеры логов

### Успешная обработка:

```
Webhook received: payment.succeeded
Processing webhook for payment: abc123
Transaction found: { user_id: '...', status: 'pending' }
Updating transaction status to: succeeded
Processing successful payment for user: user@example.com
Subscription activated: basic, expires: 2025-01-23
Payment method saved: pm_abc123
Webhook processed successfully
```

### Неудачная обработка:

```
Webhook received: payment.canceled
Processing webhook for payment: abc123
Transaction found: { user_id: '...', status: 'pending' }
Updating transaction status to: canceled
Payment was canceled, no subscription activation
```

---

## 🚀 Production Checklist

- [ ] Webhook URL добавлен в ЮKassa
- [ ] События выбраны: `payment.succeeded`, `payment.canceled`
- [ ] `YOOKASSA_WEBHOOK_SECRET` добавлен в Vercel
- [ ] Проверка подписи включена (раскомментировать в коде)
- [ ] HTTPS настроен для домена
- [ ] Тестовый платеж проведен
- [ ] Webhook успешно обработан
- [ ] Подписка активировалась
- [ ] Логи проверены

---

## 📖 Дополнительные ресурсы

- [Документация ЮKassa Webhook](https://yookassa.ru/developers/using-api/webhooks)
- [Типы событий ЮKassa](https://yookassa.ru/developers/api#webhook_object)
- [Проверка подписи](https://yookassa.ru/developers/using-api/webhooks#verifying-signature)

