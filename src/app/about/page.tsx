'use client'

import { Space_Mono, Archivo_Black } from 'next/font/google'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

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

export default function About() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    const video = document.querySelector('video')
    if (video) {
      video.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true)
      })
    }
  }, [])

  return (
    <main className="min-h-screen">
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoLoaded ? 1 : 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 -z-10"
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/about.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>

        {isVideoLoaded ? (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex items-center"
            >
              <div className="w-full max-w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 py-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h1 className={`${archivo.className} text-[12vw] md:text-[6vw] leading-none text-white mb-8`}>
                    THE FRAMED ARCHIVE
                  </h1>
                  <p className={`${spaceMono.className} text-xl text-white/80`}>EST. 2025</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className={`${spaceMono.className} text-white/80 space-y-12 text-lg md:text-xl md:text-right self-end`}
                >
                  <p className="hover:text-white transition-colors duration-300">Curating beauty.</p>
                  <p className="hover:text-white transition-colors duration-300">Framing moments.</p>
                  <p className="hover:text-white transition-colors duration-300">Art for all spaces.</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="min-h-screen flex items-center mb-24"
            >
              <div className="w-full max-w-[90%] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                  <div>
                    <h2 className={`${archivo.className} text-[8vw] md:text-[4vw] text-white/60 sticky top-24`}>WHO WE ARE</h2>
                  </div>
                  
                  <div className={`${spaceMono.className} space-y-40`}>
                    <div className="group">
                      <div className="flex items-center gap-4 mb-12">
                        <span className="text-white/40 text-5xl font-bold">01</span>
                        <p className="text-3xl text-white group-hover:text-white transition-colors duration-300">
                          Our Vision
                        </p>
                      </div>
                      <div className="pl-24 space-y-8">
                        <div className="h-px w-12 bg-white/30 group-hover:w-full group-hover:bg-white/50 transition-all duration-500"/>
                        <p className="leading-relaxed text-white/80 group-hover:text-white transition-colors duration-300 text-lg">
                          To transform everyday spaces into personal galleries, making art accessible to everyone who appreciates beauty.
                        </p>
                        <ul className="space-y-6 text-sm text-white/70 group-hover:text-white/90">
                          <li>Curated Collections</li>
                          <li>Timeless Pieces</li>
                          <li>Contemporary Aesthetics</li>
                        </ul>
                      </div>
                    </div>
    
                    <div className="group">
                      <div className="flex items-center gap-4 mb-12">
                        <span className="text-white/40 text-5xl font-bold">02</span>
                        <p className="text-3xl text-white group-hover:text-white transition-colors duration-300">
                          Our Process
                        </p>
                      </div>
                      <div className="pl-24 space-y-8">
                        <div className="h-px w-12 bg-white/30 group-hover:w-full group-hover:bg-white/50 transition-all duration-500"/>
                        <p className="leading-relaxed text-white/80 group-hover:text-white transition-colors duration-300 text-lg">
                          Each piece is carefully selected and printed using premium materials to ensure the highest quality reproduction.
                        </p>
                        <ul className="space-y-6 text-sm text-white/70 group-hover:text-white/90">
                          <li>Premium Materials</li>
                          <li>Quality Assurance</li>
                          <li>Careful Packaging</li>
                        </ul>
                      </div>
                    </div>
    
                    <div className="group">
                      <div className="flex items-center gap-4 mb-12">
                        <span className="text-white/40 text-5xl font-bold">03</span>
                        <p className="text-3xl text-white group-hover:text-white transition-colors duration-300">
                          Our Promise
                        </p>
                      </div>
                      <div className="pl-24 space-y-8">
                        <div className="h-px w-12 bg-white/30 group-hover:w-full group-hover:bg-white/50 transition-all duration-500"/>
                        <p className="leading-relaxed text-white/80 group-hover:text-white transition-colors duration-300 text-lg">
                          Quality art at prices that work for you, because we believe everyone deserves to live with art they love.
                        </p>
                        <ul className="space-y-6 text-sm text-white/70 group-hover:text-white/90">
                          <li>Affordable Pricing</li>
                          <li>Fast Delivery</li>
                          <li>Customer Satisfaction</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <Footer theme='dark' background='transparent'/>
          </>
        ) : (
          <LoadingScreen />
        )}
      </div>
    </main>
  )
}