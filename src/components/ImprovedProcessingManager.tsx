import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room } from '../types';

interface ImprovedProcessingManagerProps {
  quote: Quote;
  rooms: Room[];
  products: Product[];
  processings: Processing[];
  processingRules: ProcessingRule[];
  productDependencies: ProductDependency[];
  onQuoteUpdate: (quote: Quote) => void;
}

const ImprovedProcessingManager: React.FC<ImprovedProcessingManagerProps> = ({
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

  return (
    <div className="space-y-6">
      {/* Product Overview Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quote Items ({quote.items.length})</h3>
          <p className="text-sm text-gray-600">Click on a product to configure its processings</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.items.map((item) => {
                const product = getProduct(item.productId);
                const isSelected = selectedItemId === item.id;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product?.name}</div>
                        <div className="text-sm text-gray-500">{product?.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.appliedProcessings.map((ap: any) => {
                          const processing = getProcessing(ap.processingId);
                          return (
                            <span key={ap.processingId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {processing?.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProcessingFromItem(item.id, ap.processingId);
                                }}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                        {item.appliedProcessings.length === 0 && (
                          <span className="text-sm text-gray-400">No processings</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="text-red-600 hover:text-red-800"
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

      {/* Processing Configuration Panel */}
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
                <div className="space-y-2">
                  {selectedItem.appliedProcessings.map((ap: any) => {
                    const processing = getProcessing(ap.processingId);
                    return (
                      <div key={ap.processingId} className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                        <div>
                          <span className="text-sm font-medium text-green-900">{processing?.name}</span>
                          <span className="text-xs text-green-700 ml-2">{processing?.description}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-green-900">
                            +${ap.calculatedPrice.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeProcessingFromItem(selectedItem.id, ap.processingId)}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Processings */}
            {availableProcessings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Processings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProcessings.map((processing) => (
                    <button
                      key={processing.id}
                      onClick={() => addProcessingToItem(selectedItem.id, processing.id)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{processing.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{processing.description}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-medium text-green-600">
                            {processing.pricingType === 'percentage' 
                              ? `${(processing.price * 100).toFixed(0)}%`
                              : `$${processing.price.toFixed(2)}`
                            }
                          </p>
                          <p className="text-xs text-gray-500">{processing.pricingType.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </button>
                  ))}
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Select a product from the table above to configure its processings.</p>
        </div>
      )}

      {/* Quote Summary */}
      <div className="bg-white rounded-lg shadow p-6">
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
  );
};

export default ImprovedProcessingManager;
