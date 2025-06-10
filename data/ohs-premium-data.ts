// OHS Premium Tables and Coverage Data

export interface OHSPremiumRow {
  ageGroup: string
  plan1: number
  plan2: number
  plan3: number
  plan4: number
  plan5: number
  plan6: number
  plan7: number
}

export interface OHSCoverage {
  plan: number
  dailyLimit: number
  annualLimit: number
  accidentalDeath: number
}

// OHS Premium Table - Female (Annual premiums in MMK)
export const ohsFemalePremiums: OHSPremiumRow[] = [
  { ageGroup: "0", plan1: 332000, plan2: 564000, plan3: 763000, plan4: 1128000, plan5: 1641000, plan6: 2735000, plan7: 4310000 },
  { ageGroup: "1", plan1: 288000, plan2: 490000, plan3: 663000, plan4: 980000, plan5: 1426000, plan6: 2376000, plan7: 3744000 },
  { ageGroup: "2", plan1: 222000, plan2: 378000, plan3: 511000, plan4: 755000, plan5: 1099000, plan6: 1832000, plan7: 2886000 },
  { ageGroup: "3", plan1: 194000, plan2: 329000, plan3: 446000, plan4: 658000, plan5: 958000, plan6: 1597000, plan7: 2516000 },
  { ageGroup: "4-5", plan1: 155000, plan2: 263000, plan3: 356000, plan4: 526000, plan5: 765000, plan6: 1275000, plan7: 2009000 },
  { ageGroup: "6-10", plan1: 119000, plan2: 202000, plan3: 273000, plan4: 403000, plan5: 587000, plan6: 978000, plan7: 1541000 },
  { ageGroup: "11-15", plan1: 119000, plan2: 202000, plan3: 273000, plan4: 403000, plan5: 587000, plan6: 978000, plan7: 1541000 },
  { ageGroup: "16-20", plan1: 156000, plan2: 266000, plan3: 359000, plan4: 531000, plan5: 773000, plan6: 1287000, plan7: 2028000 },
  { ageGroup: "21-25", plan1: 138000, plan2: 235000, plan3: 318000, plan4: 470000, plan5: 684000, plan6: 1139000, plan7: 1794000 },
  { ageGroup: "26-30", plan1: 162000, plan2: 276000, plan3: 373000, plan4: 551000, plan5: 802000, plan6: 1337000, plan7: 2106000 },
  { ageGroup: "31-35", plan1: 188000, plan2: 319000, plan3: 432000, plan4: 638000, plan5: 929000, plan6: 1547000, plan7: 2438000 },
  { ageGroup: "36-40", plan1: 197000, plan2: 335000, plan3: 452000, plan4: 669000, plan5: 973000, plan6: 1622000, plan7: 2555000 },
  { ageGroup: "41-45", plan1: 218000, plan2: 370000, plan3: 501000, plan4: 740000, plan5: 1077000, plan6: 1795000, plan7: 2828000 },
  { ageGroup: "46-50", plan1: 212000, plan2: 360000, plan3: 487000, plan4: 720000, plan5: 1047000, plan6: 1745000, plan7: 2750000 },
  { ageGroup: "51-55", plan1: 353000, plan2: 600000, plan3: 811000, plan4: 1199000, plan5: 1745000, plan6: 2909000, plan7: 4583000 },
  { ageGroup: "56-60", plan1: 332000, plan2: 567000, plan3: 766000, plan4: 1133000, plan5: 1649000, plan6: 2748000, plan7: 4329000 },
  { ageGroup: "61-65", plan1: 576000, plan2: 980000, plan3: 1325000, plan4: 1959000, plan5: 2852000, plan6: 4752000, plan7: 7488000 },
  { ageGroup: "66-70", plan1: 752000, plan2: 1278000, plan3: 1729000, plan4: 2556000, plan5: 3720000, plan6: 6200000, plan7: 9770000 },
  { ageGroup: "71", plan1: 1094000, plan2: 1859000, plan3: 2516000, plan4: 3718000, plan5: 5413000, plan6: 9022000, plan7: 14216000 },
  { ageGroup: "72", plan1: 1136000, plan2: 1931000, plan3: 2612000, plan4: 3861000, plan5: 5621000, plan6: 9368000, plan7: 14762000 },
  { ageGroup: "73", plan1: 1179000, plan2: 2005000, plan3: 2712000, plan4: 4009000, plan5: 5837000, plan6: 9727000, plan7: 15327000 },
  { ageGroup: "74", plan1: 1224000, plan2: 2081000, plan3: 2816000, plan4: 4162000, plan5: 6059000, plan6: 10098000, plan7: 15912000 },
  { ageGroup: "75", plan1: 1272000, plan2: 2163000, plan3: 2926000, plan4: 4325000, plan5: 6297000, plan6: 10494000, plan7: 16536000 },
  { ageGroup: "76", plan1: 1323000, plan2: 2250000, plan3: 3043000, plan4: 4499000, plan5: 6549000, plan6: 10915000, plan7: 17199000 },
  { ageGroup: "77", plan1: 1376000, plan2: 2339000, plan3: 3164000, plan4: 4677000, plan5: 6809000, plan6: 11348000, plan7: 17882000 },
  { ageGroup: "78", plan1: 1431000, plan2: 2433000, plan3: 3292000, plan4: 4866000, plan5: 7084000, plan6: 11806000, plan7: 18603000 },
  { ageGroup: "79", plan1: 1490000, plan2: 2533000, plan3: 3426000, plan4: 5065000, plan5: 7374000, plan6: 12289000, plan7: 19364000 },
  { ageGroup: "80", plan1: 1551000, plan2: 2637000, plan3: 3568000, plan4: 5274000, plan5: 7678000, plan6: 12796000, plan7: 20163000 }
]

