import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createHash } from 'crypto'
import { type CartItem } from '@/lib/cartSecurity'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const validateCartItem = (item: CartItem) => {
  const { basePrice: _basePrice, ...itemWithoutBasePrice } = item
  const itemString = JSON.stringify(itemWithoutBasePrice)
  const hash = createHash('sha256').update(itemString).digest('hex')
  
  return {
    ...item,
    hash
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { amount, orderId, items } = body

  // Validate items on server side
  const validatedItems = items.map((item: CartItem) => validateCartItem(item))

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: orderId,
    notes: {
      items: JSON.stringify(validatedItems)
    }
  }

  try {
    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    )
  }
}