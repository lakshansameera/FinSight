export function formatLKR(amount: number): string {
  const whole = Math.round(Math.abs(amount));
  return 'LKR ' + whole.toLocaleString('en-US');
}

export function parseAmountToCents(text: string): number | null {
  const cleaned = text.replace(/,/g, '').trim(); 
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null; 
  const cents = Math.round(parseFloat(cleaned) * 100);
  return cents > 0 ? cents : null;
}

export function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}