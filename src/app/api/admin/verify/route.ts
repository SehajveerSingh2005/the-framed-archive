import { NextResponse } from 'next/server'

const ADMIN_EMAILS = ['sehajveersingh2005@gmail.com']

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 })
    }

    const isAdmin = ADMIN_EMAILS.includes(email)

    if (isAdmin) {
      return NextResponse.json({ isAdmin: true })
    }

    return NextResponse.json({ isAdmin: false }, { status: 403 })
  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}