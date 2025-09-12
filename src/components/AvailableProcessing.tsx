import React, { useState } from 'react';
import { QuoteItem, Product, Processing } from '../types';
import ProcessingModal from './ProcessingModal';

interface AvailableProcessingProps {
  selectedProduct: QuoteItem | null;
  allProducts: Product[];
  processings: Processing[];
  onProcessingApply: (productId: string, processing: Processing, selectedOptions?: { [optionId: string]: any }) => void;
}

const AvailableProcessing: React.FC<AvailableProcessingProps> = ({
  selectedProduct,
  allProducts,
  processings,
  onProcessingApply
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProcessing, setSelectedProcessing] = useState<Processing | null>(null);
  
  // Get product details
  const productDetails = selectedProduct 
    ? allProducts.find(p => p.id === selectedProduct.productId)
    : null;
  
  // Filter processings applicable to selected product
  const applicableProcessings = productDetails 
    ? processings.filter(processing => 
        processing.applicableProductCategories.includes(productDetails.category)
      )
    : [];
  
  

  // Handle processing button click
  const handleProcessingClick = (processing: Processing) => {
    if (processing.options && processing.options.length > 0) {
      // Open modal for detailed configuration
      setSelectedProcessing(processing);
      setModalOpen(true);
    } else {
      // Directly apply processing without options
      onProcessingApply(selectedProduct!.id, processing);
    }
  };

  // Handle modal form submission
  const handleModalApply = (productId: string, processing: Processing, selectedOptions: { [optionId: string]: any }) => {
    onProcessingApply(productId, processing, selectedOptions);
    setModalOpen(false);
    setSelectedProcessing(null);
  };

  if (!selectedProduct || !productDetails) {
    return (
      <div className="bg-white rounded-lg shadow h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Select a Product</h3>
          <p className="text-xs">Click on a product in your order to see available processing options</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg shadow h-64 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Available Processing</h3>
        <p className="text-xs text-gray-600">
          For: {productDetails?.name || 'Unknown Product'}
        </p>
      </div>

      {/* Processing Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {applicableProcessings.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p className="text-xs">No processing options available for this product</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applicableProcessings.map((processing) => (
              <div 
                key={processing.id}
                className="border border-gray-200 rounded p-2 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-xs">
                      {processing.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {processing.description}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs font-semibold text-green-600">
                      +${processing.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleProcessingClick(processing)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  {processing.options && processing.options.length > 0 ? 'Configure' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        processing={selectedProcessing}
        selectedProduct={selectedProduct}
        onApply={handleModalApply}
      />
      </div>
    );
};

export default AvailableProcessing;
