import { db } from './config'
import { collection, addDoc, query, where, getDocs, orderBy, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'

export type OrderItem = {
  id: number
  name: string
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

export type Order = {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: Timestamp
  processedAt?: Timestamp
  shippedAt?: Timestamp
  deliveredAt?: Timestamp
  cancelledAt?: Timestamp
  items: OrderItem[]
  total: number
  paymentId: string
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pinCode: string
  }
}

export const createOrder = async (orderData: Order) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      orderDate: Timestamp.now()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export const getUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders')
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('orderDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const orders = querySnapshot.docs.map(doc => ({
      ...(doc.data() as Order),
      id: doc.id,
      ...doc.data()
    })) as Order[]
    
    return orders
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export type UserAddress = {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const saveUserAddress = async (userId: string, address: UserAddress) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, { address }, { merge: true })
  } catch (error) {
    console.error('Error saving address:', error)
    throw error
  }
}

export const getUserAddress = async (userId: string): Promise<UserAddress | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const docSnap = await getDoc(userRef)
    
    if (docSnap.exists() && docSnap.data().address) {
      return docSnap.data().address as UserAddress
    }
    return null
  } catch (error) {
    console.error('Error fetching address:', error)
    throw error
  }
}