// OHS Premium Table - Male (Annual premiums in MMK)
export const ohsMalePremiums: OHSPremiumRow[] = [
  { ageGroup: "0", plan1: 389000, plan2: 661000, plan3: 894000, plan4: 1321000, plan5: 1924000, plan6: 3206000, plan7: 5051000 },
  { ageGroup: "1", plan1: 324000, plan2: 551000, plan3: 746000, plan4: 1102000, plan5: 1604000, plan6: 2673000, plan7: 4212000 },
  { ageGroup: "2", plan1: 257000, plan2: 437000, plan3: 590000, plan4: 873000, plan5: 1270000, plan6: 2117000, plan7: 3335000 },
  { ageGroup: "3", plan1: 224000, plan2: 380000, plan3: 515000, plan4: 760000, plan5: 1107000, plan6: 1844000, plan7: 2906000 },
  { ageGroup: "4-5", plan1: 146000, plan2: 248000, plan3: 335000, plan4: 495000, plan5: 721000, plan6: 1201000, plan7: 1892000 },
  { ageGroup: "6-10", plan1: 128000, plan2: 217000, plan3: 294000, plan4: 434000, plan5: 632000, plan6: 1052000, plan7: 1658000 },
  { ageGroup: "11-15", plan1: 120000, plan2: 204000, plan3: 276000, plan4: 408000, plan5: 594000, plan6: 990000, plan7: 1560000 },
  { ageGroup: "16-20", plan1: 138000, plan2: 235000, plan3: 318000, plan4: 470000, plan5: 684000, plan6: 1139000, plan7: 1794000 },
  { ageGroup: "21-25", plan1: 150000, plan2: 255000, plan3: 345000, plan4: 510000, plan5: 743000, plan6: 1238000, plan7: 1950000 },
  { ageGroup: "26-30", plan1: 161000, plan2: 273000, plan3: 370000, plan4: 546000, plan5: 795000, plan6: 1325000, plan7: 2087000 },
  { ageGroup: "31-35", plan1: 173000, plan2: 294000, plan3: 397000, plan4: 587000, plan5: 854000, plan6: 1424000, plan7: 2243000 },
  { ageGroup: "36-40", plan1: 177000, plan2: 301000, plan3: 408000, plan4: 602000, plan5: 877000, plan6: 1461000, plan7: 2301000 },
  { ageGroup: "41-45", plan1: 188000, plan2: 319000, plan3: 432000, plan4: 638000, plan5: 929000, plan6: 1547000, plan7: 2438000 },
  { ageGroup: "46-50", plan1: 204000, plan2: 347000, plan3: 470000, plan4: 694000, plan5: 1010000, plan6: 1683000, plan7: 2652000 },
  { ageGroup: "51-55", plan1: 314000, plan2: 533000, plan3: 722000, plan4: 1066000, plan5: 1552000, plan6: 2587000, plan7: 4076000 },
  { ageGroup: "56-60", plan1: 377000, plan2: 641000, plan3: 866000, plan4: 1281000, plan5: 1864000, plan6: 3107000, plan7: 4895000 },
  { ageGroup: "61-65", plan1: 597000, plan2: 1015000, plan3: 1374000, plan4: 2030000, plan5: 2956000, plan6: 4926000, plan7: 7761000 },
  { ageGroup: "66-70", plan1: 872000, plan2: 1482000, plan3: 2005000, plan4: 2964000, plan5: 4314000, plan6: 7190000, plan7: 11330000 },
  { ageGroup: "71", plan1: 1226000, plan2: 2084000, plan3: 2819000, plan4: 4167000, plan5: 6067000, plan6: 10111000, plan7: 15932000 },
  { ageGroup: "72", plan1: 1274000, plan2: 2165000, plan3: 2930000, plan4: 4330000, plan5: 6304000, plan6: 10507000, plan7: 16556000 },
  { ageGroup: "73", plan1: 1323000, plan2: 2250000, plan3: 3043000, plan4: 4499000, plan5: 6549000, plan6: 10915000, plan7: 17199000 },
  { ageGroup: "74", plan1: 1376000, plan2: 2339000, plan3: 3164000, plan4: 4677000, plan5: 6809000, plan6: 11348000, plan7: 17882000 },
  { ageGroup: "75", plan1: 1430000, plan2: 2431000, plan3: 3288000, plan4: 4861000, plan5: 7077000, plan6: 11794000, plan7: 18584000 },
  { ageGroup: "76", plan1: 1488000, plan2: 2530000, plan3: 3423000, plan4: 5060000, plan5: 7366000, plan6: 12276000, plan7: 19344000 },
  { ageGroup: "77", plan1: 1548000, plan2: 2632000, plan3: 3561000, plan4: 5264000, plan5: 7663000, plan6: 12771000, plan7: 20124000 },
  { ageGroup: "78", plan1: 1613000, plan2: 2742000, plan3: 3709000, plan4: 5483000, plan5: 7982000, plan6: 13304000, plan7: 20963000 },
  { ageGroup: "79", plan1: 1679000, plan2: 2854000, plan3: 3861000, plan4: 5707000, plan5: 8308000, plan6: 13848000, plan7: 21821000 },
  { ageGroup: "80", plan1: 1749000, plan2: 2974000, plan3: 4023000, plan4: 5947000, plan5: 8658000, plan6: 14430000, plan7: 22737000 }
]

