import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'

export type CartItem = {
  id: number
  name: string
  basePrice: number
  price: number
  quantity: number
  image: {
    large: string
    medium: string
    small: string
  }
  size: string
  printType: string
  variant: string
}

export async function mergeCartOnLogin(userId: string, localCart: CartItem[]) {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      // Ensure local cart items have the correct image structure
      const validatedCart = localCart.map(item => ({
        ...item,
        image: typeof item.image === 'string' 
          ? { large: item.image, medium: item.image, small: item.image }
          : item.image
      }))
      await setDoc(userRef, { cart: validatedCart })
      return validatedCart
    }

    // Get existing cart from database
    const dbCart = userDoc.data().cart || []
    const mergedCart = [...dbCart]

    // Add local items to database cart
    localCart.forEach(localItem => {
      const existingItem = mergedCart.find(
        dbItem => 
          dbItem.id === localItem.id && 
          dbItem.printType === localItem.printType &&
          dbItem.size === localItem.size &&
          dbItem.variant === localItem.variant
      )

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity = Math.min(existingItem.quantity + localItem.quantity, 10)
      } else {
        // Add new item
        mergedCart.push({
          ...localItem,
          quantity: Math.min(localItem.quantity, 10)
        })
      }
    })

    // Update database with merged cart
    await updateDoc(userRef, { cart: mergedCart })
    return mergedCart
  } catch (error) {
    console.error('Error merging cart:', error)
    throw error
  }
}

export async function getCart(userId: string): Promise<CartItem[]> {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data().cart || []
    }
    return []
  } catch (error) {
    console.error('Error getting cart:', error)
    return []
  }
}

export async function updateCart(userId: string, cart: CartItem[]) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { cart })
    return true
  } catch (error) {
    console.error('Error updating cart:', error)
    return false
  }
}