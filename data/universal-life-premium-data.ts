// Universal Life Premium Tables

export interface UniversalLifePremiumRow {
  ageGroup: string
  minimum: number
  default: number
  maximum: number
}

export interface UniversalLifePlan {
  planId: string
  name: string
  sumAssured: number
  premiums: UniversalLifePremiumRow[]
}

// Universal Life Premium Table - 1000L (Annual premiums in MMK)
export const universalLife1000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 667000, default: 1334000, maximum: 1666000 },
  { ageGroup: "20-24", minimum: 715000, default: 1429000, maximum: 1818000 },
  { ageGroup: "25-29", minimum: 770000, default: 1429000, maximum: 1818000 },
  { ageGroup: "30-34", minimum: 910000, default: 1667000, maximum: 2222000 },
  { ageGroup: "35-39", minimum: 1112000, default: 2000000, maximum: 2500000 },
  { ageGroup: "40-44", minimum: 1667000, default: 2858000, maximum: 3333000 },
  { ageGroup: "45-49", minimum: 2500000, default: 4000000, maximum: 5000000 },
  { ageGroup: "50-54", minimum: 4000000, default: 5000000, maximum: 6666000 },
  { ageGroup: "55-59", minimum: 6668000, default: 10000000, maximum: 12500000 },
  { ageGroup: "60-64", minimum: 10000000, default: 13334000, maximum: 20000000 }
]

// Universal Life Premium Table - 1500L (Annual premiums in MMK)
export const universalLife1500L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 1005000, default: 2001000, maximum: 2499000 },
  { ageGroup: "20-24", minimum: 1072000, default: 2144000, maximum: 2727000 },
  { ageGroup: "25-29", minimum: 1155000, default: 2144000, maximum: 2727000 },
  { ageGroup: "30-34", minimum: 1365000, default: 2501000, maximum: 3333000 },
  { ageGroup: "35-39", minimum: 1668000, default: 3000000, maximum: 3750000 },
  { ageGroup: "40-44", minimum: 2500500, default: 4287000, maximum: 4999000 },
  { ageGroup: "45-49", minimum: 3750000, default: 6000000, maximum: 7500000 },
  { ageGroup: "50-54", minimum: 6000000, default: 7500000, maximum: 9999000 },
  { ageGroup: "55-59", minimum: 10002000, default: 15000000, maximum: 18750000 },
  { ageGroup: "60-64", minimum: 15000000, default: 20001000, maximum: 30000000 }
]

// Universal Life Premium Table - 2000L (Annual premiums in MMK)
export const universalLife2000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 1334000, default: 2668000, maximum: 3332000 },
  { ageGroup: "20-24", minimum: 1430000, default: 2858000, maximum: 3636000 },
  { ageGroup: "25-29", minimum: 1540000, default: 2858000, maximum: 3636000 },
  { ageGroup: "30-34", minimum: 1820000, default: 3334000, maximum: 4444000 },
  { ageGroup: "35-39", minimum: 2224000, default: 4000000, maximum: 5000000 },
  { ageGroup: "40-44", minimum: 3334000, default: 5716000, maximum: 6666000 },
  { ageGroup: "45-49", minimum: 5000000, default: 8000000, maximum: 10000000 },
  { ageGroup: "50-54", minimum: 8000000, default: 10000000, maximum: 13332000 },
  { ageGroup: "55-59", minimum: 13336000, default: 20000000, maximum: 25000000 },
  { ageGroup: "60-64", minimum: 20000000, default: 26668000, maximum: 40000000 }
]

// Universal Life Premium Table - 3000L (Annual premiums in MMK)
export const universalLife3000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 2001000, default: 4002000, maximum: 4998000 },
  { ageGroup: "20-24", minimum: 2145000, default: 4287000, maximum: 5454000 },
  { ageGroup: "25-29", minimum: 2310000, default: 4287000, maximum: 5454000 },
  { ageGroup: "30-34", minimum: 2730000, default: 5001000, maximum: 6666000 },
  { ageGroup: "35-39", minimum: 3336000, default: 6000000, maximum: 7500000 },
  { ageGroup: "40-44", minimum: 5001000, default: 8574000, maximum: 9999000 },
  { ageGroup: "45-49", minimum: 7500000, default: 12000000, maximum: 15000000 },
  { ageGroup: "50-54", minimum: 12000000, default: 15000000, maximum: 19998000 },
  { ageGroup: "55-59", minimum: 20004000, default: 30000000, maximum: 37500000 },
  { ageGroup: "60-64", minimum: 30000000, default: 40002000, maximum: 60000000 }
]

