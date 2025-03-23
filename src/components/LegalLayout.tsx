import { Space_Mono, Archivo_Black } from 'next/font/google'
import Footer from './Footer'

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

export default function LegalLayout({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f1f1f1]">
      <div className="px-8 mb-24">
        <div className="max-w-screen-xl mx-auto pt-32">
          <h1 className={`${archivo.className} text-4xl mb-16 text-black`}>{title}</h1>
          <div className={`${spaceMono.className} prose prose-neutral max-w-none text-black prose-headings:text-black prose-p:text-black prose-li:text-black`}>
            {children}
          </div>
        </div>
      </div>
      <Footer theme="light" background="light" />
    </main>
  )
}