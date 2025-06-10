// Real AIA Myanmar premium tables
import { getOHSPremiumFromTable } from "@/data/ohs-premium-data"
import { getUniversalLifePremiumFromTable } from "@/data/universal-life-premium-data"
import { getShortTermEndowmentPremiumFromTable } from "@/data/short-term-endowment-premium-data"
import { getCancerCarePremiumFromTable } from "@/data/cancer-care-premium-data"

export function getOHSPremium(planId: number, insuranceAge: number, gender: string): number {
  return getOHSPremiumFromTable(planId, insuranceAge, gender)
}

export function getUniversalLifePremium(
  planId: string,
  healthTier: string,
  insuranceAge: number,
  gender: string,
): number {
  return getUniversalLifePremiumFromTable(planId, healthTier, insuranceAge)
}

export function getTermLifePremium(planId: string, age: number, gender: string): number {
  return getShortTermEndowmentPremiumFromTable(planId, age, gender)
}

export function getCancerRiderPremium(age: number, gender: string): number {
  return getCancerCarePremiumFromTable(age, gender)
}

// Note: Age factors no longer needed as real premium tables include age-specific pricing
