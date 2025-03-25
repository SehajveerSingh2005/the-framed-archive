import { validatePrice } from './validation'

export interface CartItem {
  id: number
  name: string
  basePrice: number
  price: number
  quantity: number
  printType: string
  variant: string
  size: string
  image: {
    large: string
    medium: string
    small: string
  }
}

export function validateCartItem(item: CartItem): CartItem {
  // Handle legacy or invalid image formats
  const defaultImage = {
    large: '/images/placeholder.jpg',
    medium: '/images/placeholder.jpg',
    small: '/images/placeholder.jpg'
  }

  const validatedImage = typeof item.image === 'string' 
    ? { large: item.image, medium: item.image, small: item.image }
    : (item.image || defaultImage)

  return {
    ...item,
    image: validatedImage,
    quantity: Math.max(1, Math.min(10, item.quantity)),
    price: validatePrice(item.price, item.basePrice),
    name: item.name.slice(0, 100), 
    printType: item.printType.slice(0, 50),
    variant: item.variant.slice(0, 50),
    size: item.size.slice(0, 50)
  }
}

export function secureCartStorage(items: CartItem[]): void {
  const validatedItems = items.map(validateCartItem)
  try {
    const jsonString = JSON.stringify(validatedItems)
    const encoded = btoa(jsonString)
    localStorage.setItem('cart', encoded)
    window.dispatchEvent(new Event('storage'))
  } catch (error) {
    console.error('Failed to save cart:', error)
  }
}

export function getSecureCart(): CartItem[] | undefined {
  try {
    const stored = localStorage.getItem('cart')
    if (!stored) return []

    try {
      // Try parsing as base64 first
      const decoded = atob(stored)
      const items = JSON.parse(decoded)
      return Array.isArray(items) ? items.map(validateCartItem) : []
    } catch {
      // If base64 decode fails, try parsing as legacy unencrypted data
      try {
        const items = JSON.parse(stored)
        if (Array.isArray(items)) {
          // If successful, encode it for future use
          secureCartStorage(items)
          return items.map(validateCartItem)
        }
      } catch {
        localStorage.removeItem('cart')
        return []
      }
    }
  } catch (error) {
    console.error('Failed to load cart:', error)
    return []
  }
}