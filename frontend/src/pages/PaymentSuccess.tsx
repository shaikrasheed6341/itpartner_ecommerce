import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  
  // Dummy data for successful payment
  const paymentData = {
    orderId: 'ORD-1234567890-ABC123',
    orderNumber: 'ORD-2025-001',
    totalAmount: 2500.00,
    paymentId: 'pay_1234567890abcdef',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    items: [
      {
        id: '1',
        name: 'CCTV 2MP',
        brand: 'CP PLUSE',
        quantity: 1,
        price: 2500.00,
        image: 'https://wxntkreyhefyjgphvauz.supabase.co/storage/v1/object/public/product/cctv.jpg'
      }
    ],
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876543210',
      address: '123 Main Street, City, State, 123456'
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your order. We'll deliver your items soon.</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">{paymentData.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium text-gray-900">{paymentData.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900">{paymentData.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-gray-900">₹{paymentData.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="font-semibold text-blue-900">Delivery Information</h3>
            </div>
            <p className="text-blue-800">
              <strong>Expected Delivery:</strong> {formatDate(paymentData.deliveryDate)}
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Your order will be delivered within 2 business days
            </p>
          </div>

          {/* Items Ordered */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {paymentData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{paymentData.customer.name}</p>
              <p className="text-gray-600">{paymentData.customer.email}</p>
              <p className="text-gray-600">{paymentData.customer.phone}</p>
              <p className="text-gray-600 mt-2">{paymentData.customer.address}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleContinueShopping}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleViewOrders}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            View All Orders
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Contact us at{' '}
            <a href="mailto:support@itpartner.com" className="text-blue-600 hover:underline">
              support@itpartner.com
            </a>
          </p>
          <p className="text-xs text-gray-400">
            You will receive an email confirmation shortly
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;