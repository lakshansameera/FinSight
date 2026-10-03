export function formatLKR(amount: number): string {
  const whole = Math.round(Math.abs(amount));
  return 'LKR ' + whole.toLocaleString('en-US');
}