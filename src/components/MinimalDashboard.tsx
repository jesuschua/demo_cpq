import React, { useState, useEffect } from 'react';
import { Customer, Quote } from '../types';

interface MinimalDashboardProps {
  customers: Customer[];
  onStartNewQuote: (customer: Customer) => void;
  onEditQuote: (quote: Quote) => void;
}

const MinimalDashboard: React.FC<MinimalDashboardProps> = ({
  customers,
  onStartNewQuote,
  onEditQuote
}) => {
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

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
    onStartNewQuote(customer);
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
      {/* Header with Phase Progression */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
            </div>
            
            {/* Phase Progress Indicator */}
            <div className="flex items-center space-x-2">
              {(['customer_config', 'room_config', 'product_config', 'fees_config', 'finalize']).map((phase, index) => {
                const phaseNames = ['Customer', 'Room', 'Products', 'Fees', 'Finalize'];
                const isActive = phase === 'customer_config'; // Dashboard is always in customer phase
                const isCompleted = false; // No phases completed on dashboard
                
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
                    {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-3" />}
                  </div>
                );
              })}
            </div>

            {/* Current Phase Info */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Phase 1: Customer Configuration
              </div>
              <div className="text-xs text-gray-500">
                Select customer to start quote process
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customers Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowCustomers(!showCustomers)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{customers.length}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${showCustomers ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {showCustomers && (
              <div className="h-80 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 rounded-lg cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <h3 className="font-medium text-gray-900 text-sm">{customer.name}</h3>
                      <p className="text-xs text-gray-600">
                        {customer.contractId ? `Contract: ${customer.contractId}` : 'No contract'}
                      </p>
                      <p className="text-xs text-green-600">{customer.discountPercentage}% discount</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!showCustomers && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">Click to view and select customers</p>
              </div>
            )}
          </div>

          {/* Saved Quotes Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowQuotes(!showQuotes)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Saved Quotes</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{savedQuotes.length}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${showQuotes ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {showQuotes && savedQuotes.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No saved quotes yet</p>
              </div>
            )}
            
            {showQuotes && savedQuotes.length > 0 && (
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
                          <p className="text-xs text-gray-500">
                            {formatDate(quote.createdAt)}
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
            
            {!showQuotes && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">Click to view saved quotes</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Create a Quote?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Select a customer below to begin the quote process. You'll configure rooms, select products, and finalize your quote.
            </p>
            <button
              onClick={() => setShowCustomers(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Select Customer to Start New Quote
            </button>
          </div>
        </div>

        {/* Minimal Statistics */}
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

export default MinimalDashboard;
