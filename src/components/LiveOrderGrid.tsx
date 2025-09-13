import React from 'react';
import { QuoteItem, Room, Product, Processing } from '../types';

interface LiveOrderGridProps {
  products: QuoteItem[];
  rooms: Room[];
  allProducts: Product[];
  allProcessings: Processing[];
  currentRoomId: string | null;
  selectedProductId: string | null;
  onProductSelect: (productId: string | null) => void;
  onProductRemove: (productId: string) => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onProcessingRemove?: (productId: string, processingId: string) => void;
}

const LiveOrderGrid: React.FC<LiveOrderGridProps> = ({
  products,
  rooms,
  allProducts,
  allProcessings,
  currentRoomId,
  selectedProductId,
  onProductSelect,
  onProductRemove,
  onQuantityChange,
  onProcessingRemove
}) => {
  // Helper function to get product details
  const getProductDetails = (productId: string): Product | undefined => {
    return allProducts.find(p => p.id === productId);
  };

  // Helper function to get processing details
  const getProcessingDetails = (processingId: string): Processing | undefined => {
    return allProcessings.find(p => p.id === processingId);
  };

  // Get current room and filter products to only show current room
  const currentRoom = rooms.find(room => room.id === currentRoomId);
  const currentRoomProducts = products.filter(p => p.roomId === currentRoomId);
  const currentRoomTotal = currentRoomProducts.reduce((sum, product) => sum + product.totalPrice, 0);


  // Handle cases where no room is selected or no products in current room
  if (!currentRoomId || !currentRoom) {
    return (
      <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Selected</h3>
          <p className="text-sm">Select a room from the tabs above to view its products</p>
        </div>
      </div>
    );
  }

  if (currentRoomProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{currentRoom.name} is Empty</h3>
          <p className="text-sm">Add products from the left panel to this room</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-96 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{currentRoom.name}</h3>
        <p className="text-sm text-gray-600">{currentRoomProducts.length} product{currentRoomProducts.length !== 1 ? 's' : ''} in this room</p>
      </div>

      {/* Room Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Room Summary Header */}
        <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Room Total:</span>
          </div>
          <div className="text-lg font-semibold text-green-600">
            ${currentRoomTotal.toFixed(2)}
          </div>
        </div>
        
        {/* Products in Current Room */}
        <div className="space-y-3">
          {currentRoomProducts.map((quoteItem) => {
                    const productDetails = getProductDetails(quoteItem.productId);
                    const isSelected = selectedProductId === quoteItem.id;
                    return (
                      <div 
                        key={quoteItem.id} 
                        className={`flex items-center justify-between py-3 px-3 cursor-pointer transition-all duration-200 rounded-lg mx-1 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-md ring-2 ring-blue-200 ring-opacity-50' 
                            : 'border-b border-gray-100 last:border-b-0 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                        onClick={() => onProductSelect(isSelected ? null : quoteItem.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h5 className={`text-sm font-medium ${isSelected ? 'text-blue-900 font-semibold' : 'text-gray-900'}`}>
                                {productDetails?.name || 'Unknown Product'}
                              </h5>
                              {isSelected && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-500'}`}>
                              ${quoteItem.basePrice.toFixed(2)} each
                            </div>
                          </div>
                          
                          {/* Processing Information */}
                          {quoteItem.appliedProcessings.length > 0 && (
                            <div className={`mt-2 ml-4 space-y-1 ${isSelected ? 'bg-blue-25 p-2 rounded border border-blue-200' : ''}`}>
                              {quoteItem.appliedProcessings.map((processing) => {
                                const processingDetails = getProcessingDetails(processing.processingId);
                                return (
                                  <div key={processing.processingId} className={`flex items-center justify-between text-xs ${isSelected ? 'text-blue-800' : ''}`}>
                                    <div className="flex items-center space-x-2">
                                      <span className={isSelected ? 'text-blue-400' : 'text-gray-500'}>└─</span>
                                      <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                                        {processingDetails?.name || 'Unknown Processing'}
                                        {processing.isInherited && (
                                          <span className="ml-1 text-blue-500">(inherited)</span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`font-medium ${isSelected ? 'text-green-700' : 'text-green-600'}`}>
                                        +${processing.calculatedPrice.toFixed(2)}
                                      </span>
                                      {onProcessingRemove && !processing.isInherited && (
                                        <button
                                          onClick={() => onProcessingRemove(quoteItem.id, processing.processingId)}
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (quoteItem.quantity === 1) {
                                    onProductRemove(quoteItem.id);
                                  } else {
                                    onQuantityChange(quoteItem.id, quoteItem.quantity - 1);
                                  }
                                }}
                                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{quoteItem.quantity}</span>
                              <button
                                onClick={() => onQuantityChange(quoteItem.id, quoteItem.quantity + 1)}
                                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-green-600">
                                ${quoteItem.totalPrice.toFixed(2)}
                              </span>
                              <button
                                onClick={() => onProductRemove(quoteItem.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
        </div>
      </div>
    </div>
  );
};

export default LiveOrderGrid;
