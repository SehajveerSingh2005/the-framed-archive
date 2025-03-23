'use client'

import { useState, useCallback, useEffect } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, addDoc } from 'firebase/firestore'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    description: '',
    themes: [] as string[],
    images: {
      1: '',
      2: '',
      3: '',
      4: ''
    },
    featured: false,
    available: true
  })
  
  const [folderName, setFolderName] = useState('')

  const generateImagePaths = (folder: string) => {
    const cleanFolder = folder.trim()
    if (!cleanFolder) return { 1: '', 2: '', 3: '', 4: '' }
    
    return {
      1: `/products/${cleanFolder}/1.png`,
      2: `/products/${cleanFolder}/2.png`,
      3: `/products/${cleanFolder}/3.png`,
      4: `/products/${cleanFolder}/4.png`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'products'), product)
      alert('Product added successfully!')
      setProduct({
        name: '',
        slug: '',
        description: '',
        themes: [],
        images: {
          1: '',
          2: '',
          3: '',
          4: ''
        },
        featured: false,
        available: true
      })
      setFolderName('')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    }
  }

  const generateSlug = (name: string) => {
    return name.trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
  }

                    // Add debounced folder name update
                    const debouncedUpdateFolder = useCallback((newFolder: string) => {
                      const timeoutId = setTimeout(() => {
                        setFolderName(newFolder)
                        setProduct(prev => ({
                          ...prev,
                          images: generateImagePaths(newFolder)
                        }))
                      }, 300) // Wait 300ms before updating
                    
                      return () => clearTimeout(timeoutId)
                    }, [])
  
  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
    }
  }, [router])

  if (!user) return null


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
                onChange={(e) => {
                  const newName = e.target.value
                  setProduct(prev => ({
                    ...prev, 
                    name: newName,
                    slug: generateSlug(newName)
                  }))
                }}
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Slug (Auto-generated)</label>
              <input
                type="text"
                value={product.slug}
                onChange={(e) => setProduct(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
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
                {[
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
                ].map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => {
                      setProduct(prev => ({
                        ...prev,
                        themes: prev.themes.includes(theme)
                          ? prev.themes.filter(t => t !== theme)
                          : [...prev.themes, theme]
                      }))
                    }}
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

            <div className="space-y-4">
              <label className="text-sm text-white/60">Images Folder Name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => {
                  const newFolder = e.target.value
                  debouncedUpdateFolder(newFolder)
                }}
                placeholder="e.g., Junkie Jordans"
                className="w-full p-4 bg-[#111] border border-white/10 focus:border-white outline-none text-white"
                required
              />
              <div className="space-y-2 mt-4">
                <p className="text-sm text-white/60">Generated Paths:</p>
                {Object.entries(product.images).map(([key, path]) => (
                  <div key={key} className="text-white/80 text-sm font-mono">
                    {path}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) => setProduct(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5"
                />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={(e) => setProduct(prev => ({ ...prev, available: e.target.checked }))}
                  className="w-5 h-5"
                />
                <span>Available</span>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-white text-black hover:bg-black hover:text-white border border-white transition-colors"
            >
              ADD PRODUCT
            </button>
          </form>
          
          {/* Image Preview Section */}
          <div className="lg:w-1/2">
            <h2 className={`${archivo.className} text-2xl mb-6`}>IMAGE PREVIEWS</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.images).map(([key, path]) => (
                <div key={key} className="space-y-2">
                  <p className="text-sm text-white/60">Image {key}</p>
                  {path ? (
                    <div className="relative aspect-[3/4] w-full overflow-hidden border border-white/20 rounded-sm">
                      <Image 
                        src={path}
                        alt={`Product image ${key}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (!parent) return;
                          
                          target.style.display = 'none';
                          parent.innerHTML = `
                            <div class="absolute inset-0 flex items-center justify-center bg-[#111]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-12 h-12 text-white/20">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full bg-[#111] border border-white/20 rounded-sm flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12 text-white/20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        router.push('/')
        return
      }

      try {
        await user.getIdToken(true)
        
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })

        const data = await response.json()
        
        if (!data.isAdmin) {
          router.push('/')
          toast.error('Unauthorized access')
          return
        }
        
        setIsAdmin(true)
      } catch (error) {
        console.error('Admin verification error:', error)
        router.push('/')
        toast.error('Error verifying admin status')
      }
    }

    checkAdminStatus()
  }, [user, router])

  if (!isAdmin) return null
}