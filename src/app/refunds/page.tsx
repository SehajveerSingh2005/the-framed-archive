import LegalLayout from '@/components/LegalLayout';

export default function RefundsPage() {
  return (
    <LegalLayout title="Cancellations & Refunds Policy">
      <div className="space-y-8">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <div>
          <h2>Order Cancellation</h2>
          <p>Orders can be cancelled within 24 hours of placement, provided the order has not been shipped. To cancel an order, please contact our customer service team immediately.</p>
        </div>

        <div>
          <h2>Refund Policy</h2>
          <p>We want you to be completely satisfied with your purchase. If you are not satisfied, we offer the following refund options:</p>
          <ul>
            <li>Full refund if the product arrives damaged or defective</li>
            <li>Refund must be requested within 7 days of delivery</li>
            <li>Product must be unused and in its original packaging</li>
            <li>Shipping costs are non-refundable</li>
          </ul>
        </div>

        <div>
          <h2>Refund Process</h2>
          <p>Once we receive your return:</p>
          <ul>
            <li>We will inspect the product within 48 hours</li>
            <li>You will receive an email confirming your refund</li>
            <li>Refund will be processed to your original payment method</li>
            <li>Please allow 5-7 business days for the refund to appear in your account</li>
          </ul>
        </div>

        <div>
          <h2>Contact Us</h2>
          <p>If you have any questions about our refund policy, please contact us:</p>
          <p>Email: support@theframedarchive.com</p>
        </div>
      </div>
    </LegalLayout>
  );
}