// Universal Life Premium Table - 4000L (Annual premiums in MMK)
export const universalLife4000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 2668000, default: 5336000, maximum: 6664000 },
  { ageGroup: "20-24", minimum: 2860000, default: 5716000, maximum: 7272000 },
  { ageGroup: "25-29", minimum: 3080000, default: 5716000, maximum: 7272000 },
  { ageGroup: "30-34", minimum: 3640000, default: 6668000, maximum: 8888000 },
  { ageGroup: "35-39", minimum: 4448000, default: 8000000, maximum: 10000000 },
  { ageGroup: "40-44", minimum: 6668000, default: 11432000, maximum: 13332000 },
  { ageGroup: "45-49", minimum: 10000000, default: 16000000, maximum: 20000000 },
  { ageGroup: "50-54", minimum: 16000000, default: 20000000, maximum: 26664000 },
  { ageGroup: "55-59", minimum: 26672000, default: 40000000, maximum: 50000000 },
  { ageGroup: "60-64", minimum: 40000000, default: 53336000, maximum: 80000000 }
]

// Universal Life Premium Table - 5000L (Annual premiums in MMK)
export const universalLife5000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", minimum: 3336000, default: 6670000, maximum: 8330000 },
  { ageGroup: "20-24", minimum: 3575000, default: 7145000, maximum: 9090000 },
  { ageGroup: "25-29", minimum: 3850000, default: 7145000, maximum: 9090000 },
  { ageGroup: "30-34", minimum: 4550000, default: 8335000, maximum: 11110000 },
  { ageGroup: "35-39", minimum: 5560000, default: 10000000, maximum: 12500000 },
  { ageGroup: "40-44", minimum: 8335000, default: 14290000, maximum: 16665000 },
  { ageGroup: "45-49", minimum: 12500000, default: 20000000, maximum: 25000000 },
  { ageGroup: "50-54", minimum: 20000000, default: 25000000, maximum: 33330000 },
  { ageGroup: "55-59", minimum: 33340000, default: 50000000, maximum: 62500000 },
  { ageGroup: "60-64", minimum: 50000000, default: 66670000, maximum: 100000000 }
]

// Combined Universal Life Plans Data
export const universalLifePlans: UniversalLifePlan[] = [
  { planId: "1000L", name: "1000L", sumAssured: 100000000, premiums: universalLife1000L },
  { planId: "1500L", name: "1500L", sumAssured: 150000000, premiums: universalLife1500L },
  { planId: "2000L", name: "2000L", sumAssured: 200000000, premiums: universalLife2000L },
  { planId: "3000L", name: "3000L", sumAssured: 300000000, premiums: universalLife3000L },
  { planId: "4000L", name: "4000L", sumAssured: 400000000, premiums: universalLife4000L },
  { planId: "5000L", name: "5000L", sumAssured: 500000000, premiums: universalLife5000L }
]

// Helper function to get Universal Life premium for a specific plan, health tier, and age
export const getUniversalLifePremiumFromTable = (planId: string, healthTier: string, age: number): number => {
  const plan = universalLifePlans.find(p => p.planId === planId)
  if (!plan) return 0
  
  // Find the appropriate age group
  let ageGroup = ""
  if (age >= 0 && age <= 19) ageGroup = "0-19"
  else if (age >= 20 && age <= 24) ageGroup = "20-24"
  else if (age >= 25 && age <= 29) ageGroup = "25-29"
  else if (age >= 30 && age <= 34) ageGroup = "30-34"
  else if (age >= 35 && age <= 39) ageGroup = "35-39"
  else if (age >= 40 && age <= 44) ageGroup = "40-44"
  else if (age >= 45 && age <= 49) ageGroup = "45-49"
  else if (age >= 50 && age <= 54) ageGroup = "50-54"
  else if (age >= 55 && age <= 59) ageGroup = "55-59"
  else if (age >= 60 && age <= 64) ageGroup = "60-64"
  else return 0 // Age not covered
  
  const row = plan.premiums.find(r => r.ageGroup === ageGroup)
  if (!row) return 0
  
  // Get the premium for the specific health tier
  switch (healthTier.toLowerCase()) {
    case "minimum": return row.minimum
    case "default": return row.default
    case "maximum": return row.maximum
    default: return 0
  }
}

// Helper function to get Universal Life plan details
export const getUniversalLifePlan = (planId: string): UniversalLifePlan | undefined => {
  return universalLifePlans.find(plan => plan.planId === planId)
}

// Helper function to get Universal Life age range dynamically from data
export const getUniversalLifeAgeRange = (): { minAge: number, maxAge: number } => {
  const firstPlan = universalLife1000L // Use first plan as reference (all plans have same age groups)
  const ageRanges = firstPlan.map(row => {
    const [min, max] = row.ageGroup.split('-').map(Number)
    return { min, max }
  })
  
  const minAge = Math.min(...ageRanges.map(range => range.min))
  const maxAge = Math.max(...ageRanges.map(range => range.max))
  
  return { minAge, maxAge }
}

// Helper function to check if age is covered for Universal Life
export const isUniversalLifeAgeCovered = (age: number): boolean => {
  const { minAge, maxAge } = getUniversalLifeAgeRange()
  return age >= minAge && age <= maxAge
}