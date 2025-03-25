'use client'

import { useState, useEffect, useCallback } from 'react'
import { Space_Mono } from 'next/font/google'
import { sizes, printTypes, formatPrice } from '@/data/pricing'
import { toast } from 'react-hot-toast'
import { getSecureCart, secureCartStorage } from '@/lib/cartSecurity'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});


// Update Product type
type Product = {
  id: string
  name: string
  price: number
  description: string
  details: string[]
  images: {
    [key: string]: {
      large: string
      medium: string
      small: string
    }
  }
  themes: string[]
  printType: string
  variant: string
  size: string
}

type ProductOptionsProps = {
  product: Product
  selectedPrintType: string
  setSelectedPrintType: (type: string) => void
  selectedVariant: string
  setSelectedVariant: (variant: string) => void
  selectedSize: string
  setSelectedSize: (size: string) => void
}

// Add these imports at the top
import { useAuth } from '@/contexts/AuthContext'
import { getCart, updateCart } from '@/lib/firebase/cart'

export default function ProductOptions({ 
  product,
  selectedPrintType,
  setSelectedPrintType,
  selectedVariant,
  setSelectedVariant,
  selectedSize,
  setSelectedSize
}: ProductOptionsProps) {
  const { user } = useAuth()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const availableSizes = getAvailableSizes(selectedPrintType)
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0][0])
    }
  }, [selectedPrintType, setSelectedSize])

  const getAvailableSizes = useCallback((type: string) => {
    const printType = printTypes[type as keyof typeof printTypes]
    if (!printType) return []
    
    // Filter sizes based on variant availability
    const variantSizes = Object.keys(printType.variants[selectedVariant as keyof typeof printType.variants] || {})
    const availableSizes = printType.sizes.filter(size => variantSizes.includes(size))
    
    return Object.entries(sizes).filter(([_, code]) => availableSizes.includes(code))
  }, [selectedVariant]) 

  const getAvailableVariants = useCallback((type: string) => {
    return Object.keys(printTypes[type as keyof typeof printTypes]?.variants || {})
  }, [])

  const getPrice = useCallback(() => {
    const sizeCode = sizes[selectedSize as keyof typeof sizes]
    const printType = printTypes[selectedPrintType as keyof typeof printTypes]
    const variant = printType.variants[selectedVariant as keyof typeof printType['variants']]
    return variant[sizeCode as keyof typeof variant] || 0
  }, [selectedSize, selectedPrintType, selectedVariant])

  const handlePrintTypeChange = (type: string) => {
    setSelectedPrintType(type)
    const variants = getAvailableVariants(type)
    if (variants.length > 0) {
      setSelectedVariant(variants[0])
      const sizes = getAvailableSizes(type)
      if (sizes.length > 0) {
        setSelectedSize(sizes[0][0])
      }
    }
  }

  // Update handleAddToCart function
  const handleAddToCart = async () => {
    try {
      // Get the first image from the product images
      const firstImageKey = Object.keys(product.images)[0]
      const firstImage = product.images[firstImageKey]
  
      const newItem = {
        id: Date.now(),
        name: product.name,
        basePrice: getPrice(),
        price: getPrice(),
        quantity,
        printType: selectedPrintType,
        variant: selectedVariant,
        size: selectedSize,
        image: {
          large: firstImage.large,
          medium: firstImage.medium,
          small: firstImage.small
        }
      }
  
      if (user) {
        const currentCart = await getCart(user.uid)
        const updatedCart = [...currentCart, newItem]
        await updateCart(user.uid, updatedCart)
      } else {
        const cart = getSecureCart()
        secureCartStorage(cart ? [...cart, newItem] : [newItem])
      }
  
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success(`${product.name} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  return (
    <div className={`${spaceMono.className} space-y-6 sm:space-y-8`}>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-white opacity-60 text-sm sm:text-base">Print Type</label>
          <div className="relative">
            <select
              value={selectedPrintType}
              onChange={(e) => handlePrintTypeChange(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white text-black text-sm sm:text-base border border-white focus:border-white outline-none appearance-none"
            >
              {Object.keys(printTypes).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-white opacity-60 text-sm sm:text-base">Variant</label>
          <div className="relative">
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white text-black text-sm sm:text-base border border-white focus:border-white outline-none appearance-none"
            >
              {getAvailableVariants(selectedPrintType).map(variant => (
                <option key={variant} value={variant}>{variant}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-white opacity-60 text-sm sm:text-base">Size</label>
        <div className="grid grid-cols-2 gap-2">
          {getAvailableSizes(selectedPrintType).map(([size]) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-2.5 sm:py-3 border text-sm sm:text-base ${
                selectedSize === size 
                  ? 'bg-white text-black border-white' 
                  : 'border-white/20 text-white hover:border-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
        <div className="col-span-1 space-y-2">
          <label className="block text-white opacity-60 text-sm sm:text-base">Quantity</label>
          <div className="flex items-center border border-white h-10 sm:h-12">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="px-4 h-full text-white md:hover:bg-white md:hover:text-black transition-colors text-sm sm:text-base"
            >
              -
            </button>
            <span className="flex-1 text-center text-white text-sm sm:text-base">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
              className="px-4 h-full text-white md:hover:bg-white md:hover:text-black transition-colors text-sm sm:text-base"
            >
              +
            </button>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-white opacity-60 text-sm sm:text-base">Total Price</label>
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-black py-2.5 sm:py-3 mt-2 hover:bg-white/90 transition-colors text-sm sm:text-base"
          >
            ADD TO CART - ₹{formatPrice(getPrice() * quantity)}
          </button>
        </div>
      </div>
    </div>
  )
}
