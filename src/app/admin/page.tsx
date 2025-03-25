'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import { motion } from 'framer-motion'
import OrdersPanel from '@/components/admin/OrdersPanel'
import StatsPanel from '@/components/admin/StatsPanel'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const archivo = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<'orders' | 'stats'>('orders')

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/admin/login')
        return
      }

      const adminCheck = sessionStorage.getItem('isAdmin')
      if (!adminCheck) {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
    }

    checkAdmin()
  }, [user, router])

  // Show loading state while checking admin status
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#f1f1f1] flex items-center justify-center">
        <p className={`${spaceMono.className} text-xl`}>Loading...</p>
      </div>
    )
  }

  // Show admin panel only if user is admin
  if (!isAdmin) return null

  return (
    <main className="min-h-screen bg-[#f1f1f1]">
      <div className="px-8 py-32">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${archivo.className} text-4xl`}
            >
              ADMIN PANEL
            </motion.h1>
            <Link 
              href="/admin/products" 
              className={`${spaceMono.className} px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors`}
            >
              MANAGE PRODUCTS
            </Link>
          </div>

          <div className={`${spaceMono.className} flex gap-4 mb-8`}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 transition-colors ${
                activeTab === 'orders' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              ORDERS
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 transition-colors ${
                activeTab === 'stats' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              STATS
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            {activeTab === 'orders' ? <OrdersPanel /> : <StatsPanel />}
          </div>
        </div>
      </div>
    </main>
  )
}