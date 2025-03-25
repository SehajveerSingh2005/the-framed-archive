'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { db, storage } from '@/lib/firebase/config'
import { ref, uploadBytes } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import Image from 'next/image'

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

export default function AdminProducts() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState({
    name: '',
    description: '',
    slug: '',
    themes: [] as string[],
    wishlistedBy: [],
    images: {},
  })

  const predefinedThemes = [
    'minimalist',
    'automotive',
    'retro',
    'naturesque',
    'noir',
    'sneakers',
    'urban',
    'luxury',
    'street culture',
    'cinematic',
    'pop art',    
    'entertainment',
    'anime',     
    'abstract',   
    'iconic',
    'divine'
  ]
  
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    1: null,
    2: null,
    3: null,
    4: null
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImageFiles: { [key: string]: File } = {}
      
      // Get only the first 4 images if more are selected
      for (let i = 0; i < Math.min(e.target.files.length, 4); i++) {
        newImageFiles[i + 1] = e.target.files[i]
      }
      
      setImageFiles(newImageFiles)
    }
  }


  const generateImageUrls = (folderName: string) => {
    const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/products%2F${folderName}`
    const urls: { [key: string]: { [size: string]: string } } = {}

    for (let i = 1; i <= 4; i++) {
      urls[i] = {
        'large': `${baseUrl}%2F${i}_1500x1875.webp?alt=media`,
        'medium': `${baseUrl}%2F${i}_1000x1250.webp?alt=media`,
        'small': `${baseUrl}%2F${i}_400x500.webp?alt=media`
      }
    }

    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in')
      return
    }

    if (!imageFiles[1] || !imageFiles[2]) {
      toast.error('Please select at least 2 images')
      return
    }

    if (Object.keys(imageFiles).length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }

    try {
      setLoading(true)
      const toastId = toast.loading('Creating product...')

      // Create a folder name from the product name
      const folderName = product.name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Upload the image 4 times with different names
      for (let i = 1; i <= 4; i++) {
        const storageRef = ref(storage, `products/${folderName}/${i}.png`)
        await uploadBytes(storageRef, imageFiles[i]!)
      }

      // Generate image URLs
      const imageUrls = generateImageUrls(folderName)

      // Create product with all data including image URLs
      await addDoc(collection(db, 'products'), {
        name: product.name.trim(),
        description: product.description.trim(),
        slug: product.slug.trim(),
        themes: product.themes,
        wishlistedBy: [],
        images: imageUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      })

      // Reset form
      setProduct({
        name: '',
        description: '',
        slug: '',
        themes: [],
        wishlistedBy: [],
        images: {},
      })
      setImageFiles({
        1: null,
        2: null,
        3: null,
        4: null
      })

      toast.success('Product created successfully!', { id: toastId })
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = (theme: string) => {
    setProduct(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setProduct(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-screen-xl mx-auto px-8 py-32">
        <h1 className={`${archivo.className} text-4xl mb-12`}>ADD PRODUCT</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <form onSubmit={handleSubmit} className={`${spaceMono.className} space-y-8 lg:w-1/2`}>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Name</label>
              <input
                type="text"
                value={product.name}
                onChange={handleNameChange}
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Slug (Auto-generated)</label>
              <input
                type="text"
                value={product.slug}
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Description</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white h-32"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Themes</label>
              <div className="flex flex-wrap gap-2">
                {predefinedThemes.map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={`px-4 py-2 border ${
                      product.themes.includes(theme)
                        ? 'bg-white text-black'
                        : 'border-white/10 hover:border-white'
                    }`}
                  >
                    {theme.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Images (Select up to 4)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white
                  file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-white file:text-black
                  hover:file:bg-neutral-200"
                required
              />
              <div className="text-sm text-white/60 mt-2">
                Selected: {Object.keys(imageFiles).filter(key => imageFiles[key]).length} / 4 images
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black hover:bg-black hover:text-white 
                border border-white transition-colors disabled:bg-neutral-800 
                disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              {loading ? 'CREATING...' : 'ADD PRODUCT'}
            </button>
          </form>

          {/* Image Preview Section */}
          <div className="lg:w-1/2">
            <h2 className={`${archivo.className} text-2xl mb-6`}>IMAGE PREVIEWS</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <p className="text-sm text-white/60">Image {num}</p>
                  <div className="relative aspect-[3/4] w-full overflow-hidden border border-white/20">
                    {imageFiles[num] ? (
                      <Image 
                        src={URL.createObjectURL(imageFiles[num]!)}
                        alt={`Preview ${num}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-white/20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}