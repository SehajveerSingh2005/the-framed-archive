'use client'

import { useState, useEffect } from 'react'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import { auth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import { signOutUser } from '@/lib/firebase/auth'
import { User, Mail, LogOut, MapPin, Edit2, Package, Clock } from 'lucide-react'
import { getUserOrders, saveUserAddress, getUserAddress, type UserAddress } from '@/lib/firebase/orders'
import { formatPrice } from '@/data/pricing'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import LoadingScreen from '@/components/LoadingScreen'
import { verifyPinCode } from '@/lib/location'
import { motion, AnimatePresence } from 'framer-motion'
import OrderModal from '@/components/OrderModal'
import Image from 'next/image'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const archivo = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

type OrderItem = {
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

// Remove local Order type definition since we're importing it
import { type Order } from '@/lib/firebase/orders'

export default function ProfilePage() {
  const router = useRouter()
  const user = auth.currentUser
  const [orders, setOrders] = useState<Order[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [pinCodeError, setPinCodeError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [address, setAddress] = useState<UserAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  })


  // Fetch orders and address
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        const [userOrders, userAddress] = await Promise.all([
          getUserOrders(user.uid),
          getUserAddress(user.uid)
        ])
        
        setOrders(userOrders as Order[])
        if (userAddress) {
          setAddress(userAddress)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/')
      }
      setAuthLoading(false)
    })
  
    return () => unsubscribe()
  }, [router])

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'zipCode' && value.length === 6) {
      const result = await verifyPinCode(value)
      if (result.valid) {
        setPinCodeError('')
        setAddress(prev => ({
          ...prev,
          city: result.city,
          state: result.state
        }))
      } else {
        setPinCodeError('Invalid PIN code')
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await saveUserAddress(user.uid, address)
      setIsEditingAddress(false)
      toast.success('Address saved successfully')
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    }
  }

  if (authLoading) {
    return <LoadingScreen />
  }
  
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-black">
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <div className="px-8 py-32">
        <div className="max-w-screen-xl mx-auto">
          <div className={`${spaceMono.className} text-white`}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${archivo.className} text-4xl mb-12`}
            >
              MY PROFILE
            </motion.h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-4 bg-[#111] p-8 space-y-6 h-fit"
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-xs text-white/60">NAME</label>
                    <div className="flex items-center gap-4 mt-2">
                      <User className="w-5 h-5 text-white/60 flex-shrink-0" />
                      <span className="font-medium truncate">{user.displayName || 'Not set'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60">EMAIL</label>
                    <div className="flex items-center gap-4 mt-2">
                      <Mail className="w-5 h-5 text-white/60 flex-shrink-0" />
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="w-full py-4 border border-white text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    SIGN OUT
                  </button>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-8 space-y-8"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-[#111] p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`${archivo.className} text-2xl`}>SHIPPING ADDRESS</h2>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs text-white/60 hover:text-white flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      {isEditingAddress ? 'CANCEL' : 'EDIT'}
                    </motion.button>
                  </div>

                  <AnimatePresence mode="wait">
                    {isEditingAddress ? (
                      <motion.form
                        key="edit-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        onSubmit={handleAddressSubmit}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          placeholder="Street Address"
                          name="street"
                          value={address.street}
                          onChange={handleAddressChange}
                          className="w-full p-4 bg-black text-white border border-white/10 focus:border-white outline-none"
                          required
                        />
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            name="zipCode"
                            value={address.zipCode}
                            onChange={handleAddressChange}
                            maxLength={6}
                            className="w-full p-4 bg-black text-white border border-white/10 focus:border-white outline-none"
                            required
                          />
                          {pinCodeError && (
                            <p className="text-red-500 text-sm">{pinCodeError}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="State"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            className="p-4 bg-black text-white border border-white/10 focus:border-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            className="p-4 bg-black text-white border border-white/10 focus:border-white outline-none"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-4 bg-white text-black hover:bg-black hover:text-white border border-white transition-colors"
                        >
                          SAVE ADDRESS
                        </button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="address-display"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-start gap-4"
                      >
                        <MapPin className="w-5 h-5 text-white/60 mt-1" />
                        <div className="space-y-1">
                          {address.street ? (
                            <>
                              <p>{address.street}</p>
                              <p>{address.city}, {address.state} {address.zipCode}</p>
                              <p>{address.country}</p>
                            </>
                          ) : (
                            <p className="text-white/60">No address added</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-[#111] p-8"
                >
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className={`${archivo.className} text-2xl mb-8`}
                  >
                    ORDER HISTORY
                  </motion.h2>
                  
                  {loading ? (
                    <LoadingScreen />
                  ) : orders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-16"
                    >
                      <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 mb-4">No orders yet</p>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Link 
                          href="/products"
                          className="inline-block px-6 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors"
                        >
                          START SHOPPING
                        </Link>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div className="space-y-4">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5,
                            delay: index * 0.1 
                          }}
                          className="bg-black p-4 sm:p-6 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 sm:justify-between mb-3 sm:mb-6">
                            <div>
                              <p className="text-sm text-white/60">Order #{order.id.slice(-6)}</p>
                              <p className="text-lg sm:text-xl font-medium">₹{formatPrice(order.total)}</p>
                            </div>
                            <div className="flex sm:flex-col gap-3 items-center sm:items-end">
                              <span className={`px-3 py-1 text-xs ${
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' :
                                'bg-green-500/20 text-green-500'
                              }`}>
                                {order.status.toUpperCase()}
                              </span>
                              <p className="text-xs sm:text-sm text-white/60">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                {order.orderDate.toDate().toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            {order.items.map((item, itemIndex) => (
                              <div key={`${order.id}-${itemIndex}`} className="flex gap-3 sm:gap-4 bg-[#111] p-3 sm:p-4">
                                <div className="relative w-16 sm:w-24 aspect-[4/5] bg-[#f5f5f5] flex-shrink-0">
                                  {item.image?.medium ? (
                                    <Image
                                      src={item.image.medium}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 64px, 96px"
                                      priority={itemIndex < 2}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                      <span className="text-xs sm:text-sm">No Image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                                  <p className="text-xs sm:text-sm text-white/60">
                                    {item.printType} - {item.variant}
                                  </p>
                                  <p className="text-xs sm:text-sm text-white/60">
                                    Size: {item.size}
                                  </p>
                                  <div className="flex justify-between items-center mt-1 sm:mt-2">
                                    <p className="text-xs sm:text-sm text-white/60">
                                      Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm sm:text-base">₹{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer theme="dark" background="dark" />
    </main>
  )
}
