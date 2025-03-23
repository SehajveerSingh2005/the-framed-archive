'use client'

import { Space_Mono, Archivo_Black } from 'next/font/google'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const archivo = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-8 py-32 text-center">
        <h1 className={`${archivo.className} text-4xl md:text-6xl mb-8`}>
          UNDER MAINTENANCE
        </h1>
        <div className={`${spaceMono.className} space-y-6 text-white/60`}>
          <p className="text-lg">
            We're currently migrating our image storage system to provide you with a better experience.
          </p>
          <p>
            The Framed Archive will be back soon with improved performance and reliability.
          </p>
          <p className="text-sm">
            Expected completion: 24-48 hours
          </p>
        </div>
      </div>
    </main>
  )
}
