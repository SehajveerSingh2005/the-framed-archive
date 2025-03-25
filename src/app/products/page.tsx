'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import ProductErrorBoundary from '@/components/ProductErrorBoundary'
import LoadingScreen from '@/components/LoadingScreen'
import { ArrowUp } from 'lucide-react'
import { Grid2X2, LayoutList } from 'lucide-react'

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

// Update the Product type to match the actual structure
type Product = {
  id: string
  name: string
  slug: string
  description: string
  images: {
    [key: string]: {
      large: string;
      medium: string;
      small: string;
    }
  }
  themes: string[]
}

export default function ProductsPage() {
  return (
    <ProductErrorBoundary>
      <ProductsContent />
    </ProductErrorBoundary>
  )
}

function ProductsContent() {
  // Change initial state to false for list view by default
  const [isGridView, setIsGridView] = useState(false)
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const loadMoreRef = useRef(null)
  const productsPerPage = 9

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const productsRef = collection(db, 'products')
        const snapshot = await getDocs(productsRef)
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[]
        
        setProducts(fetchedProducts)
        setFilteredProducts(fetchedProducts)
        setVisibleProducts(fetchedProducts.slice(0, productsPerPage))
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Handle filters
  useEffect(() => {
    const newFilteredProducts = products.filter(product => 
      (selectedCategory === 'ALL' || product.themes.includes(selectedCategory)) &&
      (searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    setFilteredProducts(newFilteredProducts)
    setPage(1)
    setVisibleProducts(newFilteredProducts.slice(0, productsPerPage))
    setHasMore(newFilteredProducts.length > productsPerPage)
  }, [selectedCategory, searchQuery, products])

  // Handle pagination
  useEffect(() => {
    const startIndex = 0
    const endIndex = page * productsPerPage
    setVisibleProducts(filteredProducts.slice(startIndex, endIndex))
    setHasMore(filteredProducts.length > endIndex)
  }, [page, filteredProducts])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return
  
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          setPage(prevPage => prevPage + 1)
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '500px'
      }
    )
  
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  // Back to top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="px-8">
        <div className="max-w-screen-xl mx-auto pt-32 pb-24">
          <div className={`${spaceMono.className} text-white`}>
            <h1 className={`${archivo.className} text-4xl md:text-6xl mb-4`}>THE ARCHIVE</h1>
            <p className={`${spaceMono.className} text-white/60 text-lg mb-16 max-w-2xl`}>
              A curated collection of moments captured in time, where each frame tells its own story
            </p>

            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
              <div className="w-full md:w-64 flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
                />
                <button
                  onClick={() => setIsGridView(!isGridView)}
                  className="text-white/60 hover:text-white transition-colors md:hidden"
                  aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
                >
                  {isGridView ? <LayoutList size={24} /> : <Grid2X2 size={24} />}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {['ALL', ...new Set(products.flatMap(p => p.themes))].map((category, index) => (
                  <button
                    key={`${category}-${index}`}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-4 py-2 border uppercase ${
                      selectedCategory === category 
                        ? 'border-white text-white' 
                        : 'border-white/20 text-white/60 hover:border-white/60'
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={selectedCategory + searchQuery + (isGridView ? 'grid' : 'list')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-8 ${isGridView ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 lg:grid-cols-3`}
            >
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={`product-${product.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ 
                    once: true, 
                    margin: "200px"
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1
                  }}
                >
                  <Link href={`/product/${product.slug}`} className="group block">
                    <div className="relative aspect-[4/5] mb-4 bg-[#111]">
                      <div className="absolute inset-0 bg-gradient-to-r from-black to-zinc-900 animate-pulse" />
                      <Image
                        src={
                          (product.images[2]?.medium || 
                           product.images[1]?.medium ||
                           '/images/placeholder.jpg')
                        }
                        alt={product.name}
                        fill
                        className="object-cover opacity-0 transition-opacity duration-300"
                        onLoad={(event) => {
                          const img = event.target as HTMLImageElement
                          img.classList.remove('opacity-0')
                        }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                      />
                      <Image
                        src={
                          (product.images[1]?.medium || 
                           product.images[2]?.medium ||
                           '/images/placeholder.jpg')
                        }
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={85}
                        className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`${
                          isGridView ? 'text-sm' : 'text-lg'
                        } text-white line-clamp-2`}>{product.name}</h3>
                        <p className={`${
                          isGridView ? 'text-xs' : 'text-sm'
                        } opacity-60 line-clamp-1`}>{product.themes.join(', ')}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {!loading && visibleProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl opacity-60">No products match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasMore && <div ref={loadMoreRef} className="h-10" />}
      <Footer theme="dark" background="dark" />
      
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0 }}
        animate={{ opacity: showBackToTop ? 1 : 0 }}
        className="fixed bottom-12 right-12 z-50 group"
      >
        <div className="relative flex items-center justify-center w-16 h-16">
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5" 
            style={{ 
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }} 
          />
          <ArrowUp 
            size={42} 
            className="text-white/60 group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-0.5" 
          />
        </div>
      </motion.button>
    </main>
  )
}