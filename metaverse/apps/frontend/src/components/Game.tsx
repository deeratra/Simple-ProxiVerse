import { useState, useRef, useEffect } from 'react';

interface GameProps {
  elements: any[];
  mapElements: any[];
  mapWidth: number;
  mapHeight: number;
  roomId: string;
}

const Game: React.FC<GameProps> = ({
  elements,
  mapElements,
  mapWidth,
  mapHeight,
  roomId,
}) => {
  const [userPosition, setUserPosition] = useState({ x: 100, y: 100 });
  const [otherUsers, setOtherUsers] = useState<Map<string, any>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const moveUserPosition = (dx: number, dy: number) => {
    wsRef.current?.send(
      JSON.stringify({ type: 'move', payload: { x: dx, y: dy } }),
    );
    setUserPosition((prev) => ({
      x: Math.max(0, dx),
      y: Math.max(0, dy),
    }));
    // setUserPosition((prev) => {
    //   const newX = Math.max(0, Math.min(mapWidth - 15, prev.x + dx));
    //   const newY = Math.max(0, Math.min(mapHeight - 15, prev.y + dy));
    //   return { x: newX, y: newY };
    // });
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log('Received message:', data);
    switch (data.type) {
      case 'room-joined': {
        setUserPosition({
          x: data.payload.spawn.x,
          y: data.payload.spawn.y,
        });

        const users = new Map();
        data.payload.users.forEach((user: any) => {
          users.set(user.id, user);
        });
        setOtherUsers(users);
        break;
      }

      case 'user-joined': {
        setOtherUsers((prev: any) => {
          const newUsers = new Map(prev);
          newUsers.set(data.payload.id, {
            x: data.payload.x,
            y: data.payload.y,
            id: data.payload.id,
          });
          return newUsers;
        });
        break;
      }

      case 'user-left': {
        setOtherUsers((prev: any) => {
          const newUsers = new Map(prev);
          newUsers.delete(data.payload.id);
          return newUsers;
        });
        break;
      }

      case 'user-moved': {
        setOtherUsers((prev: any) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(data.payload.id);
          console.log('User:', user);
          if (user) {
            user.x = data.payload.x;
            user.y = data.payload.y;
            newUsers.set(data.payload.id, user);
          }
          return newUsers;
        });
        break;
      }
      default:
        break;
    }
  };

  // Websocket Initialization
  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3001');
    wsRef.current.onopen = () => {
      console.log('Connected to server');
      wsRef.current?.send(
        JSON.stringify({
          type: 'join',
          payload: {
            roomId: roomId,
            token: localStorage.getItem('token'),
          },
        }),
      );
    };

    wsRef.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      handleWebSocketMessage(event);
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from server');
    };

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleKeyEvent = (event: KeyboardEvent) => {
      const { x, y } = userPosition;
      switch (event.key) {
        case 'ArrowUp':
          moveUserPosition(x, y - 10);
          break;
        case 'ArrowDown':
          moveUserPosition(x, y + 10);
          break;
        case 'ArrowLeft':
          moveUserPosition(x - 10, y);
          break;
        case 'ArrowRight':
          moveUserPosition(x + 10, y);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
    };
  });

  useEffect(() => {
    const cavas = canvasRef.current;
    const ctx = cavas?.getContext('2d');

    if (cavas && ctx) {
      ctx.clearRect(0, 0, cavas.width, cavas.height);

      mapElements.forEach((el) => {
        drawElement(ctx, el.element, el.x, el.y);
      });

      elements.forEach((el) => {
        drawElement(ctx, el.element, el.x, el.y);
      });

      ctx.beginPath();
      ctx.arc(userPosition.x, userPosition.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.closePath();
      console.log('Other users:', otherUsers);
      otherUsers?.forEach((user: any) => {
        ctx.beginPath();
        ctx.arc(user.x, user.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'red'; // Different color for other users
        ctx.fill();
        ctx.closePath();
      });
    }
  }, [elements, mapElements, userPosition, otherUsers]);

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: any,
    x: number,
    y: number,
  ) => {
    const img = new Image();
    img.src = element.imageUrl;
    img.onload = () => {
      ctx.drawImage(img, x, y, element.width, element.height);
    };
  };

  return (
    <>
      <div>
        <h1>Game</h1>
        <p>
          User position: {userPosition.x}, {userPosition.y}
        </p>
      </div>
      <div className="game-container">
        <canvas ref={canvasRef} width={mapWidth} height={mapHeight}></canvas>
      </div>
    </>
  );
};

export default Game;
