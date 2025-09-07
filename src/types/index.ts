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

export interface Room {
  id: string;
  name: string;
  description: string;
  frontModelId: string; // Determines colors and styles for all products in room
  activatedProcessings: string[]; // Processing IDs that are automatically applied to all products in this room
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

export interface QuoteItem {
  id: string;
  productId: string;
  roomId: string; // Links item to a specific room
  quantity: number;
  customDimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  appliedProcessings: {
    processingId: string;
    calculatedPrice: number;
    isInherited?: boolean; // true if inherited from room, false/undefined if manually added
    appliedDate?: string;
  }[];
  basePrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  customerId: string;
  rooms: Room[];
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
