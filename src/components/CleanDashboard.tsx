import React, { useState, useEffect } from 'react';
import { Customer, Quote } from '../types';

interface CleanDashboardProps {
  customers: Customer[];
  onStartNewQuote: (customer: Customer) => void;
  onEditQuote: (quote: Quote) => void;
}

const CleanDashboard: React.FC<CleanDashboardProps> = ({
  customers,
  onStartNewQuote,
  onEditQuote
}) => {
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Load saved quotes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedQuotes');
    if (saved) {
      try {
        setSavedQuotes(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved quotes:', error);
      }
    }
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleStartNewQuote = () => {
    if (selectedCustomer) {
      onStartNewQuote(selectedCustomer);
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    const updatedQuotes = savedQuotes.filter(q => q.id !== quoteId);
    setSavedQuotes(updatedQuotes);
    localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{savedQuotes.length} saved quotes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Customers Panel - Scrollable */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
            </div>
            <div className="h-80 overflow-y-auto">
              <div className="p-4 space-y-2">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-blue-100 border-blue-300 border'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <h3 className="font-medium text-gray-900 text-sm">{customer.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Details / Action Panel */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCustomer ? 'Selected Customer' : 'Select Customer'}
              </h2>
            </div>
            <div className="p-6">
              {selectedCustomer ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h3>
                    {selectedCustomer.contractId && (
                      <p className="text-sm text-gray-600 mt-1">Contract: {selectedCustomer.contractId}</p>
                    )}
                    <p className="text-sm text-green-600 mt-1">
                      {selectedCustomer.discountPercentage}% discount rate
                    </p>
                  </div>
                  
                  <button
                    onClick={handleStartNewQuote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                  >
                    Start New Quote
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerDetails(false);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Select a customer to start a new quote</p>
                </div>
              )}
            </div>
          </div>

          {/* Saved Quotes Panel - Scrollable */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
            </div>
            
            {savedQuotes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No saved quotes yet</p>
              </div>
            ) : (
              <div className="h-80 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {savedQuotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {quote.quoteNumber || `#${quote.id.slice(-6)}`}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {getCustomerName(quote.customerId)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          ${quote.finalTotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditQuote(quote)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Statistics Bar */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{savedQuotes.length}</div>
              <div className="text-sm text-gray-600">Quotes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${savedQuotes.reduce((sum, quote) => sum + (quote.finalTotal || 0), 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CleanDashboard;
