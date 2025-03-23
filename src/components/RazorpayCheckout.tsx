'use client'

import { useState, useEffect } from 'react'
import { createOrder, initializeRazorpayCheckout } from '@/lib/razorpay'
import { validateCartItem, type CartItem } from '@/lib/cartSecurity'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateCart } from '@/lib/firebase/cart'
import { secureCartStorage } from '@/lib/cartSecurity'

interface RazorpayCheckoutProps {
  amount: number
  orderId: string
  items: CartItem[] 
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  onSuccess: (response: any) => void
  onFailure: (error: any) => void
}

export default function RazorpayCheckout({
  amount,
  orderId,
  items,
  customerInfo,
  onSuccess,
  onFailure
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const { user } = useAuth()

  // Preload Razorpay script with improved error handling
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = (error) => {
      console.error('Error loading Razorpay script:', error)
      setIsScriptLoaded(false)
      onFailure('Failed to load payment gateway. Please try again.')
    }
    
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [onFailure])

  const clearCart = async () => {
    try {
      if (user) {
        await updateCart(user.uid, [])
      } else {
        secureCartStorage([])
      }
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      if (!isScriptLoaded) {
        throw new Error('Razorpay script not loaded')
      }

      const validatedItems = items.map(item => validateCartItem(item))
      const order = await createOrder(amount, orderId, validatedItems)
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "The Framed Archive",
        description: "Purchase from The Framed Archive",
        order_id: order.id,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          "address": "The Framed Archive",
          "orderId": orderId
        },
        theme: {
          color: "#000000"
        },
        handler: async function (response: any) {
          await clearCart()
          setIsLoading(false)
          onSuccess({
            ...response,
            orderId: orderId
          })
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            onFailure('Payment cancelled by user')
          },
          escape: false,
          backdropclose: false,
          confirm_close: true
        }
      }

      const rzp = await initializeRazorpayCheckout(options)
      rzp.open()
    } catch (error) {
      setIsLoading(false)
      onFailure(error)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !isScriptLoaded}
      className="w-full bg-black text-white py-4 px-8 hover:bg-gray-800 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <LoaderCircle className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <span>Pay Now</span>
      )}
    </button>
  )
}