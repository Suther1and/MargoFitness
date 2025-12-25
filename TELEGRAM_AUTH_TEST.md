# Тестирование исправления авторизации через Telegram

## Что было исправлено

1. **app/auth/telegram-callback/page.tsx**:
   - Добавлено чтение реферального кода из `localStorage`
   - Код передается в API запрос
   - После успешной авторизации код удаляется из `localStorage`

2. **middleware.ts**:
   - Упрощена логика публичных маршрутов
   - Все маршруты `/auth/*` теперь публичные

## Сценарии тестирования

### Тест 1: Обычная авторизация без реферального кода

1. Откройте `/auth`
2. Нажмите кнопку "Telegram"
3. Авторизуйтесь через Telegram
4. Должны быть перенаправлены на `/dashboard`
5. В консоли должно быть: `Retrieved ref code from localStorage: NONE`

### Тест 2: Авторизация с реферальным кодом (новый пользователь)

1. Получите свой реферальный код в `/dashboard/bonuses`
2. Откройте новую приватную сессию браузера
3. Перейдите по ссылке: `/auth?ref=ВАШ_КОД`
4. Должно появиться уведомление: "Вы приглашены! Получите 250 шагов"
5. Нажмите кнопку "Telegram"
6. Авторизуйтесь через Telegram (другой аккаунт)
7. В консоли должно быть: `Retrieved ref code from localStorage: ВАШ_КОД`
8. После авторизации проверьте баланс в `/dashboard/bonuses`
9. Должно быть: 250 (приветственный) + 250 (реферальный) = 500 шагов

### Тест 3: Авторизация с реферальным кодом (существующий пользователь)

1. Используя существующий аккаунт Telegram
2. Откройте `/auth?ref=ЛЮБОЙ_КОД`
3. Авторизуйтесь через Telegram
4. Должны успешно войти
5. Реферальный бонус не начисляется (т.к. уже зарегистрированы)

### Тест 4: Проверка очистки localStorage

1. Откройте DevTools → Application → Local Storage
2. Добавьте вручную: `telegram_ref_code` = `TEST123`
3. Перейдите на `/auth`
4. Авторизуйтесь через Telegram
5. После авторизации проверьте Local Storage
6. Ключ `telegram_ref_code` должен быть удален

## Проверка логов

Откройте консоль браузера и найдите логи:

```
[Telegram Callback] URL params: {...}
[Telegram Callback] Retrieved ref code from localStorage: ABC123
[Telegram Callback] Parsed data: {..., ref_code: "ABC123"}
[Telegram Callback] Sending to API: {...}
[Telegram Callback] API response: {...}
```

На сервере (в логах Vercel/консоли):

```
[Telegram Auth] Request received: {..., hasRefCode: true, refCode: "ABC123"}
[Telegram Auth] Waiting for DB triggers...
[Telegram Auth] Starting referral processing
[Telegram Auth] Processing referral code: ABC123
[Telegram Auth] Referral processed successfully
```

## Возможные проблемы и решения

### Проблема: "Invalid Telegram data"
- **Причина**: Не передан `id` или `hash` от Telegram
- **Решение**: Проверьте настройки бота, убедитесь что `TELEGRAM_BOT_TOKEN` установлен

### Проблема: "SUPABASE_SERVICE_ROLE_KEY not found"
- **Причина**: Отсутствует переменная окружения
- **Решение**: Добавьте `SUPABASE_SERVICE_ROLE_KEY` в `.env.local` и Vercel

### Проблема: Реферальный код не сохраняется
- **Причина**: Виджет не успевает сохранить код в localStorage
- **Решение**: В `TelegramLoginWidget` есть `useEffect` который должен сохранить код до авторизации

### Проблема: Бонусы не начисляются
- **Причина**: Возможно триггеры БД не отработали
- **Решение**: Проверьте логи на сервере, убедитесь что миграция `013_ADD_BONUS_REFERRAL_SYSTEM.sql` применена

## Проверка в базе данных

После успешной регистрации по реферальному коду проверьте:

```sql
-- Проверить реферальную связь
SELECT * FROM referrals WHERE referred_id = 'USER_ID';

-- Проверить бонусные транзакции
SELECT * FROM bonus_transactions WHERE user_id = 'USER_ID';

-- Проверить баланс
SELECT * FROM user_bonuses WHERE user_id = 'USER_ID';
```

## Готово к деплою

После успешного тестирования изменения можно деплоить:

```bash
git add .
git commit -m "Fix: восстановлена авторизация через Telegram с поддержкой реферальных кодов"
git push origin main
```

Vercel автоматически задеплоит изменения.

