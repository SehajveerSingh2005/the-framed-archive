'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import ProductOptions from '@/components/ProductOptions'
import { sizes, printTypes } from '@/data/pricing'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'
import { db } from '@/lib/firebase/config'
import { query, where, getDocs,addDoc, collection, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useAuth } from '@/contexts/AuthContext'
import { Star, Trash2, Heart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

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

type Review = {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

type Product = {
  id: string
  name: string
  description: string
  details: string[]
  images: {
    [key: string]: string
  }
  themes: string[]
  reviews?: Review[]
  wishlistedBy?: string[]
}

export default function ProductPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPrintType, setSelectedPrintType] = useState('Poster')
  const [selectedVariant, setSelectedVariant] = useState('Standard')
  const [selectedSize, setSelectedSize] = useState('A4')
  const [isMobile, setIsMobile] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Add error boundaries
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!slug) throw new Error('Product slug is required')
        
        // Check cache first
        const cachedProduct = sessionStorage.getItem(`product-${slug}`)
        if (cachedProduct) {
          const parsedProduct = JSON.parse(cachedProduct)
          setProduct(parsedProduct)
          setLoading(false)
          return
        }
        
        const productsRef = collection(db, 'products')
        const q = query(productsRef, where('slug', '==', slug))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const productData = querySnapshot.docs[0].data()
          const productWithDetails = {
            id: querySnapshot.docs[0].id,
            ...productData,
            details: productData.details || [
              'Poster Print: Premium 300 GSM Matte Paper',
              'Canvas Print: 380 GSM Cotton Canvas',
              'Archival Quality Pigment-Based Inks',
              'UV-Resistant Coating',
              'Color-Calibrated Production',
              'Quality Checked Before Shipping'
            ]
          } as Product
        
        // Cache the product data
        sessionStorage.setItem(`product-${slug}`, JSON.stringify(productWithDetails))
        setProduct(productWithDetails)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching product:', error)
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return
      
      try {
        const reviewsRef = collection(db, 'reviews')
        const q = query(reviewsRef, where('productId', '==', product.id))
        const querySnapshot = await getDocs(q)
        
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Review[]
        
        setReviews(reviewsData)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }
  
    fetchReviews()
  }, [product?.id])

  useEffect(() => {
    if (user && product) {
      const checkWishlist = async () => {
        const docRef = doc(db, 'products', product.id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const wishlistedBy = docSnap.data().wishlistedBy || []
          setIsWishlisted(wishlistedBy.includes(user.uid))
        }
      }
      checkWishlist()
    }
  }, [user, product])
  
  const getPrice = () => {
    const sizeCode = sizes[selectedSize as keyof typeof sizes]
    const printType = printTypes[selectedPrintType as keyof typeof printTypes]
    const variant = printType.variants[selectedVariant as keyof typeof printType['variants']]
    return variant[sizeCode as keyof typeof variant]
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black">
        <div className="flex justify-center items-center h-screen text-white">
          <p>Product not found</p>
        </div>
      </main>
    )
  }

  const productWithPrice = {
    ...product,
    price: getPrice(),
    printType: selectedPrintType,
    variant: selectedVariant,
    size: selectedSize
  }

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      return
    }
  
    try {
      const docRef = doc(db, 'products', product.id)
      if (isWishlisted) {
        await updateDoc(docRef, {
          wishlistedBy: arrayRemove(user.uid)
        })
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await updateDoc(docRef, {
          wishlistedBy: arrayUnion(user.uid)
        })
        setIsWishlisted(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        productId: product?.id,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'reviews'), reviewData)
      
      setReviews([...reviews, {
        ...reviewData,
        id: Math.random().toString(),
        createdAt: new Date()
      }])
      
      setNewReview({ rating: 5, comment: '' })
      toast.success('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string, reviewUserId: string) => {
    if (!user || user.uid !== reviewUserId) {
      toast.error('You can only delete your own reviews')
      return
    }
  
    try {
      await deleteDoc(doc(db, 'reviews', reviewId))
      setReviews(reviews.filter(review => review.id !== reviewId))
      toast.success('Review deleted successfully')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="px-8 mb-24">
        <div className="max-w-screen-xl mx-auto pt-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/products" 
              className={`${spaceMono.className} text-sm hover:opacity-60 flex items-center gap-2 text-white mb-16`}
            >
              <span>←</span>
              <span>BACK TO THE ARCHIVE</span>
            </Link>
          </motion.div>

          <section className="pb-16">
            <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-16">
              {/* Product Images */}
              <div className="relative">
                {isMobile ? (
                  <div className="w-full aspect-[4/5] bg-[#111]">
                    <Swiper
                      modules={[Pagination]}
                      pagination={{ clickable: true }}
                      loop={true}
                      className="h-full"
                    >
                      {Object.values(product.images).map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index < 2}
                            loading={index < 2 ? "eager" : "lazy"}
                            sizes="100vw"
                            quality={85}
                            onLoad={(event) => {
                              const img = event.target as HTMLImageElement
                              img.classList.remove('opacity-0')
                            }}
                          />
                          
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  // In the desktop view section
                  <div className="space-y-8">
                    {Object.values(product.images).map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className="relative aspect-[4/5] bg-[#111]"
                      >
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover opacity-0"
                          priority={index < 2}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onLoad={(event) => {
                            const img = event.target as HTMLImageElement
                            img.classList.remove('opacity-0')
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <motion.div 
                className="sticky top-16 h-fit space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div>
                <div className="flex items-center justify-between">
                  <h1 className={`${archivo.className} text-4xl text-white`}>{product.name}</h1>
                  <button
                    onClick={handleWishlist}
                    className="text-white/60 hover:text-white transition-colors p-2"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
                  <p className={`${spaceMono.className} text-sm mt-2 text-white opacity-80`}>
                    {product.themes.join(', ')}
                  </p>
                </div>

                <ProductOptions 
                  product={productWithPrice}
                  selectedPrintType={selectedPrintType}
                  setSelectedPrintType={setSelectedPrintType}
                  selectedVariant={selectedVariant}
                  setSelectedVariant={setSelectedVariant}
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                />

                <motion.div 
                  className={`${spaceMono.className} space-y-8 text-white opacity-80`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <p className="leading-relaxed">{product.description}</p>
                  
                  <div>
                    <h2 className="font-bold mb-4">DETAILS</h2>
                    <ul className="space-y-2">
                      {product.details.map((detail, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        >
                          {detail}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
      <section className="max-w-screen-xl mx-auto px-8 text-white">
    <h2 className={`${archivo.className} text-3xl mb-8`}>REVIEWS</h2>
    
    {/* Review Form */}
    {user && (
      <form onSubmit={handleReviewSubmit} className="mb-12 space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
              className={star <= newReview.rating ? 'text-yellow-400' : 'text-gray-400'}
            >
              <Star className="w-6 h-6" fill={star <= newReview.rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        
        <textarea
          value={newReview.comment}
          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
          placeholder="Write your review..."
          className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
          rows={4}
          required
        />
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-white text-black hover:bg-black hover:text-white border border-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    )}
    
    {/* Reviews List */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="border-b border-white/10 pb-8">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      fill={i < review.rating ? '#FBBF24' : 'none'}
                      stroke={i < review.rating ? '#FBBF24' : 'currentColor'}
                    />
                  ))}
                </div>
                <p className={`${spaceMono.className} text-sm`}>{review.userName}</p>
                <p className="text-sm text-white/60">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <p className="text-white/80 flex-grow">{review.comment}</p>
              {user && user.uid === review.userId && (
                <button
                  onClick={() => handleDeleteReview(review.id, review.userId)}
                  className="text-white/60 hover:text-red-500 transition-colors p-1"
                  aria-label="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-white/60">No reviews yet. Be the first to review this product!</p>
      )}
    </div>
  </section>

  <Footer theme='dark' background='dark' />
  </main>
  )
}
