'use client'

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

interface FooterProps {
  theme?: 'light' | 'dark'
  background?: 'light' | 'dark' | 'transparent'
  className?: string
}

export default function Footer({ theme = 'light', background = 'light', className = '' }: FooterProps) {
  const textColor = theme === 'light' ? 'text-black' : 'text-white'
  const borderColor = theme === 'light' ? 'border-black/10' : 'border-white/10'
  const textColorDim = theme === 'light' ? 'text-black/60' : 'text-white/60'
  const textColorDimmer = theme === 'light' ? 'text-black/40' : 'text-white/40'
  
  const getBgColor = () => {
    switch (background) {
      case 'light':
        return 'bg-[#f1f1f1]'
      case 'dark':
        return 'bg-black'
      case 'transparent':
        return 'bg-transparent'
      default:
        return 'bg-[#f1f1f1]'
    }
  }

  return (
    <footer className={`${spaceMono.className} border-t ${borderColor} ${getBgColor()} ${className}`}>
      <div className="max-w-[90%] mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="space-y-8">
            <h3 className={`${archivo.className} ${textColor} text-xl`}>THE FRAMED ARCHIVE</h3>
            <p className={`${textColorDim} text-sm`}>
              Premium art prints for everyone.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className={`${textColor} text-sm`}>EXPLORE</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/products" className={`${textColorDim} hover:${textColor} transition-colors`}>Shop</Link></li>
              <li><Link href="/about" className={`${textColorDim} hover:${textColor} transition-colors`}>About</Link></li>
              <li><Link href="/contact" className={`${textColorDim} hover:${textColor} transition-colors`}>Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className={`${textColor} text-sm`}>LEGAL</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className={`${textColorDim} hover:${textColor} transition-colors`}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={`${textColorDim} hover:${textColor} transition-colors`}>Terms of Service</Link></li>
              <li><Link href="/shipping" className={`${textColorDim} hover:${textColor} transition-colors`}>Shipping Info</Link></li>
              <li><Link href="/refunds" className={`${textColorDim} hover:${textColor} transition-colors`}>Refunds and Cancellations</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className={`${textColor} text-sm`}>CONNECT</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="https://instagram.com" target="_blank" className={`${textColorDim} hover:${textColor} transition-colors`}>Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" className={`${textColorDim} hover:${textColor} transition-colors`}>Twitter</a></li>
              <li><a href="mailto:hello@framedarchive.com" className={`${textColorDim} hover:${textColor} transition-colors`}>Email</a></li>
            </ul>
          </div>
        </div>
        <div className={`${textColorDimmer} text-sm`}>
          © {new Date().getFullYear()} The Framed Archive. All rights reserved.
        </div>
      </div>
    </footer>
  )
}