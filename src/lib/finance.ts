export const money = (value: number, compact = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);

export function equityMath(amount: number, valuation: number, basis: "pre" | "post") {
  const postMoney = basis === "pre" ? valuation + amount : valuation;
  const preMoney = basis === "pre" ? valuation : Math.max(0, valuation - amount);
  const ownership = postMoney > 0 ? (amount / postMoney) * 100 : 0;
  return { preMoney, postMoney, ownership };
}

export const percent = (value: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
