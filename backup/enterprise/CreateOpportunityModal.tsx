import React, { useState } from 'react';
import { Opportunity, Account, Contact } from '../../types/enterprise';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'lastModified'>) => void;
  accounts: Account[];
  contacts: Contact[];
}

const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  onCreateOpportunity,
  accounts,
  contacts
}) => {
  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    contactId: '',
    expectedValue: '',
    closeDate: '',
    source: 'Website',
    description: '',
    probability: 25
  });

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    setSelectedAccount(account || null);
    setFormData(prev => ({
      ...prev,
      accountId,
      contactId: '' // Reset contact when account changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.accountId || !formData.expectedValue || !formData.closeDate) {
      alert('Please fill in all required fields');
      return;
    }

    const opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'lastModified'> = {
      name: formData.name,
      accountId: formData.accountId,
      contactId: formData.contactId || contacts.find(c => c.accountId === formData.accountId)?.id || '',
      stage: 'prospecting',
      probability: formData.probability,
      expectedValue: parseFloat(formData.expectedValue),
      closeDate: new Date(formData.closeDate),
      source: formData.source,
      description: formData.description,
      createdBy: 'current_user'
    };

    onCreateOpportunity(opportunity);
    
    // Reset form
    setFormData({
      name: '',
      accountId: '',
      contactId: '',
      expectedValue: '',
      closeDate: '',
      source: 'Website',
      description: '',
      probability: 25
    });
    setSelectedAccount(null);
    onClose();
  };

  const availableContacts = selectedAccount 
    ? contacts.filter(c => c.accountId === selectedAccount.id)
    : [];

  const sources = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Partner', 'Existing Customer', 'Advertisement'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create New Opportunity</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Opportunity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opportunity Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Kitchen Renovation Project - Q1 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select an account...</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.industry})
                </option>
              ))}
            </select>
          </div>

          {/* Contact Selection */}
          {selectedAccount && availableContacts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact
              </label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a contact...</option>
                {availableContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} - {contact.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expected Value and Close Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Value * ($)
              </label>
              <input
                type="number"
                value={formData.expectedValue}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedValue: e.target.value }))}
                placeholder="25000"
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Close Date *
              </label>
              <input
                type="date"
                value={formData.closeDate}
                onChange={(e) => setFormData(prev => ({ ...prev, closeDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Source and Probability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Probability (%)
              </label>
              <select
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10% - Prospecting</option>
                <option value={25}>25% - Qualification</option>
                <option value={40}>40% - Needs Analysis</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the opportunity, customer needs, and potential scope..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account Info Display */}
          {selectedAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Account Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Industry:</span> {selectedAccount.industry}
                </div>
                <div>
                  <span className="text-blue-700">Revenue:</span> ${(selectedAccount.revenue / 1000000).toFixed(1)}M
                </div>
                <div>
                  <span className="text-blue-700">Employees:</span> {selectedAccount.employees.toLocaleString()}
                </div>
                <div>
                  <span className="text-blue-700">Credit Rating:</span> 
                  <span className={`ml-1 capitalize ${
                    selectedAccount.creditRating === 'excellent' ? 'text-green-600' :
                    selectedAccount.creditRating === 'good' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {selectedAccount.creditRating}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOpportunityModal;
