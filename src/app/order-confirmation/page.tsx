'use client'

import { useEffect } from 'react'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Footer from '@/components/Footer'
import { secureCartStorage } from '@/lib/cartSecurity'

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


export default function OrderConfirmation() {
  useEffect(() => {
    // Clear cart securely after successful order
    secureCartStorage([])
    window.dispatchEvent(new Event('cartUpdated'))
  }, [])

  return (
    <main className="min-h-screen bg-[#f1f1f1] pt-32 px-8">
      <div className="max-w-screen-xl mx-auto mb-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <CheckCircle className="w-24 h-24 mx-auto text-green-500" />
          
          <div>
            <h1 className={`${archivo.className} text-5xl mb-4 text-black`}>
              THANK YOU
            </h1>
            <p className={`${spaceMono.className} text-xl text-gray-600`}>
              Your order has been confirmed
            </p>
          </div>

          <div className={`${spaceMono.className} space-y-4 text-gray-600`}>
            <p>
              We&apos;ll send you a confirmation email with your order details and tracking information.
            </p>
            <p>
              Your order will be processed and shipped within 5-7 business days.
            </p>
          </div>

          <Link 
            href="/"
            className={`${spaceMono.className} inline-block bg-black text-white py-4 px-8 hover:bg-white hover:text-black border-2 border-black transition-all duration-200`}
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
      
      <Footer theme="light" />
    </main>
  )
}
