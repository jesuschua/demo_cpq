import { Processing, ProcessingOption } from '../types';

/**
 * Format processing options for compact display
 * @param processing - The processing object
 * @param selectedOptions - The selected options
 * @returns A compact string representation of the processing with options
 */
export const formatProcessingDisplay = (processing: Processing, selectedOptions?: { [optionId: string]: any }): string => {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
    return processing.name;
  }

  const optionStrings: string[] = [];
  
  if (processing.options) {
    processing.options.forEach(option => {
      const value = selectedOptions[option.id];
      if (value !== undefined && value !== null && value !== '') {
        const formattedValue = formatOptionValue(option, value);
        if (formattedValue) {
          optionStrings.push(formattedValue);
        }
      }
    });
  }

  if (optionStrings.length === 0) {
    return processing.name;
  }

  return `${processing.name} (${optionStrings.join(', ')})`;
};

/**
 * Format a single option value for display
 * @param option - The processing option
 * @param value - The selected value
 * @returns A formatted string representation of the option value
 */
const formatOptionValue = (option: ProcessingOption, value: any): string | null => {
  switch (option.type) {
    case 'select':
      if (option.choices) {
        const choice = option.choices.find(c => c.value === value);
        return choice ? choice.label : value;
      }
      return value;
    
    case 'color':
      return value;
    
    case 'text':
    case 'number':
      return value.toString();
    
    case 'boolean':
      return value ? 'Yes' : 'No';
    
    case 'dimensions':
      if (typeof value === 'object' && value !== null) {
        const dims = [];
        if (value.width !== undefined) dims.push(`W: ${value.width}"`);
        if (value.height !== undefined) dims.push(`H: ${value.height}"`);
        if (value.depth !== undefined) dims.push(`D: ${value.depth}"`);
        return dims.join(' × ');
      }
      return value.toString();
    
    default:
      return value.toString();
  }
};

/**
 * Check if a processing has selected options
 * @param processing - The processing object
 * @param selectedOptions - The selected options
 * @returns True if the processing has meaningful selected options
 */
export const hasSelectedOptions = (processing: Processing, selectedOptions?: { [optionId: string]: any }): boolean => {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
    return false;
  }

  if (!processing.options) {
    return false;
  }

  return processing.options.some(option => {
    const value = selectedOptions[option.id];
    return value !== undefined && value !== null && value !== '';
  });
};

/**
 * Get a compact indicator for processing with options
 * @param processing - The processing object
 * @param selectedOptions - The selected options
 * @returns A compact indicator string
 */
export const getProcessingIndicator = (processing: Processing, selectedOptions?: { [optionId: string]: any }): string => {
  if (hasSelectedOptions(processing, selectedOptions)) {
    return '*';
  }
  return '';
};
