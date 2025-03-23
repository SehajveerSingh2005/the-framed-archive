'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { formatPrice } from '@/data/pricing'
import { toast } from 'react-hot-toast'
import { validateCartItem } from '@/lib/cartSecurity'

// Update the Order type to include cancelledAt
type Order = {
  id: string
  userId: string
  items: any[]
  total: number
  shippingInfo: any
  paymentId: string
  status: string
  orderDate: Timestamp
  cancelledAt?: Timestamp
}

const canCancelOrder = (orderDate: Timestamp, status: string) => {
  const now = new Date()
  const orderDateTime = orderDate.toDate()
  const hoursSinceOrder = (now.getTime() - orderDateTime.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceOrder <= 48 && status !== 'shipped' && status !== 'delivered' && status !== 'cancelled'
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders')
        const q = query(ordersRef, orderBy('orderDate', 'desc'))
        const querySnapshot = await getDocs(q)
        const orders = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            items: data.items.map((item: any) => validateCartItem(item))
          }
        }) as Order[]
        
        setOrders(orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      })
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast.success('Order status updated')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) {
        toast.error('Order not found')
        return
      }

      if (!canCancelOrder(order.orderDate, order.status)) {
        toast.error('This order cannot be cancelled')
        return
      }

      const orderRef = doc(db, 'orders', orderId)
      const updateData = {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancelledBy: 'admin'
      }

      await updateDoc(orderRef, updateData)

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData } 
          : order
      ))
      
      toast.success('Order cancelled successfully')
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      {orders.map(order => (
        <div key={order.id} className="bg-white p-6 space-y-4">
          <div className="flex justify-between items-start text-black">
            <div>
              <p className="font-bold">Order #{order.id}</p>
              <p className="text-sm text-gray-500">
                {order.orderDate.toDate().toLocaleDateString()}  {/* Convert Timestamp to Date */}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="border p-2 text-black"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {canCancelOrder(order.orderDate, order.status) && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="border-t pt-4 text-black">
            <p className="font-bold mb-2">Customer Details</p>
            <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
            <p>{order.shippingInfo.email}</p>
            <p>{order.shippingInfo.phone}</p>
            <p>{order.shippingInfo.address}</p>
            <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pinCode}</p>
          </div>

          <div className="border-t pt-4 text-black">
            <p className="font-bold mb-2">Items</p>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <div>
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.printType} - {item.variant} - {item.size} × {item.quantity}
                  </p>
                </div>
                <p>₹{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between text-black">
            <p className="font-bold">Total</p>
            <p className="font-bold">₹{formatPrice(order.total)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}