import { Model, Product, Processing, ProcessingRule, ProductDependency, Customer, Contract, ProcessingOption } from '../types';

// CSV parsing utility
function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle CSV parsing more carefully to preserve quoted fields
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          currentValue += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(currentValue);
        currentValue = '';
        i++;
      } else {
        currentValue += char;
        i++;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    return row;
  });
}

// Cache for loaded data
let dataCache: any = null;

// Load CSV data from public folder
async function loadCSVData(filename: string): Promise<string> {
  try {
    const response = await fetch(`/data/csv/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    
    // Get the raw bytes
    const arrayBuffer = await response.arrayBuffer();
    
    // Try to detect encoding and convert to UTF-8
    let text: string;
    
    // Check if it's UTF-8 by trying to decode it
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer);
    } catch (e) {
      // If UTF-8 fails, try ISO-8859-1 (Latin-1) which is common for CSV files
      text = new TextDecoder('iso-8859-1').decode(arrayBuffer);
    }
    
    console.log(`Successfully loaded ${filename}:`, text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}


// Load models from CSV
export async function loadModels(): Promise<Model[]> {
  const csvContent = await loadCSVData('models.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as 'traditional' | 'modern' | 'transitional'
  }));
}

// Load contracts from CSV
export async function loadContracts(): Promise<Contract[]> {
  const csvContent = await loadCSVData('contracts.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    discountPercentage: parseFloat(row.discount_percentage)
  }));
}

// Load customers from CSV
export async function loadCustomers(): Promise<Customer[]> {
  const csvContent = await loadCSVData('customers.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    contractId: row.contract_id || undefined,
    discountPercentage: parseFloat(row.discount_percentage)
  }));
}

// Load products from CSV
export async function loadProducts(): Promise<Product[]> {
  const csvContent = await loadCSVData('products.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    modelId: row.model_id,
    name: row.name,
    category: row.category as 'cabinet' | 'door' | 'hardware' | 'countertop' | 'appliance' | 'accessory',
    subCategory: row.sub_category,
    basePrice: parseFloat(row.base_price),
    unit: row.unit as 'each' | 'sqft' | 'linft',
    dimensions: row.width && row.height && row.depth ? {
      width: parseFloat(row.width),
      height: parseFloat(row.height),
      depth: parseFloat(row.depth)
    } : undefined,
    inStock: row.in_stock === 'true',
    leadTimeDays: parseInt(row.lead_time_days),
    description: row.description
  }));
}

// Load processing options from CSV
export async function loadProcessingOptions(): Promise<Array<ProcessingOption & { processingId: string }>> {
  const csvContent = await loadCSVData('processing_options.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.option_id,
    processingId: row.processing_id,
    name: row.name,
    type: row.type as 'select' | 'color' | 'text' | 'number' | 'boolean' | 'dimensions',
    required: row.required === 'true',
    description: row.description || undefined,
    defaultValue: row.default_value ? (row.default_value.startsWith('{') ? JSON.parse(row.default_value) : row.default_value) : undefined
  }));
}

// Load processing option choices from CSV
export async function loadProcessingOptionChoices(): Promise<Array<{
  processingId: string;
  optionId: string;
  value: string;
  label: string;
  priceModifier: number;
}>> {
  const csvContent = await loadCSVData('processing_option_choices.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    processingId: row.processing_id,
    optionId: row.option_id,
    value: row.value,
    label: row.label,
    priceModifier: parseFloat(row.price_modifier)
  }));
}

// Load processings from CSV
export async function loadProcessings(): Promise<Processing[]> {
  const csvContent = await loadCSVData('processings.csv');
  const rows = parseCSV(csvContent);
  const processingOptions = await loadProcessingOptions();
  const processingOptionChoices = await loadProcessingOptionChoices();
  
  return rows.map(row => {
    const options = processingOptions
      .filter(opt => opt.processingId === row.id)
      .map(opt => {
        const choices = processingOptionChoices
          .filter(choice => choice.processingId === row.id && choice.optionId === opt.id)
          .map(choice => ({
            value: choice.value,
            label: choice.label,
            priceModifier: choice.priceModifier
          }));
        
        return {
          id: opt.id,
          name: opt.name,
          type: opt.type,
          required: opt.required,
          description: opt.description,
          defaultValue: opt.defaultValue,
          choices: choices.length > 0 ? choices : undefined
        };
      });
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      pricingType: row.pricing_type as 'per_unit' | 'per_dimension' | 'percentage',
      price: parseFloat(row.price),
      applicableProductCategories: row.applicable_product_categories.split(','),
      calculationFormula: row.calculation_formula || undefined,
      options: options.length > 0 ? options : undefined
    };
  });
}

// Load processing rules from CSV
export async function loadProcessingRules(): Promise<ProcessingRule[]> {
  const csvContent = await loadCSVData('processing_rules.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    type: row.type as 'mutual_exclusion' | 'requirement' | 'inheritance',
    conditions: {
      processingIds: row.processing_ids ? row.processing_ids.split(',') : undefined,
      productCategories: row.product_categories ? row.product_categories.split(',') : undefined,
      productIds: row.product_ids ? row.product_ids.split(',') : undefined
    },
    actions: {
      excludeProcessings: row.exclude_processings ? row.exclude_processings.split(',') : undefined,
      requireProcessings: row.require_processings ? row.require_processings.split(',') : undefined,
      inheritFromRoom: row.inherit_from_room === 'true'
    },
    description: row.description
  }));
}

// Load product dependencies from CSV
export async function loadProductDependencies(): Promise<ProductDependency[]> {
  const csvContent = await loadCSVData('product_dependencies.csv');
  const rows = parseCSV(csvContent);
  
  return rows.map(row => ({
    id: row.id,
    productId: row.product_id,
    requiredProductId: row.required_product_id,
    quantityFormula: row.quantity_formula,
    isAutomatic: row.is_automatic === 'true',
    description: row.description
  }));
}

// Main export function that loads all data with caching
export async function loadAllData() {
  if (dataCache) {
    console.log('Using cached data');
    return dataCache;
  }
  
  console.log('Loading CSV data...');
  
  try {
    const [models, contracts, customers, products, processings, processingRules, productDependencies] = await Promise.all([
      loadModels(),
      loadContracts(),
      loadCustomers(),
      loadProducts(),
      loadProcessings(),
      loadProcessingRules(),
      loadProductDependencies()
    ]);
    
    console.log('Successfully loaded all data:', {
      models: models.length,
      contracts: contracts.length,
      customers: customers.length,
      products: products.length,
      processings: processings.length,
      processingRules: processingRules.length,
      productDependencies: productDependencies.length
    });
    
    dataCache = {
      models,
      contracts,
      customers,
      products,
      processings,
      processingRules,
      productDependencies
    };
    
    return dataCache;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}
