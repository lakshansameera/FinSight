import type { CategoryKey } from './theme';

/**
 * SAMPLE DATA for the module demo. These are illustrative offers, not real promotions.
 * In a production app this list would come from the backend (partner banks' offer feeds).
 */
export type Offer = {
  id: string;
  bank: string;
  bankColor: string;
  title: string;
  detail: string; // one-line summary shown on the card
  category: CategoryKey; // spending category the offer is relevant to
  description: string;
  terms: string[];
  validUntil: string; // ISO date
};

export const OFFERS: Offer[] = [
  {
    id: 'o1',
    bank: 'Commercial Bank',
    bankColor: '#0B5CAB',
    title: '15% off at partner supermarkets',
    detail: 'Credit cards · up to LKR 3,000 / month',
    category: 'food',
    description: 'Get 15% off your grocery bill at participating supermarkets when you pay with an eligible credit card.',
    terms: ['Maximum discount LKR 3,000 per card per month', 'Valid on weekdays only', 'Not combinable with other promotions'],
    validUntil: '2026-12-31',
  },
  {
    id: 'o2',
    bank: 'Sampath Bank',
    bankColor: '#E2531F',
    title: '10% back on fuel',
    detail: 'Debit & credit · selected stations',
    category: 'transport',
    description: 'Earn 10% cashback on fuel purchases at selected stations, credited to your card the following month.',
    terms: ['Cashback capped at LKR 2,000 per month', 'Selected stations only', 'Credited within 30 days'],
    validUntil: '2026-11-30',
  },
  {
    id: 'o3',
    bank: 'HNB',
    bankColor: '#8A1538',
    title: '0% instalments on electronics',
    detail: '6 or 12 months · partner stores',
    category: 'shopping',
    description: 'Split large purchases into 6 or 12 interest-free instalments at partner electronics and appliance stores.',
    terms: ['Minimum purchase LKR 50,000', 'Credit cards only', 'Subject to credit approval'],
    validUntil: '2026-12-15',
  },
  {
    id: 'o4',
    bank: 'NDB Bank',
    bankColor: '#1B7F5C',
    title: '20% off at partner pharmacies',
    detail: 'All cards · health & wellness',
    category: 'health',
    description: 'Save 20% on health and wellness products at participating pharmacies and channelling centres.',
    terms: ['Excludes prescription items where prohibited by regulation', 'Show your card at checkout'],
    validUntil: '2026-11-20',
  },
  {
    id: 'o5',
    bank: "People's Bank",
    bankColor: '#C8102E',
    title: 'Waived fees on utility bill payments',
    detail: 'Online banking · electricity, water, phone',
    category: 'bills',
    description: 'Pay electricity, water and phone bills through online banking with no service fee.',
    terms: ['Online banking and mobile app only', 'Applies to registered billers'],
    validUntil: '2027-03-31',
  },
  {
    id: 'o6',
    bank: 'Bank of Ceylon',
    bankColor: '#E0A100',
    title: 'Dining deals on weekends',
    detail: 'Up to 25% off · select restaurants',
    category: 'food',
    description: 'Enjoy up to 25% off at select restaurants on Saturdays and Sundays with your BOC card.',
    terms: ['Weekends only', 'Reservations may be required', 'Discount varies by restaurant'],
    validUntil: '2026-12-31',
  },
];

export function getOffer(id: string): Offer | undefined {
  return OFFERS.find((o) => o.id === id);
}