import React, { useState } from 'react';
import { Quote, Product, Processing, ProcessingRule, ProductDependency, Room } from '../types';
import ProcessingOptionSelector from './ProcessingOptionSelector';

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
  
  // Processing options state
  const [showOptionSelector, setShowOptionSelector] = useState(false);
  const [selectedProcessing, setSelectedProcessing] = useState<Processing | null>(null);
  const [processingOptions, setProcessingOptions] = useState<{ [optionId: string]: any }>({});
  
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
    const item = quote.items.find(i => i.id === itemId);
    const processing = getProcessing(processingId);
    if (!item || !processing) return;

    // If processing has options, show option selector
    if (processing.options && processing.options.length > 0) {
      setSelectedProcessing(processing);
      setSelectedItemId(itemId);
      setProcessingOptions({});
      setShowOptionSelector(true);
      return;
    }

    // No options, apply directly
    const calculatedPrice = processing.pricingType === 'percentage' 
      ? item.basePrice * processing.price
      : processing.price;

    const appliedProcessing = {
      processingId,
      calculatedPrice,
      appliedAt: new Date().toISOString()
    };

    const updatedQuote = {
      ...quote,
      items: quote.items.map(i => 
        i.id === itemId 
          ? { 
              ...i, 
              appliedProcessings: [...i.appliedProcessings, appliedProcessing],
              totalPrice: i.basePrice + [...i.appliedProcessings, appliedProcessing].reduce((sum, ap) => sum + ap.calculatedPrice, 0)
            }
          : i
      )
    };

    // Recalculate quote totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscountAmount = subtotal * (updatedQuote.customerDiscount / 100);
    const finalTotal = subtotal - customerDiscountAmount - (updatedQuote.orderDiscount || 0);

    updatedQuote.subtotal = subtotal;
    updatedQuote.finalTotal = finalTotal;

    onQuoteUpdate(updatedQuote);
  };

  const handleApplyProcessingWithOptions = () => {
    if (!selectedProcessing || !selectedItemId) return;

    const item = quote.items.find(i => i.id === selectedItemId);
    if (!item) return;

    // Calculate price with options
    let basePrice = selectedProcessing.pricingType === 'percentage' 
      ? item.basePrice * selectedProcessing.price
      : selectedProcessing.price;

    // Add option price modifiers
    let optionModifier = 0;
    if (selectedProcessing.options) {
      selectedProcessing.options.forEach(option => {
        const selectedValue = processingOptions[option.id];
        if (selectedValue && option.choices) {
          const choice = option.choices.find(c => c.value === selectedValue);
          if (choice?.priceModifier) {
            optionModifier += choice.priceModifier;
          }
        }
      });
    }

    const calculatedPrice = basePrice + optionModifier;

    const appliedProcessing = {
      processingId: selectedProcessing.id,
      calculatedPrice,
      appliedAt: new Date().toISOString(),
      selectedOptions: processingOptions
    };

    const updatedQuote = {
      ...quote,
      items: quote.items.map(i => 
        i.id === selectedItemId 
          ? { 
              ...i, 
              appliedProcessings: [...i.appliedProcessings, appliedProcessing],
              totalPrice: i.basePrice + [...i.appliedProcessings, appliedProcessing].reduce((sum, ap) => sum + ap.calculatedPrice, 0)
            }
          : i
      )
    };

    // Recalculate quote totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscountAmount = subtotal * (updatedQuote.customerDiscount / 100);
    const finalTotal = subtotal - customerDiscountAmount - (updatedQuote.orderDiscount || 0);

    updatedQuote.subtotal = subtotal;
    updatedQuote.finalTotal = finalTotal;

    onQuoteUpdate(updatedQuote);
    
    // Close modal
    setShowOptionSelector(false);
    setSelectedProcessing(null);
    setSelectedItemId(null);
    setProcessingOptions({});
  };

  const removeProcessingFromItem = (itemId: string, processingId: string) => {
    const item = quote.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedProcessings = item.appliedProcessings.filter(ap => ap.processingId !== processingId);
    
    const updatedQuote = {
      ...quote,
      items: quote.items.map(i => 
        i.id === itemId 
          ? { 
              ...i, 
              appliedProcessings: updatedProcessings,
              totalPrice: i.basePrice + updatedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0)
            }
          : i
      )
    };

    // Recalculate quote totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscountAmount = subtotal * (updatedQuote.customerDiscount / 100);
    const finalTotal = subtotal - customerDiscountAmount - (updatedQuote.orderDiscount || 0);

    updatedQuote.subtotal = subtotal;
    updatedQuote.finalTotal = finalTotal;

    onQuoteUpdate(updatedQuote);
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedQuote = {
      ...quote,
      items: quote.items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    };

    // Recalculate quote totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscountAmount = subtotal * (updatedQuote.customerDiscount / 100);
    const finalTotal = subtotal - customerDiscountAmount - (updatedQuote.orderDiscount || 0);

    updatedQuote.subtotal = subtotal;
    updatedQuote.finalTotal = finalTotal;

    onQuoteUpdate(updatedQuote);
  };

  const removeItem = (itemId: string) => {
    const updatedQuote = {
      ...quote,
      items: quote.items.filter(item => item.id !== itemId)
    };

    // Recalculate quote totals
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const customerDiscountAmount = subtotal * (updatedQuote.customerDiscount / 100);
    const finalTotal = subtotal - customerDiscountAmount - (updatedQuote.orderDiscount || 0);

    updatedQuote.subtotal = subtotal;
    updatedQuote.finalTotal = finalTotal;

    onQuoteUpdate(updatedQuote);
    setSelectedItemId(null);
  };

  // Group items by room
  const itemsByRoom = quote.items.reduce((acc, item) => {
    const roomId = item.roomId || 'no-room';
    if (!acc[roomId]) acc[roomId] = [];
    acc[roomId].push(item);
    return acc;
  }, {} as Record<string, typeof quote.items>);

  const selectedItem = quote.items.find(item => item.id === selectedItemId);
  const availableProcessings = selectedItem 
    ? getAvailableProcessings(selectedItem.productId, selectedItem.appliedProcessings.map(ap => ap.processingId))
    : [];

  return (
    <div className="flex space-x-6">
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
              const roomTotal = roomItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);

              return (
                <div key={roomId} className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {room?.name || 'Unassigned Products'}
                        </h3>
                        {room?.dimensions && (
                          <p className="text-sm text-gray-600 mt-1">
                            {room.dimensions.width}" × {room.dimensions.height}" × {room.dimensions.depth}"
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{roomItems.length} items</p>
                        <p className="text-lg font-semibold text-green-600">${roomTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {roomItems.map((item) => {
                      const product = getProduct(item.productId);
                      const isSelected = selectedItemId === item.id;

                      return (
                        <div 
                          key={item.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200 ring-opacity-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {/* Room Context Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m5-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                    </svg>
                                    {room?.name || 'Unassigned Room'}
                                  </span>
                                  {isSelected && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md animate-pulse">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      SELECTED
                                    </span>
                                  )}
                                </div>
                                
                                {/* Selection Indicator */}
                                {isSelected && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <h4 className={`font-medium mt-1 ${isSelected ? 'text-blue-900 text-lg' : 'text-gray-900'}`}>
                                {product?.name}
                                {isSelected && (
                                  <span className="ml-2 inline-flex items-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                  </span>
                                )}
                              </h4>
                              <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                {product?.description}
                              </p>
                              
                              {item.appliedProcessings.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Applied Processings:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.appliedProcessings.map((ap) => {
                                      const processing = getProcessing(ap.processingId);
                                      return (
                                        <span
                                          key={ap.processingId}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                                        >
                                          {processing?.name} (+${ap.calculatedPrice.toFixed(2)})
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item.id, item.quantity - 1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateItemQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(item.id);
                                  }}
                                  className="ml-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-sm"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-gray-600">Base: ${item.basePrice.toFixed(2)}</p>
                                <p className="text-lg font-semibold text-green-600">
                                  ${(item.totalPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
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
        )}
      </div>

      {/* Right Side - Live Processing Pane */}
      <div className="w-96">
        {selectedItem ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 pb-4 border-b border-gray-200">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m5-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                  </svg>
                  {rooms.find(r => r.id === selectedItem.roomId)?.name || 'Unassigned Room'}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {getProduct(selectedItem.productId)?.name}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="flex items-center text-blue-600 font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Processing
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Processing</h3>
              
              {/* Enhanced Product Context with Room Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-900">
                          {rooms.find(r => r.id === selectedItem.roomId)?.name || 'Unassigned Room'}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-blue-300"></div>
                      <span className="text-sm text-blue-700">
                        {rooms.find(r => r.id === selectedItem.roomId)?.description || 'No description'}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-blue-900 mb-1">
                      {getProduct(selectedItem.productId)?.name}
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      {getProduct(selectedItem.productId)?.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Qty: {selectedItem.quantity}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Base: ${selectedItem.basePrice.toFixed(2)}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Total: ${(selectedItem.totalPrice * selectedItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-right">
                      <div className="text-xs text-blue-600 mb-1">Room Style</div>
                      <div className="text-sm font-medium text-blue-900">
                        {rooms.find(r => r.id === selectedItem.roomId)?.frontModelId ? 
                          products.find(p => p.id === rooms.find(r => r.id === selectedItem.roomId)?.frontModelId)?.name || 
                          'Unknown Style' : 'No Style Set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-200">
            <div className="max-w-sm mx-auto">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
              <p className="text-gray-600">
                Click on any product to configure its processings and pricing options.
              </p>
            </div>
          </div>
        )}

        {/* Quote Summary */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{quote.items.length}</span>
            </div>
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
