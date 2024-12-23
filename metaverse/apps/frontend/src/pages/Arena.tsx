import React, { useEffect, useState } from 'react';

// Sample data for elements
const elements = [
  { id: 'element1', x: 50, y: 100, imageUrl: 'https://via.placeholder.com/50' },
  { id: 'element2', x: 50, y: 1000, imageUrl: 'https://via.placeholder.com/50' },
];

const Arena: React.FC = () => {
  const [userPosition, setUserPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Generate a random position for the user within the arena (let's assume 500x500 arena size)
    const randomX = Math.floor(Math.random() * 500);
    const randomY = Math.floor(Math.random() * 500);
    setUserPosition({ x: randomX, y: randomY });
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-200">
      {/* Displaying Elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
          }}
        >
          <img src={element.imageUrl} alt={`Element ${element.id}`} />
        </div>
      ))}

      {/* User - A simple circle for the user */}
      {userPosition && (
        <div
          className="absolute bg-blue-500 rounded-full"
          style={{
            left: `${userPosition.x}px`,
            top: `${userPosition.y}px`,
            width: '30px',
            height: '30px',
          }}
        />
      )}
    </div>
  );
};

export default Arena;
