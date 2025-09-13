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
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);

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


  const handleViewCustomerDetails = (customer: Customer) => {
    setCustomerToView(customer);
    setShowCustomerDetails(true);
  };

  const handleCreateOrderWithCustomer = (customer: Customer) => {
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
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kitchen CPQ</h1>
              <span className="ml-4 text-sm text-gray-500">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customer Information Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowCustomers(!showCustomers)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
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
                      className="p-3 rounded-lg border border-gray-200 hover:border-gray-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{customer.name}</h3>
                          <p className="text-xs text-gray-600">
                            {customer.contractId ? `Contract: ${customer.contractId}` : 'No contract'}
                          </p>
                          <p className="text-xs text-green-600">{customer.discountPercentage}% discount</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleViewCustomerDetails(customer)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleCreateOrderWithCustomer(customer)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            Create Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!showCustomers && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">Click to view customer information</p>
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

      {/* Customer Details Modal */}
      {showCustomerDetails && customerToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg text-gray-900">{customerToView.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract ID</label>
                  <p className="text-gray-900">{customerToView.contractId || 'No contract'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Discount Percentage</label>
                  <p className="text-lg text-green-600 font-semibold">{customerToView.discountPercentage}%</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCustomerDetails(false);
                    handleCreateOrderWithCustomer(customerToView);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create Order for This Customer
                </button>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalDashboard;
