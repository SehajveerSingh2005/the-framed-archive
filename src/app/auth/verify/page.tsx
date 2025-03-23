'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyMagicLink } from '@/lib/firebase/auth'
import { Space_Mono } from 'next/font/google'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function VerifyEmail() {
  const router = useRouter()
  const [status, setStatus] = useState('Verifying...')

  useEffect(() => {
    const verify = async () => {
      const linkTimestamp = new URLSearchParams(window.location.search).get('timestamp')
      if (linkTimestamp && (Date.now() - parseInt(linkTimestamp)) > 24 * 60 * 60 * 1000) {
        setStatus('Link expired. Please request a new verification link.')
        return
      }
      const verifiedFlag = sessionStorage.getItem('emailVerified')
      if (verifiedFlag) {
        router.replace('/profile')
        return
      }

      try {
        const user = await verifyMagicLink()
        sessionStorage.setItem('emailVerified', 'true')
        
        // Migrate pending orders to the verified user
        const ordersRef = collection(db, 'orders')
        const pendingOrdersQuery = query(
          ordersRef,
          where('userId', '==', `pending_${user.email}`)
        )
        
        const pendingOrders = await getDocs(pendingOrdersQuery)
        
        if (!pendingOrders.empty) {
          const batch = writeBatch(db)
          
          pendingOrders.docs.forEach((doc) => {
            batch.update(doc.ref, { userId: user.uid })
          })
          
          await batch.commit()
        }

        setStatus('Verified! Redirecting...')
        router.replace('/profile') // Use replace instead of push
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('Verification failed. Please try logging in manually.')
      }
    }

    verify()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f1f1]">
      <div className={`${spaceMono.className} text-xl text-center`}>
        {status}
      </div>
    </div>
  )
}