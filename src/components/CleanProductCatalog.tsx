import React, { useMemo } from 'react';
import { Model, Product } from '../types';

interface CleanProductCatalogProps {
  models: Model[];
  products: Product[];
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  onProductSelect: (product: Product, quantity: number) => void;
  hasQuote: boolean;
  onCreateQuote: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CleanProductCatalog: React.FC<CleanProductCatalogProps> = ({
  models,
  products,
  selectedModel,
  onModelSelect,
  onProductSelect,
  hasQuote,
  onCreateQuote,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange
}) => {
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      !selectedModel || p.modelId === selectedModel.id
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedModel, selectedCategory, searchTerm]);

  const categories = ['all', 'cabinet', 'hardware', 'countertop', 'appliance', 'accessory'];

  const handleProductClick = (product: Product) => {
    onProductSelect(product, 1);
  };

  return (
    <div className="space-y-6 h-96 flex flex-col">
      {/* Model Selection */}
      {!selectedModel && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Model Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelSelect(model)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <h3 className="font-medium text-gray-900">{model.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{model.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedModel && (
        <>
          {/* Clean Product Grid - Scrollable */}
          <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">
                  Available Products ({filteredProducts.length})
                </h3>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products (e.g., 'Base', 'Cabinet')..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Category Filter Dropdown */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Click on products to add them to your quote</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map((product) => {
                  return (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 rounded p-2 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs leading-tight truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="font-semibold text-green-600 text-xs">
                            ${product.basePrice.toFixed(2)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                              product.inStock ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></span>
                            <span className="text-xs text-gray-500">
                              {product.inStock ? 'In stock' : `${product.leadTimeDays}d`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No products available for this selection</p>
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default CleanProductCatalog;
