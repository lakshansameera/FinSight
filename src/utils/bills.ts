import { monthKey } from './dates';
import type { BillStatus } from '@/components/BillCard';

export type BillLike = {
  dueDay: number;
  remindDaysBefore: number;
  lastPaidMonth: string | null;
};

/** Due date for a given month. Day 31 in a 30-day month becomes the 30th. */
export function dueDateFor(dueDay: number, year: number, month: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dueDay, lastDay));
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

export function billStatus(bill: BillLike, now = new Date()): { status: BillStatus; daysLeft: number; dueDate: Date } {
  const dueDate = dueDateFor(bill.dueDay, now.getFullYear(), now.getMonth());
  const daysLeft = daysBetween(now, dueDate); // negative = overdue

  if (bill.lastPaidMonth === monthKey(now)) return { status: 'paid', daysLeft, dueDate };
  if (daysLeft < 0) return { status: 'overdue', daysLeft, dueDate };
  if (daysLeft <= Math.max(bill.remindDaysBefore, 3)) return { status: 'dueSoon', daysLeft, dueDate };
  return { status: 'upcoming', daysLeft, dueDate };
}

export function dueText(status: BillStatus, daysLeft: number, dueDate: Date): string {
  const short = dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  switch (status) {
    case 'paid':
      return 'Paid this month';
    case 'overdue':
      return `Overdue by ${-daysLeft} day${-daysLeft === 1 ? '' : 's'}`;
    case 'dueSoon':
      return daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`;
    default:
      return `Due ${short}`;
  }
}