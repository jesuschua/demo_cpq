import React, { useState, useEffect } from 'react';
import { ProcessingOption, ProcessingOptionType } from '../types';

interface ProcessingOptionSelectorProps {
  processingId: string;
  processingName: string;
  options: ProcessingOption[];
  selectedOptions: { [optionId: string]: any };
  onOptionsChange: (options: { [optionId: string]: any }) => void;
  onClose: () => void;
  onApply: () => void;
}

const ProcessingOptionSelector: React.FC<ProcessingOptionSelectorProps> = ({
  processingId,
  processingName,
  options,
  selectedOptions,
  onOptionsChange,
  onClose,
  onApply
}) => {
  const [localOptions, setLocalOptions] = useState<{ [optionId: string]: any }>(selectedOptions);

  useEffect(() => {
    setLocalOptions(selectedOptions);
  }, [selectedOptions]);

  const handleOptionChange = (optionId: string, value: any) => {
    const newOptions = { ...localOptions, [optionId]: value };
    setLocalOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const renderOptionInput = (option: ProcessingOption) => {
    const value = localOptions[option.id] || option.defaultValue || '';

    switch (option.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={option.required}
          >
            <option value="">Select {option.name}</option>
            {option.choices?.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
                {choice.priceModifier && choice.priceModifier > 0 && ` (+$${choice.priceModifier})`}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {option.colorPalette?.map((color) => (
                <button
                  key={color}
                  onClick={() => handleOptionChange(option.id, color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    value === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <input
              type="color"
              value={value}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder={`Enter ${option.name.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={option.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleOptionChange(option.id, parseFloat(e.target.value) || 0)}
            min={option.min}
            max={option.max}
            step={option.step || 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={option.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={option.id}
                checked={value === true}
                onChange={() => handleOptionChange(option.id, true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={option.id}
                checked={value === false}
                onChange={() => handleOptionChange(option.id, false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );

      case 'dimensions':
        return (
          <div className="grid grid-cols-3 gap-2">
            {option.dimensionFields?.map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-600 mb-1 capitalize">
                  {field}
                </label>
                <input
                  type="number"
                  value={value[field] || ''}
                  onChange={(e) => {
                    const newValue = { ...value, [field]: parseFloat(e.target.value) || 0 };
                    handleOptionChange(option.id, newValue);
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unsupported option type: {option.type}</div>;
    }
  };

  const isFormValid = () => {
    return options.every(option => {
      if (!option.required) return true;
      const value = localOptions[option.id];
      return value !== undefined && value !== null && value !== '';
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Configure {processingName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {option.name}
                  {option.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {option.description && (
                  <p className="text-xs text-gray-600">{option.description}</p>
                )}
                {renderOptionInput(option)}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              disabled={!isFormValid()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply Processing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOptionSelector;
