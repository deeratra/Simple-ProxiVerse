import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface Map {
  id: string;
  name: string;
  thumbnailUrl: string;
}

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch rooms when the component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/room`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setRooms(response.data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };

    fetchRooms();
  }, []);

  // Fetch maps when "Create Room" is clicked
  const handleCreateRoomClick = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/maps/bulk`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Maps:', response.data);
      setMaps(response.data);
      setShowMapSelector(true);
    } catch (err) {
      console.error('Failed to fetch maps:', err);
    }
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/arena/${roomId}`); // Redirect to Arena page with roomId
  };

  // Handle creating a new room after selecting a map
  const handleSubmitRoom = async () => {
    if (!newRoomName || !selectedMapId) {
      setError('Please provide a room name and select a map.');
      return;
    }

    try {
      console.log('Creating room:', newRoomName, selectedMapId);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/room`,
        {
          name: newRoomName,
          mapId: selectedMapId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      setRooms((prevRooms) => [...prevRooms, response.data]);
      setNewRoomName('');
      setSelectedMapId(null);
      setShowMapSelector(false);
      setError('');
      setSuccess('Room created successfully!');
    } catch (err) {
      setError('Failed to create room. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="home">
      <h1 className="title">Your Rooms</h1>
      <div className="rooms-list">
        {rooms.length === 0 ? (
          <p>No rooms available. Create one to get started!</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="room-card"
              onClick={() => handleRoomClick(room.id)}
            >
              <img src={room.thumbnailUrl} alt={`${room.name} Thumbnail`} />
              <p>{room.name}</p>
            </div>
          ))
        )}
      </div>

      <button className="create-room-button" onClick={handleCreateRoomClick}>
        Create Room
      </button>

      {showMapSelector && (
        <div className="map-selector-modal">
          <h2>Select a Map</h2>
          <div className="maps-grid">
            {maps.map((map) => (
              <div
                key={map.id}
                className={`map-card ${selectedMapId === map.id ? 'selected' : ''}`}
                onClick={() => setSelectedMapId(map.id)}
              >
                <img
                  src={map.thumbnailUrl}
                  alt={`${map.name} Thumbnail`}
                  className="map-thumbnail"
                />
                <p className="map-name">{map.name}</p>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button onClick={handleSubmitRoom}>Submit</button>
          <button onClick={() => setShowMapSelector(false)}>Cancel</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default Home;
