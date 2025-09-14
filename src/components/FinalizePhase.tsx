import React from 'react';
import { Quote, Customer, Room, Product, Processing, Model } from '../types';

interface FinalizePhaseProps {
  quote: Quote;
  customer: Customer;
  rooms: Room[];
  products: Product[];
  processings: Processing[];
  models: Model[];
  onBackToEdit: () => void;
  onPrint: () => void;
}

const FinalizePhase: React.FC<FinalizePhaseProps> = ({
  quote,
  customer,
  rooms,
  products,
  processings,
  models,
  onBackToEdit,
  onPrint
}) => {
  const getProduct = (productId: string) => products.find(p => p.id === productId);
  const getModel = (modelId: string) => models.find(m => m.id === modelId);
  const getProcessing = (processingId: string) => processings.find(p => p.id === processingId);

  // Group items by room
  const itemsByRoom = quote.items.reduce((acc, item) => {
    const roomId = item.roomId;
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalize Your Order</h1>
        <p className="text-lg text-gray-600">Review your order details before printing</p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Order Summary</h2>
              <p className="text-blue-100">Quote #{quote.quoteNumber || quote.id}</p>
            </div>
            <div className="text-right text-white">
              <p className="text-sm">Created: {quote.createdAt.toLocaleDateString()}</p>
              <p className="text-sm">Expires: {quote.expiresAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contract ID</p>
              <p className="font-medium">{customer.contractId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer ID</p>
              <p className="font-medium">{customer.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Discount</p>
              <p className="font-medium">{customer.discountPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Order Details by Room */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
          {Object.entries(itemsByRoom).map(([roomId, items]) => {
            const room = rooms.find(r => r.id === roomId);
            if (!room) return null;

            return (
              <div key={roomId} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                {/* Room Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">{room.name}</h4>
                  <p className="text-sm text-gray-600">{room.description}</p>
                </div>

                {/* Products in Room */}
                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{product.name}</h5>
                            <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            
                            {/* Processing Details */}
                            {item.appliedProcessings && item.appliedProcessings.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Applied Processing:</p>
                                <div className="space-y-1">
                                  {item.appliedProcessings.map((processing: any, index: number) => {
                                    const processingDetails = getProcessing(processing.processingId);
                                    if (!processingDetails) return null;
                                    
                                    return (
                                      <div key={index} className="flex justify-between items-center text-xs">
                                        <span className={`${processing.isInherited ? 'text-green-600' : 'text-purple-600'}`}>
                                          {processing.isInherited ? '🏠 ' : '⚙️ '}
                                          {processingDetails.name}
                                        </span>
                                        <span className="font-medium">${processing.calculatedPrice.toFixed(2)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-green-600">${item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">${quote.subtotal.toFixed(2)}</span>
            </div>

            {/* Delivery Fee - Always show for documentation */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivery Fee:</span>
              <span className="text-sm font-medium">${quote.deliveryFees.calculated.toFixed(2)}</span>
            </div>

            {/* Environmental Fees - Always show for documentation */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Environmental Fees:</span>
              <span className="text-sm font-medium">${quote.environmentalFees.calculated.toFixed(2)}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-600">${quote.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onBackToEdit}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={onPrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print Order
        </button>
      </div>
    </div>
  );
};

export default FinalizePhase;
