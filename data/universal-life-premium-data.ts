// Universal Life Premium Tables

export interface UniversalLifePremiumRow {
  ageGroup: string
  twenty_years: number
  fifteen_years: number
  ten_years: number
}

export interface UniversalLifePlan {
  planId: string
  name: string
  sumAssured: number
  premiums: UniversalLifePremiumRow[]
}

// Universal Life Premium Table - 1000L (Annual premiums in MMK)
export const universalLife1000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 667000, fifteen_years: 1334000, ten_years: 1666000 },
  { ageGroup: "20-24", twenty_years: 715000, fifteen_years: 1429000, ten_years: 1818000 },
  { ageGroup: "25-29", twenty_years: 770000, fifteen_years: 1429000, ten_years: 1818000 },
  { ageGroup: "30-34", twenty_years: 910000, fifteen_years: 1667000, ten_years: 2222000 },
  { ageGroup: "35-39", twenty_years: 1112000, fifteen_years: 2000000, ten_years: 2500000 },
  { ageGroup: "40-44", twenty_years: 1667000, fifteen_years: 2858000, ten_years: 3333000 },
  { ageGroup: "45-49", twenty_years: 2500000, fifteen_years: 4000000, ten_years: 5000000 },
  { ageGroup: "50-54", twenty_years: 4000000, fifteen_years: 5000000, ten_years: 6666000 },
  { ageGroup: "55-59", twenty_years: 6668000, fifteen_years: 10000000, ten_years: 12500000 },
  { ageGroup: "60-64", twenty_years: 10000000, fifteen_years: 13334000, ten_years: 20000000 }
]

// Universal Life Premium Table - 1500L (Annual premiums in MMK)
export const universalLife1500L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 1005000, fifteen_years: 2001000, ten_years: 2499000 },
  { ageGroup: "20-24", twenty_years: 1072000, fifteen_years: 2144000, ten_years: 2727000 },
  { ageGroup: "25-29", twenty_years: 1155000, fifteen_years: 2144000, ten_years: 2727000 },
  { ageGroup: "30-34", twenty_years: 1365000, fifteen_years: 2501000, ten_years: 3333000 },
  { ageGroup: "35-39", twenty_years: 1668000, fifteen_years: 3000000, ten_years: 3750000 },
  { ageGroup: "40-44", twenty_years: 2500500, fifteen_years: 4287000, ten_years: 4999000 },
  { ageGroup: "45-49", twenty_years: 3750000, fifteen_years: 6000000, ten_years: 7500000 },
  { ageGroup: "50-54", twenty_years: 6000000, fifteen_years: 7500000, ten_years: 9999000 },
  { ageGroup: "55-59", twenty_years: 10002000, fifteen_years: 15000000, ten_years: 18750000 },
  { ageGroup: "60-64", twenty_years: 15000000, fifteen_years: 20001000, ten_years: 30000000 }
]

// Universal Life Premium Table - 2000L (Annual premiums in MMK)
export const universalLife2000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 1334000, fifteen_years: 2668000, ten_years: 3332000 },
  { ageGroup: "20-24", twenty_years: 1430000, fifteen_years: 2858000, ten_years: 3636000 },
  { ageGroup: "25-29", twenty_years: 1540000, fifteen_years: 2858000, ten_years: 3636000 },
  { ageGroup: "30-34", twenty_years: 1820000, fifteen_years: 3334000, ten_years: 4444000 },
  { ageGroup: "35-39", twenty_years: 2224000, fifteen_years: 4000000, ten_years: 5000000 },
  { ageGroup: "40-44", twenty_years: 3334000, fifteen_years: 5716000, ten_years: 6666000 },
  { ageGroup: "45-49", twenty_years: 5000000, fifteen_years: 8000000, ten_years: 10000000 },
  { ageGroup: "50-54", twenty_years: 8000000, fifteen_years: 10000000, ten_years: 13332000 },
  { ageGroup: "55-59", twenty_years: 13336000, fifteen_years: 20000000, ten_years: 25000000 },
  { ageGroup: "60-64", twenty_years: 20000000, fifteen_years: 26668000, ten_years: 40000000 }
]

