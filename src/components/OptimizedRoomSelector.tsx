import React, { useState, useRef, useEffect } from 'react';
import { Room, QuoteItem } from '../types';

interface OptimizedRoomSelectorProps {
  rooms: Room[];
  currentRoomId: string | null;
  quoteItems: QuoteItem[];
  onRoomSelect: (roomId: string) => void;
  className?: string;
}

const OptimizedRoomSelector: React.FC<OptimizedRoomSelectorProps> = ({
  rooms,
  currentRoomId,
  quoteItems,
  onRoomSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current room details
  const currentRoom = rooms.find(room => room.id === currentRoomId);
  const currentRoomProductCount = quoteItems.filter(item => item.roomId === currentRoomId).length;

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get room product counts
  const getRoomProductCount = (roomId: string) => {
    return quoteItems.filter(item => item.roomId === roomId).length;
  };

  // Sort rooms: rooms with products first, then alphabetical
  const sortedRooms = filteredRooms.sort((a, b) => {
    const aCount = getRoomProductCount(a.id);
    const bCount = getRoomProductCount(b.id);
    
    // Rooms with products first
    if (aCount > 0 && bCount === 0) return -1;
    if (bCount > 0 && aCount === 0) return 1;
    
    // Then alphabetical
    return a.name.localeCompare(b.name);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRoomClick = (roomId: string) => {
    onRoomSelect(roomId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between px-4 py-2 border rounded-lg bg-white
          transition-all duration-200 min-w-[200px] max-w-[300px]
          ${currentRoom 
            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
            : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }
          ${isOpen ? 'ring-2 ring-blue-200' : ''}
        `}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-sm font-medium truncate">
            {currentRoom ? currentRoom.name : 'Select Room'}
          </span>
          {currentRoom && currentRoomProductCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              {currentRoomProductCount}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Room List */}
          <div className="max-h-64 overflow-y-auto">
            {sortedRooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No rooms found matching "{searchTerm}"
              </div>
            ) : (
              <>
                {/* Rooms with Products Section */}
                {sortedRooms.some(room => getRoomProductCount(room.id) > 0) && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      Rooms with Products
                    </div>
                    {sortedRooms
                      .filter(room => getRoomProductCount(room.id) > 0)
                      .map((room) => {
                        const productCount = getRoomProductCount(room.id);
                        const isCurrentRoom = room.id === currentRoomId;
                        
                        return (
                          <button
                            key={room.id}
                            onClick={() => handleRoomClick(room.id)}
                            className={`
                              w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                              transition-colors duration-150 border-b border-gray-100 last:border-b-0
                              ${isCurrentRoom ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{room.name}</span>
                                {isCurrentRoom && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                {productCount}
                              </span>
                            </div>
                            {room.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{room.description}</p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* Empty Rooms Section */}
                {sortedRooms.some(room => getRoomProductCount(room.id) === 0) && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      Available Rooms
                    </div>
                    {sortedRooms
                      .filter(room => getRoomProductCount(room.id) === 0)
                      .map((room) => {
                        const isCurrentRoom = room.id === currentRoomId;
                        
                        return (
                          <button
                            key={room.id}
                            onClick={() => handleRoomClick(room.id)}
                            className={`
                              w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                              transition-colors duration-150 border-b border-gray-100 last:border-b-0
                              ${isCurrentRoom ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{room.name}</span>
                                {isCurrentRoom && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">Empty</span>
                            </div>
                            {room.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate">{room.description}</p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Summary Footer */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
            {filteredRooms.length} of {rooms.length} rooms
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedRoomSelector;
