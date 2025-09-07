import React, { useState } from 'react';
import { Model, Room } from '../types';

interface ImprovedRoomManagerProps {
  models: Model[];
  onCreateQuote: (room: Room) => void;
  existingRooms: Room[];
  onAddRoom: (room: Room) => void;
}

const ROOM_TYPES = [
  'Kitchen',
  'Master Bathroom', 
  'Guest Bathroom',
  'Powder Room',
  'Laundry Room',
  'Pantry',
  'Bar Area',
  'Home Office'
];

const ImprovedRoomManager: React.FC<ImprovedRoomManagerProps> = ({
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
        type: room.name,
        description: room.description || '',
        frontModelId: room.frontModelId,
        dimensions: room.dimensions || { width: 0, height: 0, depth: 0 }
      };
    }
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
      id: Date.now().toString(),
      name: newRoom.type,
      description: newRoom.description,
      frontModelId: newRoom.frontModelId,
      activatedProcessings: [], // Initialize with empty array - can be configured later
      dimensions: newRoom.dimensions.width > 0 ? newRoom.dimensions : undefined
    };

    if (existingRooms.length === 0) {
      // First room - create quote
      onCreateQuote(room);
    } else {
      // Additional room
      onAddRoom(room);
    }

    setShowCreateForm(false);
    // Reset form for next room
    setNewRoom({
      type: 'Kitchen',
      description: '',
      frontModelId: '',
      dimensions: { width: 0, height: 0, depth: 0 }
    });
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
              return (
                <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{room.name}</h3>
                      {room.description && (
                        <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                      )}
                      <p className="text-sm text-blue-600 mt-1">
                        Style: {model?.name || 'Unknown Model'}
                      </p>
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
            {existingRooms.length === 0 ? 'Create Room & Start Quote' : 'Add New Room'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Type Dropdown */}
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

          {/* Optional Description */}
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

          {/* Dimensions (Optional) */}
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

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            {existingRooms.length > 0 && (
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            )}
            
            <button
              onClick={handleCreateRoom}
              disabled={!newRoom.type || !newRoom.frontModelId}
              className={`px-6 py-2 rounded-md font-medium ${
                newRoom.type && newRoom.frontModelId
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${existingRooms.length === 0 ? 'ml-auto' : ''}`}
            >
              {existingRooms.length === 0 ? 'Create Room & Start Quote' : 'Add Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedRoomManager;
