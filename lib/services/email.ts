/**
 * Email сервис - отправка уведомлений через Resend
 * 
 * Функции:
 * - Приветственное письмо после регистрации
 * - Уведомление об успешной оплате
 * - Уведомление об апгрейде подписки
 * - Уведомление об изменении подписки
 */

import { Resend } from 'resend'

// Инициализация клиента Resend (только если есть API ключ)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// От кого отправляются письма
const FROM_EMAIL = process.env.EMAIL_FROM || 'MargoFitness <onboarding@resend.dev>'

// ============================================
// Типы
// ============================================

export interface WelcomeEmailParams {
  to: string
  userName?: string
}

export interface PaymentSuccessEmailParams {
  to: string
  userName?: string
  planName: string
  amount: number
  duration: number
  expiresAt: string
}

export interface SubscriptionUpgradeEmailParams {
  to: string
  userName?: string
  oldPlan: string
  newPlan: string
  bonusDays: number
  totalDays: number
}

export interface SubscriptionChangeEmailParams {
  to: string
  userName?: string
  changeType: 'activated' | 'renewed' | 'cancelled' | 'expired'
  planName?: string
  details?: string
}

// ============================================
// HTML шаблоны
// ============================================

function getWelcomeEmailHTML(userName?: string): string {
  const name = userName || 'друг'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">💪</div>
      <h1>Добро пожаловать в MargoFitness!</h1>
    </div>
    <div class="content">
      <p>Привет, ${name}!</p>
      
      <p>Рады приветствовать тебя в нашем фитнес-сообществе! Твой аккаунт успешно создан.</p>
      
      <p><strong>Что дальше?</strong></p>
      <ul>
        <li>✅ Получи доступ к бесплатным тренировкам</li>
        <li>✅ Изучи наши тарифные планы</li>
        <li>✅ Начни путь к своей лучшей форме</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Перейти в личный кабинет
        </a>
      </p>
      
      <p>Если у тебя есть вопросы, просто ответь на это письмо.</p>
      
      <p>До встречи на тренировках! 💪</p>
    </div>
    <div class="footer">
      <p>MargoFitness © ${new Date().getFullYear()}</p>
      <p>Ты получил это письмо, потому что зарегистрировался на нашем сайте</p>
    </div>
  </div>
</body>
</html>
  `
}

function getPaymentSuccessEmailHTML(params: Omit<PaymentSuccessEmailParams, 'to'>): string {
  const name = params.userName || 'друг'
  const expiryDate = new Date(params.expiresAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .payment-details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; }
    .detail-value { font-weight: 600; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>Оплата прошла успешно!</h1>
    </div>
    <div class="content">
      <p>Привет, ${name}!</p>
      
      <p>Спасибо за покупку! Твоя подписка активирована.</p>
      
      <div class="payment-details">
        <div class="detail-row">
          <span class="detail-label">Тарифный план:</span>
          <span class="detail-value">${params.planName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Длительность:</span>
          <span class="detail-value">${params.duration} ${getDurationText(params.duration)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Сумма:</span>
          <span class="detail-value">${params.amount.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Действует до:</span>
          <span class="detail-value">${expiryDate}</span>
        </div>
      </div>
      
      <p><strong>Теперь тебе доступно:</strong></p>
      <ul>
        <li>✅ Все тренировочные программы</li>
        <li>✅ Персональные рекомендации</li>
        <li>✅ Отслеживание прогресса</li>
        <li>✅ Поддержка тренера</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Начать тренировки
        </a>
      </p>
      
      <p>Желаем успехов в достижении твоих целей! 💪</p>
    </div>
    <div class="footer">
      <p>MargoFitness © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `
}

