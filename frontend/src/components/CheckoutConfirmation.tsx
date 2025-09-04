import React from 'react'
import { CheckCircle, CreditCard, X, AlertTriangle } from 'lucide-react'

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
}

export function CheckoutConfirmation({ isOpen, onClose, onConfirm, summary, isLoading }: CheckoutConfirmationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-orange-500 h-6 w-6" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{summary.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Products:</span>
              <span className="font-medium">{summary.itemCount}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-800">Total Amount:</span>
              <span className="text-green-600">₹{summary.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Are you sure you want to proceed to payment? This will open the Razorpay payment gateway to complete your order.
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Open Payment Gateway</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
