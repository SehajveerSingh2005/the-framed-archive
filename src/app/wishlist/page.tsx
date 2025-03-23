'use client'

import { Space_Mono, Archivo_Black } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs,doc, updateDoc, arrayRemove } from 'firebase/firestore'
import { ShoppingCart, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import LoadingScreen from '@/components/LoadingScreen'
import { handleAsyncError } from '@/lib/errorHandling'
import { motion } from 'framer-motion'

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

type Product = {
  id: string
  name: string
  slug: string
  images: {
    [key: string]: string
  }
  wishlistedBy?: string[]
}

// Update component
export default function WishlistPage() {
  const router = useRouter()
  const { user } = useAuth() // Replace auth.currentUser with useAuth hook
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Add auth redirect effect
  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('wishlistedBy', 'array-contains', user.uid))
        
        const items = await handleAsyncError(
          getDocs(q).then(snapshot => 
            snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          ),
          'Error fetching wishlist'
        ) as Product[]
        
        setWishlistItems(items)
      } catch (error) {
        toast.error('Failed to load wishlist')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user])

  // Remove the direct return and let the effect handle redirect
  if (loading) {
    return <LoadingScreen />
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const docRef = doc(db, 'products', productId)
      await updateDoc(docRef, {
        wishlistedBy: arrayRemove(user?.uid)
      })
      setWishlistItems(items => items.filter(item => item.id !== productId))
      toast.success('Removed from wishlist')
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="px-8 mb-24">
        <div className="max-w-screen-xl mx-auto pt-32">
          <div className={`${spaceMono.className} text-white`}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${archivo.className} text-4xl mb-12`}
            >
              MY WISHLIST
            </motion.h1>

            {loading ? (
              <p className="text-white/60">Loading...</p>
            ) : wishlistItems.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative"
                  >
                    <Link href={`/product/${item.slug}`}>
                      <div className="relative aspect-[4/5] bg-[#111] mb-4 overflow-hidden">
                        <Image
                          src={Object.values(item.images)[0]}
                          alt={item.name}
                          fill
                          loading={index <= 1 ? "eager" : "lazy"}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={85}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h3 className={`${archivo.className} text-lg mb-4 transition-colors duration-300 group-hover:text-white/60`}>
                        {item.name}
                      </h3>
                    </Link>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex gap-3"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-white border border-white hover:bg-white hover:text-black transition-all duration-300"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">View Product</span>
                      </Link>
                      
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-3 border border-white/20 text-white/60 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16 space-y-8"
              >
                <Heart className="w-16 h-16 mx-auto text-white/30" />
                <div className="space-y-4">
                  <p className="text-white/60">Your wishlist is empty</p>
                  <Link 
                    href="/products" 
                    className="inline-block py-4 px-8 border border-white hover:bg-white hover:text-black transition-colors"
                  >
                    EXPLORE THE ARCHIVE
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer theme="dark" background="dark" />
    </main>
  )
}