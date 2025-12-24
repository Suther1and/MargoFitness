# ✅ Чеклист деплоя MargoFitness на Vercel

## Перед деплоем

### 1. База данных (Supabase)
- [ ] Применена миграция 012 для Yandex ID
  ```sql
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS yandex_id TEXT UNIQUE;
  CREATE INDEX IF NOT EXISTS idx_profiles_yandex_id ON profiles(yandex_id);
  ```
- [ ] Все предыдущие миграции применены (001-011)
- [ ] Проверены RLS политики

### 2. OAuth приложения настроены

#### Yandex ID:
- [ ] Создано приложение на [OAuth.Yandex](https://oauth.yandex.ru/)
- [ ] Добавлен Redirect URI: `https://margofitness.pro/api/auth/yandex/callback`
- [ ] Выданы права: `login:email`, `login:info`, `login:avatar`
- [ ] Скопированы Client ID и Client Secret

#### Telegram Bot (опционально):
- [ ] Бот создан через @BotFather
- [ ] Скопирован Bot Token
- [ ] Запомнили Bot Name

#### Google OAuth:
- [ ] Настроен в Supabase Dashboard (Authentication → Providers → Google)

### 3. Переменные окружения готовы
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL` (ваш домен)
- [ ] `YANDEX_CLIENT_ID`
- [ ] `YANDEX_CLIENT_SECRET`
- [ ] `TELEGRAM_BOT_TOKEN` (если используете)
- [ ] `NEXT_PUBLIC_TELEGRAM_BOT_NAME` (если используете)

---

## Процесс деплоя

### Шаг 1: Vercel
- [ ] Открыт [vercel.com/new](https://vercel.com/new)
- [ ] Импортирован GitHub репозиторий
- [ ] Выбран проект MargoFitness

### Шаг 2: Environment Variables
Добавьте в **Settings → Environment Variables**:

#### Обязательные:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yxzrenwkkntnhmdimhln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ
NEXT_PUBLIC_SITE_URL=https://margofitness.pro
```

#### OAuth:
```env
YANDEX_CLIENT_ID=81370b983cd64ba79bc49dc8d9b215e1
YANDEX_CLIENT_SECRET=ee66c653113e4ceab2fa7f64d4ceff87
TELEGRAM_BOT_TOKEN=ваш_токен
NEXT_PUBLIC_TELEGRAM_BOT_NAME=margofitness_auth_bot
```

#### Опционально:
```env
YOOKASSA_SHOP_ID=ваш_id
YOOKASSA_SECRET_KEY=ваш_секрет
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=noreply@margofitness.pro
```

- [ ] Все переменные добавлены
- [ ] Выбрано окружение: **Production**

### Шаг 3: Deploy
- [ ] Нажата кнопка **Deploy**
- [ ] Деплой завершен успешно (2-3 минуты)
- [ ] Получен URL вида `margofitness.vercel.app`

### Шаг 4: Домен
- [ ] Открыт **Settings → Domains**
- [ ] Добавлен домен: `margofitness.pro`
- [ ] Скопированы DNS записи от Vercel

### Шаг 5: DNS настройки
У регистратора домена:
- [ ] Добавлена A-запись или CNAME
- [ ] DNS обновлен (ожидание 5-30 минут)
- [ ] Домен доступен через HTTPS

---

## После деплоя

### 1. Обновить OAuth Redirect URIs

#### Yandex:
- [ ] Открыт [OAuth.Yandex](https://oauth.yandex.ru/)
- [ ] В Redirect URI добавлено:
  ```
  https://margofitness.pro/api/auth/yandex/callback
  ```

#### Supabase (для Google):
- [ ] Открыт Supabase Dashboard
- [ ] Authentication → URL Configuration
- [ ] Site URL: `https://margofitness.pro`
- [ ] Redirect URLs: `https://margofitness.pro/auth/callback`

### 2. Тестирование

#### Авторизация:
- [ ] Email/Password работает
- [ ] Google OAuth работает
- [ ] Yandex OAuth работает (**НОВОЕ!**)
- [ ] Telegram авторизация работает

#### Функциональность:
- [ ] Dashboard загружается
- [ ] Тренировки отображаются
- [ ] Профиль редактируется
- [ ] Админка доступна (если админ)

#### Платежи (если настроены):
- [ ] YooKassa интеграция работает
- [ ] Тестовый платеж проходит

### 3. Мониторинг
- [ ] Открыт Vercel Dashboard → Analytics
- [ ] Проверены логи (Functions → Logs)
- [ ] Настроены уведомления об ошибках

---

## 🐛 Troubleshooting

### Ошибка: "OAuth not configured"
→ Проверьте переменные `YANDEX_CLIENT_ID` и `YANDEX_CLIENT_SECRET`  
→ Убедитесь, что выбрали окружение **Production**  
→ Redeploy проект после добавления переменных

### Ошибка: "Invalid redirect_uri"
→ Обновите Redirect URI в Yandex OAuth приложении  
→ Проверьте `NEXT_PUBLIC_SITE_URL` (должен совпадать с доменом)

### Ошибка: "Database error" или "Column does not exist"
→ Примените миграцию 012 в Supabase  
→ Проверьте, что `yandex_id` существует в таблице profiles

### DNS не обновляется
→ Проверьте записи у регистратора (должны совпадать с Vercel)  
→ Подождите до 48 часов (обычно 5-30 минут)  
→ Очистите DNS кеш: `ipconfig /flushdns` (Windows) или `sudo dscacheutil -flushcache` (Mac)

### Суpabase connection error
→ Проверьте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
→ Убедитесь, что проект Supabase активен  
→ Проверьте RLS политики

---

## 📊 Полезные ссылки

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Yandex OAuth:** https://oauth.yandex.ru/
- **Telegram BotFather:** https://t.me/BotFather

---

## 🎉 Готово!

После выполнения всех пунктов:
1. Откройте https://margofitness.pro
2. Протестируйте все функции
3. Наслаждайтесь работающим приложением!

---

**Последнее обновление:** 24 декабря 2025  
**Версия:** 2.0 (с Yandex ID OAuth)

