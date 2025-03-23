'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { sizes, printTypes, formatPrice } from '@/data/pricing'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { getSecureCart, secureCartStorage, validateCartItem } from '@/lib/cartSecurity'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext' 
import LoadingScreen from '@/components/LoadingScreen'
import { getCart, updateCart } from '@/lib/firebase/cart'
import { toast } from 'react-hot-toast'

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

type CartItem = {
  id: number
  name: string
  basePrice: number
  price: number
  quantity: number
  image: string
  size: string
  printType: string
  variant: string
}

export default function Cart() {
  const router = useRouter()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true)
        if (user) {
          const dbCart = await getCart(user.uid)
          setCartItems(dbCart)
        } else {
          const localCart = getSecureCart() || []
          setCartItems(localCart)
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        toast.error('Failed to load cart')
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user])

  const calculateItemPrice = (
    item: CartItem,
    newSize?: string,
    newPrintType?: string,
    newVariant?: string,
    newQuantity?: number
  ) => {
    const size = newSize || item.size
    const printType = newPrintType || item.printType
    const variant = newVariant || item.variant
    const quantity = newQuantity || item.quantity

    const sizeCode = sizes[size as keyof typeof sizes]
    const printTypeConfig = printTypes[printType as keyof typeof printTypes]
    const variantPrices = printTypeConfig.variants[variant as keyof typeof printTypeConfig.variants]
    const basePrice = variantPrices[sizeCode as keyof typeof variantPrices]
    
    return {
      basePrice,
      totalPrice: basePrice * quantity
    }
  }

  const getAvailableSizes = (type: string) => {
    const availableSizes = printTypes[type as keyof typeof printTypes]?.sizes || []
    return Object.entries(sizes).filter(([size]) => availableSizes.includes(sizes[size as keyof typeof sizes]))
  }

  const getAvailableVariants = (type: string) => {
    return Object.keys(printTypes[type as keyof typeof printTypes]?.variants || {})
  }

  const handleCartUpdate = async (newCart: CartItem[]) => {
    try {
      setIsUpdating(true)
      if (user) {
        await updateCart(user.uid, newCart)
      } else {
        secureCartStorage(newCart)
      }
      setCartItems(newCart)
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    await handleCartUpdate(updatedCart)
  }

  const handleUpdateQuantity = (itemId: number, change: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, Math.min(10, item.quantity + change))
        const { totalPrice } = calculateItemPrice(item, undefined, undefined, undefined, newQuantity)
        return { ...item, quantity: newQuantity, price: totalPrice }
      }
      return item
    })
    handleCartUpdate(updatedCart)
  }

  const handleUpdateSize = (itemId: number, newSize: string) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const { basePrice, totalPrice } = calculateItemPrice(item, newSize)
        return validateCartItem({
          ...item,
          size: newSize,
          basePrice,
          price: totalPrice
        })
      }
      return item
    })
    handleCartUpdate(updatedCart)
  }

  const handleUpdatePrintType = (itemId: number, newType: string) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const firstVariant = Object.keys(printTypes[newType as keyof typeof printTypes].variants)[0]
        const firstSize = getAvailableSizes(newType)[0][0]
        const { basePrice, totalPrice } = calculateItemPrice(
          item,
          firstSize,
          newType,
          firstVariant
        )
        return validateCartItem({
          ...item,
          printType: newType,
          variant: firstVariant,
          size: firstSize,
          basePrice,
          price: totalPrice
        })
      }
      return item
    })
    handleCartUpdate(updatedCart)
  }

  const handleUpdateVariant = (itemId: number, newVariant: string) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        const { basePrice, totalPrice } = calculateItemPrice(item, undefined, undefined, newVariant)
        return validateCartItem({
          ...item,
          variant: newVariant,
          basePrice,
          price: totalPrice
        })
      }
      return item
    })
    handleCartUpdate(updatedCart)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      // Use replace instead of push to prevent back navigation
      router.replace('/checkout')
    } else {
      toast.error('Your cart is empty')
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="px-4 sm:px-8 mb-12 sm:mb-24">
        <div className="max-w-screen-xl mx-auto pt-24 sm:pt-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${archivo.className} text-3xl sm:text-5xl mb-8 sm:mb-16 text-black`}
          >
            SHOPPING CART
          </motion.h1>

          <AnimatePresence mode="wait">
            {cartItems.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 text-black"
              >
                <div className="lg:col-span-2">
                  <AnimatePresence>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex flex-col pb-8 mb-8 sm:pb-12 sm:mb-12 border-b border-[#e5e5e5]"
                      >
                        <div className="flex gap-6 sm:gap-12">
                          <div className="relative aspect-[4/5] w-40 sm:w-48 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 160px, 192px"
                              priority={index < 2}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`${archivo.className} text-xl sm:text-2xl mb-2`}>
                                  {item.name}
                                </h3>
                                <p className={`${spaceMono.className} text-lg sm:text-xl`}>
                                  ₹{formatPrice(item.price)}
                                </p>
                                
                                {/* Form section - Hidden on mobile, shown next to title on desktop */}
                                <div className={`${spaceMono.className} hidden sm:block space-y-4 mt-4`}>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <label className="block text-gray-500 text-sm">Print Type</label>
                                      <select 
                                        value={item.printType}
                                        onChange={(e) => handleUpdatePrintType(item.id, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                                      >
                                        {Object.keys(printTypes).map(type => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-gray-500 text-sm">Variant</label>
                                      <select 
                                        value={item.variant}
                                        onChange={(e) => handleUpdateVariant(item.id, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                                      >
                                        {getAvailableVariants(item.printType).map(variant => (
                                          <option key={variant} value={variant}>{variant}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-gray-500 text-sm">Size</label>
                                      <select 
                                        value={item.size}
                                        onChange={(e) => handleUpdateSize(item.id, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                                      >
                                        {getAvailableSizes(item.printType).map(([size]) => (
                                          <option key={size} value={size}>{size}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <button
                                      className="hover:text-gray-500 transition-colors p-1"
                                      onClick={() => handleUpdateQuantity(item.id, -1)}
                                    >
                                      <Minus size={20} />
                                    </button>
                                    <span className="w-8 text-center text-sm">
                                      {item.quantity}
                                    </span>
                                    <button
                                      className="hover:text-gray-500 transition-colors p-1"
                                      onClick={() => handleUpdateQuantity(item.id, 1)}
                                    >
                                      <Plus size={20} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button
                                className="text-gray-400 hover:text-black transition-colors p-1"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <X size={24} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`${spaceMono.className} sm:hidden space-y-4 mt-8`}>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="block text-gray-500 text-sm">Print Type</label>
                              <select 
                                value={item.printType}
                                onChange={(e) => handleUpdatePrintType(item.id, e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                              >
                                {Object.keys(printTypes).map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-gray-500 text-sm">Variant</label>
                              <select 
                                value={item.variant}
                                onChange={(e) => handleUpdateVariant(item.id, e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                              >
                                {getAvailableVariants(item.printType).map(variant => (
                                  <option key={variant} value={variant}>{variant}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-gray-500 text-sm">Size</label>
                              <select 
                                value={item.size}
                                onChange={(e) => handleUpdateSize(item.id, e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 bg-transparent focus:border-black outline-none text-sm"
                              >
                                {getAvailableSizes(item.printType).map(([size]) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              className="hover:text-gray-500 transition-colors p-1"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                            >
                              <Minus size={20} />
                            </button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              className="hover:text-gray-500 transition-colors p-1"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-[#f5f5f5] p-6 sm:p-8 h-fit"
                >
                  <motion.h2 
                    className={`${archivo.className} text-2xl mb-8`}
                  >
                    ORDER SUMMARY
                  </motion.h2>
                  <div className={`${spaceMono.className} space-y-6 text-base`}>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between pt-6 border-t border-gray-200 text-lg font-bold">
                      <span>Total</span>
                      <span>₹{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className={`${spaceMono.className} w-full bg-black text-white py-4 mt-8 hover:bg-white hover:text-black border border-black transition-colors text-base font-bold`}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-32"
              >
                <p className={`${spaceMono.className} text-xl mb-8 text-black`}>
                  Your cart is empty
                </p>
                <Link 
                  href="/products"
                  className={`${spaceMono.className} bg-black text-white px-12 py-4 hover:bg-white hover:text-black border border-black transition-colors text-base`}
                >
                  CONTINUE SHOPPING
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer theme="light" background="light" />
    </main>
  )
}