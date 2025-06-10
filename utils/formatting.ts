export function formatMMK(amount: number): string {
  if (amount >= 1000000) {
    // For amounts 1M and above, use L format (1 Lakh = 100,000)
    const lakhs = amount / 100000
    if (lakhs % 1 === 0) {
      return `${lakhs}L MMK`
    } else {
      return `${lakhs.toFixed(1)}L MMK`
    }
  } else {
    // For amounts below 1M, use comma format
    return `${new Intl.NumberFormat("en-US").format(amount)} MMK`
  }
}

export function formatMMKShort(amount: number): string {
  if (amount >= 1000000) {
    // For amounts 1M and above, use L format without MMK (1 Lakh = 100,000)
    const lakhs = amount / 100000
    if (lakhs % 1 === 0) {
      return `${lakhs}L`
    } else {
      return `${lakhs.toFixed(1)}L`
    }
  } else {
    // For amounts below 1M, use comma format without MMK
    return new Intl.NumberFormat("en-US").format(amount)
  }
}
