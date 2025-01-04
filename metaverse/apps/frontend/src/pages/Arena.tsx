/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import Game from '../components/Game';
import { useParams } from 'react-router-dom';

const Arena: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Room ID:', roomId);
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/room/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        console.log('Room data:', response.data);
        setRoomData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred');
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="arena-container">
      <h1 className="text-center text-2xl font-bold">Arena: {roomData.name}</h1>
      <Game
        elements={roomData.elements}
        mapElements={roomData.map.mapElements}
        mapWidth={roomData.map.width}
        mapHeight={roomData.map.height}
        roomId={roomId}
      />
    </div>
  );
};

export default Arena;
