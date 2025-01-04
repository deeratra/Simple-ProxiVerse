/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const AddElementToMap: React.FC = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const [elements, setElements] = useState([]);
  const [elementId, setElementId] = useState('');
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/element/bulk`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setElements(response.data);
      } catch (err) {
        console.error('Error fetching elements:', err);
      }
    };

    fetchElements();
  }, []);

  const handleAddElement = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/maps/element`,
        {
          mapId,
          elementId,
          x,
          y,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      alert('Element added to map successfully!');
    } catch (err) {
      console.error('Error adding element to map:', err);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Add Element to Map</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Element:</label>
        <select
          className="w-full px-3 py-2 border rounded"
          value={elementId}
          onChange={(e) => setElementId(e.target.value)}
        >
          <option value="">-- Select an Element --</option>
          {elements.map((element: any) => (
            <option key={element.id} value={element.id}>
              {element.id} (Size: {element.width}x{element.height})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">X Position:</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Y Position:</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded"
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
        />
      </div>

      <button
        className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
        onClick={handleAddElement}
      >
        Add Element
      </button>
    </div>
  );
};

export default AddElementToMap;
