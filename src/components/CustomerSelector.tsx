import React from 'react';
import { Customer, Contract } from '../types';

interface CustomerSelectorProps {
  customers: Customer[];
  contracts: Contract[];
  onCustomerSelect: (customer: Customer) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  contracts,
  onCustomerSelect
}) => {
  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Customer</h2>
        <p className="text-gray-600 mb-6">Choose a customer to begin creating a quote</p>
        
        <div className="space-y-3">
          {customers.map((customer) => {
            const contract = contracts.find(c => c.id === customer.contractId);
            return (
              <button
                key={customer.id}
                onClick={() => onCustomerSelect(customer)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">
                      Contract: {contract?.name || 'No Contract'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {contract?.discountPercentage || 0}% + {customer.discountPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">Contract + Customer</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerSelector;
