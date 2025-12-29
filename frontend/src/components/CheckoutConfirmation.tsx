import React from 'react'
import { CheckCircle, CreditCard, X, MapPin, Package, ShieldCheck } from 'lucide-react'

interface CheckoutConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  summary: {
    totalAmount: number
    totalItems: number
    itemCount: number
  }
  isLoading: boolean
  shippingAddress?: {
    fullName: string
    houseNumber: string
    street: string
    area: string
    city: string
    state: string
    pinCode: string
    phone: string
  } | null
  items?: Array<{
    id: string
    name: string
    quantity: number
    rate: number
    image_url?: string
  }>
}

export function CheckoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  summary,
  isLoading,
  shippingAddress,
  items = []
}: CheckoutConfirmationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Glassmorphism Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-zinc-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-white/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-600" />
              Confirm Order
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Please review your order details before payment</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Shipping & Payment Info */}
            <div className="space-y-6">

              {/* Shipping Address */}
              <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm mb-2">Shipping To</h3>
                    {shippingAddress ? (
                      <div className="text-sm text-zinc-600 space-y-1">
                        <p className="font-medium text-zinc-900">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.houseNumber}, {shippingAddress.street}</p>
                        <p>{shippingAddress.area}, {shippingAddress.city}</p>
                        <p>{shippingAddress.state} - {shippingAddress.pinCode}</p>
                        <p className="mt-2 text-zinc-500">Phone: {shippingAddress.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                        No shipping address found. Please update your profile.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Hint */}
              <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm mb-1">Payment Method</h3>
                  <p className="text-sm text-zinc-600">Razorpay Secure Gateway (UPI, Cards, NetBanking)</p>
                </div>
              </div>

            </div>

            {/* Right Column: Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items ({summary.totalItems})
              </h3>

              <div className="bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {items.map((item, index) => (
                    <div key={item.id || index} className="flex gap-4 p-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-100/50 transition-colors">
                      <div className="h-16 w-16 bg-white rounded-lg border border-zinc-200 overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-zinc-900 text-sm truncate">{item.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-zinc-500 bg-white px-2 py-1 rounded border border-zinc-200">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-zinc-900 text-sm">
                            ₹{(Number(item.rate) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Footer */}
                <div className="bg-zinc-100/80 p-4 flex justify-between items-center border-t border-zinc-200">
                  <span className="font-semibold text-zinc-700">Total Payable</span>
                  <span className="font-bold text-xl text-zinc-900">₹{Number(summary.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Secure Checkout</span>
                <CreditCard className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
