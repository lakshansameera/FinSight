import { colors } from '@/constants/theme';
export type BudgetStatus = 'ok' | 'warning' | 'over';

export function budgetStatus(spent : number , limit : number) : BudgetStatus {
    if (limit <=0) return 'ok';
    const ratio = spent / limit;
    if (ratio >= 1 ) return 'over';
    if (ratio >= 0.8) return 'warning';
    return 'ok';
}

export const STATUS_COLORS: Record<BudgetStatus, { fill: string; text: string }> = {
  ok: { fill: colors.primary, text: colors.caption },
  warning: { fill: colors.warning, text: colors.warningText },
  over: { fill: colors.danger, text: colors.danger },
};