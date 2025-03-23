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

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // Here you can add error logging service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className={`${spaceMono.className} text-center px-4`}>
            <h1 className={`${archivo.className} text-4xl mb-6`}>Something went wrong</h1>
            <p className="text-white/60 mb-8">We apologize for the inconvenience</p>
            <Link 
              href="/"
              className="inline-block py-4 px-8 border border-white hover:bg-white hover:text-black transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Return Home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}