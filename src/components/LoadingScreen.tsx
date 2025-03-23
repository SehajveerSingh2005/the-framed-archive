import { Space_Mono } from 'next/font/google'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <h1 className={`${spaceMono.className} text-white text-xl`}>THE FRAMED ARCHIVE</h1>
    </div>
  )
}