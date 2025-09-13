import React, { useState } from 'react';
import { Model, Room, Processing } from '../types';

interface HorizontalRoomManagerProps {
  models: Model[];
  processings: Processing[];
  onCreateQuote: (room: Room) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => void;
  onEditRoom?: (room: Room) => void;
  onSelectRoom?: (roomId: string) => void;
  currentRoomId?: string | null;
}

const ROOM_TYPES = ['Kitchen', 'Bathroom', 'Laundry Room', 'Pantry', 'Wet Bar'];

const HorizontalRoomManager: React.FC<HorizontalRoomManagerProps> = ({
  models,
  processings,
  onCreateQuote,
  existingRooms,
  onAddRoom,
  onEditRoom,
  onSelectRoom,
  currentRoomId
}) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState(() => {
    return {
      type: 'Kitchen',
      description: '',
      frontModelId: '',
      dimensions: { width: 0, height: 0, depth: 0 }
    };
  });

  const handleCreateRoom = () => {
    if (!newRoom.type || !newRoom.frontModelId) return;

    const room: Room = {
      id: editingRoomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newRoom.description || newRoom.type,
      description: newRoom.description,
      frontModelId: newRoom.frontModelId,
      activatedProcessings: [], // Start with empty processings - configure separately
      dimensions: newRoom.dimensions.width > 0 ? newRoom.dimensions : undefined
    };

    if (editingRoomId) {
      onEditRoom?.(room);
    } else if (existingRooms.length === 0) {
      onCreateQuote(room);
    } else {
      onAddRoom(room);
    }

    // Reset form
    setEditingRoomId(null);
    setNewRoom({
      type: 'Kitchen',
      description: '',
      frontModelId: '',
      dimensions: { width: 0, height: 0, depth: 0 }
    });
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setNewRoom({
      type: room.name,
      description: room.description,
      frontModelId: room.frontModelId,
      dimensions: room.dimensions || { width: 0, height: 0, depth: 0 }
    });
  };

  const handleProcessingToggle = (roomId: string, processingId: string) => {
    const room = existingRooms.find(r => r.id === roomId);
    if (!room) return;

    const updatedProcessings = room.activatedProcessings.includes(processingId)
      ? room.activatedProcessings.filter(id => id !== processingId)
      : [...room.activatedProcessings, processingId];

    const updatedRoom = {
      ...room,
      activatedProcessings: updatedProcessings
    };

    onEditRoom?.(updatedRoom);
  };

  // Get processings that are applicable to room-level inheritance
  const getRoomLevelProcessings = () => {
    return processings.filter(proc => 
      proc.category === 'finishing' || 
      proc.category === 'hardware_install' || 
      proc.category === 'upgrade'
    );
  };

  // This function is no longer needed since processing configuration is handled per room

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
        {/* Left Pane - Add New Room */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingRoomId ? 'Edit Room' : 'Room Details'}
                </h2>
                
                {/* Add Room Button - Only show when not editing */}
                {!editingRoomId && (
                  <button
                    onClick={handleCreateRoom}
                    disabled={!newRoom.type || !newRoom.frontModelId}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Add Room
                  </button>
                )}
                
                {/* Action Buttons - Only show when editing */}
                {editingRoomId && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingRoomId(null);
                        setNewRoom({
                          type: 'Kitchen',
                          description: '',
                          frontModelId: '',
                          dimensions: { width: 0, height: 0, depth: 0 }
                        });
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleCreateRoom}
                      disabled={!newRoom.type || !newRoom.frontModelId}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-1 rounded text-xs font-medium"
                    >
                      Update Room
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Room Form - Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
              {/* Room Type and Model Selection - Inline */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                  >
                    {ROOM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Style *</label>
                  <select
                    value={newRoom.frontModelId}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, frontModelId: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select style...</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description - Compact */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Special notes..."
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Dimensions - Inline */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dimensions (ft)</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    placeholder="W"
                    value={newRoom.dimensions.width || ''}
                    onChange={(e) => setNewRoom(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="H"
                    value={newRoom.dimensions.height || ''}
                    onChange={(e) => setNewRoom(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="D"
                    value={newRoom.dimensions.depth || ''}
                    onChange={(e) => setNewRoom(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, depth: parseFloat(e.target.value) || 0 }
                    }))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Pane - Configured Rooms */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Configured Rooms {existingRooms.length > 0 && `(${existingRooms.length})`}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {existingRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m5-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No Rooms Added</h3>
                  <p className="text-xs text-gray-600">Add rooms using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-2">
                {existingRooms.map((room) => {
                  const model = models.find(m => m.id === room.frontModelId);
                  const activatedProcessingNames = room.activatedProcessings
                    .map(id => processings.find(p => p.id === id)?.name)
                    .filter(Boolean);
                  
                  return (
                    <div 
                      key={room.id} 
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        currentRoomId === room.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onSelectRoom?.(room.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-medium text-gray-900 text-sm truncate">{room.name}</h3>
                              {currentRoomId === room.id && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                  Selected
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-blue-600 truncate">
                              {model?.name || 'Unknown Model'}
                            </p>
                            
                            {room.description && (
                              <p className="text-xs text-gray-600 truncate">{room.description}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRoom(room);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        
                        {/* Activated Processings - Compact */}
                        {activatedProcessingNames.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Auto-Applied:</p>
                            <div className="flex flex-wrap gap-1">
                              {activatedProcessingNames.slice(0, 2).map((name, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">
                                  {name}
                                </span>
                              ))}
                              {activatedProcessingNames.length > 2 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded">
                                  +{activatedProcessingNames.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {room.dimensions && (
                          <p className="text-xs text-gray-500">
                            {room.dimensions.width}'×{room.dimensions.height}'×{room.dimensions.depth}'
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane - Available Room Processings */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow h-96 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Room Processings
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {!currentRoomId ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Select a Room</h3>
                  <p className="text-xs text-gray-600">Choose a room to configure its processings</p>
                </div>
              ) : (
                <div className="space-y-2">
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    Configuring processings for: <span className="font-medium">
                      {existingRooms.find(r => r.id === currentRoomId)?.name}
                    </span>
                  </p>
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                  {getRoomLevelProcessings().map((processing) => {
                    const room = existingRooms.find(r => r.id === currentRoomId);
                    const isActivated = room?.activatedProcessings.includes(processing.id) || false;
                    
                    return (
                      <label key={processing.id} className="flex items-start space-x-3 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActivated}
                          onChange={() => handleProcessingToggle(currentRoomId, processing.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">{processing.name}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{processing.description}</p>
                          <p className="text-xs text-green-600 mt-1">
                            {processing.pricingType === 'percentage' 
                              ? `${(processing.price * 100).toFixed(0)}% of base price`
                              : `$${processing.price.toFixed(2)} ${processing.pricingType.replace('_', ' ')}`
                            }
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default HorizontalRoomManager;
