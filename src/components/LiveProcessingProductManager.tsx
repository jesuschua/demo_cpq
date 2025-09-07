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
      proc.applicableProductCategories.includes(product.category) &&
      !currentProcessings.includes(proc.id)
    );

    // Apply processing rules
    processingRules.forEach(rule => {
      if (rule.type === 'mutual_exclusion' && 
          rule.conditions.processingIds?.some(id => currentProcessings.includes(id))) {
        available = available.filter(proc => 
          !rule.actions.excludeProcessings?.includes(proc.id)
        );
      }
    });

    return available;
  };

  const addProcessingToItem = (itemId: string, processingId: string) => {
    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => {
        if (item.id === itemId) {
          const processing = getProcessing(processingId);
          const calculatedPrice = processing?.price || 0;
          const newProcessing = { 
            processingId, 
            calculatedPrice,
            isInherited: false, // This is manually added
            appliedDate: new Date().toISOString()
          };
          const updatedProcessings = [...item.appliedProcessings, newProcessing];
          const processingTotal = updatedProcessings.reduce((sum, proc) => sum + proc.calculatedPrice, 0);
          const newTotalPrice = (item.basePrice + processingTotal) * item.quantity;
          
          return {
            ...item,
            appliedProcessings: updatedProcessings,
            totalPrice: newTotalPrice
          };
        }
        return item;
      })
    };

    recalculateQuote(updatedQuote);
  };

  const removeProcessingFromItem = (itemId: string, processingId: string) => {
    const item = quote.items.find(i => i.id === itemId);
    if (!item) return;
    
    // Check if this is an inherited processing - cannot be removed
    const processingToRemove = item.appliedProcessings.find(proc => proc.processingId === processingId);
    if (processingToRemove?.isInherited) {
      alert('This processing is inherited from the room configuration and cannot be removed individually. To change it, edit the room settings.');
      return;
    }

    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => {
        if (item.id === itemId) {
          const updatedProcessings = item.appliedProcessings.filter(proc => proc.processingId !== processingId);
          // Recalculate total price from base price + remaining processings
          const processingTotal = updatedProcessings.reduce((sum, proc) => sum + proc.calculatedPrice, 0);
          const newTotalPrice = (item.basePrice + processingTotal) * item.quantity;
          
          return {
            ...item,
            appliedProcessings: updatedProcessings,
            totalPrice: newTotalPrice
          };
        }
        return item;
      })
    };

    recalculateQuote(updatedQuote);
  };

  const recalculateQuote = (updatedQuote: Quote) => {
    // Calculate totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscount = (quote.customerDiscount || 0) / 100 * subtotal;
    const contractDiscount = (quote.contractDiscount || 0) / 100 * subtotal;
    const totalDiscount = customerDiscount + contractDiscount + (quote.orderDiscount || 0);
    const finalTotal = subtotal - totalDiscount;

    const recalculatedQuote = {
      ...updatedQuote,
      subtotal,
      totalDiscount,
      finalTotal
    };

    onQuoteUpdate(recalculatedQuote);
  };

  const adjustQuantity = (itemId: string, change: number) => {
    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    };

    recalculateQuote(updatedQuote);
  };

  const removeItem = (itemId: string) => {
    const updatedQuote = {
      ...quote,
      items: quote.items.filter(item => item.id !== itemId)
    };

    recalculateQuote(updatedQuote);
    
    // If we removed the selected item, clear selection
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const selectedItem = selectedItemId ? quote.items.find(item => item.id === selectedItemId) : null;

  return (
    <div className="flex space-x-6">
      {/* Left Side - Product Cards */}
      <div className="flex-1">
        {quote.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No products in quote. Add products from the previous step.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quote.items.map((item) => {
              const product = getProduct(item.productId);
              const appliedProcessingNames = item.appliedProcessings.map(proc => 
                getProcessing(proc.processingId)?.name || 'Unknown'
              );

              return (
                <div 
                  key={item.id} 
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedItemId === item.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product?.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{product?.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQuantity(item.id, -1);
                        }}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQuantity(item.id, 1);
                        }}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Applied Processings */}
                  {appliedProcessingNames.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Applied Processings:</p>
                      <div className="flex flex-wrap gap-1">
                        {appliedProcessingNames.map((name, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      ${item.basePrice.toFixed(2)} base
                    </p>
                    <p className="font-semibold text-green-600">
                      ${item.totalPrice.toFixed(2)} each
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.totalPrice * item.quantity).toFixed(2)} total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side - Live Processing Pane */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Processing Options</h3>
          {selectedItem ? (
            <p className="text-sm text-gray-600 mt-1">
              Configure {getProduct(selectedItem.productId)?.name}
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Select a product to configure processings
            </p>
          )}
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {!selectedItem ? (
            <div className="text-center py-8 text-gray-500">
              <p>Click on a product card to view processing options</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Applied Processings */}
              {selectedItem.appliedProcessings.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Applied Processings</h4>
                  <div className="space-y-2">
                    {selectedItem.appliedProcessings.map((proc: any) => {
                      const processing = getProcessing(proc.processingId);
                      const isInherited = proc.isInherited;
                      return (
                        <div key={proc.processingId} className={`flex justify-between items-center p-3 rounded-lg ${
                          isInherited ? 'bg-green-50 border border-green-200' : 'bg-blue-50'
                        }`}>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className={`font-medium ${isInherited ? 'text-green-900' : 'text-blue-900'}`}>
                                {processing?.name}
                              </p>
                              {isInherited && (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                  Inherited
                                </span>
                              )}
                            </div>
                            <p className={`text-xs ${isInherited ? 'text-green-700' : 'text-blue-700'}`}>
                              {processing?.description}
                            </p>
                            <p className="text-xs text-green-600">
                              +${proc.calculatedPrice.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeProcessingFromItem(selectedItem.id, proc.processingId)}
                            disabled={isInherited}
                            className={`px-2 py-1 rounded text-xs ${
                              isInherited 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            title={isInherited ? 'Inherited processings cannot be removed' : 'Remove processing'}
                          >
                            {isInherited ? 'Locked' : 'Remove'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Processings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available</h4>
                <div className="space-y-2">
                  {getAvailableProcessings(selectedItem.productId, selectedItem.appliedProcessings.map((p: any) => p.processingId))
                    .map((processing) => (
                      <div key={processing.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{processing.name}</p>
                          <p className="text-xs text-gray-600">{processing.description}</p>
                          <p className="text-xs text-green-600">
                            +${processing.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => addProcessingToItem(selectedItem.id, processing.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  
                  {getAvailableProcessings(selectedItem.productId, selectedItem.appliedProcessings.map((p: any) => p.processingId)).length === 0 && (
                    <p className="text-sm text-gray-500 italic">No additional processings available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Summary at Bottom Right */}
      <div className="w-64 bg-white border border-gray-200 rounded-lg p-4 h-fit">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${quote.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          
          {quote.customerDiscount && quote.customerDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Customer Discount ({quote.customerDiscount}%):</span>
              <span>-${quote.contractDiscount?.toFixed(2) || '0.00'}</span>
            </div>
          )}
          
          {quote.orderDiscount && quote.orderDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Order Discount:</span>
              <span>-${quote.orderDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <hr className="my-2" />
          
          <div className="flex justify-between text-lg font-semibold">
            <span>Final Total:</span>
            <span className="text-green-600">${quote.finalTotal?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveProcessingProductManager;
