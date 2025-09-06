import React, { useState, useEffect } from 'react';
import { Customer, Quote } from '../types';

interface DashboardProps {
  customers: Customer[];
  onStartNewQuote: (customer: Customer) => void;
  onEditQuote: (quote: Quote) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  customers,
  onStartNewQuote,
  onEditQuote
}) => {
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
              <span className="ml-4 text-sm text-gray-500">Configure, Price, Quote</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customer Selection Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">Customers</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCustomer?.id === customer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      {customer.contractId && (
                        <p className="text-sm text-gray-600">Contract: {customer.contractId}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">
                        {customer.discountPercentage}% discount
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartNewQuote}
              disabled={!selectedCustomer}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                selectedCustomer
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start New Quote
            </button>
          </div>

          {/* Saved Quotes Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">Saved Quotes</h2>
              </div>
              <span className="text-sm text-gray-600">{savedQuotes.length} quotes</span>
            </div>

            {savedQuotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No saved quotes</p>
                <p className="text-sm">Create your first quote to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {savedQuotes.map((quote) => (
                  <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {quote.quoteNumber || `Quote #${quote.id.slice(-6)}`}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quote.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quote.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Customer: {getCustomerName(quote.customerId)}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Created: {formatDate(quote.createdAt)}
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ${quote.finalTotal?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => onEditQuote(quote)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md"
                      >
                        Edit Quote
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{customers.length}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{savedQuotes.length}</div>
            <div className="text-sm text-gray-600">Saved Quotes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              ${savedQuotes.reduce((sum, quote) => sum + (quote.finalTotal || 0), 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Total Quote Value</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
