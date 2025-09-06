import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency } from '../../types';

interface EnterpriseQuoteBuilderProps {
  quote: Quote;
  products: Product[];
  processings: Processing[];
  processingRules: ProcessingRule[];
  productDependencies: ProductDependency[];
  onQuoteUpdate: (quote: Quote) => void;
}

const EnterpriseQuoteBuilder: React.FC<EnterpriseQuoteBuilderProps> = ({
  quote,
  products,
  processings,
  processingRules,
  productDependencies,
  onQuoteUpdate
}) => {
  // const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [orderDiscount, setOrderDiscount] = useState(quote.orderDiscount);

  const getProduct = (productId: string) => products.find(p => p.id === productId);
  const getProcessing = (processingId: string) => processings.find(p => p.id === processingId);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, quantity: newQuantity };
        updatedItem.totalPrice = (updatedItem.basePrice * newQuantity) + 
          updatedItem.appliedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
        return updatedItem;
      }
      return item;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = quote.items.filter(item => item.id !== itemId);
    recalculateQuote({ ...quote, items: updatedItems });
  };

  const getAvailableProcessings = (productId: string, currentProcessings: string[]) => {
    const product = getProduct(productId);
    if (!product) return [];

    // Get processings applicable to this product category
    let available = processings.filter(proc => 
      proc.applicableProductCategories.includes(product.category)
    );

    // Apply mutual exclusion rules
    const mutualExclusionRules = processingRules.filter(rule => 
      rule.type === 'mutual_exclusion'
    );

    mutualExclusionRules.forEach(rule => {
      const hasConflicting = currentProcessings.some(procId => 
        rule.conditions.processingIds?.includes(procId)
      );
      
      if (hasConflicting && rule.actions.excludeProcessings) {
        available = available.filter(proc => 
          !rule.actions.excludeProcessings?.includes(proc.id)
        );
      }
    });

    // Remove already applied processings
    available = available.filter(proc => !currentProcessings.includes(proc.id));

    return available;
  };

  const addProcessingToItem = (itemId: string, processingId: string) => {
    const item = quote.items.find(i => i.id === itemId);
    const processing = getProcessing(processingId);
    const product = item ? getProduct(item.productId) : null;
    
    if (!item || !processing || !product) return;

    // Calculate processing price
    let calculatedPrice = 0;
    if (processing.pricingType === 'per_unit') {
      calculatedPrice = processing.price * item.quantity;
    } else if (processing.pricingType === 'percentage') {
      calculatedPrice = item.basePrice * item.quantity * processing.price;
    } else if (processing.pricingType === 'per_dimension' && product.dimensions) {
      // Simplified calculation - in real system this would be more complex
      calculatedPrice = (product.dimensions.width || 0) * processing.price;
    }

    const updatedItems = quote.items.map(i => {
      if (i.id === itemId) {
        const updatedItem = {
          ...i,
          appliedProcessings: [
            ...i.appliedProcessings,
            { processingId, calculatedPrice }
          ]
        };
        updatedItem.totalPrice = (updatedItem.basePrice * updatedItem.quantity) + 
          updatedItem.appliedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
        return updatedItem;
      }
      return i;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const removeProcessingFromItem = (itemId: string, processingId: string) => {
    const updatedItems = quote.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          appliedProcessings: item.appliedProcessings.filter(ap => ap.processingId !== processingId)
        };
        updatedItem.totalPrice = (updatedItem.basePrice * updatedItem.quantity) + 
          updatedItem.appliedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
        return updatedItem;
      }
      return item;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  const applyOrderDiscount = () => {
    const updatedQuote = { ...quote, orderDiscount };
    recalculateQuote(updatedQuote);
  };

  const recalculateQuote = (updatedQuote: Quote) => {
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const contractDiscount = subtotal * (updatedQuote.contractDiscount / 100);
    const customerDiscount = (subtotal - contractDiscount) * (updatedQuote.customerDiscount / 100);
    const totalDiscount = contractDiscount + customerDiscount + updatedQuote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    const finalQuote = {
      ...updatedQuote,
      subtotal,
      totalDiscount,
      finalTotal,
      requiresApproval: finalTotal > updatedQuote.approvalThreshold
    };

    onQuoteUpdate(finalQuote);
  };

  const checkDependencies = (productId: string) => {
    const deps = productDependencies.filter(dep => dep.productId === productId);
    if (deps.length === 0) return [];

    return deps.map(dep => {
      const requiredProduct = getProduct(dep.requiredProductId);
      return {
        ...dep,
        requiredProductName: requiredProduct?.name || 'Unknown Product'
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Quote Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quote Configuration</h3>
          <p className="text-sm text-gray-600">Configure products and apply processings</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {quote.items.map((item) => {
            const product = getProduct(item.productId);
            const dependencies = checkDependencies(item.productId);
            const currentProcessingIds = item.appliedProcessings.map(ap => ap.processingId);
            const availableProcessings = getAvailableProcessings(item.productId, currentProcessingIds);
            
            if (!product) return null;

            return (
              <div key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    {product.dimensions && (
                      <p className="text-xs text-gray-500 mt-1">
                        {product.dimensions.width}"W × {product.dimensions.height}"H × {product.dimensions.depth}"D
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Base: ${(item.basePrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Dependencies Warning */}
                {dependencies.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="text-sm font-medium text-yellow-800 mb-2">Product Dependencies:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {dependencies.map((dep) => (
                        <li key={dep.id}>
                          • {dep.isAutomatic ? 'Auto-adds' : 'Consider adding'}: {dep.requiredProductName} 
                          {dep.quantityFormula !== '1' && ` (${dep.quantityFormula})`}
                          <span className="text-xs ml-2">- {dep.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Applied Processings */}
                {item.appliedProcessings.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Applied Processings:</h5>
                    <div className="space-y-2">
                      {item.appliedProcessings.map((ap) => {
                        const processing = getProcessing(ap.processingId);
                        return (
                          <div key={ap.processingId} className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded">
                            <div>
                              <span className="text-sm font-medium text-blue-900">{processing?.name}</span>
                              <span className="text-xs text-blue-700 ml-2">{processing?.description}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-blue-900">
                                +${ap.calculatedPrice.toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeProcessingFromItem(item.id, ap.processingId)}
                                className="text-red-600 hover:text-red-800 text-xs"
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
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Available Processings:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableProcessings.map((processing) => (
                        <button
                          key={processing.id}
                          onClick={() => addProcessingToItem(item.id, processing.id)}
                          className="text-left p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="text-sm font-medium text-gray-900">{processing.name}</h6>
                              <p className="text-xs text-gray-600">{processing.description}</p>
                            </div>
                            <div className="text-right">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Quote Totals & Discounts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enterprise Quote Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
          </div>
          
          {quote.contractDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Discount ({quote.contractDiscount}%):</span>
              <span className="text-red-600">-${(quote.subtotal * quote.contractDiscount / 100).toFixed(2)}</span>
            </div>
          )}
          
          {quote.customerDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Discount ({quote.customerDiscount}%):</span>
              <span className="text-red-600">-${((quote.subtotal - quote.subtotal * quote.contractDiscount / 100) * quote.customerDiscount / 100).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Order Discount:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                placeholder="0.00"
              />
              <button
                onClick={applyOrderDiscount}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Final Total:</span>
              <span className="text-xl font-bold text-green-600">${quote.finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {quote.requiresApproval && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ This quote requires approval as it exceeds $&gt;{quote.approvalThreshold.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseQuoteBuilder;
