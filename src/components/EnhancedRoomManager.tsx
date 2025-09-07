import React, { useState } from 'react';
import { Model, Room, Processing } from '../types';

interface EnhancedRoomManagerProps {
  models: Model[];
  processings: Processing[];
  onCreateQuote: (room: Room) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => void;
}

const ROOM_TYPES = ['Kitchen', 'Bathroom', 'Laundry Room', 'Pantry', 'Wet Bar'];

const EnhancedRoomManager: React.FC<EnhancedRoomManagerProps> = ({
  models,
  processings,
  onCreateQuote,
  existingRooms,
  onAddRoom
}) => {
  const [showCreateForm, setShowCreateForm] = useState(existingRooms.length === 0);
  const [showProcessingConfig, setShowProcessingConfig] = useState(false);
  const [newRoom, setNewRoom] = useState(() => {
    return {
      type: 'Kitchen',
      description: '',
      frontModelId: '',
      activatedProcessings: [] as string[],
      dimensions: { width: 0, height: 0, depth: 0 }
    };
  });

  const handleCreateRoom = () => {
    if (!newRoom.type || !newRoom.frontModelId) return;

    const room: Room = {
      id: Date.now().toString(),
      name: newRoom.type,
      description: newRoom.description,
      frontModelId: newRoom.frontModelId,
      activatedProcessings: newRoom.activatedProcessings,
      dimensions: newRoom.dimensions.width > 0 ? newRoom.dimensions : undefined
    };

    if (existingRooms.length === 0) {
      onCreateQuote(room);
    } else {
      onAddRoom(room);
    }

    setShowCreateForm(false);
    setShowProcessingConfig(false);
    // Reset form
    setNewRoom({
      type: 'Kitchen',
      description: '',
      frontModelId: '',
      activatedProcessings: [],
      dimensions: { width: 0, height: 0, depth: 0 }
    });
  };

  const toggleProcessing = (processingId: string) => {
    setNewRoom(prev => ({
      ...prev,
      activatedProcessings: prev.activatedProcessings.includes(processingId)
        ? prev.activatedProcessings.filter(id => id !== processingId)
        : [...prev.activatedProcessings, processingId]
    }));
  };

  // Get processings that are applicable to room-level inheritance
  const getRoomLevelProcessings = () => {
    return processings.filter(proc => 
      // Include processings that can be applied at room level (typically finishing and common hardware)
      proc.category === 'finishing' || 
      proc.category === 'hardware_install' || 
      proc.category === 'upgrade'
    );
  };

  const getSelectedProcessingNames = () => {
    return newRoom.activatedProcessings
      .map(id => processings.find(p => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Existing Rooms */}
      {existingRooms.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configured Rooms</h2>
          <div className="space-y-3">
            {existingRooms.map((room) => {
              const model = models.find(m => m.id === room.frontModelId);
              const activatedProcessingNames = room.activatedProcessings
                .map(id => processings.find(p => p.id === id)?.name)
                .filter(Boolean);
              
              return (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{room.name}</h3>
                      {room.description && (
                        <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                      )}
                      <p className="text-sm text-blue-600 mt-1">
                        Style: {model?.name || 'Unknown Model'}
                      </p>
                      
                      {/* Activated Processings Display */}
                      {activatedProcessingNames.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Auto-Applied Processings:</p>
                          <div className="flex flex-wrap gap-1">
                            {activatedProcessingNames.map((name, index) => (
                              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {room.dimensions && (
                        <p className="text-xs text-gray-500 mt-1">
                          {room.dimensions.width}' × {room.dimensions.height}' × {room.dimensions.depth}'
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit Room
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm"
          >
            Add Another Room
          </button>
        </div>
      )}

      {/* Room Creation Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {existingRooms.length === 0 ? 'Create Room & Configure Auto-Processing' : 'Add New Room'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type *
              </label>
              <select
                value={newRoom.type}
                onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {ROOM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style *
              </label>
              <select
                value={newRoom.frontModelId}
                onChange={(e) => setNewRoom(prev => ({ ...prev, frontModelId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a style...</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newRoom.description}
              onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any special notes or requirements for this room..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Dimensions */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions (Optional)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Width (ft)"
                  value={newRoom.dimensions.width || ''}
                  onChange={(e) => setNewRoom(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Height (ft)"
                  value={newRoom.dimensions.height || ''}
                  onChange={(e) => setNewRoom(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Depth (ft)"
                  value={newRoom.dimensions.depth || ''}
                  onChange={(e) => setNewRoom(prev => ({
                    ...prev,
                    dimensions: { ...prev.dimensions, depth: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Auto-Applied Processings Section */}
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Auto-Applied Processings</h3>
                <p className="text-sm text-gray-600">
                  These processings will be automatically applied to all products in this room
                </p>
              </div>
              <button
                onClick={() => setShowProcessingConfig(!showProcessingConfig)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                {showProcessingConfig ? 'Hide' : 'Configure'} Processings
              </button>
            </div>

            {/* Selected Processings Preview */}
            {newRoom.activatedProcessings.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Selected Auto-Applied Processings ({newRoom.activatedProcessings.length}):
                </p>
                <p className="text-sm text-green-800">{getSelectedProcessingNames()}</p>
              </div>
            )}

            {/* Processing Configuration Panel */}
            {showProcessingConfig && (
              <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRoomLevelProcessings().map((processing) => (
                      <label key={processing.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRoom.activatedProcessings.includes(processing.id)}
                          onChange={() => toggleProcessing(processing.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{processing.name}</h4>
                          <p className="text-xs text-gray-600">{processing.description}</p>
                          <p className="text-xs text-green-600 mt-1">
                            {processing.pricingType === 'percentage' 
                              ? `${(processing.price * 100).toFixed(0)}% of base price`
                              : `$${processing.price.toFixed(2)} ${processing.pricingType.replace('_', ' ')}`
                            }
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            {existingRooms.length > 0 && (
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setShowProcessingConfig(false);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={handleCreateRoom}
              disabled={!newRoom.type || !newRoom.frontModelId}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md ml-auto"
            >
              {existingRooms.length === 0 ? 'Create Room & Start Quote' : 'Add Room'}
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      {!showCreateForm && existingRooms.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m5-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Room</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Start by creating a room, selecting a style, and configuring automatic processings. 
            All products added to this room will inherit the selected processings automatically.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create Room
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedRoomManager;
