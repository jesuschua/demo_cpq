import React from 'react';
import { Quote, Customer, Product, Contract } from '../types';

interface QuotesDashboardProps {
  savedQuotes: Quote[];
  customers: Customer[];
  contracts: Contract[];
  products: Product[];
  onLoadQuote: (quote: Quote, customer: Customer) => void;
  onPrintQuote: (quote: Quote) => void;
}

const QuotesDashboard: React.FC<QuotesDashboardProps> = ({
  savedQuotes,
  customers,
  contracts,
  products,
  onLoadQuote,
  onPrintQuote
}) => {
  const getCustomer = (customerId: string) => customers.find(c => c.id === customerId);
  const getContract = (contractId?: string) => contracts.find(c => c.id === contractId);
  const getProduct = (productId: string) => products.find(p => p.id === productId);

  const formatQuotePreview = (quote: Quote) => {
    const itemCount = quote.items.length;
    const topProducts = quote.items.slice(0, 2).map(item => {
      const product = getProduct(item.productId);
      return product?.name || 'Unknown Product';
    });
    
    if (itemCount > 2) {
      return `${topProducts.join(', ')} +${itemCount - 2} more`;
    }
    return topProducts.join(', ');
  };

  const recentQuotes = savedQuotes
    .sort((a, b) => new Date(b.savedAt || b.createdAt).getTime() - new Date(a.savedAt || a.createdAt).getTime())
    .slice(0, 8);

  const groupedQuotes = savedQuotes.reduce((acc, quote) => {
    const customer = getCustomer(quote.customerId);
    if (customer) {
      if (!acc[customer.id]) {
        acc[customer.id] = {
          customer,
          quotes: []
        };
      }
      acc[customer.id].quotes.push(quote);
    }
    return acc;
  }, {} as Record<string, { customer: Customer; quotes: Quote[] }>);

  if (savedQuotes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Quotes Yet</h2>
            <p className="text-gray-600 mb-6">Create your first quote by selecting a customer above</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📝 Step 1</div>
                <div>Select a customer from the list above</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🛠️ Step 2</div>
                <div>Build your quote with products and processings</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">💾 Step 3</div>
                <div>Save and access your quotes from here</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Quotes</h2>
        <p className="text-gray-600">Quick access to your most recent saved quotes</p>
      </div>

      {/* Recent Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
        {recentQuotes.map((quote) => {
          const customer = getCustomer(quote.customerId);
          const contract = getContract(customer?.contractId);
          
          if (!customer) return null;

          return (
            <div key={quote.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {quote.quoteNumber || quote.id.slice(-6)}
                  </h3>
                  <p className="text-xs text-gray-600">{customer.name}</p>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  quote.status === 'draft' 
                    ? 'bg-gray-100 text-gray-800'
                    : quote.status === 'pending_approval'
                    ? 'bg-yellow-100 text-yellow-800'
                    : quote.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {quote.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {formatQuotePreview(quote)}
                </p>
              </div>

              <div className="flex justify-between items-center mb-3 text-xs text-gray-600">
                <span>{quote.items.length} items</span>
                <span className="font-semibold text-green-600">${quote.finalTotal.toFixed(0)}</span>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                <div>Created: {new Date(quote.createdAt).toLocaleDateString()}</div>
                {quote.savedAt && (
                  <div>Saved: {new Date(quote.savedAt).toLocaleDateString()}</div>
                )}
              </div>

              {quote.requiresApproval && (
                <div className="mb-3 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <span className="text-yellow-800">⚠️ Requires approval</span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => onLoadQuote(quote, customer)}
                  className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Load
                </button>
                <button
                  onClick={() => onPrintQuote(quote)}
                  className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Print
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quotes by Customer */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quotes by Customer</h3>
        <div className="space-y-4">
          {Object.values(groupedQuotes)
            .sort((a, b) => b.quotes.length - a.quotes.length)
            .map(({ customer, quotes }) => {
              const contract = getContract(customer.contractId);
              const totalValue = quotes.reduce((sum, q) => sum + q.finalTotal, 0);
              
              return (
                <div key={customer.id} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{customer.name}</h4>
                      <p className="text-sm text-gray-600">
                        {contract?.name} • {quotes.length} quotes • Total: ${totalValue.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">Discounts:</p>
                      <p className="font-medium text-blue-600">
                        {contract?.discountPercentage || 0}% + {customer.discountPercentage}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quotes
                      .sort((a, b) => new Date(b.savedAt || b.createdAt).getTime() - new Date(a.savedAt || a.createdAt).getTime())
                      .slice(0, 6)
                      .map((quote) => (
                        <div key={quote.id} className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {quote.quoteNumber || quote.id.slice(-6)}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              ${quote.finalTotal.toFixed(0)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                            {formatQuotePreview(quote)}
                          </p>
                          
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>{quote.items.length} items</span>
                            <span>{new Date(quote.savedAt || quote.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onLoadQuote(quote, customer)}
                              className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => onPrintQuote(quote)}
                              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            >
                              Print
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {quotes.length > 6 && (
                    <div className="mt-3 text-center">
                      <span className="text-sm text-gray-500">
                        +{quotes.length - 6} more quotes for this customer
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default QuotesDashboard;
