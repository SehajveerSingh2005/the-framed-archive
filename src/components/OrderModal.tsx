import { motion, AnimatePresence } from 'framer-motion'
import { X, Truck, Package, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/data/pricing'
import { type Order } from '@/lib/firebase/orders'
import OrderActions from '@/components/OrderActions'
import { Space_Mono, Archivo_Black } from 'next/font/google'
import { Timestamp } from 'firebase/firestore'

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const archivo = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

type OrderModalProps = {
  order: Order 
  isOpen: boolean
  onClose: () => void
}

export default function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const getTrackingStatus = () => {
    const statuses = [
      { status: 'pending', label: 'Order Placed', done: true },
      { status: 'processing', label: 'Processing', done: order.status !== 'pending' },
      { status: 'shipped', label: 'Shipped', done: ['shipped', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', done: order.status === 'delivered' }
    ]

    return statuses
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#111] max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header remains the same */}
            <div className="p-8 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
              <h2 className={`${archivo.className} text-2xl`}>ORDER DETAILS</h2>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Order Info */}
                <div className={`${spaceMono.className} grid grid-cols-2 gap-6`}>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Order Number</p>
                    <p className="font-medium">#{order.id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Order Date</p>
                    <p className="font-medium">
                      {order.orderDate.toDate().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Total Amount</p>
                    <p className="font-medium">₹{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-2">Status</p>
                    <span className={`inline-block px-3 py-1 text-xs rounded-sm ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                      order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Two columns for Tracking and Shipping */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Tracking Status */}
                  <div className={`${spaceMono.className} space-y-4`}>
                    <h3 className={`${archivo.className} text-xl`}>ORDER TIMELINE</h3>
                    <div className="relative space-y-4">
                      {getTrackingStatus().map((status, index) => (
                        <div key={status.status} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                            ${status.done ? 'border-green-500 text-green-500' : 'border-white/20 text-white/20'}`}>
                            {status.done ? '✓' : index + 1}
                          </div>
                          <p className={status.done ? 'text-white text-sm' : 'text-white/40 text-sm'}>
                            {status.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className={`${spaceMono.className} space-y-4`}>
                    <h3 className={`${archivo.className} text-xl`}>SHIPPING INFO</h3>
                    <div className="bg-black/30 p-4 space-y-2 text-sm">
                      <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p className="text-white/60">{order.shippingInfo.address}</p>
                      <p className="text-white/60">{order.shippingInfo.city}, {order.shippingInfo.state}</p>
                      <p className="text-white/60">{order.shippingInfo.pinCode}</p>
                      <p className="text-white/60">Phone: {order.shippingInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className={`${spaceMono.className} space-y-4`}>
                  <h3 className={`${archivo.className} text-xl`}>ACTIONS</h3>
                  <OrderActions 
                    orderId={order.id}
                    status={order.status}
                    deliveryDate={order.deliveredAt?.toDate()}
                  />
                </div>
              </div>

              {/* Right Column - Order Items */}
              <div className={`${spaceMono.className} space-y-4`}>
                <h3 className={`${archivo.className} text-xl`}>ORDER ITEMS</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-black/30 p-4">
                      <div className="relative w-20 h-20 bg-black flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base mb-1 truncate">{item.name}</p>
                        <p className="text-xs text-white/60">
                          {item.printType} - {item.variant}
                        </p>
                        <p className="text-xs text-white/60">
                          Size: {item.size}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-white/60">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-medium">
                            ₹{formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}