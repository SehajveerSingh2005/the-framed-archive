import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { toast } from 'react-hot-toast'

type OrderActionsProps = {
  orderId: string
  status: string
  deliveryDate?: Date
}

export default function OrderActions({ orderId, status, deliveryDate }: OrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    setIsLoading(true)
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        cancelledAt: new Date()
      })
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnRequest = async () => {
    if (!window.confirm('Do you want to request a return/replacement?')) return
    
    setIsLoading(true)
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        returnRequested: true,
        returnRequestedAt: new Date()
      })
      toast.success('Return request submitted')
    } catch (error) {
      toast.error('Failed to submit return request')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if order is eligible for return (within 7 days of delivery)
  const isReturnEligible = () => {
    if (!deliveryDate) return false
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(deliveryDate) > sevenDaysAgo
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Track Order - Always visible except for cancelled orders */}
      {status !== 'cancelled' && (
        <button
          onClick={() => window.open(`/track/${orderId}`, '_blank')}
          className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Track Order
        </button>
      )}

      {/* Cancel Order - Only for pending/processing orders */}
      {['pending', 'processing'].includes(status) && (
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-red-400"
        >
          {isLoading ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}

      {/* Return/Replace - Only for delivered orders within return window */}
      {status === 'delivered' && isReturnEligible() && (
        <button
          onClick={handleReturnRequest}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:bg-orange-400"
        >
          Request Return/Replacement
        </button>
      )}

      {/* Review - Only for delivered orders */}
      {status === 'delivered' && (
        <button
          onClick={() => window.open(`/review/${orderId}`, '_blank')}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Write Review
        </button>
      )}
    </div>
  )
}