import React, { useState } from 'react';
import { Model, Product, Customer, Quote, QuoteItem } from './types';
import { models, products, processings, processingRules, productDependencies, customers, contracts } from './data/sampleData';
import CustomerSelector from './components/CustomerSelector';
import ProductCatalog from './components/ProductCatalog';
import QuoteBuilder from './components/QuoteBuilder';
import QuoteDisplay from './components/QuoteDisplay';
import QuoteActions from './components/QuoteActions';
import SavedQuotes from './components/SavedQuotes';
import QuotesDashboard from './components/QuotesDashboard';

function App() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'quote' | 'saved'>('catalog');
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);

  const initializeQuote = () => {
    if (!selectedCustomer) return;
    
    const newQuote: Quote = {
      id: `quote_${Date.now()}`,
      customerId: selectedCustomer.id,
      items: [],
      contractDiscount: contracts.find(c => c.id === selectedCustomer.contractId)?.discountPercentage || 0,
      customerDiscount: selectedCustomer.discountPercentage,
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
    
    setCurrentQuote(newQuote);
    setActiveTab('quote');
  };

  const addProductToQuote = (product: Product, quantity: number = 1) => {
    if (!currentQuote) return;
    
    const quoteItem: QuoteItem = {
      id: `item_${Date.now()}`,
      productId: product.id,
      quantity,
      appliedProcessings: [],
      basePrice: product.basePrice,
      totalPrice: product.basePrice * quantity
    };
    
    const updatedQuote = { ...currentQuote, items: [...currentQuote.items, quoteItem] };
    const subtotal = updatedQuote.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const contractDiscount = subtotal * (updatedQuote.contractDiscount / 100);
    const customerDiscount = (subtotal - contractDiscount) * (updatedQuote.customerDiscount / 100);
    const totalDiscount = contractDiscount + customerDiscount + updatedQuote.orderDiscount;
    const finalTotal = subtotal - totalDiscount;
    
    updatedQuote.subtotal = subtotal;
    updatedQuote.totalDiscount = totalDiscount;
    updatedQuote.finalTotal = finalTotal;
    updatedQuote.requiresApproval = finalTotal > updatedQuote.approvalThreshold;
    
    setCurrentQuote(updatedQuote);
  };

  const handleSaveQuote = (quote: Quote) => {
    // Add to saved quotes
    setSavedQuotes(prev => {
      const existingIndex = prev.findIndex(q => q.id === quote.id);
      if (existingIndex >= 0) {
        // Update existing quote
        const updated = [...prev];
        updated[existingIndex] = quote;
        return updated;
      } else {
        // Add new quote
        return [...prev, quote];
      }
    });

    // Update current quote
    setCurrentQuote(quote);
    
    // Show success message (in real app, this would be a proper notification)
    alert(`Quote ${quote.quoteNumber} saved successfully!`);
  };

  const handlePrintQuote = (quote: Quote) => {
    console.log('Printing quote:', quote.quoteNumber || quote.id);
    // Print functionality is handled in QuoteActions component
  };

  const handleLoadQuote = (quote: Quote, customer?: Customer) => {
    setCurrentQuote(quote);
    if (customer) {
      setSelectedCustomer(customer);
    }
    setActiveTab('quote');
  };

  const handleLoadQuoteFromDashboard = (quote: Quote, customer: Customer) => {
    setCurrentQuote(quote);
    setSelectedCustomer(customer);
    setActiveTab('quote');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ System</h1>
              <p className="text-sm text-gray-600">Configure, Price, Quote</p>
            </div>
            <div className="flex items-center space-x-4">
              {selectedCustomer && (
                <>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    ← Back to Dashboard
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-500">
                      Contract: {contracts.find(c => c.id === selectedCustomer.contractId)?.discountPercentage || 0}% + Customer: {selectedCustomer.discountPercentage}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!selectedCustomer && (
        <>
          <CustomerSelector 
            customers={customers}
            contracts={contracts}
            onCustomerSelect={setSelectedCustomer}
          />
          <QuotesDashboard
            savedQuotes={savedQuotes}
            customers={customers}
            contracts={contracts}
            products={products}
            onLoadQuote={handleLoadQuoteFromDashboard}
            onPrintQuote={handlePrintQuote}
          />
        </>
      )}

      {selectedCustomer && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'catalog'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('catalog')}
                >
                  Product Catalog
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'quote'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('quote')}
                  disabled={!currentQuote}
                >
                  Quote Builder
                  {currentQuote && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {currentQuote.items.length}
                    </span>
                  )}
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'saved'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('saved')}
                >
                  Saved Quotes
                  {savedQuotes.filter(q => q.customerId === selectedCustomer?.id).length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {savedQuotes.filter(q => q.customerId === selectedCustomer?.id).length}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <ProductCatalog
                  models={models}
                  products={products}
                  processings={processings}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  onAddToQuote={addProductToQuote}
                  hasQuote={!!currentQuote}
                  onCreateQuote={initializeQuote}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                {currentQuote && (
                  <>
                    <QuoteDisplay
                      quote={currentQuote}
                      products={products}
                      customer={selectedCustomer}
                    />
                    <QuoteActions
                      quote={currentQuote}
                      customer={selectedCustomer}
                      products={products}
                      onSaveQuote={handleSaveQuote}
                      onPrintQuote={handlePrintQuote}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'quote' && currentQuote && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <QuoteBuilder
                  quote={currentQuote}
                  products={products}
                  processings={processings}
                  processingRules={processingRules}
                  productDependencies={productDependencies}
                  onQuoteUpdate={setCurrentQuote}
                />
              </div>
              <div className="lg:col-span-1">
                <QuoteActions
                  quote={currentQuote}
                  customer={selectedCustomer}
                  products={products}
                  onSaveQuote={handleSaveQuote}
                  onPrintQuote={handlePrintQuote}
                />
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <SavedQuotes
              savedQuotes={savedQuotes}
              customer={selectedCustomer}
              products={products}
              onLoadQuote={(quote) => handleLoadQuote(quote)}
              onPrintQuote={handlePrintQuote}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
