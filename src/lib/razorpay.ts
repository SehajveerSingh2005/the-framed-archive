declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export const createOrder = async (amount: number, orderId: string, items: any[]) => {
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId,
        items,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export const initializeRazorpayCheckout = async (options: any) => {
  const res = await loadRazorpayScript()
  if (!res) {
    alert('Razorpay SDK failed to load')
    return
  }

  const rzp = new window.Razorpay(options)
  return rzp
}