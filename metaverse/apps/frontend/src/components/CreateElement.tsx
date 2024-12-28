import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

interface Props {
  onClose: () => void;
}

const CreateElement: React.FC<Props> = ({ onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [success, setSuccess] = useState('');

  const handleCreateElement = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/element`, {
        imageUrl,
        width,
        height,
      });
      console.log('Element created:', response.data);
      setSuccess('Element created successfully!');
      setImageUrl('');
      setWidth(0);
      setHeight(0);
    } catch (err) {
      console.error('Error creating element:', err);
      setSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Element</h2>
        <form>
          <label className="block mb-2">
            Image URL:
            <input
              type="text"
              className="w-full px-3 py-2 border rounded mt-1"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleCreateElement}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateElement;