// Universal Life Premium Table - 3000L (Annual premiums in MMK)
export const universalLife3000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 2001000, fifteen_years: 4002000, ten_years: 4998000 },
  { ageGroup: "20-24", twenty_years: 2145000, fifteen_years: 4287000, ten_years: 5454000 },
  { ageGroup: "25-29", twenty_years: 2310000, fifteen_years: 4287000, ten_years: 5454000 },
  { ageGroup: "30-34", twenty_years: 2730000, fifteen_years: 5001000, ten_years: 6666000 },
  { ageGroup: "35-39", twenty_years: 3336000, fifteen_years: 6000000, ten_years: 7500000 },
  { ageGroup: "40-44", twenty_years: 5001000, fifteen_years: 8574000, ten_years: 9999000 },
  { ageGroup: "45-49", twenty_years: 7500000, fifteen_years: 12000000, ten_years: 15000000 },
  { ageGroup: "50-54", twenty_years: 12000000, fifteen_years: 15000000, ten_years: 19998000 },
  { ageGroup: "55-59", twenty_years: 20004000, fifteen_years: 30000000, ten_years: 37500000 },
  { ageGroup: "60-64", twenty_years: 30000000, fifteen_years: 40002000, ten_years: 60000000 }
]

// Universal Life Premium Table - 4000L (Annual premiums in MMK)
export const universalLife4000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 2668000, fifteen_years: 5336000, ten_years: 6664000 },
  { ageGroup: "20-24", twenty_years: 2860000, fifteen_years: 5716000, ten_years: 7272000 },
  { ageGroup: "25-29", twenty_years: 3080000, fifteen_years: 5716000, ten_years: 7272000 },
  { ageGroup: "30-34", twenty_years: 3640000, fifteen_years: 6668000, ten_years: 8888000 },
  { ageGroup: "35-39", twenty_years: 4448000, fifteen_years: 8000000, ten_years: 10000000 },
  { ageGroup: "40-44", twenty_years: 6668000, fifteen_years: 11432000, ten_years: 13332000 },
  { ageGroup: "45-49", twenty_years: 10000000, fifteen_years: 16000000, ten_years: 20000000 },
  { ageGroup: "50-54", twenty_years: 16000000, fifteen_years: 20000000, ten_years: 26664000 },
  { ageGroup: "55-59", twenty_years: 26672000, fifteen_years: 40000000, ten_years: 50000000 },
  { ageGroup: "60-64", twenty_years: 40000000, fifteen_years: 53336000, ten_years: 80000000 }
]

// Universal Life Premium Table - 5000L (Annual premiums in MMK)
export const universalLife5000L: UniversalLifePremiumRow[] = [
  { ageGroup: "0-19", twenty_years: 3336000, fifteen_years: 6670000, ten_years: 8330000 },
  { ageGroup: "20-24", twenty_years: 3575000, fifteen_years: 7145000, ten_years: 9090000 },
  { ageGroup: "25-29", twenty_years: 3850000, fifteen_years: 7145000, ten_years: 9090000 },
  { ageGroup: "30-34", twenty_years: 4550000, fifteen_years: 8335000, ten_years: 11110000 },
  { ageGroup: "35-39", twenty_years: 5560000, fifteen_years: 10000000, ten_years: 12500000 },
  { ageGroup: "40-44", twenty_years: 8335000, fifteen_years: 14290000, ten_years: 16665000 },
  { ageGroup: "45-49", twenty_years: 12500000, fifteen_years: 20000000, ten_years: 25000000 },
  { ageGroup: "50-54", twenty_years: 20000000, fifteen_years: 25000000, ten_years: 33330000 },
  { ageGroup: "55-59", twenty_years: 33340000, fifteen_years: 50000000, ten_years: 62500000 },
  { ageGroup: "60-64", twenty_years: 50000000, fifteen_years: 66670000, ten_years: 100000000 }
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
    case "20 years": return row.twenty_years
    case "15 years": return row.fifteen_years
    case "10 years": return row.ten_years
    // Legacy support for old names
    case "minimum": return row.twenty_years
    case "default": return row.fifteen_years
    case "maximum": return row.ten_years
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