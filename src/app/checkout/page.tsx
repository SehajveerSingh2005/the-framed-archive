'use client'

import { Space_Mono, Archivo_Black } from 'next/font/google'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/data/pricing'
import Footer from '@/components/Footer'
import RazorpayCheckout from '@/components/RazorpayCheckout'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { getUserAddress } from '@/lib/firebase/orders'
import { states, verifyPinCode } from '@/lib/location'
import { sendMagicLink } from '@/lib/firebase/auth'
import CheckoutErrorBoundary from '@/components/CheckoutErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'
import { createOrder, type Order } from '@/lib/firebase/orders'
import { getCart } from '@/lib/firebase/cart'
import { getSecureCart, secureCartStorage } from '@/lib/cartSecurity'
import { Timestamp } from 'firebase/firestore'

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

type ShippingInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pinCode: string
}

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  size: string
  printType: string
  variant: string
}

export default function CheckoutPage() {
  return (
    <CheckoutErrorBoundary>
      <CheckoutContent />
    </CheckoutErrorBoundary>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: ''
  })
  
  // Update the loadSavedAddress useEffect
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user) return
      
      try {
        const savedAddress = await getUserAddress(user.uid)
        if (savedAddress) {
          setShippingInfo(prev => ({
            ...prev,
            address: savedAddress.street,
            city: savedAddress.city,
            state: savedAddress.state,
            pinCode: savedAddress.zipCode,
            email: user.email || '',
            firstName: user.displayName ? user.displayName.split(' ')[0] : '',
            lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''
          }))
        }
      } catch (error) {
        console.error('Error loading saved address:', error)
      }
    }
  
    loadSavedAddress()
  }, [user])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 0

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (Object.values(shippingInfo).some(value => !value)) {
      alert('Please fill in all fields')
      return
    }
    setStep('payment')
  }

  const [cities, setCities] = useState<string[]>([])
  const [pinCodeError, setPinCodeError] = useState('')
  

  useEffect(() => {
    if (shippingInfo.state) {
      setCities([])
    }
  }, [shippingInfo.state])
  
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }))
  
    if (name === 'pinCode' && value.length === 6) {
      const result = await verifyPinCode(value)
      if (result.valid) {
        setPinCodeError('')
        setShippingInfo(prev => ({
          ...prev,
          city: result.city,
          state: result.state
        }))
      } else {
        setPinCodeError('Invalid PIN code')
      }
    }
  }

  <div className="grid grid-cols-3 gap-8">
    <div className="space-y-2">
      <label className={`${spaceMono.className} block text-gray-500`}>PIN Code</label>
      <input 
        type="text" 
        name="pinCode"
        value={shippingInfo.pinCode}
        onChange={handleInputChange}
        maxLength={6}
        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none" 
      />
      {pinCodeError && (
        <p className="text-red-500 text-sm mt-1">{pinCodeError}</p>
      )}
    </div>
    <div className="space-y-2">
      <label className={`${spaceMono.className} block text-gray-500`}>State</label>
      <select
        name="state"
        value={shippingInfo.state}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none bg-white"
      >
        <option value="">Select State</option>
        {states.map(state => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
    </div>
    <div className="space-y-2">
      <label className={`${spaceMono.className} block text-gray-500`}>City</label>
      <select
        name="city"
        value={shippingInfo.city}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none bg-white"
      >
        <option value="">Select City</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  </div>

  // Update cart loading useEffect
  useEffect(() => {
    const validateCheckout = async () => {
      try {
        let cart
        if (user) {
          cart = await getCart(user.uid)
        } else {
          cart = getSecureCart() || []
        }
        
        if (!cart || cart.length === 0) {
          toast.error('Your cart is empty')
          router.replace('/cart')
          return
        }
        
        setCartItems(cart)
      } catch (error) {
        console.error('Error validating checkout:', error)
        toast.error('Error loading cart')
        router.replace('/cart')
      }
    }

    validateCheckout()
  }, [user, router])

  // Update handlePaymentSuccess
  const handlePaymentSuccess = async (response: any) => {
    try {
      if (!response.razorpay_payment_id) {
        throw new Error('Invalid payment response')
      }
  
      let userId = user?.uid || 'guest'
  
      if (!userId) {
        try {
          await sendMagicLink(
            shippingInfo.email,
            `${shippingInfo.firstName} ${shippingInfo.lastName}`
          )
          userId = 'pending_' + shippingInfo.email
          toast.success('Check your email to access your order history!')
        } catch (error) {
          console.error('Error sending magic link:', error)
        }
      }
  
      const orderData: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        items: cartItems,
        total: subtotal + shipping,
        shippingInfo,
        paymentId: response.razorpay_payment_id,
        status: 'pending',
        orderDate: Timestamp.now() 
      }
  
      await createOrder(orderData)
      
      // Clear cart using secure methods
      secureCartStorage([])
      window.dispatchEvent(new Event('cartUpdated'))
      router.push('/order-confirmation')
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error creating order. Please contact support.')
    }
  }

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed', error)
    alert('Payment failed. Please try again.')
  }

  return (
    <main className="min-h-screen bg-[#f1f1f1]"> 
      <div className="px-8 mb-24">
        <div className="max-w-screen-xl mx-auto pt-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${archivo.className} text-5xl mb-8 text-black`}
          >
            CHECKOUT
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 text-black">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 space-y-4"
            >
              <div className={`${spaceMono.className} flex gap-8 text-lg`}>
                <button 
                  onClick={() => setStep('shipping')}
                  className={`${step === 'shipping' ? 'opacity-100 font-bold' : 'opacity-50'}`}
                >
                  01. SHIPPING
                </button>
                <button 
                  onClick={() => step === 'payment' && setStep('payment')}
                  className={`${step === 'payment' ? 'opacity-100 font-bold' : 'opacity-50'}`}
                >
                  02. PAYMENT
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'shipping' ? (
                  <motion.form
                    key="shipping"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleShippingSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className={`${spaceMono.className} block text-gray-500`}>First Name</label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                          autoComplete="given-name"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`${spaceMono.className} block text-gray-500`}>Last Name</label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                          autoComplete="family-name"
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`${spaceMono.className} block text-gray-500`}>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                        autoComplete="email"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${spaceMono.className} block text-gray-500`}>Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                        autoComplete="tel"
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`${spaceMono.className} block text-gray-500`}>Address</label>
                      <input 
                        type="text" 
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                        autoComplete="street-address"
                        required 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className={`${spaceMono.className} block text-gray-500`}>PIN Code</label>
                        <input 
                          type="text" 
                          name="pinCode"
                          value={shippingInfo.pinCode}
                          onChange={handleInputChange}
                          maxLength={6}
                          className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                          autoComplete="postal-code"
                          required 
                        />
                        {pinCodeError && (
                          <p className="text-red-500 text-sm">{pinCodeError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className={`${spaceMono.className} block text-gray-500`}>State</label>
                        <input 
                          type="text" 
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                          autoComplete="address-level1"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`${spaceMono.className} block text-gray-500`}>City</label>
                        <input 
                          type="text" 
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-500 focus:border-black outline-none"
                          autoComplete="address-level2"
                          required 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className={`${spaceMono.className} w-full bg-black text-white py-4 hover:bg-white hover:text-black border-2 border-black transition-all duration-200`}
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    <div className={`${spaceMono.className} space-y-4`}>
                      <h3 className="text-xl">Payment Details</h3>
                      <p className="text-gray-500">
                        You will be redirected to Razorpay's secure payment gateway
                      </p>
                    </div>

                    <RazorpayCheckout
                      amount={subtotal + shipping}
                      orderId={`order_${Date.now()}`}
                      items={cartItems.map(item => ({
                        ...item,
                        basePrice: item.price
                      }))}
                      customerInfo={{
                        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                        email: shippingInfo.email,
                        phone: shippingInfo.phone
                      }}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-12 h-fit"
            >
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`${archivo.className} text-2xl mb-8`}
              >
                ORDER SUMMARY
              </motion.h2>
              
              <motion.div 
                className={`${spaceMono.className} space-y-6`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="relative w-20 h-20 bg-[#f5f5f5] flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.printType} - {item.variant} - {item.size}
                      </p>
                      <p className="text-sm">
                        ₹{formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">₹{formatPrice(item.price * item.quantity)}</p>
                  </motion.div>
                ))}
                
                {/* ... summary totals ... */}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer theme='light' />
    </main>
  )
}