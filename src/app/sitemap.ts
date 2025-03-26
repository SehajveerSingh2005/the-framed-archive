import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all products
  const productsRef = collection(db, 'products')
  const productsSnapshot = await getDocs(productsRef)
  const products = productsSnapshot.docs.map(doc => ({
    slug: doc.data().slug,
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  }))

  const baseUrl = 'https://theframedarchive.com'

  // Static routes with priorities
  const routes = [
    { route: '', priority: 1.0 },
    { route: '/products', priority: 0.9 },
    { route: '/about', priority: 0.7 },
    { route: '/contact', priority: 0.7 },
    { route: '/shipping', priority: 0.6 },
    { route: '/terms', priority: 0.5 },
    { route: '/privacy', priority: 0.5 },
  ].map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: page.priority,
  }))

  // Dynamic product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...routes, ...productRoutes]
}