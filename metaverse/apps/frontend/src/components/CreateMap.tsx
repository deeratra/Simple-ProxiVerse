/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface Props {
  onClose: () => void;
}

const CreateMap: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  // const [setError] = useState('');

  const handleCreateMap = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/maps`,
        {
          name,
          dimensions: `${width}x${height}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      console.log('Map created:', response.data);
      onClose();
    } catch (err) {
      console.error('Error creating map:', err);
      // setError('Failed to create map.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Map</h2>
        <form>
          <label className="block mb-2">
            Name:
            <input
              type="text"
              className="w-full px-3 py-2 border rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block mb-2">
            Width:
            <input
              type="number"
              className="w-full px-3 py-2 border rounded mt-1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </label>
          <label className="block mb-4">
            Height:
            <input
              type="number"
              className="w-full px-3 py-2 border rounded mt-1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleCreateMap}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMap;
