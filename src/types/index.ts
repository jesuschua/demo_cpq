export interface Model {
  id: string;
  name: string;
  description: string;
  category: 'traditional' | 'modern' | 'transitional';
}

export interface Product {
  id: string;
  modelId: string;
  name: string;
  category: 'cabinet' | 'door' | 'hardware' | 'countertop' | 'appliance' | 'accessory';
  subCategory: string;
  basePrice: number;
  unit: 'each' | 'sqft' | 'linft';
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  inStock: boolean;
  leadTimeDays: number;
  description: string;
}

export interface Processing {
  id: string;
  name: string;
  description: string;
  category: string;
  pricingType: 'per_unit' | 'per_dimension' | 'percentage';
  price: number;
  applicableProductCategories: string[];
  calculationFormula?: string; // For dimension-based calculations
}

export interface ProcessingRule {
  id: string;
  type: 'mutual_exclusion' | 'requirement' | 'inheritance';
  conditions: {
    processingIds?: string[];
    productCategories?: string[];
    productIds?: string[];
  };
  actions: {
    excludeProcessings?: string[];
    requireProcessings?: string[];
    inheritFromRoom?: boolean;
  };
  description: string;
}

export interface ProductDependency {
  id: string;
  productId: string;
  requiredProductId: string;
  quantityFormula: string; // e.g., "Math.ceil(parentProduct.dimensions.width / 24)"
  isAutomatic: boolean; // true = auto-add, false = flag for sales rep
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  contractId?: string;
  discountPercentage: number;
}

export interface Contract {
  id: string;
  name: string;
  discountPercentage: number;
}

export interface QuoteItem {
  id: string;
  productId: string;
  quantity: number;
  customDimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  appliedProcessings: {
    processingId: string;
    calculatedPrice: number;
  }[];
  basePrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  customerId: string;
  items: QuoteItem[];
  contractDiscount: number;
  customerDiscount: number;
  orderDiscount: number; // fixed amount
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  requiresApproval: boolean;
  approvalThreshold: number;
  savedAt?: Date;
  quoteNumber?: string;
  notes?: string;
}
