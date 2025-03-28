'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Space_Mono, Archivo_Black } from 'next/font/google';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

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
  id: string;
  name: string;
  slug: string;
  description: string;
  images: {
    [key: string]: {
      large: string;
      medium: string;
      small: string;
    }
  };
  available: boolean;
  featured?: boolean;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const heroControls = useAnimation();

  // Handle initial animations
  useEffect(() => {
    if (imageLoaded) {
      setContentReady(true);
      const sequence = async () => {
        await heroControls.start("animate");
      };
      sequence();
    }
  }, [imageLoaded, heroControls]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setFeaturedProducts(products.filter(product => product.images));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Animation variants
  const heroVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const heroImageVariants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 1.2,
        ease: "easeOut"
      } 
    }
  };
  
  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#000000]">
      <AnimatePresence mode="wait">
        <motion.section 
          key="hero"
          variants={heroVariants}
          initial="initial"
          animate={heroControls}
          className="h-screen flex flex-col justify-center relative overflow-hidden bg-black text-white px-8"
        >
          <motion.div 
            variants={heroImageVariants}
            className="absolute inset-0"
          >
            <Image
              src="/images/hero/hero_2.jpg"
              alt="Abstract Art Texture"
              fill
              className="object-cover object-center opacity-100"
              priority
              sizes="100vw"
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>

          {contentReady && (
            <motion.div 
              variants={contentVariants}
              className="max-w-screen-xl mx-auto w-full relative z-10"
            >
              <motion.p 
                variants={contentVariants}
                className={`${spaceMono.className} text-sm mb-8`}
              >
                THE FRAMED ARCHIVE
              </motion.p>
              <motion.h1 
                variants={contentVariants}
                className={`${archivo.className} text-6xl md:text-[120px] font-bold leading-none tracking-tight mb-8`}
              >
                ART THAT
                <br />
                SPEAKS
              </motion.h1>
              <motion.div 
                variants={contentVariants}
                className="flex justify-between items-end"
              >
                <p className={`${spaceMono.className} max-w-md text-lg font-light`}>
                  Curated collection of contemporary art prints and canvas pieces.
                </p>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link 
                    href="/products"
                    className={`${spaceMono.className} bg-white text-black px-8 py-4 hover:bg-black hover:text-white transition-colors`}
                  >
                    BROWSE→
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* Featured Products section remains the same */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 px-8 bg-black text-white"
      >
        <div className="max-w-screen-xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-16"
          >
            <h2 className={`${archivo.className} text-3xl font-bold`}>FEATURED WORKS</h2>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/products" className={`${spaceMono.className} underline`}>
                View All
              </Link>
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1 
                }}
              >
                <Link 
                  href={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] mb-4 bg-gray-900">
                    {product.images && (
                      <Image
                        src={
                          (product.images[1]?.medium || 
                           product.images[2]?.medium || 
                           '/images/placeholder.jpg')
                        }
                        alt={product.name}
                        fill
                        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex justify-between items-start"
                  >
                    <h3 className={`${archivo.className} text-lg font-medium`}>{product.name}</h3>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Footer theme='light' />
    </main>
  );
}