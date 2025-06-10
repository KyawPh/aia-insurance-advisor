// Short Term Endowment Life Premium Tables

export interface ShortTermEndowmentPremiumRow {
  age: number
  coverage10M: number
  coverage50M: number
  coverage100M: number
  coverage150M: number
  coverage200M: number
}

export interface ShortTermEndowmentPlan {
  id: string
  name: string
  coverage: number
}

// Short Term Endowment Premium Table - Male (Annual premiums in MMK)
export const shortTermEndowmentMalePremiums: ShortTermEndowmentPremiumRow[] = [
  { age: 17, coverage10M: 36900, coverage50M: 184500, coverage100M: 369000, coverage150M: 553500, coverage200M: 738000 },
  { age: 18, coverage10M: 37100, coverage50M: 185500, coverage100M: 371000, coverage150M: 556500, coverage200M: 742000 },
  { age: 19, coverage10M: 37300, coverage50M: 186500, coverage100M: 373000, coverage150M: 559500, coverage200M: 746000 },
  { age: 20, coverage10M: 37500, coverage50M: 187500, coverage100M: 375000, coverage150M: 562500, coverage200M: 750000 },
  { age: 21, coverage10M: 38700, coverage50M: 193500, coverage100M: 387000, coverage150M: 580500, coverage200M: 774000 },
  { age: 22, coverage10M: 39900, coverage50M: 199500, coverage100M: 399000, coverage150M: 598500, coverage200M: 798000 },
  { age: 23, coverage10M: 41100, coverage50M: 205500, coverage100M: 411000, coverage150M: 616500, coverage200M: 822000 },
  { age: 24, coverage10M: 42300, coverage50M: 211500, coverage100M: 423000, coverage150M: 634500, coverage200M: 846000 },
  { age: 25, coverage10M: 43500, coverage50M: 217500, coverage100M: 435000, coverage150M: 652500, coverage200M: 870000 },
  { age: 26, coverage10M: 44300, coverage50M: 221500, coverage100M: 443000, coverage150M: 664500, coverage200M: 886000 },
  { age: 27, coverage10M: 45100, coverage50M: 225500, coverage100M: 451000, coverage150M: 676500, coverage200M: 902000 },
  { age: 28, coverage10M: 45900, coverage50M: 229500, coverage100M: 459000, coverage150M: 688500, coverage200M: 918000 },
  { age: 29, coverage10M: 46600, coverage50M: 233000, coverage100M: 466000, coverage150M: 699000, coverage200M: 932000 },
  { age: 30, coverage10M: 47400, coverage50M: 237000, coverage100M: 474000, coverage150M: 711000, coverage200M: 948000 },
  { age: 31, coverage10M: 51800, coverage50M: 259000, coverage100M: 518000, coverage150M: 777000, coverage200M: 1036000 },
  { age: 32, coverage10M: 56200, coverage50M: 281000, coverage100M: 562000, coverage150M: 843000, coverage200M: 1124000 },
  { age: 33, coverage10M: 60600, coverage50M: 303000, coverage100M: 606000, coverage150M: 909000, coverage200M: 1212000 },
  { age: 34, coverage10M: 65000, coverage50M: 325000, coverage100M: 650000, coverage150M: 975000, coverage200M: 1300000 },
  { age: 35, coverage10M: 69400, coverage50M: 347000, coverage100M: 694000, coverage150M: 1041000, coverage200M: 1388000 },
  { age: 36, coverage10M: 75800, coverage50M: 379000, coverage100M: 758000, coverage150M: 1137000, coverage200M: 1516000 },
  { age: 37, coverage10M: 82100, coverage50M: 410500, coverage100M: 821000, coverage150M: 1231500, coverage200M: 1642000 },
  { age: 38, coverage10M: 88500, coverage50M: 442500, coverage100M: 885000, coverage150M: 1327500, coverage200M: 1770000 },
  { age: 39, coverage10M: 94900, coverage50M: 474500, coverage100M: 949000, coverage150M: 1423500, coverage200M: 1898000 },
  { age: 40, coverage10M: 101200, coverage50M: 506000, coverage100M: 1012000, coverage150M: 1518000, coverage200M: 2024000 },
  { age: 41, coverage10M: 104700, coverage50M: 523500, coverage100M: 1047000, coverage150M: 1570500, coverage200M: 2094000 },
  { age: 42, coverage10M: 108100, coverage50M: 540500, coverage100M: 1081000, coverage150M: 1621500, coverage200M: 2162000 },
  { age: 43, coverage10M: 111600, coverage50M: 558000, coverage100M: 1116000, coverage150M: 1674000, coverage200M: 2232000 },
  { age: 44, coverage10M: 115000, coverage50M: 575000, coverage100M: 1150000, coverage150M: 1725000, coverage200M: 2300000 },
  { age: 45, coverage10M: 118500, coverage50M: 592500, coverage100M: 1185000, coverage150M: 1777500, coverage200M: 2370000 },
  { age: 46, coverage10M: 130200, coverage50M: 651000, coverage100M: 1302000, coverage150M: 1953000, coverage200M: 2604000 },
  { age: 47, coverage10M: 141900, coverage50M: 709500, coverage100M: 1419000, coverage150M: 2128500, coverage200M: 2838000 },
  { age: 48, coverage10M: 153700, coverage50M: 768500, coverage100M: 1537000, coverage150M: 2305500, coverage200M: 3074000 },
  { age: 49, coverage10M: 165400, coverage50M: 827000, coverage100M: 1654000, coverage150M: 2481000, coverage200M: 3308000 },
  { age: 50, coverage10M: 177100, coverage50M: 885500, coverage100M: 1771000, coverage150M: 2656500, coverage200M: 3542000 },
  { age: 51, coverage10M: 195500, coverage50M: 977500, coverage100M: 1955000, coverage150M: 2932500, coverage200M: 3910000 },
  { age: 52, coverage10M: 213900, coverage50M: 1069500, coverage100M: 2139000, coverage150M: 3208500, coverage200M: 4278000 },
  { age: 53, coverage10M: 232200, coverage50M: 1161000, coverage100M: 2322000, coverage150M: 3483000, coverage200M: 4644000 },
  { age: 54, coverage10M: 250600, coverage50M: 1253000, coverage100M: 2506000, coverage150M: 3759000, coverage200M: 5012000 },
  { age: 55, coverage10M: 269000, coverage50M: 1345000, coverage100M: 2690000, coverage150M: 4035000, coverage200M: 5380000 },
  { age: 56, coverage10M: 297600, coverage50M: 1488000, coverage100M: 2976000, coverage150M: 4464000, coverage200M: 5952000 },
  { age: 57, coverage10M: 326200, coverage50M: 1631000, coverage100M: 3262000, coverage150M: 4893000, coverage200M: 6524000 },
  { age: 58, coverage10M: 354800, coverage50M: 1774000, coverage100M: 3548000, coverage150M: 5322000, coverage200M: 7096000 },
  { age: 59, coverage10M: 383400, coverage50M: 1917000, coverage100M: 3834000, coverage150M: 5751000, coverage200M: 7668000 },
  { age: 60, coverage10M: 412000, coverage50M: 2060000, coverage100M: 4120000, coverage150M: 6180000, coverage200M: 8240000 },
  { age: 61, coverage10M: 472800, coverage50M: 2364000, coverage100M: 4728000, coverage150M: 7092000, coverage200M: 9456000 },
  { age: 62, coverage10M: 533700, coverage50M: 2668500, coverage100M: 5337000, coverage150M: 8005500, coverage200M: 10674000 },
  { age: 63, coverage10M: 594500, coverage50M: 2972500, coverage100M: 5945000, coverage150M: 8917500, coverage200M: 11890000 },
  { age: 64, coverage10M: 655400, coverage50M: 3277000, coverage100M: 6554000, coverage150M: 9831000, coverage200M: 13108000 },
  { age: 65, coverage10M: 716200, coverage50M: 3581000, coverage100M: 7162000, coverage150M: 10743000, coverage200M: 14324000 }
]

