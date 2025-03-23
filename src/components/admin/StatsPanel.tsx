'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { formatPrice } from '@/data/pricing'

type ProductStats = {
  id: string
  name: string
  orderCount: number
  revenue: number
  wishlistCount: number  // Add this
  cartCount: number      // Add this
  status: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
}

export default function StatsPanel() {
  const [stats, setStats] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<keyof ProductStats>('revenue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, users] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'users'))
        ])

        // Debug logs
        console.log('Order Items:', orders.docs.map(doc => doc.data().items))
        console.log('User Wishlist:', users.docs.map(doc => doc.data().wishlist))
        console.log('User Cart:', users.docs.map(doc => doc.data().cart))

        const statsMap = new Map<string, ProductStats>()

        // Initialize products
        products.docs.forEach(doc => {
          const productData = doc.data()
          statsMap.set(doc.id, {
            id: doc.id,
            name: productData.name || productData.slug,
            orderCount: 0,
            revenue: 0,
            wishlistCount: productData.wishlistedBy?.length || 0,  // Get from product data
            cartCount: 0,
            status: {
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0
            }
          })
        })

        // Process orders
        orders.docs.forEach(doc => {
          const orderData = doc.data()
          if (orderData.items) {
            orderData.items.forEach((item: any) => {
              // Find product by name instead of ID
              const productStats = Array.from(statsMap.values()).find(
                stat => stat.name === item.name
              )
              if (productStats) {
                productStats.orderCount += item.quantity || 1
                productStats.revenue += (item.price * (item.quantity || 1)) || 0
                if (orderData.status) {
                  productStats.status[orderData.status as keyof typeof productStats.status]++
                }
              }
            })
          }
        })

        // Process users
        users.docs.forEach(doc => {
          const userData = doc.data()
          
          // Process wishlist
          if (userData.wishlist) {
            userData.wishlist.forEach((item: any) => {
              // Find product by name
              const productStats = Array.from(statsMap.values()).find(
                stat => stat.name === item.name
              )
              if (productStats) productStats.wishlistCount++
            })
          }

          // Process cart
          if (userData.cart) {
            userData.cart.forEach((item: any) => {
              // Find product by name
              const productStats = Array.from(statsMap.values()).find(
                stat => stat.name === item.name
              )
              if (productStats) productStats.cartCount++
            })
          }
        })

        const finalStats = Array.from(statsMap.values())
        console.log('Final Stats:', finalStats)
        setStats(finalStats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const sortedStats = [...stats].sort((a, b) => {
    const compareValue = sortOrder === 'desc' 
      ? Number(b[sortBy]) - Number(a[sortBy]) 
      : Number(a[sortBy]) - Number(b[sortBy])
    return compareValue
  })

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 items-center">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof ProductStats)}
          className="border rounded-md p-2 text-black bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="orderCount">Sort by Orders</option>
          <option value="wishlistCount">Sort by Wishlists</option>
          <option value="cartCount">Sort by Cart Items</option>
        </select>
        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="border rounded-md p-2 text-black bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
        </button>
      </div>

      <div className="space-y-6">
        {sortedStats.map(stat => (
          <div key={stat.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <p className="font-bold text-black text-lg">{stat.name}</p>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="text-red-500">❤️</span>
                  <span className="font-medium text-black">{stat.wishlistCount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-500">🛒</span>
                  <span className="font-medium text-black">{stat.cartCount}</span>
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-black">₹{formatPrice(stat.revenue)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-black">{stat.orderCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Order Status</p>
                <div className="space-y-1 text-sm text-black">
                  {Object.entries(stat.status).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize">{status}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}