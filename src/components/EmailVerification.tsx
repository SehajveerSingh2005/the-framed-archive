'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase/config'
import { sendEmailVerification } from 'firebase/auth'

export default function EmailVerification() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVerification = async () => {
    if (!auth.currentUser) return
    
    setIsLoading(true)
    try {
      await sendEmailVerification(auth.currentUser)
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return auth.currentUser && !auth.currentUser.emailVerified ? (
    <div className="p-4 bg-yellow-50 text-yellow-800">
      <p>Please verify your email address.</p>
      <button
        onClick={handleVerification}
        disabled={isLoading}
        className="mt-2 text-sm underline"
      >
        {isLoading ? 'Sending...' : 'Resend verification email'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  ) : null
}