// Short Term Endowment Premium Table - Female (Annual premiums in MMK)
export const shortTermEndowmentFemalePremiums: ShortTermEndowmentPremiumRow[] = [
  { age: 17, coverage10M: 31700, coverage50M: 158500, coverage100M: 317000, coverage150M: 475500, coverage200M: 634000 },
  { age: 18, coverage10M: 32000, coverage50M: 160000, coverage100M: 320000, coverage150M: 480000, coverage200M: 640000 },
  { age: 19, coverage10M: 32200, coverage50M: 161000, coverage100M: 322000, coverage150M: 483000, coverage200M: 644000 },
  { age: 20, coverage10M: 32400, coverage50M: 162000, coverage100M: 324000, coverage150M: 486000, coverage200M: 648000 },
  { age: 21, coverage10M: 33300, coverage50M: 166500, coverage100M: 333000, coverage150M: 499500, coverage200M: 666000 },
  { age: 22, coverage10M: 34100, coverage50M: 170500, coverage100M: 341000, coverage150M: 511500, coverage200M: 682000 },
  { age: 23, coverage10M: 35000, coverage50M: 175000, coverage100M: 350000, coverage150M: 525000, coverage200M: 700000 },
  { age: 24, coverage10M: 35800, coverage50M: 179000, coverage100M: 358000, coverage150M: 537000, coverage200M: 716000 },
  { age: 25, coverage10M: 36700, coverage50M: 183500, coverage100M: 367000, coverage150M: 550500, coverage200M: 734000 },
  { age: 26, coverage10M: 37000, coverage50M: 185000, coverage100M: 370000, coverage150M: 555000, coverage200M: 740000 },
  { age: 27, coverage10M: 37300, coverage50M: 186500, coverage100M: 373000, coverage150M: 559500, coverage200M: 746000 },
  { age: 28, coverage10M: 37600, coverage50M: 188000, coverage100M: 376000, coverage150M: 564000, coverage200M: 752000 },
  { age: 29, coverage10M: 37900, coverage50M: 189500, coverage100M: 379000, coverage150M: 568500, coverage200M: 758000 },
  { age: 30, coverage10M: 38200, coverage50M: 191000, coverage100M: 382000, coverage150M: 573000, coverage200M: 764000 },
  { age: 31, coverage10M: 40300, coverage50M: 201500, coverage100M: 403000, coverage150M: 604500, coverage200M: 806000 },
  { age: 32, coverage10M: 42500, coverage50M: 212500, coverage100M: 425000, coverage150M: 637500, coverage200M: 850000 },
  { age: 33, coverage10M: 44700, coverage50M: 223500, coverage100M: 447000, coverage150M: 670500, coverage200M: 894000 },
  { age: 34, coverage10M: 46900, coverage50M: 234500, coverage100M: 469000, coverage150M: 703500, coverage200M: 938000 },
  { age: 35, coverage10M: 49100, coverage50M: 245500, coverage100M: 491000, coverage150M: 736500, coverage200M: 982000 },
  { age: 36, coverage10M: 53500, coverage50M: 267500, coverage100M: 535000, coverage150M: 802500, coverage200M: 1070000 },
  { age: 37, coverage10M: 57600, coverage50M: 288000, coverage100M: 576000, coverage150M: 864000, coverage200M: 1152000 },
  { age: 38, coverage10M: 61900, coverage50M: 309500, coverage100M: 619000, coverage150M: 928500, coverage200M: 1238000 },
  { age: 39, coverage10M: 66100, coverage50M: 330500, coverage100M: 661000, coverage150M: 991500, coverage200M: 1322000 },
  { age: 40, coverage10M: 70400, coverage50M: 352000, coverage100M: 704000, coverage150M: 1056000, coverage200M: 1408000 },
  { age: 41, coverage10M: 76800, coverage50M: 384000, coverage100M: 768000, coverage150M: 1152000, coverage200M: 1536000 },
  { age: 42, coverage10M: 83100, coverage50M: 415500, coverage100M: 831000, coverage150M: 1246500, coverage200M: 1662000 },
  { age: 43, coverage10M: 89500, coverage50M: 447500, coverage100M: 895000, coverage150M: 1342500, coverage200M: 1790000 },
  { age: 44, coverage10M: 95900, coverage50M: 479500, coverage100M: 959000, coverage150M: 1438500, coverage200M: 1918000 },
  { age: 45, coverage10M: 102300, coverage50M: 511500, coverage100M: 1023000, coverage150M: 1534500, coverage200M: 2046000 },
  { age: 46, coverage10M: 111300, coverage50M: 556500, coverage100M: 1113000, coverage150M: 1669500, coverage200M: 2226000 },
  { age: 47, coverage10M: 120400, coverage50M: 602000, coverage100M: 1204000, coverage150M: 1806000, coverage200M: 2408000 },
  { age: 48, coverage10M: 129400, coverage50M: 647000, coverage100M: 1294000, coverage150M: 1941000, coverage200M: 2588000 },
  { age: 49, coverage10M: 138500, coverage50M: 692500, coverage100M: 1385000, coverage150M: 2077500, coverage200M: 2770000 },
  { age: 50, coverage10M: 147500, coverage50M: 737500, coverage100M: 1475000, coverage150M: 2212500, coverage200M: 2950000 },
  { age: 51, coverage10M: 168100, coverage50M: 840500, coverage100M: 1681000, coverage150M: 2521500, coverage200M: 3362000 },
  { age: 52, coverage10M: 188700, coverage50M: 943500, coverage100M: 1887000, coverage150M: 2830500, coverage200M: 3774000 },
  { age: 53, coverage10M: 209400, coverage50M: 1047000, coverage100M: 2094000, coverage150M: 3141000, coverage200M: 4188000 },
  { age: 54, coverage10M: 230000, coverage50M: 1150000, coverage100M: 2300000, coverage150M: 3450000, coverage200M: 4600000 },
  { age: 55, coverage10M: 250600, coverage50M: 1253000, coverage100M: 2506000, coverage150M: 3759000, coverage200M: 5012000 },
  { age: 56, coverage10M: 277700, coverage50M: 1388500, coverage100M: 2777000, coverage150M: 4165500, coverage200M: 5554000 },
  { age: 57, coverage10M: 304700, coverage50M: 1523500, coverage100M: 3047000, coverage150M: 4570500, coverage200M: 6094000 },
  { age: 58, coverage10M: 331800, coverage50M: 1659000, coverage100M: 3318000, coverage150M: 4977000, coverage200M: 6636000 },
  { age: 59, coverage10M: 358900, coverage50M: 1794500, coverage100M: 3589000, coverage150M: 5383500, coverage200M: 7178000 },
  { age: 60, coverage10M: 385900, coverage50M: 1929500, coverage100M: 3859000, coverage150M: 5788500, coverage200M: 7718000 },
  { age: 61, coverage10M: 445200, coverage50M: 2226000, coverage100M: 4452000, coverage150M: 6678000, coverage200M: 8904000 },
  { age: 62, coverage10M: 504500, coverage50M: 2522500, coverage100M: 5045000, coverage150M: 7567500, coverage200M: 10090000 },
  { age: 63, coverage10M: 563800, coverage50M: 2819000, coverage100M: 5638000, coverage150M: 8457000, coverage200M: 11276000 },
  { age: 64, coverage10M: 623100, coverage50M: 3115500, coverage100M: 6231000, coverage150M: 9346500, coverage200M: 12462000 },
  { age: 65, coverage10M: 682400, coverage50M: 3412000, coverage100M: 6824000, coverage150M: 10236000, coverage200M: 13648000 }
]

