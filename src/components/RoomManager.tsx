import React, { useState } from 'react';
import { Model, Room } from '../types';

interface RoomManagerProps {
  models: Model[];
  onCreateQuote: (room: Room) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({
  models,
  onCreateQuote,
  existingRooms,
  onAddRoom
}) => {
  const [showCreateForm, setShowCreateForm] = useState(existingRooms.length === 0);
  const [newRoom, setNewRoom] = useState(() => {
    // Pre-populate with existing room data if available
    if (existingRooms.length > 0) {
      const room = existingRooms[0];
      return {
        name: room.name,
        description: room.description,
        frontModelId: room.frontModelId,
        dimensions: room.dimensions || { width: 0, height: 0, depth: 0 }
      };
    }
    return {
      name: '',
      description: '',
      frontModelId: '',
      dimensions: { width: 0, height: 0, depth: 0 }
    };
  });

  const handleCreateRoom = () => {
    alert('🔧 RoomManager handleCreateRoom called with newRoom: ' + JSON.stringify(newRoom));
    console.log('🔧 RoomManager handleCreateRoom called with newRoom:', newRoom);
    
    if (!newRoom.name || !newRoom.frontModelId) {
      console.log('❌ Room validation failed:', { name: newRoom.name, frontModelId: newRoom.frontModelId });
      return;
    }

    const room: Room = {
      id: Date.now().toString(),
      name: newRoom.name,
      description: newRoom.description,
      frontModelId: newRoom.frontModelId,
      activatedProcessings: [], // Initialize with empty array - can be configured later
      dimensions: newRoom.dimensions.width > 0 ? newRoom.dimensions : undefined
    };

    console.log('🔧 Created room object:', room);

    if (existingRooms.length === 0) {
      // First room - create quote
      console.log('🔧 Calling onCreateQuote with room:', room);
      onCreateQuote(room);
    } else {
      // Additional room
      console.log('🔧 Calling onAddRoom with room:', room);
      onAddRoom(room);
    }

    // Reset form
    setNewRoom({
      name: '',
      description: '',
      frontModelId: '',
      dimensions: { width: 0, height: 0, depth: 0 }
    });
    setShowCreateForm(false);
  };

  const getModelName = (modelId: string) => {
    return models.find(m => m.id === modelId)?.name || 'Unknown Model';
  };

  return (
    <div className="space-y-6">
      {/* Existing Rooms */}
      {existingRooms.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingRooms.map((room) => (
              <div key={room.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{room.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">
                      Front Model: {getModelName(room.frontModelId)}
                    </p>
                    {room.dimensions && (
                      <p className="text-xs text-gray-500 mt-1">
                        {room.dimensions.width}" × {room.dimensions.height}" × {room.dimensions.depth}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Room */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {existingRooms.length === 0 ? 'Create Your First Room' : 'Add Another Room'}
            </h3>
            {!showCreateForm && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  + New Room
                </button>
                {existingRooms.length > 0 && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Edit Room
                  </button>
                )}
              </div>
            )}
          </div>

          {(showCreateForm || existingRooms.length === 0) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Kitchen, Master Bath, Guest Powder Room"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front Model * 
                    <span className="text-xs text-gray-500 ml-1">(determines colors & styles)</span>
                  </label>
                  <select
                    value={newRoom.frontModelId}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, frontModelId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Front Model</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the room or special requirements"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Dimensions (optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      type="number"
                      value={newRoom.dimensions.width || ''}
                      onChange={(e) => setNewRoom(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="Width"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Width (ft)</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={newRoom.dimensions.height || ''}
                      onChange={(e) => setNewRoom(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="Height"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Height (ft)</p>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={newRoom.dimensions.depth || ''}
                      onChange={(e) => setNewRoom(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, depth: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="Depth"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Depth (ft)</p>
                  </div>
                </div>
              </div>

              {/* Selected Model Preview */}
              {newRoom.frontModelId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Front Model</h4>
                  <div className="text-sm text-blue-800">
                    <p><span className="font-medium">{getModelName(newRoom.frontModelId)}</span></p>
                    <p className="text-xs text-blue-600 mt-1">
                      All products in this room will inherit colors and styles from this model
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                {showCreateForm && existingRooms.length > 0 && (
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name || !newRoom.frontModelId}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-md text-sm font-medium"
                >
                  {existingRooms.length === 0 ? 'DEBUG BUTTON' : 'Update Room'}
                </button>
              </div>
            </div>
          )}

          {/* Help Text */}
          {existingRooms.length === 0 && !showCreateForm && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m5-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Room</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start by creating a room and selecting a front model. 
                The front model determines the colors and styles for all products in that room.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManager;

