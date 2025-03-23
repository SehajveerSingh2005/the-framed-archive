import LegalLayout from '@/components/LegalLayout'

export default function ShippingInfo() {
  return (
    <LegalLayout title="SHIPPING INFORMATION">
      <h2>Delivery Times</h2>
      <p>Standard shipping within India takes 5-7 business days. International shipping may take 10-15 business days.</p>

      <h2>Shipping Costs</h2>
      <p>We offer free shipping on all orders within India. International shipping rates vary by location.</p>

      <h2>Tracking Orders</h2>
      <p>Once your order ships, you will receive a tracking number via email to monitor your package's journey.</p>

      <h2>Returns & Exchanges</h2>
      <p>If you&apos;re not satisfied with your purchase, you may return it within 30 days of delivery. Please note that custom prints are non-refundable.</p>

      <h2>Packaging</h2>
      <p>All artwork is carefully packaged in protective materials to ensure safe delivery:</p>
      <ul>
        <li>Prints are sealed in waterproof sleeves</li>
        <li>Rigid cardboard backing for support</li>
        <li>Sturdy shipping tubes or flat mailers</li>
        <li>Additional corner protection for framed pieces</li>
      </ul>
    </LegalLayout>
  )
}