// OHS Plans Coverage Information (Benefits in MMK)
export const ohsCoverageData: OHSCoverage[] = [
  { plan: 1, dailyLimit: 23000, annualLimit: 3750000, accidentalDeath: 1000000 },
  { plan: 2, dailyLimit: 38000, annualLimit: 7500000, accidentalDeath: 2000000 },
  { plan: 3, dailyLimit: 53000, annualLimit: 15000000, accidentalDeath: 3000000 },
  { plan: 4, dailyLimit: 75000, annualLimit: 30000000, accidentalDeath: 4000000 },
  { plan: 5, dailyLimit: 150000, annualLimit: 45000000, accidentalDeath: 5000000 },
  { plan: 6, dailyLimit: 300000, annualLimit: 75000000, accidentalDeath: 6000000 },
  { plan: 7, dailyLimit: 525000, annualLimit: 120000000, accidentalDeath: 7000000 }
]

// Helper function to get premium for a specific plan, age, and gender
export const getOHSPremiumFromTable = (planNumber: number, age: number, gender: string): number => {
  const premiumTable = gender.toLowerCase() === 'female' ? ohsFemalePremiums : ohsMalePremiums
  
  // Find the appropriate age group
  let ageGroup = ""
  if (age === 0) ageGroup = "0"
  else if (age === 1) ageGroup = "1"
  else if (age === 2) ageGroup = "2"
  else if (age === 3) ageGroup = "3"
  else if (age >= 4 && age <= 5) ageGroup = "4-5"
  else if (age >= 6 && age <= 10) ageGroup = "6-10"
  else if (age >= 11 && age <= 15) ageGroup = "11-15"
  else if (age >= 16 && age <= 20) ageGroup = "16-20"
  else if (age >= 21 && age <= 25) ageGroup = "21-25"
  else if (age >= 26 && age <= 30) ageGroup = "26-30"
  else if (age >= 31 && age <= 35) ageGroup = "31-35"
  else if (age >= 36 && age <= 40) ageGroup = "36-40"
  else if (age >= 41 && age <= 45) ageGroup = "41-45"
  else if (age >= 46 && age <= 50) ageGroup = "46-50"
  else if (age >= 51 && age <= 55) ageGroup = "51-55"
  else if (age >= 56 && age <= 60) ageGroup = "56-60"
  else if (age >= 61 && age <= 65) ageGroup = "61-65"
  else if (age >= 66 && age <= 70) ageGroup = "66-70"
  else if (age >= 71 && age <= 80) ageGroup = age.toString()
  else return 0 // Age not covered
  
  const row = premiumTable.find(r => r.ageGroup === ageGroup)
  if (!row) return 0
  
  // Get the premium for the specific plan
  switch (planNumber) {
    case 1: return row.plan1
    case 2: return row.plan2
    case 3: return row.plan3
    case 4: return row.plan4
    case 5: return row.plan5
    case 6: return row.plan6
    case 7: return row.plan7
    default: return 0
  }
}

// Helper function to get coverage details for a plan
export const getOHSCoverage = (planNumber: number): OHSCoverage | undefined => {
  return ohsCoverageData.find(coverage => coverage.plan === planNumber)
}

// Helper function to get OHS age range dynamically from data
export const getOHSAgeRange = (): { minAge: number, maxAge: number } => {
  const femaleAges = ohsFemalePremiums.map(row => {
    if (row.ageGroup.includes('-')) {
      const [min, max] = row.ageGroup.split('-').map(Number)
      return { min, max }
    } else {
      const age = Number(row.ageGroup)
      return { min: age, max: age }
    }
  })
  
  const minAge = Math.min(...femaleAges.map(range => range.min))
  const maxAge = Math.max(...femaleAges.map(range => range.max))
  
  return { minAge, maxAge }
}

// Helper function to check if age is covered for OHS
export const isOHSAgeCovered = (age: number): boolean => {
  const { minAge, maxAge } = getOHSAgeRange()
  return age >= minAge && age <= maxAge
}