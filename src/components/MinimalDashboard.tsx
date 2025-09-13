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
        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Create New Quote Module */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-blue-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Quote</h3>
              <p className="text-sm text-gray-600 mb-4">Start a new quote for a customer and configure their order</p>
              <button
                onClick={() => setShowCustomers(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Create Quote
              </button>
            </div>
          </div>

          {/* Customer Management Module */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-gray-400">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
              <p className="text-sm text-gray-600 mb-4">View and manage customer information and details</p>
              <button
                onClick={() => setShowCustomers(true)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Manage Customers
              </button>
            </div>
          </div>

          {/* Quote Management Module */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-gray-400">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Management</h3>
              <p className="text-sm text-gray-600 mb-4">View, edit, and manage existing quotes and orders</p>
              <button
                onClick={() => setShowQuotes(true)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                View Quotes
              </button>
            </div>
          </div>

        </div>

        {/* Customer Selection Modal */}
        {showCustomers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Select Customer</h3>
                  <button
                    onClick={() => setShowCustomers(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                          <p className="text-sm text-gray-600">
                            {customer.contractId ? `Contract: ${customer.contractId}` : 'No contract'}
                          </p>
                          <p className="text-sm text-green-600 font-medium">{customer.discountPercentage}% discount</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCustomerDetails(customer)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomers(false);
                            handleCreateOrderWithCustomer(customer);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium"
                        >
                          Create Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quote Management Modal */}
        {showQuotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Saved Quotes</h3>
                  <button
                    onClick={() => setShowQuotes(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {savedQuotes.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No saved quotes yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedQuotes.map((quote) => (
                      <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {quote.quoteNumber || `#${quote.id.slice(-6)}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {getCustomerName(quote.customerId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(quote.createdAt)}
                            </p>
                          </div>
                          <span className="text-lg font-semibold text-green-600">
                            ${quote.finalTotal?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowQuotes(false);
                              onEditQuote(quote);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium"
                          >
                            Edit Quote
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium"
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
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{customers.length}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{savedQuotes.length}</div>
              <div className="text-sm text-gray-600">Saved Quotes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
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
