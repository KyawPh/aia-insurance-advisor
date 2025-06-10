// Cancer Care Premium Tables

export interface CancerCarePremiumRow {
  age: number
  premium: number
}

// Cancer Care Premium Table - Female (Annual premiums in MMK)
export const cancerCareFemalePremiums: CancerCarePremiumRow[] = [
  { age: 1, premium: 48000 },
  { age: 2, premium: 55000 },
  { age: 3, premium: 61000 },
  { age: 4, premium: 68000 },
  { age: 5, premium: 74000 },
  { age: 6, premium: 77000 },
  { age: 7, premium: 87000 },
  { age: 8, premium: 93000 },
  { age: 9, premium: 93000 },
  { age: 10, premium: 96000 },
  { age: 11, premium: 96000 },
  { age: 12, premium: 100000 },
  { age: 13, premium: 103000 },
  { age: 14, premium: 106000 },
  { age: 15, premium: 116000 },
  { age: 16, premium: 125000 },
  { age: 17, premium: 132000 },
  { age: 18, premium: 135000 },
  { age: 19, premium: 135000 },
  { age: 20, premium: 135000 },
  { age: 21, premium: 135000 },
  { age: 22, premium: 132000 },
  { age: 23, premium: 132000 },
  { age: 24, premium: 132000 },
  { age: 25, premium: 132000 },
  { age: 26, premium: 129000 },
  { age: 27, premium: 125000 },
  { age: 28, premium: 132000 },
  { age: 29, premium: 151000 },
  { age: 30, premium: 174000 },
  { age: 31, premium: 196000 },
  { age: 32, premium: 225000 },
  { age: 33, premium: 248000 },
  { age: 34, premium: 260000 },
  { age: 35, premium: 276000 },
  { age: 36, premium: 289000 },
  { age: 37, premium: 305000 },
  { age: 38, premium: 338000 },
  { age: 39, premium: 383000 },
  { age: 40, premium: 437000 },
  { age: 41, premium: 501000 },
  { age: 42, premium: 569000 },
  { age: 43, premium: 633000 },
  { age: 44, premium: 688000 },
  { age: 45, premium: 746000 },
  { age: 46, premium: 807000 },
  { age: 47, premium: 878000 },
  { age: 48, premium: 929000 },
  { age: 49, premium: 964000 },
  { age: 50, premium: 1006000 },
  { age: 51, premium: 1041000 },
  { age: 52, premium: 1083000 },
  { age: 53, premium: 1131000 },
  { age: 54, premium: 1189000 },
  { age: 55, premium: 1247000 },
  { age: 56, premium: 1311000 },
  { age: 57, premium: 1379000 },
  { age: 58, premium: 1437000 },
  { age: 59, premium: 1482000 },
  { age: 60, premium: 1530000 }
]

// Cancer Care Premium Table - Male (Annual premiums in MMK)
export const cancerCareMalePremiums: CancerCarePremiumRow[] = [
  { age: 1, premium: 98000 },
  { age: 2, premium: 93000 },
  { age: 3, premium: 88000 },
  { age: 4, premium: 83000 },
  { age: 5, premium: 80000 },
  { age: 6, premium: 78000 },
  { age: 7, premium: 73000 },
  { age: 8, premium: 73000 },
  { age: 9, premium: 73000 },
  { age: 10, premium: 75000 },
  { age: 11, premium: 75000 },
  { age: 12, premium: 75000 },
  { age: 13, premium: 78000 },
  { age: 14, premium: 78000 },
  { age: 15, premium: 80000 },
  { age: 16, premium: 80000 },
  { age: 17, premium: 80000 },
  { age: 18, premium: 83000 },
  { age: 19, premium: 88000 },
  { age: 20, premium: 95000 },
  { age: 21, premium: 103000 },
  { age: 22, premium: 108000 },
  { age: 23, premium: 108000 },
  { age: 24, premium: 105000 },
  { age: 25, premium: 103000 },
  { age: 26, premium: 100000 },
  { age: 27, premium: 98000 },
  { age: 28, premium: 103000 },
  { age: 29, premium: 113000 },
  { age: 30, premium: 125000 },
  { age: 31, premium: 140000 },
  { age: 32, premium: 155000 },
  { age: 33, premium: 163000 },
  { age: 34, premium: 158000 },
  { age: 35, premium: 150000 },
  { age: 36, premium: 148000 },
  { age: 37, premium: 143000 },
  { age: 38, premium: 150000 },
  { age: 39, premium: 173000 },
  { age: 40, premium: 200000 },
  { age: 41, premium: 230000 },
  { age: 42, premium: 265000 },
  { age: 43, premium: 295000 },
  { age: 44, premium: 320000 },
  { age: 45, premium: 345000 },
  { age: 46, premium: 373000 },
  { age: 47, premium: 400000 },
  { age: 48, premium: 438000 },
  { age: 49, premium: 483000 },
  { age: 50, premium: 530000 },
  { age: 51, premium: 583000 },
  { age: 52, premium: 643000 },
  { age: 53, premium: 695000 },
  { age: 54, premium: 740000 },
  { age: 55, premium: 793000 },
  { age: 56, premium: 848000 },
  { age: 57, premium: 848000 },
  { age: 58, premium: 990000 },
  { age: 59, premium: 1108000 },
  { age: 60, premium: 1240000 }
]

// Cancer Care Coverage Information
export const cancerCareCoverage = {
  coverageAmount: 100000000, // 100M MMK
  description: "Protection to reduce the impact of cancer on your life",
  keyFeatures: [
    "Cancer-specific coverage",
    "Early stage cancer coverage", 
    "Advanced stage cancer benefits",
    "Cancer treatment support",
    "Surgical benefit for cancer",
    "Chemotherapy and radiotherapy coverage",
    "Recovery income benefit"
  ]
}

// Helper function to get Cancer Care premium for a specific age and gender
export const getCancerCarePremiumFromTable = (age: number, gender: string): number => {
  const premiumTable = gender.toLowerCase() === 'female' ? cancerCareFemalePremiums : cancerCareMalePremiums
  
  // Find the premium for the exact age
  const premiumRow = premiumTable.find(row => row.age === age)
  
  if (premiumRow) {
    return premiumRow.premium
  }
  
  // If exact age not found, return 0 (age not covered)
  return 0
}

// Helper function to get Cancer Care age range dynamically from data
export const getCancerCareAgeRange = (): { minAge: number, maxAge: number } => {
  const femaleAges = cancerCareFemalePremiums.map(row => row.age)
  const minAge = Math.min(...femaleAges)
  const maxAge = Math.max(...femaleAges)
  
  return { minAge, maxAge }
}

// Helper function to check if age is covered for Cancer Care
export const isCancerCareAgeCovered = (age: number): boolean => {
  const { minAge, maxAge } = getCancerCareAgeRange()
  return age >= minAge && age <= maxAge
}