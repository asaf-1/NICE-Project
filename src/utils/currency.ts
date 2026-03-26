export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[$,]/g, '').trim());
}

export function sumBalances(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}

