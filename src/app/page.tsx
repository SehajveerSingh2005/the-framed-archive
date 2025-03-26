'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Space_Mono, Archivo_Black } from 'next/font/google';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { motion, useAnimation } from 'framer-motion';

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
  const [pageLoaded, setPageLoaded] = useState(false);
  const heroControls = useAnimation();

  useEffect(() => {
    // Set page as loaded and trigger hero animations
    setPageLoaded(true);
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      heroControls.start("animate");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [heroControls]);

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

  // Animation variants for hero section
  const heroVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8 } }
  };
  
  const heroImageVariants = {
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.2 } }
  };
  
  const titleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 } }
  };
  
  const headingVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.7 } }
  };
  
  const ctaVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.9 } }
  };

  return (
    <main className="min-h-screen bg-[#000000]">
      <motion.section 
        variants={heroVariants}
        initial="initial"
        animate={heroControls}
        className="h-screen flex flex-col justify-center relative overflow-hidden bg-black text-white px-8"
      >
        <motion.div 
          variants={heroImageVariants}
          initial="initial"
          animate={heroControls}
          className="absolute inset-0"
        >
          <Image
            src="/images/hero/hero_2.jpg"
            alt="Abstract Art Texture"
            fill
            className="object-cover object-center opacity-100"
            priority
            sizes="100vw"
            onLoad={() => heroControls.start("animate")}
          />
        </motion.div>
        <div className="max-w-screen-xl mx-auto w-full relative z-10">
          <motion.p 
            variants={titleVariants}
            initial="initial"
            animate={heroControls}
            className={`${spaceMono.className} text-sm mb-8`}
          >
            THE FRAMED ARCHIVE
          </motion.p>
          <motion.h1 
            variants={headingVariants}
            initial="initial"
            animate={heroControls}
            className={`${archivo.className} text-6xl md:text-[120px] font-bold leading-none tracking-tight mb-8`}
          >
            ART THAT
            <br />
            SPEAKS
          </motion.h1>
          <motion.div 
            variants={ctaVariants}
            initial="initial"
            animate={heroControls}
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
        </div>
      </motion.section>

      {/* Featured Products - keeping original implementation */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 px-8 bg-black text-white"
      >
        {/* Rest of the featured products section remains unchanged */}
        {/* ... */}
      </motion.section>

      <Footer theme='light' />
    </main>
  );
}