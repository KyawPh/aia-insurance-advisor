export interface ClientData {
  name: string
  dateOfBirth: string
  gender: string
}

export interface OHSPlan {
  id: number
  name: string
  dailyLimit: number
  annualLimit: number
  accidentalDeath: number
}

export interface OHSPlanWithPremium extends OHSPlan {
  premium: number
  isDefault?: boolean
}

export interface UniversalLifePlan {
  id: string
  name: string
  sumAssured: number
  healthTiers: string[]
}

export interface TermLifePlan {
  id: string
  name: string
  coverage: number
}

export interface ProductSelections {
  ohsPlans: number[]
  universalLife: {
    planId: string
    healthTier: string
  } | null
  termLife: {
    planId: string
  } | null
  cancerRider: boolean
}
