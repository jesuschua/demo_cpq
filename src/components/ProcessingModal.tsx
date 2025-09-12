import React, { useState, useEffect } from 'react';
import { Processing, ProcessingOption, QuoteItem } from '../types';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  processing: Processing | null;
  selectedProduct: QuoteItem | null;
  onApply: (productId: string, processing: Processing, selectedOptions: { [optionId: string]: any }) => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  onClose,
  processing,
  selectedProduct,
  onApply
}) => {
  const [formData, setFormData] = useState<{ [optionId: string]: any }>({});

  // Initialize form data when processing changes
  useEffect(() => {
    if (processing?.options) {
      const initialData: { [optionId: string]: any } = {};
      processing.options.forEach(option => {
        initialData[option.id] = option.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [processing]);

  if (!isOpen || !processing || !selectedProduct) {
    return null;
  }

  const handleOptionChange = (optionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(selectedProduct.id, processing, formData);
    onClose();
  };

  const renderOptionInput = (option: ProcessingOption) => {
    switch (option.type) {
      case 'select':
        return (
          <select
            value={formData[option.id] || ''}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={option.required}
          >
            <option value="">Select an option</option>
            {option.choices?.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case 'dimensions':
        return (
          <div className="grid grid-cols-3 gap-2">
            {option.dimensionFields?.map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="number"
                  value={formData[option.id]?.[field] || ''}
                  onChange={(e) => {
                    const newValue = { ...formData[option.id], [field]: parseFloat(e.target.value) || 0 };
                    handleOptionChange(option.id, newValue);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required={option.required}
                  step="0.1"
                />
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={formData[option.id] || ''}
            onChange={(e) => handleOptionChange(option.id, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={option.required}
            min={option.min}
            max={option.max}
            step={option.step}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={formData[option.id] || ''}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={option.required}
            placeholder={option.description}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData[option.id] || false}
              onChange={(e) => handleOptionChange(option.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {option.description}
            </label>
          </div>
        );

      case 'color':
        return (
          <div className="grid grid-cols-4 gap-2">
            {option.colorPalette?.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleOptionChange(option.id, color)}
                className={`w-8 h-8 rounded border-2 ${
                  formData[option.id] === color ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={formData[option.id] || ''}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required={option.required}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configure {processing.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {processing.description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {processing.options?.map((option) => (
              <div key={option.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {option.name}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {option.description && (
                  <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                )}
                {renderOptionInput(option)}
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Apply Processing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
