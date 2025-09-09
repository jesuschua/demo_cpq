import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room } from '../types';
import ProcessingOptionSelector from './ProcessingOptionSelector';

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
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [orderDiscount, setOrderDiscount] = useState(quote.orderDiscount);
  
  // Processing options state
  const [showOptionSelector, setShowOptionSelector] = useState(false);
  const [selectedProcessing, setSelectedProcessing] = useState<Processing | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [processingOptions, setProcessingOptions] = useState<{ [optionId: string]: any }>({});

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

    // Debug: Check if custom paint is in the processings array
    const customPaint = processings.find(p => p.id === 'proc_paint_custom');

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

  const calculateProcessingPrice = (processing: Processing, item: any, selectedOptions: { [optionId: string]: any } = {}) => {
    let basePrice = 0;
    
    // Calculate base processing price
    if (processing.pricingType === 'per_unit') {
      basePrice = processing.price * item.quantity;
    } else if (processing.pricingType === 'percentage') {
      basePrice = item.basePrice * item.quantity * processing.price;
    } else if (processing.pricingType === 'per_dimension' && item.product?.dimensions) {
      basePrice = (item.product.dimensions.width || 0) * processing.price;
    }

    // Add option price modifiers
    let optionModifier = 0;
    if (processing.options) {
      processing.options.forEach(option => {
        const selectedValue = selectedOptions[option.id];
        if (selectedValue && option.choices) {
          const choice = option.choices.find(c => c.value === selectedValue);
          if (choice?.priceModifier) {
            optionModifier += choice.priceModifier * item.quantity;
          }
        }
      });
    }

    return basePrice + optionModifier;
  };

  const addProcessingToItem = (itemId: string, processingId: string) => {
    const item = quote.items.find(i => i.id === itemId);
    const processing = getProcessing(processingId);
    const product = item ? getProduct(item.productId) : null;
    
    if (!item || !processing || !product) return;

    // If processing has options, show option selector
    if (processing.options && processing.options.length > 0) {
      setSelectedProcessing(processing);
      setSelectedItemId(itemId);
      setProcessingOptions({});
      setShowOptionSelector(true);
      return;
    }

    // No options, apply directly
    const calculatedPrice = calculateProcessingPrice(processing, { ...item, product });

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

  const handleApplyProcessingWithOptions = () => {
    if (!selectedProcessing || !selectedItemId) return;

    const item = quote.items.find(i => i.id === selectedItemId);
    const product = item ? getProduct(item.productId) : null;
    
    if (!item || !product) return;

    const calculatedPrice = calculateProcessingPrice(selectedProcessing, { ...item, product }, processingOptions);

    const updatedItems = quote.items.map(i => {
      if (i.id === selectedItemId) {
        const updatedItem = {
          ...i,
          appliedProcessings: [
            ...i.appliedProcessings,
            { 
              processingId: selectedProcessing.id, 
              calculatedPrice,
              selectedOptions: processingOptions
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
    
    // Close option selector
    setShowOptionSelector(false);
    setSelectedProcessing(null);
    setSelectedItemId(null);
    setProcessingOptions({});
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


  return (
    <div className="space-y-6">
      {/* Processing Option Selector Modal */}
      {showOptionSelector && selectedProcessing && (
        <ProcessingOptionSelector
          processingId={selectedProcessing.id}
          processingName={selectedProcessing.name}
          options={selectedProcessing.options || []}
          selectedOptions={processingOptions}
          onOptionsChange={setProcessingOptions}
          onClose={() => {
            setShowOptionSelector(false);
            setSelectedProcessing(null);
            setSelectedItemId(null);
            setProcessingOptions({});
          }}
          onApply={handleApplyProcessingWithOptions}
        />
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
}> = ({
  item,
  product,
  getProcessing,
  getAvailableProcessings,
  updateQuantity,
  removeItem,
  addProcessingToItem,
  removeProcessingFromItem
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
                <div key={ap.processingId} className="bg-blue-50 px-3 py-2 rounded">
                  <div className="flex justify-between items-center mb-1">
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
                  
                  {/* Display selected options */}
                  {ap.selectedOptions && Object.keys(ap.selectedOptions).length > 0 && (
                    <div className="mt-2 text-xs text-blue-800">
                      <div className="font-medium mb-1">Selected Options:</div>
                      {Object.entries(ap.selectedOptions).map(([optionId, value]) => {
                        const option = processing?.options?.find((o: any) => o.id === optionId);
                        if (!option) return null;
                        
                        let displayValue: React.ReactNode = String(value);
                        if (option.type === 'color') {
                          displayValue = (
                            <span className="inline-flex items-center">
                              <span 
                                className="w-3 h-3 rounded-full border border-gray-300 mr-1" 
                                style={{ backgroundColor: value as string }}
                              />
                              {value as string}
                            </span>
                          );
                        } else if (option.type === 'select') {
                          const choice = option.choices?.find((c: any) => c.value === value);
                          displayValue = choice?.label || (value as string);
                        } else if (option.type === 'dimensions' && typeof value === 'object' && value !== null) {
                          const dims = value as { width?: number; height?: number; depth?: number };
                          displayValue = `${dims.width || 0}" × ${dims.height || 0}" × ${dims.depth || 0}"`;
                        }
                        
                        return (
                          <div key={optionId} className="ml-2">
                            <span className="font-medium">{option.name}:</span> {displayValue}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Processings */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Available Processings:</h5>
        <div className="text-xs text-gray-500 mb-2">
          Found {availableProcessings.length} processings for {product?.category} products
        </div>
        {availableProcessings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableProcessings.map((processing: any) => {
              return (
              <button
                key={processing.id}
                onClick={() => {
                  addProcessingToItem(item.id, processing.id);
                }}
                className="text-left p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="text-sm font-medium text-gray-900">{processing.name}</h6>
                    <p className="text-xs text-gray-600">{processing.description}</p>
                    {processing.options && processing.options.length > 0 && (
                      <p className="text-xs text-blue-600 font-medium">⚙️ Has {processing.options.length} options</p>
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
            );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No processings available for this product type</div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedQuoteBuilder;

