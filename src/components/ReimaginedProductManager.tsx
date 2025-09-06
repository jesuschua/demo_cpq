import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room } from '../types';

interface ReimaginedProductManagerProps {
  quote: Quote;
  rooms: Room[];
  products: Product[];
  processings: Processing[];
  processingRules: ProcessingRule[];
  productDependencies: ProductDependency[];
  onQuoteUpdate: (quote: Quote) => void;
}

const ReimaginedProductManager: React.FC<ReimaginedProductManagerProps> = ({
  quote,
  rooms,
  products,
  processings,
  processingRules,
  productDependencies,
  onQuoteUpdate
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [configureItem, setConfigureItem] = useState<any>(null);

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

    return available;
  };

  const openProcessingModal = (item: any) => {
    setConfigureItem(item);
    setShowProcessingModal(true);
  };

  const addProcessingToItem = (itemId: string, processingId: string) => {
    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => {
        if (item.id === itemId) {
          const processing = getProcessing(processingId);
          const calculatedPrice = processing?.price || 0;
          const updatedProcessings = [...item.appliedProcessings, { processingId, calculatedPrice }];
          const newTotalPrice = item.basePrice + calculatedPrice;
          
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
    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => {
        if (item.id === itemId) {
          const updatedProcessings = item.appliedProcessings.filter(proc => proc.processingId !== processingId);
          const removedProcessing = item.appliedProcessings.find(proc => proc.processingId === processingId);
          const newTotalPrice = item.basePrice - (removedProcessing?.calculatedPrice || 0);
          
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
    const orderDiscount = updatedQuote.orderDiscount || 0;
    const totalDiscount = customerDiscount + orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    const finalQuote = {
      ...updatedQuote,
      subtotal,
      totalDiscount,
      finalTotal,
      contractDiscount: customerDiscount
    };

    onQuoteUpdate(finalQuote);
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
  };

  return (
    <div className="space-y-6">
      {/* Product Overview Cards */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quote Configuration</h2>
        
        {quote.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products added to quote yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                >
                  {/* Product Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{product?.name}</h3>
                      <p className="text-xs text-gray-600">{product?.category}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-600">Quantity:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQuantity(item.id, -1);
                        }}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQuantity(item.id, 1);
                        }}
                        className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Processings Summary */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Processings:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProcessingModal(item);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Configure
                      </button>
                    </div>
                    {appliedProcessingNames.length === 0 ? (
                      <p className="text-xs text-gray-400">None applied</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {appliedProcessingNames.slice(0, 2).map((name, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {name}
                          </span>
                        ))}
                        {appliedProcessingNames.length > 2 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{appliedProcessingNames.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Total:</span>
                    <span className="text-sm font-semibold text-green-600">
                      ${(item.totalPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processing Configuration Modal */}
      {showProcessingModal && configureItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configure Processings: {getProduct(configureItem.productId)?.name}
                </h3>
                <button
                  onClick={() => setShowProcessingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-80 overflow-y-auto">
              <div className="space-y-4">
                {/* Applied Processings */}
                {configureItem.appliedProcessings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Applied Processings</h4>
                    <div className="space-y-2">
                      {configureItem.appliedProcessings.map((proc: any) => {
                        const processing = getProcessing(proc.processingId);
                        return (
                          <div key={proc.processingId} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium text-blue-900">{processing?.name}</p>
                              <p className="text-sm text-blue-700">{processing?.description}</p>
                              <p className="text-sm text-green-600">
                                +${proc.calculatedPrice.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeProcessingFromItem(configureItem.id, proc.processingId)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Processings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Available Processings</h4>
                  <div className="space-y-2">
                    {getAvailableProcessings(configureItem.productId, configureItem.appliedProcessings.map((p: any) => p.processingId))
                      .map((processing) => (
                        <div key={processing.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{processing.name}</p>
                            <p className="text-sm text-gray-600">{processing.description}</p>
                            <p className="text-sm text-green-600">
                              +${processing.price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => addProcessingToItem(configureItem.id, processing.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowProcessingModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
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

export default ReimaginedProductManager;
