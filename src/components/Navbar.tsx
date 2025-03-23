'use client'

import Link from 'next/link'
import { Space_Mono } from 'next/font/google'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { signOutUser } from '@/lib/firebase/auth'
import { LogOut, User, Menu, X } from 'lucide-react'
import AuthModal from './AuthModal'
import { getSecureCart } from '@/lib/cartSecurity'
import { usePathname } from 'next/navigation'
import { getCart } from '@/lib/firebase/cart'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Navbar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const darkThemePaths = ['/', '/products', '/product/[slug]','/profile','/wishlist','/contact','/about']
  const isDarkTheme = darkThemePaths.some(path => {
    if (path.includes('[slug]')) {
      return pathname.startsWith('/product/')
    }
    return pathname === path
  })

  const textColor = isMenuOpen ? 'text-white' : (isDarkTheme ? 'text-white' : 'text-black')
  const hoverEffect = isMenuOpen ? 'hover:text-black/60' : (isDarkTheme ? 'hover:text-white/60' : 'hover:text-black/60')
  const dropdownBg = isDarkTheme ? 'bg-black border-white/20' : 'bg-white border-black'
  const dropdownText = isDarkTheme ? 'text-white' : 'text-black'
  const dropdownHover = isDarkTheme ? 'hover:bg-white hover:text-black' : 'hover:bg-black hover:text-white'

  useEffect(() => {
    const updateCartCount = async () => {
      try {
        if (user) {
          const dbCart = await getCart(user.uid)
          setCartCount(dbCart?.length || 0)
        } else {
          const localCart = getSecureCart()
          setCartCount(localCart?.length || 0)
        }
      } catch (error) {
        console.error('Error updating cart count:', error)
        setCartCount(0)
      }
    }

    updateCartCount()

    window.addEventListener('cartUpdated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full px-4 sm:px-8 z-50">
        <div className="max-w-screen-xl mx-auto">
          <div className={`${spaceMono.className} flex items-center justify-between h-24 text-sm ${textColor}`}>
            <Link href="/" className={`font-bold ${hoverEffect}`}>
              THE FRAMED ARCHIVE
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className={hoverEffect}>
                ARCHIVE
              </Link>
              <Link href="/about" className={hoverEffect}>
                ABOUT
              </Link>
              <Link href="/cart" className={hoverEffect}>
                CART ({cartCount})
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <div className="relative group">
                      <button className={`flex items-center gap-2 ${hoverEffect}`}>
                        <User className="w-4 h-4" />
                        <span>
                          {user.displayName?.split(' ')[0]?.toUpperCase() || 'USER'}
                        </span>
                      </button>
                      <div className={`absolute right-0 mt-2 w-48 ${dropdownBg} shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                        <div className={`p-2 ${dropdownText}`}>
                          <Link href="/profile" className={`block p-2 ${dropdownHover}`}>
                            PROFILE
                          </Link>
                          <Link href="/wishlist" className={`block p-2 ${dropdownHover}`}>
                            WISHLIST
                          </Link>
                          <button 
                            onClick={handleSignOut}
                            className={`w-full text-left p-2 ${dropdownHover} flex items-center gap-2`}
                          >
                            <LogOut className="w-4 h-4" />
                            SIGN OUT
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setIsAuthOpen(true)} className={hoverEffect}>
                      LOGIN
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <Link 
                href="/cart" 
                className={`${hoverEffect} relative`}
              >
                CART {cartCount > 0 && `(${cartCount})`}
              </Link>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className={`md:hidden ${textColor} ${isAuthOpen ? 'opacity-0 invisible' : ''}`}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/95
          transition-all duration-300 ease-in-out md:hidden
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
      >
        <div className="px-4 pt-24">
          <div className={`${spaceMono.className} flex flex-col gap-8 text-white text-lg`}>
            <Link 
              href="/products" 
              className="hover:opacity-60"
              onClick={() => setIsMenuOpen(false)}
            >
              ARCHIVE
            </Link>
            <Link 
              href="/about" 
              className="hover:opacity-60"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link 
              href="/cart" 
              className="hover:opacity-60"
              onClick={() => setIsMenuOpen(false)}
            >
              CART ({cartCount})
            </Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {user.displayName?.split(' ')[0]?.toUpperCase() || 'USER'}
                      </span>
                    </div>
                    <Link 
                      href="/profile" 
                      className="pl-6 hover:opacity-60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      PROFILE
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="pl-6 hover:opacity-60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      WISHLIST
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="pl-6 text-left hover:opacity-60 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      SIGN OUT
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsAuthOpen(true)
                    }}
                    className="hover:opacity-60"
                  >
                    LOGIN
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  )
}