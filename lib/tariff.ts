export const TARIFF_BY_UF: Record<string, number> = {
  AC: 0.75, AL: 0.72, AM: 0.78, AP: 0.70, BA: 0.73,
  CE: 0.71, DF: 0.68, ES: 0.76, GO: 0.74, MA: 0.69,
  MG: 0.77, MS: 0.72, MT: 0.75, PA: 0.79, PB: 0.70,
  PE: 0.73, PI: 0.68, PR: 0.71, RJ: 0.82, RN: 0.69,
  RO: 0.74, RR: 0.80, RS: 0.77, SC: 0.70, SE: 0.68,
  SP: 0.81, TO: 0.73,
}

export const DEFAULT_TARIFF = 0.75

export function getTariff(uf: string): number {
  return TARIFF_BY_UF[uf.toUpperCase()] ?? DEFAULT_TARIFF
}

export function estimateSavings(monthlyKwh: number, uf: string): number {
  const tariff = getTariff(uf)
  const monthlyCost = monthlyKwh * tariff
  const savings = monthlyCost * 0.32
  return Math.round(savings * 100) / 100
}

export function estimateFromBillAmount(monthlyBill: number): number {
  const savings = monthlyBill * 0.32
  return Math.round(savings * 100) / 100
}
