'use client'

import { Space_Mono, Archivo_Black } from 'next/font/google'
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { toast } from 'react-hot-toast'
import Footer from '@/components/Footer'
import { validateEmail, validateMessage } from '@/lib/validation'

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

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In the Contact component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!validateMessage(formData.message)) {
      toast.error('Message must be between 10 and 1000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      // Add rate limiting check
      const now = new Date()
      const lastSubmission = localStorage.getItem('lastContactSubmission')
      
      if (lastSubmission && now.getTime() - new Date(lastSubmission).getTime() < 300000) { // 5 minutes
        toast.error('Please wait a few minutes before sending another message')
        return
      }

      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'unread'
      })

      // Store submission time
      localStorage.setItem('lastContactSubmission', now.toISOString())

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      toast.success('Message sent successfully!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update form button to show loading state
  return (
    <main className="min-h-screen bg-black">
      <div className="px-8 mb-24">
        <div className="max-w-screen-xl mx-auto pt-32">
          <h1 className={`${archivo.className} text-5xl text-white mb-16`}>GET IN TOUCH</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label htmlFor="name" className={`${spaceMono.className} block text-white/60`}>
                    NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/20 text-white p-4 outline-none focus:border-white/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="email" className={`${spaceMono.className} block text-white/60`}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/20 text-white p-4 outline-none focus:border-white/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="subject" className={`${spaceMono.className} block text-white/60`}>
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/20 text-white p-4 outline-none focus:border-white/50 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="message" className={`${spaceMono.className} block text-white/60`}>
                    MESSAGE
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full bg-white/5 border-2 border-white/20 text-white p-4 outline-none focus:border-white/50 transition-colors"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`${spaceMono.className} w-full bg-white text-black py-5 
                    hover:bg-white/90 transition-colors disabled:bg-white/50 
                    disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className={`${spaceMono.className} space-y-16`}>
              <div className="space-y-8">
                <h2 className="text-white text-xl">BUSINESS HOURS</h2>
                <div className="space-y-4 text-white/60">
                  <p>Monday - Friday: 9am - 6pm</p>
                  <p>Saturday: 10am - 4pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-white text-xl">LOCATION</h2>
                <div className="space-y-4 text-white/60">
                  <p>MD Plaza</p>
                  <p>VIP Road, Zirakpur</p>
                  <p>Mohali, Punjab 140603</p>
                  <p>India</p>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-white text-xl">CONNECT</h2>
                <div className="space-y-4 text-white/60">
                  <p>Phone: +91 8360138347</p>
                  <p>Email: theframedarchive@gmail.com</p>
                  <div className="flex gap-4">
                    <a href="https://instagram.com/theframedarchive" target="_blank" className="hover:text-white transition-colors">ig: @theframedarchive</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer theme="dark" background="dark" />
    </main>
  )
}