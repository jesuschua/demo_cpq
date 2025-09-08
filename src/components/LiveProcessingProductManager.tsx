import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room } from '../types';

interface LiveProcessingProductManagerProps {
  quote: Quote;
  rooms: Room[];
  products: Product[];
  processings: Processing[];
  processingRules: ProcessingRule[];
  productDependencies: ProductDependency[];
  onQuoteUpdate: (quote: Quote) => void;
}

const LiveProcessingProductManager: React.FC<LiveProcessingProductManagerProps> = ({
  quote,
  rooms,
  products,
  processings,
  processingRules,
  productDependencies,
  onQuoteUpdate
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const getProduct = (productId: string) => products.find(p => p.id === productId);
  const getProcessing = (processingId: string) => processings.find(p => p.id === processingId);

  const getAvailableProcessings = (productId: string, currentProcessings: string[]) => {
    const product = getProduct(productId);
    if (!product) return [];

    let available = processings.filter(proc => 
      proc.applicableProductCategories.includes(product.category)
    );

    // Apply processing rules for mutual exclusions
    processingRules.forEach(rule => {
      if (rule.type === 'mutual_exclusion' && rule.conditions.processingIds && 
          currentProcessings.some(id => rule.conditions.processingIds!.includes(id))) {
        available = available.filter(proc => 
          !rule.conditions.processingIds!.includes(proc.id) || currentProcessings.includes(proc.id));
      }
    });

    // Remove already applied processings
    available = available.filter(proc => !currentProcessings.includes(proc.id));

    return available;
  };

  const addProcessingToItem = (itemId: string, processingId: string) => {
    const processing = getProcessing(processingId);
    if (!processing) return;

    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        const product = getProduct(item.productId);
        if (!product) return item;

        let calculatedPrice = 0;
        if (processing.pricingType === 'percentage') {
          calculatedPrice = product.basePrice * processing.price;
        } else {
          calculatedPrice = processing.price;
        }

        const newProcessing = {
          processingId,
          calculatedPrice,
          appliedDate: new Date().toISOString()
        };

        const updatedItem = {
          ...item,
          appliedProcessings: [...item.appliedProcessings, newProcessing]
        };

        // Recalculate total price
        const processingTotal = updatedItem.appliedProcessings.reduce((sum: number, ap: any) => sum + ap.calculatedPrice, 0);
        updatedItem.totalPrice = (product.basePrice + processingTotal) * item.quantity;

        return updatedItem;
      }
      return item;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const removeProcessingFromItem = (itemId: string, processingId: string) => {
    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        const product = getProduct(item.productId);
        if (!product) return item;

        const updatedItem = {
          ...item,
          appliedProcessings: item.appliedProcessings.filter((ap: any) => ap.processingId !== processingId)
        };

        // Recalculate total price
        const processingTotal = updatedItem.appliedProcessings.reduce((sum: number, ap: any) => sum + ap.calculatedPrice, 0);
        updatedItem.totalPrice = (product.basePrice + processingTotal) * item.quantity;

        return updatedItem;
      }
      return item;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        const product = getProduct(item.productId);
        if (!product) return item;

        const updatedItem = { ...item, quantity: newQuantity };
        const processingTotal = updatedItem.appliedProcessings.reduce((sum: number, ap: any) => sum + ap.calculatedPrice, 0);
        updatedItem.totalPrice = (product.basePrice + processingTotal) * newQuantity;

        return updatedItem;
      }
      return item;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = quote.items.filter(item => item.id !== itemId);
    recalculateQuote({ ...quote, items: updatedItems });
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const recalculateQuote = (updatedQuote: Quote) => {
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customerDiscount = subtotal * (updatedQuote.customerDiscount / 100);
    const orderDiscount = updatedQuote.orderDiscount || 0;
    const totalDiscount = customerDiscount + orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    const finalQuote = {
      ...updatedQuote,
      orderDiscount,
      subtotal,
      totalDiscount,
      finalTotal
    };

    onQuoteUpdate(finalQuote);
  };

  const selectedItem = selectedItemId ? quote.items.find(item => item.id === selectedItemId) : null;
  const selectedProduct = selectedItem ? getProduct(selectedItem.productId) : null;
  const availableProcessings = selectedItem ? getAvailableProcessings(selectedItem.productId, selectedItem.appliedProcessings.map((ap: any) => ap.processingId)) : [];

  // Group items by room for room-aware display
  const itemsByRoom = quote.items.reduce((acc, item) => {
    const roomId = item.roomId || 'no-room';
    if (!acc[roomId]) {
      acc[roomId] = [];
    }
    acc[roomId].push(item);
    return acc;
  }, {} as Record<string, typeof quote.items>);

  return (
    <div className="flex space-x-6">
      {/* Left Side - Product Cards Organized by Room */}
      <div className="flex-1">
        {quote.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No products in quote. Add products from the previous step.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(itemsByRoom).map(([roomId, roomItems]) => {
              const room = rooms.find(r => r.id === roomId);
              const roomTotal = roomItems.reduce((sum, item) => sum + item.totalPrice, 0);

              return (
                <div key={roomId} className="bg-white rounded-lg shadow">
                  {/* Room Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {room ? room.name : 'Unassigned Products'}
                      </h3>
                      <span className="text-lg font-bold text-blue-600">
                        ${roomTotal.toFixed(2)}
                      </span>
                    </div>
                    {room?.dimensions && (
                      <p className="text-sm text-gray-600 mt-1">
                        {room.dimensions.width}" × {room.dimensions.height}" × {room.dimensions.depth}"
                      </p>
                    )}
                  </div>

                  {/* Room Products Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processings</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {roomItems.map((item) => {
                          const product = getProduct(item.productId);
                          if (!product) return null;

                          const isSelected = selectedItemId === item.id;
                          const processingTotal = item.appliedProcessings.reduce((sum: number, ap: any) => sum + ap.calculatedPrice, 0);
                          const unitPrice = product.basePrice + processingTotal;

                          return (
                            <tr 
                              key={item.id} 
                              className={`${isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'} cursor-pointer`}
                              onClick={() => setSelectedItemId(item.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.category}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {item.appliedProcessings.map((ap: any) => {
                                    const processing = getProcessing(ap.processingId);
                                    return processing ? (
                                      <span key={ap.processingId} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1">
                                        {processing.name} (+${ap.calculatedPrice.toFixed(2)})
                                      </span>
                                    ) : null;
                                  })}
                                  {item.appliedProcessings.length === 0 && (
                                    <span className="text-gray-400 text-sm">No processings</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, item.quantity - 1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                                  >
                                    -
                                  </button>
                                  <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, item.quantity + 1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${unitPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${item.totalPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(item.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side - Live Processing Panel */}
      <div className="w-96">
      {selectedItem && selectedProduct && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-medium text-gray-900">Configure: {selectedProduct.name}</h3>
            <p className="text-sm text-gray-600">Add processings to customize this product</p>
          </div>
          
          <div className="p-6">
            {/* Applied Processings */}
            {selectedItem.appliedProcessings.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Applied Processings</h4>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <div className="space-y-2">
                    {selectedItem.appliedProcessings.map((ap: any) => {
                      const processing = getProcessing(ap.processingId);
                      return (
                        <div key={ap.processingId} className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-semibold text-green-900">
                                {processing?.name}
                              </h5>
                              <div className="flex items-center space-x-3">
                                <span className="text-lg font-bold text-green-700">
                                  +${ap.calculatedPrice.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeProcessingFromItem(selectedItem.id, ap.processingId)}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                >
                                  Remove ✕
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-green-700 pr-2">
                              {processing?.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Available Processings */}
            {availableProcessings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Processings</h4>
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <div className="space-y-2">
                    {availableProcessings.map((processing) => (
                      <button
                        key={processing.id}
                        onClick={() => addProcessingToItem(selectedItem.id, processing.id)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 group bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">
                                {processing.name}
                              </h5>
                              <div className="flex items-center space-x-2 ml-4">
                                <span className="text-lg font-bold text-green-600">
                                  {processing.pricingType === 'percentage' 
                                    ? `+${(processing.price * 100).toFixed(0)}%`
                                    : `+$${processing.price.toFixed(2)}`
                                  }
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200">
                                  Add +
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 pr-2">
                              {processing.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {availableProcessings.length === 0 && selectedItem.appliedProcessings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No processings available for this product type.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedItem && (
        <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-200">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Product Processings</h3>
            <p className="text-gray-500">Select a product from the room tables to add custom processings and configurations.</p>
          </div>
        </div>
      )}

      {/* Quote Summary */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${quote.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer Discount ({quote.customerDiscount}%):</span>
            <span className="font-medium text-red-600">-${((quote.subtotal || 0) * (quote.customerDiscount / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Discount:</span>
            <span className="font-medium text-red-600">-${(quote.orderDiscount || 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Final Total:</span>
              <span className="text-green-600">${quote.finalTotal?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LiveProcessingProductManager;
