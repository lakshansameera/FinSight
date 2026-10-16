import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { billStatus, dueDateFor } from './bills';
import { formatLKR } from './currency';
import type { Bill } from '@/db/billsRepo';

const CHANNEL = 'bill-reminders';
const REMINDER_HOUR = 9; // 9:00 local time

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureReminderPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Bill reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return asked.granted;
  } catch {
    return false;
  }
}

/**
 * Rebuilds all local reminders from the bills table: one reminder per unpaid bill for this month
 * and next month, fired `remindDaysBefore` days before the due date at 09:00.
 */
export async function syncBillReminders(bills: Bill[], now = new Date()): Promise<number> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (bills.length === 0) return 0;
    if (!(await ensureReminderPermission())) return 0;

    let scheduled = 0;
    for (const bill of bills) {
      const { status } = billStatus(bill, now);
      for (let offset = 0; offset < 2; offset++) {
        if (offset === 0 && status === 'paid') continue; // this month's already settled
        const due = dueDateFor(bill.dueDay, now.getFullYear(), now.getMonth() + offset);
        const fire = new Date(due);
        fire.setDate(fire.getDate() - bill.remindDaysBefore);
        fire.setHours(REMINDER_HOUR, 0, 0, 0);
        if (fire.getTime() <= now.getTime()) continue;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${bill.name} is due soon`,
            body: `${formatLKR(bill.amountCents / 100)} due on ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.`,
            data: { billId: bill.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fire,
            channelId: CHANNEL,
          },
        });
        scheduled++;
      }
    }
    return scheduled;
  } catch (e) {
    console.warn('[reminders] could not schedule', e);
    return 0;
  }
}