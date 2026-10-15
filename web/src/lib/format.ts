export function formatMoney(amount: number, currency: string): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0
  const amountStr = amount.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })
  return `$${amountStr} ${currency}`
}
