import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room, ProcessingOptionValue, ProcessingOption } from '../types';

interface SimplifiedQuoteBuilderProps {
  quote: Quote;
  rooms: Room[];
  products: Product[];
  processings: Processing[];
  processingRules: ProcessingRule[];
  productDependencies: ProductDependency[];
  onQuoteUpdate: (quote: Quote) => void;
}

const SimplifiedQuoteBuilder: React.FC<SimplifiedQuoteBuilderProps> = ({
  quote,
  rooms,
  products,
  processings,
  processingRules,
  productDependencies,
  onQuoteUpdate
}) => {
  console.log('🔧 SimplifiedQuoteBuilder rendered with:', {
    quoteItems: quote.items.length,
    rooms: rooms.length,
    products: products.length,
    processings: processings.length
  });

  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [orderDiscount, setOrderDiscount] = useState(quote.orderDiscount);
  const [optionSelector, setOptionSelector] = useState<{
    isOpen: boolean;
    itemId: string;
    processingId: string;
    processing: Processing | null;
    currentValues: ProcessingOptionValue[];
  }>({
    isOpen: false,
    itemId: '',
    processingId: '',
    processing: null,
    currentValues: []
  });

  const getProduct = (productId: string) => products.find(p => p.id === productId);
  const getProcessing = (processingId: string) => processings.find(p => p.id === processingId);
  const getRoom = (roomId: string) => rooms.find(r => r.id === roomId);

  const filteredItems = selectedRoomFilter === 'all' 
    ? quote.items 
    : quote.items.filter(item => item.roomId === selectedRoomFilter);

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

  const addProcessingToItem = (itemId: string, processingId: string, optionValues?: ProcessingOptionValue[]) => {
    console.log('🔧 addProcessingToItem called:', { itemId, processingId, optionValues });
    
    const item = quote.items.find(i => i.id === itemId);
    const processing = getProcessing(processingId);
    const product = item ? getProduct(item.productId) : null;
    
    console.log('🔧 Found:', { item: !!item, processing: !!processing, product: !!product });
    console.log('🔧 Processing details:', processing ? { 
      id: processing.id, 
      name: processing.name, 
      requiresOptions: processing.requiresOptions,
      hasOptions: !!processing.options,
      optionsCount: processing.options?.length || 0
    } : 'null');

    if (!item || !processing || !product) {
      console.log('❌ Missing required data, returning early');
      return;
    }

    // If processing requires options but no option values provided, open option selector
    if (processing.requiresOptions && (!optionValues || optionValues.length === 0)) {
      console.log('🔧 Processing requires options, opening option selector...');
      openOptionSelector(itemId, processingId);
      return;
    }

    // Calculate processing price including option modifiers
    let calculatedPrice = 0;
    let optionPriceModifier = 0;
    
    if (optionValues) {
      optionPriceModifier = optionValues.reduce((sum, ov) => sum + (ov.priceModifier || 0), 0);
    }
    
    if (processing.pricingType === 'per_unit') {
      calculatedPrice = (processing.price + optionPriceModifier) * item.quantity;
    } else if (processing.pricingType === 'percentage') {
      calculatedPrice = item.basePrice * item.quantity * processing.price;
      if (optionPriceModifier > 0) {
        calculatedPrice += optionPriceModifier * item.quantity;
      }
    } else if (processing.pricingType === 'per_dimension' && product.dimensions) {
      calculatedPrice = (product.dimensions.width || 0) * processing.price;
      if (optionPriceModifier > 0) {
        calculatedPrice += optionPriceModifier;
      }
    }

    const updatedItems = quote.items.map(i => {
      if (i.id === itemId) {
        const updatedItem = {
          ...i,
          appliedProcessings: [
            ...i.appliedProcessings,
            { 
              processingId, 
              calculatedPrice,
              optionValues: optionValues || [],
              requiresOptions: false // Options are now provided
            }
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

  const updateProcessingOptions = (itemId: string, processingId: string, optionValues: ProcessingOptionValue[]) => {
    const item = quote.items.find(i => i.id === itemId);
    const processing = getProcessing(processingId);
    const product = item ? getProduct(item.productId) : null;
    
    if (!item || !processing || !product) return;

    // Recalculate price with new option values
    let calculatedPrice = 0;
    let optionPriceModifier = optionValues.reduce((sum, ov) => sum + (ov.priceModifier || 0), 0);
    
    if (processing.pricingType === 'per_unit') {
      calculatedPrice = (processing.price + optionPriceModifier) * item.quantity;
    } else if (processing.pricingType === 'percentage') {
      calculatedPrice = item.basePrice * item.quantity * processing.price;
      if (optionPriceModifier > 0) {
        calculatedPrice += optionPriceModifier * item.quantity;
      }
    } else if (processing.pricingType === 'per_dimension' && product.dimensions) {
      calculatedPrice = (product.dimensions.width || 0) * processing.price;
      if (optionPriceModifier > 0) {
        calculatedPrice += optionPriceModifier;
      }
    }

    const updatedItems = quote.items.map(i => {
      if (i.id === itemId) {
        const updatedItem = {
          ...i,
          appliedProcessings: i.appliedProcessings.map(ap => 
            ap.processingId === processingId 
              ? { 
                  ...ap, 
                  optionValues, 
                  calculatedPrice,
                  requiresOptions: false // Options are now provided
                }
              : ap
          )
        };
        updatedItem.totalPrice = (updatedItem.basePrice * updatedItem.quantity) + 
          updatedItem.appliedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
        return updatedItem;
      }
      return i;
    });

    recalculateQuote({ ...quote, items: updatedItems });
  };

  // Check if there are any pending processing options that need resolution
  const getPendingProcessingOptions = () => {
    const pendingOptions: { itemId: string; processingId: string; processingName: string; requiredOptions: string[] }[] = [];
    
    quote.items.forEach(item => {
      item.appliedProcessings.forEach(ap => {
        if (ap.requiresOptions) {
          const processing = getProcessing(ap.processingId);
          if (processing && processing.options) {
            const requiredOptions = processing.options
              .filter(opt => opt.required)
              .map(opt => opt.id);
            
            if (requiredOptions.length > 0) {
              pendingOptions.push({
                itemId: item.id,
                processingId: ap.processingId,
                processingName: processing.name,
                requiredOptions
              });
            }
          }
        }
      });
    });
    
    return pendingOptions;
  };

  const openOptionSelector = (itemId: string, processingId: string) => {
    console.log('🔧 openOptionSelector called:', { itemId, processingId });
    
    const processing = getProcessing(processingId);
    console.log('🔧 Processing found:', processing ? {
      id: processing.id,
      name: processing.name,
      requiresOptions: processing.requiresOptions,
      hasOptions: !!processing.options
    } : 'null');
    
    if (!processing || !processing.requiresOptions) {
      console.log('❌ Processing not found or does not require options, returning early');
      return;
    }

    console.log('🔧 Opening option selector modal...');
    setOptionSelector({
      isOpen: true,
      itemId,
      processingId,
      processing,
      currentValues: []
    });
    console.log('✅ Option selector state updated');
  };

  const closeOptionSelector = () => {
    setOptionSelector({
      isOpen: false,
      itemId: '',
      processingId: '',
      processing: null,
      currentValues: []
    });
  };

  const handleOptionValuesChange = (values: ProcessingOptionValue[]) => {
    setOptionSelector(prev => ({ ...prev, currentValues: values }));
  };

  const handleApplyOptions = () => {
    if (optionSelector.processing && optionSelector.currentValues.length > 0) {
      addProcessingToItem(optionSelector.itemId, optionSelector.processingId, optionSelector.currentValues);
    } else if (optionSelector.processing) {
      // If no options but processing requires them, add with empty values to flag as requiring options
      addProcessingToItem(optionSelector.itemId, optionSelector.processingId, []);
    }
    closeOptionSelector();
  };

  const applyOrderDiscount = () => {
    const updatedQuote = { ...quote, orderDiscount };
    recalculateQuote(updatedQuote);
  };

  const recalculateQuote = (updatedQuote: Quote) => {
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customerDiscount = subtotal * (updatedQuote.customerDiscount / 100);
    const totalDiscount = customerDiscount + updatedQuote.orderDiscount;
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

  // Group items by room for better organization
  const itemsByRoom = quote.items.reduce((acc, item) => {
    const roomId = item.roomId;
    if (!acc[roomId]) acc[roomId] = [];
    acc[roomId].push(item);
    return acc;
  }, {} as Record<string, typeof quote.items>);

  const pendingOptions = getPendingProcessingOptions();

  return (
    <div className="space-y-6" data-testid="simplified-quote-builder">
      {/* Pending Processing Options Alert */}
      {pendingOptions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-testid="pending-options-alert">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Processing Options Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The following processings require additional options to be specified:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {pendingOptions.map((option, index) => (
                    <li key={index}>
                      <strong>{option.processingName}</strong> - Missing: {option.requiredOptions.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter by Room</h3>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Rooms ({quote.items.length} items)</option>
            {rooms.map(room => {
              const roomItems = quote.items.filter(item => item.roomId === room.id);
              return (
                <option key={room.id} value={room.id}>
                  {room.name} ({roomItems.length} items)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Quote Items by Room */}
      <div className="space-y-6">
        {selectedRoomFilter === 'all' ? (
          // Show all rooms
          rooms.map(room => {
            const roomItems = itemsByRoom[room.id] || [];
            if (roomItems.length === 0) return null;

            return (
              <div key={room.id} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                  <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-600">{roomItems.length} items</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {roomItems.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      product={getProduct(item.productId)}
                      getProcessing={getProcessing}
                      getAvailableProcessings={getAvailableProcessings}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                      addProcessingToItem={addProcessingToItem}
                      removeProcessingFromItem={removeProcessingFromItem}
                      updateProcessingOptions={updateProcessingOptions}
                      openOptionSelector={openOptionSelector}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Show single room
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {getRoom(selectedRoomFilter)?.name || 'Room'} Items
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredItems.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  product={getProduct(item.productId)}
                  getProcessing={getProcessing}
                  getAvailableProcessings={getAvailableProcessings}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                  addProcessingToItem={addProcessingToItem}
                  removeProcessingFromItem={removeProcessingFromItem}
                  updateProcessingOptions={updateProcessingOptions}
                  openOptionSelector={openOptionSelector}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quote Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
          </div>
          
          {quote.customerDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Discount ({quote.customerDiscount}%):</span>
              <span className="text-red-600">-${(quote.subtotal * quote.customerDiscount / 100).toFixed(2)}</span>
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
                ⚠️ This quote requires approval as it exceeds ${quote.approvalThreshold.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processing Option Selector Modal */}
      {optionSelector.isOpen && optionSelector.processing && (
        <ProcessingOptionSelector
          processing={optionSelector.processing}
          currentValues={optionSelector.currentValues}
          onValuesChange={handleOptionValuesChange}
          onApply={handleApplyOptions}
          onCancel={closeOptionSelector}
        />
      )}
    </div>
  );
};

// Extracted ItemRow component for cleaner code
const ItemRow: React.FC<{
  item: any;
  product: any;
  getProcessing: any;
  getAvailableProcessings: any;
  updateQuantity: any;
  removeItem: any;
  addProcessingToItem: any;
  removeProcessingFromItem: any;
  updateProcessingOptions: any;
  openOptionSelector: any;
}> = ({
  item,
  product,
  getProcessing,
  getAvailableProcessings,
  updateQuantity,
  removeItem,
  addProcessingToItem,
  removeProcessingFromItem,
  updateProcessingOptions,
  openOptionSelector
}) => {
  if (!product) return null;

  const currentProcessingIds = item.appliedProcessings.map((ap: any) => ap.processingId);
  const availableProcessings = getAvailableProcessings(item.productId, currentProcessingIds);

  return (
    <div className="p-6">
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

      {/* Applied Processings */}
      {item.appliedProcessings.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Applied Processings:</h5>
          <div className="space-y-2">
            {item.appliedProcessings.map((ap: any) => {
              const processing = getProcessing(ap.processingId);
              return (
                <div key={ap.processingId} className={`px-3 py-2 rounded ${ap.requiresOptions ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50'}`} data-testid="applied-processing">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-900">{processing?.name}</span>
                        {ap.requiresOptions && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Options Required
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-blue-700">{processing?.description}</span>
                      
                      {/* Show option values if they exist */}
                      {ap.optionValues && ap.optionValues.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Options:</strong>
                          <ul className="ml-2 mt-1 space-y-1">
                            {ap.optionValues.map((ov: any, index: number) => {
                              const option = processing?.options?.find((opt: ProcessingOption) => opt.id === ov.optionId);
                              return (
                                <li key={index}>
                                  {option?.name}: {ov.value}
                                  {ov.priceModifier && ov.priceModifier > 0 && (
                                    <span className="text-green-600 ml-1">(+${ov.priceModifier})</span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="available-processings">
            {availableProcessings.map((processing: any) => (
              <button
                key={processing.id}
                data-testid="processing-item"
                onClick={() => addProcessingToItem(item.id, processing.id)}
                className="text-left p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="text-sm font-medium text-gray-900">{processing.name}</h6>
                    <p className="text-xs text-gray-600">{processing.description}</p>
                    {processing.requiresOptions && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                        Requires Options
                      </span>
                    )}
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
};

// ProcessingOptionSelector component for handling processing options
const ProcessingOptionSelector: React.FC<{
  processing: Processing;
  currentValues: ProcessingOptionValue[];
  onValuesChange: (values: ProcessingOptionValue[]) => void;
  onApply: () => void;
  onCancel: () => void;
}> = ({ processing, currentValues, onValuesChange, onApply, onCancel }) => {
  const [values, setValues] = useState<ProcessingOptionValue[]>(currentValues);

  const handleOptionChange = (optionId: string, value: any, priceModifier?: number) => {
    console.log(`🔧 handleOptionChange called: optionId=${optionId}, value=${value}, priceModifier=${priceModifier}`);
    
    const newValues = values.filter(v => v.optionId !== optionId);
    if (value !== undefined && value !== '') {
      newValues.push({ optionId, value, priceModifier });
    }
    
    console.log(`🔧 New values:`, newValues);
    setValues(newValues);
    onValuesChange(newValues);
  };

  const getCurrentValue = (optionId: string) => {
    const value = values.find(v => v.optionId === optionId)?.value;
    if (value === undefined || value === null) return '';
    return String(value);
  };

  const renderOptionInput = (option: ProcessingOption) => {
    const currentValue = getCurrentValue(option.id);

    switch (option.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={option.name}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => {
              console.log(`🔧 Number input changed: ${e.target.value}`);
              handleOptionChange(option.id, parseFloat(e.target.value) || 0);
            }}
            min={option.validation?.min}
            max={option.validation?.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={option.name}
          />
        );
      
      case 'select':
        return (
          <select
            value={currentValue}
            onChange={(e) => {
              const choice = option.choices?.find(c => c.value === e.target.value);
              handleOptionChange(option.id, e.target.value, choice?.priceModifier);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {option.name}</option>
            {option.choices?.map((choice, index) => (
              <option key={index} value={choice.value}>
                {choice.label} {choice.priceModifier && choice.priceModifier > 0 ? `(+$${choice.priceModifier})` : ''}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        const booleanValue = values.find(v => v.optionId === option.id)?.value === true;
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={booleanValue}
              onChange={(e) => handleOptionChange(option.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">{option.name}</label>
          </div>
        );
      
      default:
        return null;
    }
  };

  const isFormValid = () => {
    if (!processing.options) return true;
    
    const isValid = processing.options.every(option => {
      const value = getCurrentValue(option.id);
      const isRequired = option.required;
      const hasValue = value !== '';
      console.log(`🔧 Validation for ${option.name}: required=${isRequired}, value="${value}", hasValue=${hasValue}`);
      return !isRequired || hasValue;
    });
    
    console.log(`🔧 Form validation result: ${isValid}`);
    return isValid;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="option-selector-modal">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configure {processing.name}
          </h3>
          
          <div className="space-y-4">
            {processing.options?.map((option) => (
              <div key={option.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.name}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div data-testid="option-input">
                  {renderOptionInput(option)}
                </div>
                {option.validation && (
                  <p className="text-xs text-gray-500 mt-1">
                    {option.validation.min !== undefined && `Min: ${option.validation.min}`}
                    {option.validation.max !== undefined && ` Max: ${option.validation.max}`}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              data-testid="cancel-options-button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              data-testid="apply-options-button"
              disabled={!isFormValid()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedQuoteBuilder;

