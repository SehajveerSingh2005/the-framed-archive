'use client'

import { useState, FormEvent, useEffect } from 'react'
import { auth } from '@/lib/firebase/config'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import { Space_Mono } from 'next/font/google'
import { Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { FirebaseError } from 'firebase/app'
import PasswordReset from './PasswordReset'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  const validatePassword = (pass: string): boolean => {
    const minLength = 8
    const hasNumber = /\d/.test(pass)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    const hasUpperCase = /[A-Z]/.test(pass)
    return pass.length >= minLength && hasNumber && hasSpecialChar && hasUpperCase
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '')
  }

  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const timeWindow = 60 * 1000
    const maxAttempts = 5
    
    // Use sessionStorage to persist attempts across component remounts
    const attempts = JSON.parse(sessionStorage.getItem('authAttempts') || '[]')
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < timeWindow)
    
    if (recentAttempts.length >= maxAttempts) {
      setError('Too many attempts. Please try again later.')
      return false
    }
    
    recentAttempts.push(now)
    sessionStorage.setItem('authAttempts', JSON.stringify(recentAttempts))
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!checkRateLimit()) {
      return
    }

    const sanitizedEmail = sanitizeInput(email)
    const sanitizedName = sanitizeInput(name)

    if (!isLogin && !validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain numbers, special characters, and uppercase letters')
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, sanitizedEmail, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password)
        if (sanitizedName && userCredential.user) {
          await updateProfile(userCredential.user, { displayName: sanitizedName })
        }
      }
      resetForm()
      onClose()
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message || 'Authentication failed. Please try again.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!checkRateLimit()) {
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      await signInWithPopup(auth, provider)
      resetForm()
      onClose()
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        setError(err.message || 'Google sign in failed. Please try again.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Reset attempt count after window is closed
  // Remove this effect since we don't need it anymore
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center px-8 text-black">
      <div className={`${spaceMono.className} bg-[#f1f1f1] p-8 max-w-md w-full`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {showPasswordReset ? 'RESET PASSWORD' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </h2>
          <button 
            onClick={onClose} 
            className="text-4xl leading-none hover:opacity-60"
            disabled={isLoading}
          >×</button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        {showPasswordReset ? (
          <>
            <PasswordReset onClose={() => setShowPasswordReset(false)} />
            <button 
              onClick={() => setShowPasswordReset(false)}
              className="w-full text-center mt-4 hover:opacity-60"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block mb-2">NAME</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-white border border-black"
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              )}
              <div>
                <label className="block mb-2">EMAIL</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-white border border-black"
                  required
                  disabled={isLoading}
                  autoComplete={isLogin ? "username" : "email"}
                />
              </div>
              <div>
                <label className="block mb-2">PASSWORD</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white border border-black"
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-60"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
              </button>
            </form>

            <div className="mt-4 space-y-4">
              <button 
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full py-4 border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FcGoogle className="w-5 h-5" />
                CONTINUE WITH GOOGLE
              </button>
              {isLogin && (
                <button 
                  onClick={() => setShowPasswordReset(true)}
                  className="w-full text-center hover:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  type="button"
                >
                  Forgot your password?
                </button>
              )}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin)
                  resetForm()
                }}
                className="w-full text-center hover:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}