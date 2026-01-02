# Отладка апгрейда подписки

## Где смотреть логи

### 1. Логи сервера (Next.js)
**Где:** Терминал, где запущен `npm run dev`

**Что искать:**
```
[ProcessPayment] ========== UPGRADE PROCESSING ==========
[ProcessPayment] Current Tier: basic
[ProcessPayment] Current Expires: [дата]
[ConversionCalc] Remaining days: 30
[ConversionCalc] Converted days: 24
[ProcessPayment] TOTAL days from NOW: 54
[ProcessPayment] Calculated expiration: [дата через 54 дня]
```

### 2. Логи браузера (Chrome DevTools)
1. Откройте DevTools: `F12` или `Ctrl+Shift+I`
2. Вкладка **Console** - логи клиента
3. Вкладка **Network** - запросы к API
   - Фильтр: `XHR` или `Fetch`
   - Найдите запросы к `/api/payments/`

### 3. Проверка данных в БД
После апгрейда проверьте в Supabase:
- Таблица `profiles` → поле `subscription_expires_at`
- Должна быть дата через 54 дня (для Basic 30 → Pro 30)

## Что проверить при проблеме

1. **Конвертация работает?**
   - В логах должно быть: `Converted days: 24` (для Basic → Pro)
   - Если `0` - проблема в расчете конвертации

2. **Дата рассчитывается правильно?**
   - В логах: `TOTAL days from NOW: 54`
   - `Expected days from NOW: 54.0000`
   - Если меньше - проблема в расчете даты

3. **Данные сохраняются в БД?**
   - Проверьте `subscription_expires_at` в Supabase
   - Сравните с расчетом в логах

## Типичные проблемы

### Проблема: Показывает 30 дней вместо 54
**Причина:** Дата рассчитывается от старой даты окончания, а не от текущей
**Решение:** Уже исправлено - теперь используется текущая дата

### Проблема: Конвертация дает 0 дней
**Причина:** Оставшихся дней нет или расчет неправильный
**Решение:** Проверьте логи `[ConversionCalc]` - должно быть `remainingDays > 0`

### Проблема: Данные не обновляются
**Причина:** Webhook не отработал или ошибка при сохранении
**Решение:** Проверьте логи `[Webhook]` и `[ProcessPayment]` на ошибки