function getSubscriptionUpgradeEmailHTML(params: Omit<SubscriptionUpgradeEmailParams, 'to'>): string {
  const name = params.userName || 'друг'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .upgrade-box { background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🚀</div>
      <h1>Апгрейд подписки!</h1>
    </div>
    <div class="content">
      <p>Привет, ${name}!</p>
      
      <p>Отличные новости! Ты повысил свою подписку.</p>
      
      <div class="upgrade-box">
        <p style="margin: 0;"><strong>Изменения:</strong></p>
        <p style="margin: 10px 0;">${params.oldPlan} → <strong>${params.newPlan}</strong></p>
        <p style="margin: 0; color: #92400e;">
          🎁 <strong>Бонус:</strong> ${params.bonusDays} дней за остаток старой подписки<br>
          📅 <strong>Всего:</strong> ${params.totalDays} дней подписки ${params.newPlan}
        </p>
      </div>
      
      <p>Мы конвертировали оставшиеся дни твоей предыдущей подписки в дополнительные дни новой. Теперь у тебя ещё больше возможностей!</p>
      
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Открыть личный кабинет
        </a>
      </p>
      
      <p>Спасибо, что с нами! 💪</p>
    </div>
    <div class="footer">
      <p>MargoFitness © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `
}

function getSubscriptionChangeEmailHTML(params: Omit<SubscriptionChangeEmailParams, 'to'>): string {
  const name = params.userName || 'друг'
  
  let emoji = '📢'
  let title = 'Изменение подписки'
  let message = ''
  let color = '#667eea'
  
  switch (params.changeType) {
    case 'activated':
      emoji = '✅'
      title = 'Подписка активирована'
      message = `Твоя подписка ${params.planName} успешно активирована!`
      color = '#10b981'
      break
    case 'renewed':
      emoji = '🔄'
      title = 'Подписка продлена'
      message = `Твоя подписка ${params.planName} автоматически продлена.`
      color = '#3b82f6'
      break
    case 'cancelled':
      emoji = '⚠️'
      title = 'Подписка отменена'
      message = 'Твоя подписка была отменена. Доступ сохранится до конца оплаченного периода.'
      color = '#ef4444'
      break
    case 'expired':
      emoji = '⏰'
      title = 'Подписка истекла'
      message = 'Твоя подписка истекла. Оформи новую, чтобы продолжить тренировки!'
      color = '#f59e0b'
      break
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${color}; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; border-top: none; }
    .button { display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">${emoji}</div>
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p>Привет, ${name}!</p>
      
      <p>${message}</p>
      
      ${params.details ? `<p>${params.details}</p>` : ''}
      
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
          Открыть личный кабинет
        </a>
      </p>
    </div>
    <div class="footer">
      <p>MargoFitness © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `
}

// ============================================
// Вспомогательные функции
// ============================================

function getDurationText(months: number): string {
  if (months === 1) return 'месяц'
  if (months >= 2 && months <= 4) return 'месяца'
  return 'месяцев'
}

// ============================================
// Функции отправки email
// ============================================

/**
 * Отправить приветственное письмо
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured. Skipping welcome email. Set RESEND_API_KEY to enable.')
    return false
  }
  
  try {
    console.log('[Email] Sending welcome email to:', params.to)
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: '🎉 Добро пожаловать в MargoFitness!',
      html: getWelcomeEmailHTML(params.userName)
    })
    
    console.log('[Email] Welcome email sent successfully')
    return true
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error)
    return false
  }
}

/**
 * Отправить уведомление об успешной оплате
 */
export async function sendPaymentSuccessEmail(params: PaymentSuccessEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured. Skipping payment success email. Set RESEND_API_KEY to enable.')
    return false
  }
  
  try {
    console.log('[Email] Sending payment success email to:', params.to)
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: '✅ Оплата прошла успешно - MargoFitness',
      html: getPaymentSuccessEmailHTML(params)
    })
    
    console.log('[Email] Payment success email sent successfully')
    return true
  } catch (error) {
    console.error('[Email] Failed to send payment success email:', error)
    return false
  }
}

/**
 * Отправить уведомление об апгрейде подписки
 */
export async function sendSubscriptionUpgradeEmail(params: SubscriptionUpgradeEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured. Skipping upgrade email. Set RESEND_API_KEY to enable.')
    return false
  }
  
  try {
    console.log('[Email] Sending upgrade email to:', params.to)
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: '🚀 Апгрейд подписки - MargoFitness',
      html: getSubscriptionUpgradeEmailHTML(params)
    })
    
    console.log('[Email] Upgrade email sent successfully')
    return true
  } catch (error) {
    console.error('[Email] Failed to send upgrade email:', error)
    return false
  }
}

/**
 * Отправить уведомление об изменении подписки
 */
export async function sendSubscriptionChangeEmail(params: SubscriptionChangeEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured. Skipping subscription change email. Set RESEND_API_KEY to enable.')
    return false
  }
  
  try {
    console.log('[Email] Sending subscription change email to:', params.to)
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: '📢 Изменение подписки - MargoFitness',
      html: getSubscriptionChangeEmailHTML(params)
    })
    
    console.log('[Email] Subscription change email sent successfully')
    return true
  } catch (error) {
    console.error('[Email] Failed to send subscription change email:', error)
    return false
  }
}

