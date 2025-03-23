'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth'
import { mergeCartOnLogin } from '@/lib/firebase/cart'
import { getSecureCart } from '@/lib/cartSecurity'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Merge cart when user logs in
        const localCart = getSecureCart() || []
        if (localCart.length > 0) {
          try {
            await mergeCartOnLogin(user.uid, localCart)
            localStorage.removeItem('cart') // Clear local cart after merging
          } catch (error) {
            console.error('Error merging cart:', error)
          }
        }
      }
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)