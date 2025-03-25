'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Space_Mono } from 'next/font/google'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function AdminLogin() {
  const router = useRouter()
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!user) {
        toast.error('Please log in first')
        return
      }

      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (data.isAdmin && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true')
        router.push('/admin')
        toast.success('Welcome, Admin!')
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f1f1f1] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className={`${spaceMono.className} space-y-6`}>
          <h1 className="text-2xl mb-8">ADMIN LOGIN</h1>
          
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-4 bg-white border border-black/10 focus:border-black outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors"
          >
            {loading ? 'VERIFYING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </main>
  )
}