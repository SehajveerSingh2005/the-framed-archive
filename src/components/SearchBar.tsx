'use client'

import { Space_Mono } from 'next/font/google'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});


export default function SearchBar() {
  return (
    <div className="w-full max-w-xl mx-auto px-8 flex items-center">
      <div className="relative w-full">
        <input 
          type="search"
          placeholder="SEARCH THE ARCHIVE..."
          className={`${spaceMono.className} w-full bg-white border-1 border-black px-4 py-2 outline-none text-black placeholder:text-black/50 focus:bg-black focus:text-white focus:placeholder:text-white/50 transition-colors uppercase text-sm`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono">⌕</span>
      </div>
    </div>
  )
}