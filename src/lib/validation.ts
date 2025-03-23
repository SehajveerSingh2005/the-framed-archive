export function validatePassword(password: string): boolean {
  const minLength = 8
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  
  return password.length >= minLength && hasNumber && hasSpecialChar && hasUpperCase
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;]/g, '')  // Remove semicolons
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
}

export function validatePrice(price: number, basePrice: number): number {
  const maxPriceMultiplier = 1.5
  const minPrice = 1
  const maxPrice = basePrice * maxPriceMultiplier

  if (price < minPrice || price > maxPrice || isNaN(price)) {
    console.error('Invalid price detected:', price)
    return basePrice
  }
  return price
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 1000
}