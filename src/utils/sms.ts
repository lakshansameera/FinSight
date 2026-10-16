import type { CategoryKey } from '@/constants/theme';
import { parseAmountToCents } from './currency';

export type SmsDraft = {
  amountCents: number | null;
  direction: 'in' | 'out';
  merchant: string;
  category: CategoryKey;
};

const OUT_WORDS = /\b(debit(?:ed)?|spent|purchase|paid|payment|withdraw(?:n|al)?|sent|transferred)\b/i;
const IN_WORDS = /\b(credit(?:ed)?|received|deposit(?:ed)?|salary|refund(?:ed)?)\b/i;

// Keyword -> category. First match wins, so keep the specific ones first.
const CATEGORY_HINTS: [RegExp, CategoryKey][] = [
  [/keells|cargills|arpico|food|restaurant|cafe|kfc|pizza|uber ?eats|pickme ?food|bakery/i, 'food'],
  [/uber|pickme|fuel|petrol|ceypetco|lanka ioc|bus|train|expressway|parking/i, 'transport'],
  [/ceb|leco|water board|nwsdb|dialog|mobitel|slt|hutch|airtel|electricity|internet|rent/i, 'bills'],
  [/pharmacy|hospital|channel|clinic|medi|health|lab/i, 'health'],
  [/odel|fashion|mall|store|shop|daraz|supermarket|amazon/i, 'shopping'],
  [/loan|leasing|installment|instalment/i, 'loans'],
  [/salary|payroll|refund/i, 'income'],
];

export function guessCategory(text: string, direction: 'in' | 'out'): CategoryKey {
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(text)) return cat === 'income' && direction === 'out' ? 'other' : cat;
  return direction === 'in' ? 'income' : 'other';
}

/** Best-effort parse of a pasted bank SMS. Always returns a draft the user must confirm. */
export function parseBankSms(text: string): SmsDraft {
  const amountMatch = /(?:LKR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i.exec(text);
  const amountCents = amountMatch ? parseAmountToCents(amountMatch[1]) : null;

  const isIn = IN_WORDS.test(text) && !OUT_WORDS.test(text);
  const direction: 'in' | 'out' = isIn ? 'in' : 'out';

  const merchantMatch =
    /\b(?:at|to|from|@)\s+([A-Za-z0-9][A-Za-z0-9 &.'-]{1,30}?)(?=\s+(?:on|dt|date|ref|bal|avl|using|via|a\/c|acc)\b|[.,;]|$)/i.exec(text);
  const merchant = merchantMatch ? merchantMatch[1].trim().replace(/\s+/g, ' ') : '';

  return { amountCents, direction, merchant, category: guessCategory(`${merchant} ${text}`, direction) };
}