import React, { useState, useMemo } from 'react';
import { Model, Product, Processing } from '../types';

interface ProductCatalogProps {
  models: Model[];
  products: Product[];
  processings: Processing[];
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  onAddToQuote: (product: Product, quantity: number) => void;
  hasQuote: boolean;
  onCreateQuote: () => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  models,
  products,
  processings,
  selectedModel,
  onModelSelect,
  onAddToQuote,
  hasQuote,
  onCreateQuote
}) => {
  console.log('🔧 ProductCatalog rendered with selectedModel:', selectedModel);
  console.log('🔧 ProductCatalog hasQuote:', hasQuote);
  console.log('🔧 ProductCatalog products count:', products.length);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => 
      !selectedModel || p.modelId === selectedModel.id
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedModel, selectedCategory, searchTerm]);

  const categories = ['all', 'cabinet', 'hardware', 'countertop', 'appliance', 'accessory'];

  const getAvailableProcessings = (product: Product) => {
    return processings.filter(proc => 
      proc.applicableProductCategories.includes(product.category)
    );
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kitchen Models</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelSelect(model)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedModel?.id === model.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="font-medium text-sm">{model.name}</h3>
              <p className="text-xs text-gray-600 capitalize">{model.category}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedModel && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedModel?.name} Products
                </h2>
                <p className="text-sm text-gray-600">{selectedModel?.description}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const availableProcessings = getAvailableProcessings(product);
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {product.category} → {product.subCategory}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${product.basePrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{product.description}</p>

                    {/* Dimensions */}
                    {product.dimensions && (
                      <div className="text-xs text-gray-600 mb-3">
                        Dimensions: {product.dimensions.width}"W × {product.dimensions.height}"H × {product.dimensions.depth}"D
                      </div>
                    )}

                    {/* Stock Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.inStock ? 'In Stock' : `${product.leadTimeDays} days`}
                      </span>
                    </div>

                    {/* Available Processings */}
                    {availableProcessings.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">
                          Available Processings ({availableProcessings.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {availableProcessings.slice(0, 3).map((proc) => (
                            <span
                              key={proc.id}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {proc.name}
                            </span>
                          ))}
                          {availableProcessings.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{availableProcessings.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add to Quote Button */}
                    <div className="pt-3 border-t">
                      {hasQuote ? (
                        <button
                          onClick={() => onAddToQuote(product, 1)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Add to Quote
                        </button>
                      ) : (
                        <button
                          onClick={onCreateQuote}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                        >
                          Start Quote
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedModel && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Select a kitchen model to view products</p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