// Short Term Endowment Plans Configuration
export const shortTermEndowmentPlans: ShortTermEndowmentPlan[] = [
  { id: "10M", name: "100L", coverage: 10000000 },
  { id: "50M", name: "500L", coverage: 50000000 },
  { id: "100M", name: "1000L", coverage: 100000000 },
  { id: "150M", name: "1500L", coverage: 150000000 },
  { id: "200M", name: "2000L", coverage: 200000000 }
]

// Helper function to get Short Term Endowment premium for a specific plan, age, and gender
export const getShortTermEndowmentPremiumFromTable = (planId: string, age: number, gender: string): number => {
  const premiumTable = gender.toLowerCase() === 'female' ? shortTermEndowmentFemalePremiums : shortTermEndowmentMalePremiums
  
  // Find the premium for the exact age
  const premiumRow = premiumTable.find(row => row.age === age)
  
  if (!premiumRow) return 0 // Age not covered
  
  // Get the premium for the specific coverage amount
  switch (planId) {
    case "10M": return premiumRow.coverage10M
    case "50M": return premiumRow.coverage50M
    case "100M": return premiumRow.coverage100M
    case "150M": return premiumRow.coverage150M
    case "200M": return premiumRow.coverage200M
    default: return 0
  }
}

// Helper function to get Short Term Endowment plan details
export const getShortTermEndowmentPlan = (planId: string): ShortTermEndowmentPlan | undefined => {
  return shortTermEndowmentPlans.find(plan => plan.id === planId)
}

// Helper function to get Short Term Endowment age range dynamically from data
export const getShortTermEndowmentAgeRange = (): { minAge: number, maxAge: number } => {
  const femaleAges = shortTermEndowmentFemalePremiums.map(row => row.age)
  const minAge = Math.min(...femaleAges)
  const maxAge = Math.max(...femaleAges)
  
  return { minAge, maxAge }
}

// Helper function to check if age is covered for Short Term Endowment
export const isShortTermEndowmentAgeCovered = (age: number): boolean => {
  const { minAge, maxAge } = getShortTermEndowmentAgeRange()
  return age >= minAge && age <= maxAge
}