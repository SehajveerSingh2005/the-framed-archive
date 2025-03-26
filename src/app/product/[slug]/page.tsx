import { Metadata, ResolvingMetadata } from 'next'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import ProductPageClient from '@/components/ProductPageClient'
import { Product } from '@/types/product'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

// Update the Props type to match Next.js PageProps constraint
type Props = {
  params: Promise<{ slug: string }> 
  searchParams?: { [key: string]: string | string[] | undefined }
}

type ProductData = {
  name: string
  description: string
  images: {
    [key: string]: {
      large: string
      medium: string
      small: string
    }
  }
  themes: string[]
  details?: string[]
  slug: string
}

async function getProduct(slug: string) {
  const productsRef = collection(db, 'products')
  const q = query(productsRef, where('slug', '==', slug))
  const querySnapshot = await getDocs(q)
  return querySnapshot
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params first
  const params = await Promise.resolve(props.params)
  const querySnapshot = await getProduct(params.slug)
  
  if (querySnapshot.empty) {
    return {
      title: 'Product Not Found | The Framed Archive',
    }
  }

  const product = querySnapshot.docs[0].data() as ProductData

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: Object.values(product.images).map(img => img.large),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'INR',
      url: `https://theframedarchive.com/product/${params.slug}`,
    },
    brand: {
      '@type': 'Brand',
      name: 'The Framed Archive'
    },
    additionalProperty: product.details?.map(detail => ({
      '@type': 'PropertyValue',
      name: 'Product Detail',
      value: detail
    }))
  }

  return {
    metadataBase: new URL('https://theframedarchive.com'),
    title: `${product.name} | The Framed Archive`,
    description: product.description,
    openGraph: {
      title: `${product.name} | The Framed Archive`,
      description: product.description,
      images: Object.values(product.images).map(image => ({
        url: image.large,
        width: 1200,
        height: 1500,
      })),
      type: 'website',
      locale: 'en_US',
      siteName: 'The Framed Archive',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | The Framed Archive`,
      description: product.description,
      images: Object.values(product.images).map(img => img.large),
    },
    alternates: {
      canonical: `https://theframedarchive.com/product/${params.slug}`,
    },
    other: {
      'application-name': 'The Framed Archive',
      'msapplication-TileColor': '#000000',
      'theme-color': '#000000',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function ProductPage(props: Props) {
  // Await params first
  const params = await Promise.resolve(props.params)
  const querySnapshot = await getProduct(params.slug)
  
  if (querySnapshot.empty) {
    return (
      <main className="min-h-screen bg-black">
        <div className="flex justify-center items-center h-screen text-white">
          <p>Product not found</p>
        </div>
      </main>
    )
  }

  const productData = querySnapshot.docs[0].data() as ProductData
  const product: Product = {
    id: querySnapshot.docs[0].id,
    name: productData.name,
    description: productData.description,
    images: productData.images,
    themes: productData.themes,
    slug: productData.slug,
    details: productData.details || [
      'Poster Print: Premium 300 GSM Matte Paper',
      'Canvas Print: 380 GSM Cotton Canvas',
      'Archival Quality Pigment-Based Inks',
      'UV-Resistant Coating',
      'Color-Calibrated Production',
      'Quality Checked Before Shipping'
    ]
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: Object.values(product.images).map(img => img.large),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '0',
      priceCurrency: 'INR',
      url: `https://theframedarchive.com/product/${product.slug}`,
    },
    brand: {
      '@type': 'Brand',
      name: 'The Framed Archive'
    },
    additionalProperty: product.details?.map(detail => ({
      '@type': 'PropertyValue',
      name: 'Product Detail',
      value: detail
    }))
  }

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient initialProduct={product} />
    </>
  )
}