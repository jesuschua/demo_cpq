import React, { useState, useMemo } from 'react';
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
  onCategoryChange
}) => {
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      !selectedModel || p.modelId === selectedModel.id
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered;
  }, [products, selectedModel, selectedCategory]);

  const categories = ['all', 'cabinet', 'hardware', 'countertop', 'appliance', 'accessory'];

  const handleProductClick = (product: Product) => {
    onProductSelect(product, 1);
  };

  return (
    <div className="space-y-6">
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
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">
                  Available Products ({filteredProducts.length})
                </h3>
                <select
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                >
                  {['all', 'cabinet', 'hardware', 'countertop', 'appliance', 'accessory'].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-600">Click on products to add them to your quote</p>
            </div>
            
            <div className="h-96 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  return (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm leading-tight">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-green-600 text-sm">
                            ${product.basePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Minimal status indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            product.inStock ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-xs text-gray-600">
                            {product.inStock ? 'Available' : `${product.leadTimeDays}d`}
                          </span>
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
