import React from 'react';
import { Quote, Product, Customer } from '../types';

interface QuoteDisplayProps {
  quote: Quote;
  products: Product[];
  customer: Customer;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, products, customer }) => {
  const getProduct = (productId: string) => products.find(p => p.id === productId);

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Quote</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          quote.status === 'draft' 
            ? 'bg-gray-100 text-gray-800'
            : quote.status === 'pending_approval'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {quote.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Quote Items */}
      <div className="space-y-3 mb-4">
        {quote.items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items added yet</p>
        ) : (
          quote.items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <div key={item.id} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-600">
                      Qty: {item.quantity} × ${item.basePrice.toFixed(2)}
                    </p>
                    {item.appliedProcessings.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-blue-600">
                          + {item.appliedProcessings.length} processings
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quote Summary */}
      {quote.items.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-gray-900">${quote.subtotal.toFixed(2)}</span>
          </div>
          
          {quote.contractDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Contract Discount ({quote.contractDiscount}%):</span>
              <span className="text-red-600">-${(quote.subtotal * quote.contractDiscount / 100).toFixed(2)}</span>
            </div>
          )}
          
          {quote.customerDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer Discount ({quote.customerDiscount}%):</span>
              <span className="text-red-600">-${((quote.subtotal - quote.subtotal * quote.contractDiscount / 100) * quote.customerDiscount / 100).toFixed(2)}</span>
            </div>
          )}
          
          {quote.orderDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Discount:</span>
              <span className="text-red-600">-${quote.orderDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-gray-900">${quote.finalTotal.toFixed(2)}</span>
          </div>

          {quote.requiresApproval && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                ⚠️ Requires approval (over ${quote.approvalThreshold.toLocaleString()})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quote Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
        <p>Customer: {customer.name}</p>
        <p>Created: {quote.createdAt.toLocaleDateString()}</p>
        <p>Expires: {quote.expiresAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default QuoteDisplay;
