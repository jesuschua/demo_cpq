import React, { useState } from 'react';
import { Quote, Customer, Product } from '../types';

interface QuoteActionsProps {
  quote: Quote;
  customer: Customer;
  products: Product[];
  onSaveQuote: (quote: Quote) => void;
  onPrintQuote: (quote: Quote) => void;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  quote,
  customer,
  products,
  onSaveQuote,
  onPrintQuote
}) => {
  const [notes, setNotes] = useState(quote.notes || '');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    const quoteNumber = quote.quoteNumber || `Q${Date.now().toString().slice(-6)}`;
    const savedQuote: Quote = {
      ...quote,
      notes,
      savedAt: new Date(),
      quoteNumber,
      status: quote.status === 'draft' ? 'pending_approval' : quote.status
    };

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSaveQuote(savedQuote);
    setIsSaving(false);
    setShowSaveDialog(false);
  };

  const handlePrint = () => {
    // Create a print-friendly version
    onPrintQuote(quote);
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintHTML = () => {
    const getProduct = (productId: string) => products.find(p => p.id === productId);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quote ${quote.quoteNumber || quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .quote-title { font-size: 20px; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f9fafb; font-weight: bold; }
            .totals { background-color: #f9fafb; }
            .total-row { font-weight: bold; font-size: 16px; }
            .text-right { text-align: right; }
            .text-green { color: #059669; }
            .text-red { color: #dc2626; }
            .approval-notice { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Kitchen CPQ Solutions</div>
            <div class="quote-title">Quote ${quote.quoteNumber || quote.id}</div>
            <div style="margin-top: 10px;">
              <strong>Date:</strong> ${quote.createdAt.toLocaleDateString()} | 
              <strong>Expires:</strong> ${quote.expiresAt.toLocaleDateString()}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Contract Discount:</strong> ${quote.contractDiscount}%</p>
            <p><strong>Customer Discount:</strong> ${quote.customerDiscount}%</p>
          </div>

          <div class="section">
            <div class="section-title">Quote Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Description</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Processings</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${quote.items.map(item => {
                  const product = getProduct(item.productId);
                  const processingCost = item.appliedProcessings.reduce((sum, ap) => sum + ap.calculatedPrice, 0);
                  return `
                    <tr>
                      <td><strong>${product?.name || 'Unknown Product'}</strong></td>
                      <td>${product?.description || ''}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right">$${item.basePrice.toFixed(2)}</td>
                      <td class="text-right">$${processingCost.toFixed(2)}</td>
                      <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Quote Summary</div>
            <table class="totals">
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td class="text-right">$${quote.subtotal.toFixed(2)}</td>
              </tr>
              ${quote.contractDiscount > 0 ? `
              <tr>
                <td>Contract Discount (${quote.contractDiscount}%):</td>
                <td class="text-right text-red">-$${(quote.subtotal * quote.contractDiscount / 100).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${quote.customerDiscount > 0 ? `
              <tr>
                <td>Customer Discount (${quote.customerDiscount}%):</td>
                <td class="text-right text-red">-$${((quote.subtotal - quote.subtotal * quote.contractDiscount / 100) * quote.customerDiscount / 100).toFixed(2)}</td>
              </tr>
              ` : ''}
              ${quote.orderDiscount > 0 ? `
              <tr>
                <td>Order Discount:</td>
                <td class="text-right text-red">-$${quote.orderDiscount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td><strong>Final Total:</strong></td>
                <td class="text-right text-green"><strong>$${quote.finalTotal.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          ${quote.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p>${quote.notes}</p>
          </div>
          ` : ''}

          ${quote.requiresApproval ? `
          <div class="approval-notice">
            <strong>⚠️ Approval Required:</strong> This quote exceeds $${quote.approvalThreshold.toLocaleString()} and requires management approval.
          </div>
          ` : ''}

          <div style="margin-top: 40px; font-size: 12px; color: #6b7280;">
            <p>This quote is valid until ${quote.expiresAt.toLocaleDateString()}. Terms and conditions apply.</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Actions</h3>
      
      <div className="space-y-4">
        {/* Quote Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Quote ID:</p>
              <p className="font-medium">{quote.quoteNumber || quote.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                quote.status === 'draft' 
                  ? 'bg-gray-100 text-gray-800'
                  : quote.status === 'pending_approval'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {quote.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Created:</p>
              <p className="font-medium">{quote.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Expires:</p>
              <p className="font-medium">{quote.expiresAt.toLocaleDateString()}</p>
            </div>
          </div>
          {quote.savedAt && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-green-600">
                ✅ Last saved: {quote.savedAt.toLocaleDateString()} at {quote.savedAt.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={quote.items.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            💾 Save Quote
          </button>
          
          <button
            onClick={handlePrint}
            disabled={quote.items.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🖨️ Print Quote
          </button>
        </div>

        {/* Quote Summary */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-900">${quote.finalTotal.toFixed(2)}</p>
          <p className="text-sm text-blue-700">{quote.items.length} items • {quote.requiresApproval ? 'Requires Approval' : 'Ready to Send'}</p>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Save Quote</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Number
                </label>
                <input
                  type="text"
                  value={quote.quoteNumber || `Q${Date.now().toString().slice(-6)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this quote..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Quote'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteActions;
