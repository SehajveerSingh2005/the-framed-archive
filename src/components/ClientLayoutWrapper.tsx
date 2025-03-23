'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientLayout from '@/components/ClientLayout'
import ErrorBoundary from '@/components/ErrorBoundary'

const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { 
    ssr: false,
    loading: () => null 
  }
)

function LoadingFallback() {
  return null
}

export default function ClientLayoutWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(true) 

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ClientLayout>
          {mounted && <Navbar />}
          {children}
          {mounted && (
            <Toaster
              position="bottom-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#000',
                  color: '#fff',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontFamily: 'var(--font-geist-mono)',
                  borderRadius: '0',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxWidth: '400px',
                  width: '90%',
                },
                success: {
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#000',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#000',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#000',
                  },
                }
              }}
            />
          )}
        </ClientLayout>
      </AuthProvider>
    </ErrorBoundary>
  )
}