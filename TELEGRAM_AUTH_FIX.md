# Исправление авторизации через Telegram

## Проблема

После реализации реферальной системы перестала работать авторизация через Telegram. Проблема была в том, что реферальный код не передавался при использовании redirect-based авторизации.

## Причина

В приложении есть два способа авторизации через Telegram:

1. **Через виджет с callback функцией** (`onTelegramAuth`) - работал корректно
   - Виджет сохраняет реферальный код в `localStorage` под ключом `telegram_ref_code`
   - При авторизации код извлекается из `localStorage` и передается в API

2. **Через redirect на callback page** - НЕ работал
   - Callback page (`app/auth/telegram-callback/page.tsx`) не проверял `localStorage`
   - Реферальный код терялся при авторизации

## Решение

Исправлен файл `app/auth/telegram-callback/page.tsx`:

### Добавлено чтение реферального кода из localStorage

```typescript
// Получаем реферальный код из localStorage
const refCode = localStorage.getItem('telegram_ref_code')
console.log('[Telegram Callback] Retrieved ref code from localStorage:', refCode || 'NONE')

// Получаем данные от Telegram из URL
const telegramData = {
  id: parseInt(searchParams.get('id') || '0'),
  first_name: searchParams.get('first_name') || '',
  last_name: searchParams.get('last_name') || undefined,
  username: searchParams.get('username') || undefined,
  photo_url: searchParams.get('photo_url') || undefined,
  auth_date: parseInt(searchParams.get('auth_date') || '0'),
  hash: searchParams.get('hash') || '',
  ref_code: refCode || undefined  // ← ДОБАВЛЕНО
}
```

### Добавлена очистка localStorage после успешной авторизации

```typescript
if (sessionError) {
  throw new Error('Ошибка установки сессии')
}

// Очищаем реферальный код из localStorage
localStorage.removeItem('telegram_ref_code')  // ← ДОБАВЛЕНО

// Редирект на dashboard
router.push('/dashboard')
router.refresh()
```

## Как работает реферальная система

1. **Пользователь переходит по реферальной ссылке**: `/auth?ref=ABC123`

2. **Виджет сохраняет код**: 
   - `TelegramLoginWidget` сохраняет код в `localStorage` при монтировании компонента

3. **Авторизация через Telegram**:
   - Пользователь нажимает кнопку Telegram
   - Telegram может использовать либо callback функцию, либо redirect

4. **Обработка реферального кода**:
   - Код извлекается из `localStorage` (теперь в обоих случаях)
   - Передается в API `/api/auth/telegram`
   - API создает связь в таблице `referrals`
   - Начисляются бонусы обоим пользователям

5. **Очистка**:
   - После успешной авторизации код удаляется из `localStorage`

## Проверка работоспособности

1. Откройте страницу авторизации с реферальным кодом: `/auth?ref=TEST_CODE`
2. Авторизуйтесь через Telegram
3. Проверьте консоль браузера - должны быть логи:
   ```
   [Telegram Callback] Retrieved ref code from localStorage: TEST_CODE
   [Telegram Callback] Parsed data: {..., ref_code: "TEST_CODE"}
   ```
4. После успешной авторизации проверьте баланс бонусов в дашборде

## Альтернативные провайдеры

- **Yandex OAuth** - реферальный код передается через параметр `state` в OAuth flow
- **Google OAuth** - реферальный код сохраняется в `localStorage` под ключом `pending_referral_code`

## Файлы изменений

- `app/auth/telegram-callback/page.tsx` - добавлена обработка реферального кода

