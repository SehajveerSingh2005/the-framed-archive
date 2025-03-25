import { NextResponse } from 'next/server'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  })
}

const bucket = getStorage().bucket()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string
    const filename = formData.get('filename') as string

    if (!file || !productId || !filename) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const path = `products/${productId}/${filename}.png`
    
    await bucket.file(path).save(buffer, {
      metadata: {
        contentType: 'image/png'
      }
    })

    return NextResponse.json({ 
      success: true,
      path
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 })
  }
}