import React, { useState } from 'react';
import { Quote, Customer, Room, Model } from './types';
import { customers, models, products, processings, processingRules, productDependencies } from './data/sampleData';
import CustomerSelector from './components/CustomerSelector';
import RoomManager from './components/RoomManager';
import ProductCatalog from './components/ProductCatalog';
import SimplifiedQuoteBuilder from './components/SimplifiedQuoteBuilder';

type ViewType = 'customer_selection' | 'room_management' | 'product_selection' | 'quote_builder';

interface SimplifiedAppState {
  currentView: ViewType;
  selectedCustomer: Customer | null;
  currentQuote: Quote | null;
  savedQuotes: Quote[];
}

function SimplifiedApp() {
  const [state, setState] = useState<SimplifiedAppState>({
    currentView: 'customer_selection',
    selectedCustomer: null,
    currentQuote: null,
    savedQuotes: []
  });

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const handleCustomerSelect = (customer: Customer) => {
    setState(prev => ({ 
      ...prev, 
      selectedCustomer: customer,
      currentView: 'room_management'
    }));
  };

  const handleCreateQuote = (initialRoom: Room) => {
    alert('🔧 handleCreateQuote called with room: ' + JSON.stringify(initialRoom));
    console.log('🔧 handleCreateQuote called with room:', initialRoom);
    
    const newQuote: Quote = {
      id: Date.now().toString(),
      customerId: state.selectedCustomer!.id,
      rooms: [initialRoom],
      items: [],
      contractDiscount: 0,
      customerDiscount: state.selectedCustomer?.discountPercentage || 0,
      orderDiscount: 0,
      subtotal: 0,
      totalDiscount: 0,
      finalTotal: 0,
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      requiresApproval: false,
      approvalThreshold: 50000
    };

    // Set the selected model based on the room's frontModelId
    const roomModel = models.find(m => m.id === initialRoom.frontModelId);
    console.log('🔧 Looking for model with ID:', initialRoom.frontModelId);
    console.log('🔧 Available models:', models.map(m => ({ id: m.id, name: m.name })));
    console.log('🔧 Found room model:', roomModel);
    
    if (roomModel) {
      setSelectedModel(roomModel);
      console.log('🔧 Selected model set to:', roomModel.name);
    } else {
      console.log('❌ No model found for frontModelId:', initialRoom.frontModelId);
    }

    setState(prev => ({ 
      ...prev, 
      currentQuote: newQuote,
      currentView: 'product_selection'
    }));
    setSelectedRoom(initialRoom);
  };

  const handleAddRoom = (room: Room) => {
    if (!state.currentQuote) return;
    
    const updatedQuote = {
      ...state.currentQuote,
      rooms: [...state.currentQuote.rooms, room]
    };
    
    // Set the selected model based on the room's frontModelId
    const roomModel = models.find(m => m.id === room.frontModelId);
    if (roomModel) {
      setSelectedModel(roomModel);
    }
    
    setState(prev => ({ ...prev, currentQuote: updatedQuote }));
  };

  const handleAddProductToQuote = (productId: string, quantity: number = 1) => {
    console.log('🔧 handleAddProductToQuote called:', { productId, quantity, hasQuote: !!state.currentQuote, selectedRoom: !!selectedRoom });
    
    if (!state.currentQuote || !selectedRoom) {
      console.log('❌ Missing currentQuote or selectedRoom');
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      return;
    }

    console.log('🔧 Adding product to quote:', product.name);

    const newItem = {
      id: Date.now().toString(),
      productId,
      roomId: selectedRoom.id,
      quantity,
      appliedProcessings: [],
      basePrice: product.basePrice,
      totalPrice: product.basePrice * quantity
    };

    const updatedItems = [...state.currentQuote.items, newItem];
    const updatedQuote = { ...state.currentQuote, items: updatedItems };
    
    // Recalculate totals
    recalculateQuote(updatedQuote);
    
    // Update state with the new quote
    setState(prev => ({ ...prev, currentQuote: updatedQuote }));
    console.log('✅ Product added to quote, new item count:', updatedItems.length);
  };

  const recalculateQuote = (quote: Quote) => {
    const subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customerDiscount = subtotal * (quote.customerDiscount / 100);
    const totalDiscount = customerDiscount + quote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;

    const finalQuote = {
      ...quote,
      subtotal,
      totalDiscount,
      finalTotal,
      requiresApproval: finalTotal > quote.approvalThreshold
    };

    setState(prev => ({ ...prev, currentQuote: finalQuote }));
  };

  const handleQuoteUpdate = (updatedQuote: Quote) => {
    setState(prev => ({ ...prev, currentQuote: updatedQuote }));
  };

  const handleSaveQuote = () => {
    if (!state.currentQuote) return;
    
    const savedQuote = {
      ...state.currentQuote,
      savedAt: new Date(),
      quoteNumber: `Q-${Date.now().toString().slice(-6)}`
    };

    setState(prev => ({
      ...prev,
      savedQuotes: [...prev.savedQuotes, savedQuote]
    }));

    alert('Quote saved successfully!');
  };

  const handleBackToCustomers = () => {
    setState(prev => ({
      ...prev,
      currentView: 'customer_selection',
      selectedCustomer: null,
      currentQuote: null
    }));
    setSelectedRoom(null);
    setSelectedModel(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
              <span className="ml-4 text-sm text-gray-500">Configure, Price, Quote</span>
            </div>
            
            {state.selectedCustomer && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{state.selectedCustomer.name}</p>
                  <p className="text-xs text-gray-500">
                    {state.selectedCustomer.discountPercentage}% Customer Discount
                  </p>
                </div>
                <button
                  onClick={handleBackToCustomers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Customer
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Selection */}
        {state.currentView === 'customer_selection' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Customer</h2>
              <p className="text-gray-600">Choose a customer to start creating a quote</p>
            </div>
            <CustomerSelector
              customers={customers}
              contracts={[]} // No contracts in simplified version
              onCustomerSelect={handleCustomerSelect}
            />
          </div>
        )}

        {/* Room Management */}
        {state.currentView === 'room_management' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Room Setup</h2>
              <p className="text-gray-600">Create rooms and select front models for your quote</p>
            </div>
            <RoomManager
              models={models}
              onCreateQuote={handleCreateQuote}
              existingRooms={state.currentQuote?.rooms || []}
              onAddRoom={handleAddRoom}
            />
          </div>
        )}

        {/* Product Selection & Quote Building */}
        {state.currentView === 'product_selection' && state.currentQuote && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Build Your Quote</h2>
                <p className="text-gray-600">
                  Current Room: <span className="font-medium">{selectedRoom?.name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-green-600">
                  Total: ${state.currentQuote.finalTotal.toFixed(2)}
                </span>
                <button
                  onClick={handleSaveQuote}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Save Quote
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, currentView: 'quote_builder' }))}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Configure Items
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProductCatalog
                  models={models}
                  products={products}
                  processings={processings}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onAddToQuote={(product, quantity) => handleAddProductToQuote(product.id, quantity)}
                  hasQuote={true}
                  onCreateQuote={() => {}}
                />
              </div>
              
              <div className="space-y-6">
                {/* Quick Quote Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{state.currentQuote.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${state.currentQuote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Discount:</span>
                      <span className="text-red-600">-${(state.currentQuote.subtotal * state.currentQuote.customerDiscount / 100).toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-green-600">${state.currentQuote.finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                {selectedRoom && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Room</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedRoom.name}</span></p>
                      <p><span className="text-gray-600">Front Model:</span> <span className="font-medium">{models.find(m => m.id === selectedRoom.frontModelId)?.name}</span></p>
                      <p className="text-xs text-gray-500 mt-2">{selectedRoom.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Quote Builder */}
        {state.currentView === 'quote_builder' && state.currentQuote && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configure Quote Items</h2>
                <p className="text-gray-600">Apply processings and customize your products</p>
              </div>
              <button
                onClick={() => setState(prev => ({ ...prev, currentView: 'product_selection' }))}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Back to Products
              </button>
            </div>

            <SimplifiedQuoteBuilder
              quote={state.currentQuote}
              rooms={state.currentQuote.rooms}
              products={products}
              processings={processings}
              processingRules={processingRules}
              productDependencies={productDependencies}
              onQuoteUpdate={handleQuoteUpdate}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default SimplifiedApp;
