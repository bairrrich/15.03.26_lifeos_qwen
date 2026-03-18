import { TransactionService, SubscriptionService } from './finance-services';
import type { Transaction, Subscription } from '../entities';

const transactionService = new TransactionService();
const subscriptionService = new SubscriptionService();

/**
 * Проверяет подписки и создаёт транзакции для наступивших платежей
 */
export async function processSubscriptionPayments(): Promise<{
  processed: number;
  created: number;
}> {
  const subscriptions = await subscriptionService.getAll();
  const now = Date.now();

  let processed = 0;
  let created = 0;

  for (const subscription of subscriptions) {
    // Пропускаем неактивные подписки
    if (subscription.is_active === false) continue;

    // Проверяем, наступила ли дата платежа
    if (subscription.next_billing_date <= now) {
      processed++;

      try {
        // Создаём транзакцию
        await transactionService.create({
          user_id: subscription.user_id,
          account_id: subscription.account_id,
          category_id: subscription.category_id,
          type: 'expense',
          amount: subscription.amount,
          currency: subscription.currency,
          description: subscription.description || `Подписка: ${subscription.name}`,
          merchant: subscription.name,
          date: now,
          tags: ['subscription', 'recurring'],
        });

        // Обновляем дату следующего платежа
        const nextDate = getNextBillingDate(
          subscription.next_billing_date,
          subscription.billing_period
        );

        await subscriptionService.update(subscription.id, {
          ...subscription,
          next_billing_date: nextDate,
        });

        created++;
      } catch (error) {
        console.error(`[Subscriptions] Error processing ${subscription.name}:`, error);
      }
    }
  }

  return { processed, created };
}

/**
 * Рассчитывает следующую дату платежа
 */
function getNextBillingDate(
  currentDate: number,
  period: 'monthly' | 'yearly' | 'weekly'
): number {
  const date = new Date(currentDate);

  switch (period) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.getTime();
}

/**
 * Получает подписки с предстоящими платежами (в течение N дней)
 */
export async function getUpcomingPayments(days: number = 7): Promise<Subscription[]> {
  const subscriptions = await subscriptionService.getAll();
  const now = Date.now();
  const futureDate = now + days * 24 * 60 * 60 * 1000;

  return subscriptions.filter(
    (sub) =>
      sub.is_active !== false &&
      sub.next_billing_date >= now &&
      sub.next_billing_date <= futureDate
  );
}

/**
 * Отправляет уведомления о предстоящих платежах
 */
export async function notifyUpcomingPayments(days: number = 7): Promise<void> {
  const upcoming = await getUpcomingPayments(days);

  for (const subscription of upcoming) {
    const daysUntil = Math.ceil(
      (subscription.next_billing_date - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // В реальном приложении здесь была бы отправка push/email уведомлений
    // Сейчас просто логируем
    console.log(
      `[Notification] Подписка "${subscription.name}": платеж через ${daysUntil} дн. (${subscription.amount} ${subscription.currency})`
    );
  }
}

/**
 * Получает историю платежей по подписке
 */
export async function getSubscriptionPaymentHistory(
  subscriptionId: string
): Promise<Transaction[]> {
  const [transactions, subscription] = await Promise.all([
    transactionService.getAll(),
    subscriptionService.getById(subscriptionId),
  ]);

  if (!subscription) return [];

  return transactions
    .filter(
      (t) =>
        t.tags?.includes('subscription') &&
        t.merchant === subscription.name
    )
    .sort((a, b) => b.date - a.date);
}

