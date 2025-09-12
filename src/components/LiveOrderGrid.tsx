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

  // Group products by room
  const productsByRoom = rooms.map(room => {
    const roomProducts = products.filter(p => p.roomId === room.id);
    const roomTotal = roomProducts.reduce((sum, product) => sum + product.totalPrice, 0);
    
    return {
      room,
      products: roomProducts,
      total: roomTotal
    };
  }).filter(roomData => roomData.products.length > 0);


  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Order is Empty</h3>
          <p className="text-sm">Start adding products from the left panel to build your order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
        <p className="text-sm text-gray-600">{products.length} product{products.length !== 1 ? 's' : ''} selected</p>
      </div>

      {/* Order Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {productsByRoom.map(({ room, products: roomProducts, total }) => (
            <div key={room.id} className="border border-gray-200 rounded-lg">
              {/* Room Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{room.name}</h4>
                    <span className="ml-2 text-sm text-gray-500">
                      ({roomProducts.length} product{roomProducts.length !== 1 ? 's' : ''})
                    </span>
                    {room.id === currentRoomId && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products in Room */}
              <div className="p-4">
                <div className="space-y-3">
                  {roomProducts.map((quoteItem) => {
                    const productDetails = getProductDetails(quoteItem.productId);
                    const isSelected = selectedProductId === quoteItem.id;
                    return (
                      <div 
                        key={quoteItem.id} 
                        className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onProductSelect(isSelected ? null : quoteItem.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">
                              {productDetails?.name || 'Unknown Product'}
                            </h5>
                            <div className="text-sm text-gray-500">
                              ${quoteItem.basePrice.toFixed(2)} each
                            </div>
                          </div>
                          
                          {/* Processing Information */}
                          {quoteItem.appliedProcessings.length > 0 && (
                            <div className="mt-2 ml-4 space-y-1">
                              {quoteItem.appliedProcessings.map((processing) => {
                                const processingDetails = getProcessingDetails(processing.processingId);
                                return (
                                  <div key={processing.processingId} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500">└─</span>
                                      <span className="text-gray-600">
                                        {processingDetails?.name || 'Unknown Processing'}
                                        {processing.isInherited && (
                                          <span className="ml-1 text-blue-500">(inherited)</span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-green-600 font-medium">
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
          ))}
        </div>
      </div>

    </div>
  );
};

export default LiveOrderGrid;
