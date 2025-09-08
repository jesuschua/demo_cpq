import React, { useState, useMemo } from 'react';
import { Model, Product } from '../types';

interface SimplifiedProductCatalogProps {
  models: Model[];
  products: Product[];
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  onAddToQuote: (product: Product, quantity: number) => void;
  hasQuote: boolean;
  onCreateQuote: () => void;
}

const SimplifiedProductCatalog: React.FC<SimplifiedProductCatalogProps> = ({
  models,
  products,
  selectedModel,
  onModelSelect,
  onAddToQuote,
  hasQuote,
  onCreateQuote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

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

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToQuote = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    onAddToQuote(product, quantity);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
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
          {/* Selected Model Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedModel.name}</h2>
                <p className="text-sm text-gray-600 capitalize">{selectedModel.category} style</p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simplified Product Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        ${product.basePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Stock indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      product.inStock ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-xs text-gray-600">
                      {product.inStock ? 'In Stock' : `${product.leadTimeDays}d`}
                    </span>
                  </div>

                  {/* Quantity and Add Button */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleAddToQuote(product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md"
                    >
                      Add to Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No products available for this selection</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SimplifiedProductCatalog;
