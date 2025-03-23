'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Space_Mono } from 'next/font/google'
import { toast } from 'react-hot-toast'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    } else {
      toast.error('Invalid password')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className={`${spaceMono.className} space-y-6`}>
          <h1 className="text-2xl mb-8">ADMIN LOGIN</h1>
          
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-white text-black hover:bg-black hover:text-white border border-white transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </main>
  )
}