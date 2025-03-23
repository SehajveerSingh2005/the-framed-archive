'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import Link from 'next/link'

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

interface Props {
  children: ReactNode
}

export default class CheckoutErrorBoundary extends Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Checkout error:', error, errorInfo)
    // Redirect to cart on error
    window.location.href = '/cart'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className={`${spaceMono.className} text-center px-4`}>
            <h1 className={`${archivo.className} text-4xl mb-6`}>Checkout Error</h1>
            <p className="text-white/60 mb-8">There was a problem processing your order</p>
            <div className="space-x-4">
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="inline-block py-4 px-8 border border-white hover:bg-white hover:text-black transition-colors"
              >
                Try Again
              </button>
              <Link 
                href="/cart"
                className="inline-block py-4 px-8 border border-white hover:bg-white hover:text-black transition-colors"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}