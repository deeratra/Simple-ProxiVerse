/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateElement from '../components/CreateElement';
import CreateMap from '../components/CreateMap';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const MapsPage: React.FC = () => {
  const [maps, setMaps] = useState([]);
  const [showCreateElement, setShowCreateElement] = useState(false);
  const [showCreateMap, setShowCreateMap] = useState(false);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/maps/bulk`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Maps:', response.data);
        setMaps(response.data);
      } catch (err) {
        console.error('Error fetching maps:', err);
      }
    };

    fetchMaps();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Maps</h1>
        <div className="space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            onClick={() => setShowCreateElement(true)}
          >
            Create Element
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
            onClick={() => setShowCreateMap(true)}
          >
            Create Map
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {maps.map((map: any) => (
          <Link
            to={`/addElementsToMap/${map.id}`}
            key={map.id}
            className="w-72 bg-white rounded shadow hover:shadow-lg transition"
          >
            {/* Thumbnail */}
            <div className="h-40 bg-gray-200 rounded-t">
              <img
                src={map.image || 'https://via.placeholder.com/300x200'} // Fallback thumbnail
                alt={map.name}
                className="h-full w-full object-cover rounded-t"
              />
            </div>
            {/* Details */}
            <div className="p-4">
              <h2 className="text-lg font-semibold truncate">{map.name}</h2>
              <p className="text-sm text-gray-600 truncate">{`Size: ${map.width}x${map.height}`}</p>
            </div>
          </Link>
        ))}
      </div>

      {showCreateElement && (
        <CreateElement onClose={() => setShowCreateElement(false)} />
      )}

      {showCreateMap && <CreateMap onClose={() => setShowCreateMap(false)} />}
    </div>
  );
};

export default MapsPage;
