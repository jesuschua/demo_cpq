import React, { useState, useEffect } from 'react';
import { Quote, Customer, Room } from './types';
import { customers, models, products, processings, processingRules, productDependencies } from './data/sampleData';
import CustomerSelector from './components/CustomerSelector';
import RoomManager from './components/RoomManager';
import ProductCatalog from './components/ProductCatalog';
import ImprovedProcessingManager from './components/ImprovedProcessingManager';

// Define the 4 clear phases
type WorkflowPhase = 'customer_config' | 'room_config' | 'product_config' | 'quote_finalize';

interface WorkflowState {
  currentPhase: WorkflowPhase;
  customer: Customer | null;
  room: Room | null;
  products: Quote['items'];
  quote: Quote | null;
  savedStates: {
    customer?: Customer;
    room?: Room;
    products?: Quote['items'];
  };
}

function ImprovedApp() {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentPhase: 'customer_config',
    customer: null,
    room: null,
    products: [],
    quote: null,
    savedStates: {}
  });

  // Phase progression with validation
  const canProceedToNextPhase = () => {
    switch (workflow.currentPhase) {
      case 'customer_config': return workflow.customer !== null;
      case 'room_config': return workflow.room !== null;
      case 'product_config': return workflow.products.length > 0;
      case 'quote_finalize': return workflow.quote !== null;
      default: return false;
    }
  };

  const proceedToNextPhase = () => {
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'quote_finalize'];
    const currentIndex = phaseOrder.indexOf(workflow.currentPhase);
    
    if (currentIndex < phaseOrder.length - 1 && canProceedToNextPhase()) {
      const nextPhase = phaseOrder[currentIndex + 1];
      
      // Auto-create quote when moving to product config
      if (nextPhase === 'product_config' && !workflow.quote) {
        createQuoteFromCurrentState();
      }
      
      // Update quote when moving to quote finalization
      if (nextPhase === 'quote_finalize') {
        createQuoteFromCurrentState();
      }
      
      setWorkflow(prev => ({
        ...prev,
        currentPhase: nextPhase,
        savedStates: {
          ...prev.savedStates,
          [prev.currentPhase]: getCurrentPhaseData()
        }
      }));
    }
  };

  const goToPreviousPhase = () => {
    const phaseOrder: WorkflowPhase[] = ['customer_config', 'room_config', 'product_config', 'quote_finalize'];
    const currentIndex = phaseOrder.indexOf(workflow.currentPhase);
    
    if (currentIndex > 0) {
      const prevPhase = phaseOrder[currentIndex - 1];
      setWorkflow(prev => ({ ...prev, currentPhase: prevPhase }));
    }
  };

  const getCurrentPhaseData = () => {
    switch (workflow.currentPhase) {
      case 'customer_config': return workflow.customer;
      case 'room_config': return workflow.room;
      case 'product_config': return workflow.products;
      case 'quote_finalize': return workflow.quote;
      default: return null;
    }
  };

  // Save current phase state
  const saveCurrentPhase = () => {
    const currentData = getCurrentPhaseData();
    setWorkflow(prev => ({
      ...prev,
      savedStates: {
        ...prev.savedStates,
        [prev.currentPhase]: currentData
      }
    }));
    
    // Show save confirmation
    const phaseNames = {
      customer_config: 'Customer Configuration',
      room_config: 'Room Configuration', 
      product_config: 'Product Configuration',
      quote_finalize: 'Quote'
    };
    alert(`${phaseNames[workflow.currentPhase]} saved successfully!`);
  };

  // Create quote from current state
  const createQuoteFromCurrentState = () => {
    if (!workflow.customer || !workflow.room) return;

    const newQuote: Quote = {
      id: Date.now().toString(),
      customerId: workflow.customer.id,
      rooms: [workflow.room],
      items: workflow.products,
      contractDiscount: 0,
      customerDiscount: workflow.customer.discountPercentage || 0,
      orderDiscount: 0,
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requiresApproval: false,
      approvalThreshold: 5000
    };

    const updatedQuote = recalculateQuote(newQuote);
    setWorkflow(prev => ({ ...prev, quote: updatedQuote }));
  };

  // Recalculate quote totals
  const recalculateQuote = (quote: Quote): Quote => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customerDiscount = subtotal * (quote.customerDiscount / 100);
    const totalDiscount = customerDiscount + quote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    return {
      ...quote,
      subtotal,
      totalDiscount,
      finalTotal,
      requiresApproval: finalTotal > quote.approvalThreshold
    };
  };

  // Cascading updates when stepping back
  useEffect(() => {
    // If customer changes, clear room and products
    if (workflow.currentPhase === 'customer_config' && workflow.room) {
      setWorkflow(prev => ({ ...prev, room: null, products: [], quote: null }));
    }
    
    // If room changes, clear products that don't match the new room's model
    if (workflow.currentPhase === 'room_config' && workflow.room && workflow.products.length > 0) {
      const roomModel = models.find(m => m.id === workflow.room?.frontModelId);
      if (roomModel) {
        const compatibleProducts = workflow.products.filter(item => {
          const product = products.find(p => p.id === item.productId);
          return product?.modelId === roomModel.id;
        });
        
        if (compatibleProducts.length !== workflow.products.length) {
          setWorkflow(prev => ({ 
            ...prev, 
            products: compatibleProducts,
            quote: null // Clear quote to force recalculation
          }));
        }
      }
    }
  }, [workflow.customer, workflow.room, workflow.currentPhase, workflow.products]);

  // Phase-specific handlers
  const handleCustomerSelect = (customer: Customer) => {
    setWorkflow(prev => ({ ...prev, customer }));
  };

  const handleRoomCreate = (room: Room) => {
    setWorkflow(prev => ({ ...prev, room }));
  };

  const handleProductAdd = (productId: string, quantity: number = 1) => {
    if (!workflow.room) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItem = {
      id: Date.now().toString(),
      productId,
      roomId: workflow.room.id,
      quantity,
      appliedProcessings: [],
      basePrice: product.basePrice,
      totalPrice: product.basePrice * quantity
    };

    setWorkflow(prev => ({ 
      ...prev, 
      products: [...prev.products, newItem]
    }));
  };

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    setWorkflow(prev => ({ ...prev, quote: updatedQuote }));
  };

  // Remove product from workflow
  const removeProduct = (productId: string) => {
    setWorkflow(prev => ({
      ...prev,
      products: prev.products.filter(item => item.productId !== productId)
    }));
  };

  // Print quote
  const printQuote = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print functionality is not available in this browser.');
    }
  };

  const resetWorkflow = () => {
    setWorkflow({
      currentPhase: 'customer_config',
      customer: null,
      room: null,
      products: [],
      quote: null,
      savedStates: {}
    });
  };

  // Get the current room's model
  const getCurrentRoomModel = () => {
    if (!workflow.room) return null;
    return models.find(m => m.id === workflow.room!.frontModelId) || null;
  };

  // Phase titles and descriptions
  const phaseInfo = {
    customer_config: {
      title: 'Phase 1: Customer Configuration',
      description: 'Select and configure customer details'
    },
    room_config: {
      title: 'Phase 2: Room Configuration', 
      description: 'Create room and select styling preferences'
    },
    product_config: {
      title: 'Phase 3: Product Configuration',
      description: 'Select products that inherit room styling'
    },
    quote_finalize: {
      title: 'Phase 4: Quote Finalization',
      description: 'Review, adjust discounts, and finalize quote'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Phase Progression */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
              <span className="ml-4 text-sm text-gray-500">Improved Workflow</span>
            </div>
            
            {/* Phase Progress Indicator */}
            <div className="flex items-center space-x-2">
              {(['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).map((phase, index) => {
                const phaseNames = ['Customer', 'Room', 'Products', 'Quote'];
                const isActive = workflow.currentPhase === phase;
                const isCompleted = (['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) > index;
                
                return (
                  <div key={phase} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      {phaseNames[index]}
                    </span>
                    {index < 3 && <div className="w-8 h-0.5 bg-gray-300 mx-3" />}
                  </div>
                );
              })}
            </div>

            {/* Current Phase Info */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {phaseInfo[workflow.currentPhase].title}
              </div>
              <div className="text-xs text-gray-500">
                {phaseInfo[workflow.currentPhase].description}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
        
        {/* Phase 1: Customer Configuration */}
        {workflow.currentPhase === 'customer_config' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Customer</h2>
              <p className="text-gray-600">Select customer to start quote process</p>
            </div>
            
            <CustomerSelector
              customers={customers}
              contracts={[]}
              onCustomerSelect={handleCustomerSelect}
            />

            {workflow.customer && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-green-900">
                      Customer Selected: {workflow.customer.name}
                    </h3>
                    <p className="text-sm text-green-700">
                      Customer Discount: {workflow.customer.discountPercentage}%
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={saveCurrentPhase}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Save Customer
                    </button>
                    <button
                      onClick={proceedToNextPhase}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Proceed to Room Setup →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Room Configuration */}
        {workflow.currentPhase === 'room_config' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Room</h2>
              <p className="text-gray-600">
                Customer: <span className="font-medium">{workflow.customer?.name}</span>
              </p>
            </div>

            <RoomManager
              models={models}
              onCreateQuote={handleRoomCreate}
              existingRooms={workflow.room ? [workflow.room] : []}
              onAddRoom={handleRoomCreate}
            />

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousPhase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Back to Customer
              </button>

              {workflow.room && (
                <div className="flex space-x-3">
                  <button
                    onClick={saveCurrentPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Room Config
                  </button>
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Proceed to Products →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Product Configuration */}
        {workflow.currentPhase === 'product_config' && workflow.room && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Products</h2>
              <p className="text-gray-600">
                Room: <span className="font-medium">{workflow.room?.name}</span> | 
                Front Model: <span className="font-medium">{models.find(m => m.id === workflow.room?.frontModelId)?.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductCatalog
                  models={models} // Pass all models
                  products={products}
                  processings={processings}
                  selectedModel={getCurrentRoomModel()}
                  onModelSelect={() => {}} // Disabled in improved workflow
                  onAddToQuote={(product, quantity) => handleProductAdd(product.id, quantity)}
                  hasQuote={true}
                  onCreateQuote={() => {}}
                />
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Room:</span> <span className="font-medium">{workflow.room?.name}</span></p>
                    <p><span className="text-gray-600">Front Model:</span> <span className="font-medium">{models.find(m => m.id === workflow.room?.frontModelId)?.name}</span></p>
                    <p><span className="text-gray-600">Style:</span> <span className="font-medium capitalize">{models.find(m => m.id === workflow.room?.frontModelId)?.category}</span></p>
                    <p className="text-xs text-blue-600 mt-2">All products inherit this room's styling</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Products</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Items:</span> <span className="font-medium">{workflow.products.length}</span></p>
                    <p><span className="text-gray-600">Total Value:</span> <span className="font-medium">${workflow.products.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousPhase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Back to Room Setup
              </button>

              {workflow.products.length > 0 && (
                <div className="flex space-x-3">
                  <button
                    onClick={saveCurrentPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Product Config
                  </button>
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                  >
                    Proceed to Quote →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 4: Quote Finalization */}
        {workflow.currentPhase === 'quote_finalize' && workflow.quote && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Finalize Quote</h2>
              <p className="text-gray-600">Review and configure final quote details</p>
            </div>

            <ImprovedProcessingManager
              quote={workflow.quote}
              rooms={workflow.quote.rooms}
              products={products}
              processings={processings}
              processingRules={processingRules}
              productDependencies={productDependencies}
              onQuoteUpdate={handleQuoteUpdate}
            />

            <div className="mt-6 flex justify-between">
              <button
                onClick={goToPreviousPhase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                ← Back to Products
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const quoteData = {
                      ...workflow.quote,
                      quoteNumber: `Q-${Date.now().toString().slice(-6)}`,
                      savedAt: new Date()
                    };
                    console.log('Quote saved:', quoteData);
                    alert(`Quote ${quoteData.quoteNumber} saved successfully!`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Save Final Quote
                </button>
                <button
                  onClick={() => {
                    try {
                      window.print();
                    } catch (error) {
                      console.error('Print failed:', error);
                      alert('Print functionality is not available in this browser.');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Print Quote
                </button>
                <button
                  onClick={resetWorkflow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                >
                  New Quote
                </button>
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Selected Products Sidebar */}
          {(workflow.currentPhase === 'product_config' || workflow.currentPhase === 'quote_finalize') && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-8h6v8h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
                Selected Products
              </h3>
              
              {workflow.products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm">No products selected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflow.products.map((product, index) => {
                    const productDetails = products.find(p => p.id === product.productId);
                    return (
                      <div key={product.productId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{productDetails?.name}</h4>
                            <p className="text-xs text-gray-600">Qty: {product.quantity}</p>
                            <p className="text-xs text-gray-600">${productDetails?.basePrice.toFixed(2)} each</p>
                          </div>
                          <button
                            onClick={() => removeProduct(product.productId)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{workflow.products.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Est. Total:</span>
                      <span className="font-medium text-green-600">
                        ${workflow.products.reduce((sum, product) => {
                          const productDetails = products.find(p => p.id === product.productId);
                          return sum + (productDetails?.basePrice || 0) * product.quantity;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Phase {(['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1} of 4
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(((['customer_config', 'room_config', 'product_config', 'quote_finalize'] as WorkflowPhase[]).indexOf(workflow.currentPhase) + 1) / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-3">
                {workflow.currentPhase !== 'customer_config' && (
                  <button
                    onClick={goToPreviousPhase}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    ← Back
                  </button>
                )}
                
                {canProceedToNextPhase() && workflow.currentPhase !== 'quote_finalize' && (
                  <button
                    onClick={proceedToNextPhase}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                  >
                    Continue →
                  </button>
                )}

                {workflow.currentPhase === 'quote_finalize' && workflow.quote && (
                  <div className="flex space-x-2">
                    <button
                      onClick={saveCurrentPhase}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Save Quote
                    </button>
                    <button
                      onClick={printQuote}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Print
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ImprovedApp;
