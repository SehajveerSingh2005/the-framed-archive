'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from './LoadingScreen'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  // Remove the conditional return to prevent flash
  return (
    <>
      {loading && <LoadingScreen />}
      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  )
}