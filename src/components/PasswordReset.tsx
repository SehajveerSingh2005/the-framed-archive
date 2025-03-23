'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase/config'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Space_Mono } from 'next/font/google'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function PasswordReset({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent! Please check your inbox.')
    } catch (error) {
      setMessage('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={spaceMono.className}>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-4 bg-white border border-black"
          required
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors"
        >
          {isLoading ? 'SENDING...' : 'RESET PASSWORD'}
        </button>
        {message && (
          <p className="text-center">{message}</p>
        )}
      </form>
    </div>
  )
}