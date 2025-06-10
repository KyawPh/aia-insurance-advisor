export function calculateAge(dateOfBirth: string): number {
  const [day, month, year] = dateOfBirth.split("/").map(Number)
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatDateInput(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "")

  // Format as DD/MM/YYYY
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
  }
}
