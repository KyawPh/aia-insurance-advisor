export interface AIAProduct {
  id: string
  name: string
  description: string
  category: string
  keyFeatures: string[]
  targetCustomers: string[]
  benefits: string[]
}

export const aiaProductsData: AIAProduct[] = [
  {
    id: "universal-life",
    name: "Universal Life Insurance",
    description: "Flexible insurance plan with whole life protection and enhancing saving elements",
    category: "Life Insurance",
    keyFeatures: [
      "Whole life protection coverage",
      "Flexible premium payment options",
      "Cash value accumulation",
      "Investment component with potential returns",
      "Partial withdrawal options",
      "Loan facility against policy value"
    ],
    targetCustomers: [
      "Individuals seeking long-term life protection",
      "People who want investment-linked insurance",
      "Those looking for flexible premium payment",
      "Customers wanting cash value build-up"
    ],
    benefits: [
      "Lifetime protection",
      "Flexible premium payments",
      "Cash value growth potential",
      "Tax advantages",
      "Estate planning benefits",
      "Financial security for beneficiaries"
    ]
  },
  {
    id: "one-health-solution",
    name: "One Health Solution (OHS)",
    description: "All-in-one Protection for Every Medical Need!",
    category: "Health Insurance",
    keyFeatures: [
      "Comprehensive medical coverage",
      "Hospitalization benefits",
      "Outpatient treatment coverage",
      "Surgery and specialist consultation",
      "Emergency medical evacuation",
      "Annual health check-up",
      "Dental and optical coverage options"
    ],
    targetCustomers: [
      "Individuals and families seeking comprehensive health coverage",
      "Working professionals",
      "People without employer health insurance",
      "Those wanting to supplement existing health coverage"
    ],
    benefits: [
      "Complete medical expense coverage",
      "Cashless treatment at network hospitals",
      "24/7 emergency assistance",
      "No waiting period for accidents",
      "Renewable for lifetime",
      "Tax deduction benefits",
      "Peace of mind for medical expenses"
    ]
  },
  {
    id: "aia-cancer-care",
    name: "AIA Cancer Care",
    description: "Protection to reduce the impact of cancer on your life",
    category: "Critical Illness Insurance",
    keyFeatures: [
      "Cancer-specific coverage",
      "Early stage cancer coverage",
      "Advanced stage cancer benefits",
      "Cancer treatment support",
      "Surgical benefit for cancer",
      "Chemotherapy and radiotherapy coverage",
      "Recovery income benefit"
    ],
    targetCustomers: [
      "Individuals with family history of cancer",
      "People in high-risk occupations",
      "Those seeking specialized cancer protection",
      "Health-conscious individuals",
      "People wanting to supplement health insurance"
    ],
    benefits: [
      "Lump sum payment upon cancer diagnosis",
      "Coverage for treatment costs",
      "Income replacement during treatment",
      "No restrictions on treatment choice",
      "Support for family during treatment",
      "Financial protection against cancer costs",
      "Access to quality cancer treatment"
    ]
  },
  {
    id: "short-term-endowment",
    name: "Short Term Endowment Life Insurance",
    description: "Saving insurance plan that provides life protection coverage",
    category: "Endowment Insurance",
    keyFeatures: [
      "Fixed term life protection",
      "Guaranteed maturity benefit",
      "Death benefit protection",
      "Saving and protection combination",
      "Premium payment flexibility",
      "Bonus additions (if applicable)",
      "Tax benefits on premiums and maturity"
    ],
    targetCustomers: [
      "Individuals seeking short-term financial goals",
      "People wanting guaranteed returns",
      "Those planning for specific financial milestones",
      "Conservative investors seeking safety",
      "Parents saving for children's education or marriage"
    ],
    benefits: [
      "Guaranteed maturity amount",
      "Life protection during policy term",
      "Disciplined saving habit",
      "Tax benefits under applicable laws",
      "Financial goal achievement",
      "Low-risk investment option",
      "Death benefit for family protection"
    ]
  }
]

// Helper function to get product by ID
export const getProductById = (id: string): AIAProduct | undefined => {
  return aiaProductsData.find(product => product.id === id)
}

// Helper function to get products by category
export const getProductsByCategory = (category: string): AIAProduct[] => {
  return aiaProductsData.filter(product => product.category === category)
}

// Helper function to search products
export const searchProducts = (query: string): AIAProduct[] => {
  const lowercaseQuery = query.toLowerCase()
  return aiaProductsData.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.keyFeatures.some(feature => feature.toLowerCase().includes(lowercaseQuery))
  )
}