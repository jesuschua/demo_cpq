import React from 'react';
import { Quote, Customer, Product } from '../types';

interface SavedQuotesProps {
  savedQuotes: Quote[];
  customer: Customer;
  products: Product[];
  onLoadQuote: (quote: Quote) => void;
  onPrintQuote: (quote: Quote) => void;
}

const SavedQuotes: React.FC<SavedQuotesProps> = ({
  savedQuotes,
  customer,
  products,
  onLoadQuote,
  onPrintQuote
}) => {
  const customerQuotes = savedQuotes.filter(q => q.customerId === customer.id);

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

  if (customerQuotes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Quotes</h3>
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <p className="text-gray-500">No saved quotes for {customer.name}</p>
          <p className="text-sm text-gray-400 mt-2">Create and save a quote to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Saved Quotes</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {customerQuotes.length} saved
        </span>
      </div>
      
      <div className="space-y-4">
        {customerQuotes
          .sort((a, b) => new Date(b.savedAt || b.createdAt).getTime() - new Date(a.savedAt || a.createdAt).getTime())
          .map((quote) => (
            <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Quote {quote.quoteNumber || quote.id}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatQuotePreview(quote)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${quote.finalTotal.toFixed(2)}</p>
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
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Created:</span> {new Date(quote.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Expires:</span> {new Date(quote.expiresAt).toLocaleDateString()}
                </div>
                {quote.savedAt && (
                  <div>
                    <span className="font-medium">Saved:</span> {new Date(quote.savedAt).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <span className="font-medium">Items:</span> {quote.items.length}
                </div>
              </div>

              {quote.notes && (
                <div className="mb-3">
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {quote.notes}
                  </p>
                </div>
              )}

              {quote.requiresApproval && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <span className="text-yellow-800">⚠️ Requires approval (over ${quote.approvalThreshold.toLocaleString()})</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onLoadQuote(quote)}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Load Quote
                </button>
                <button
                  onClick={() => onPrintQuote(quote)}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Print
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SavedQuotes;
