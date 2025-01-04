/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, useEffect } from 'react';
const PROXIMITY_THRESHOLD = 50;

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
  const sendingPeerConnection = useRef<RTCPeerConnection | null>(null);
  const receivingPeerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const initiateVideoCall = async (userId: string) => {
    try {
      // Get local media stream (video and audio)
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const localVideo = document.getElementById(
        'localVideo',
      ) as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.play();
      }

      // Create a new RTCPeerConnection
      const peerConnection = new RTCPeerConnection();
      sendingPeerConnection.current = peerConnection;
      // setSendingPeerConnection?.current(peerConnection);
      if (sendingPeerConnection) {
        // Add local stream tracks to the peer connection
        localStream.getTracks().forEach((track) => {
          sendingPeerConnection.current?.addTrack(track, localStream);
        });

        // Listen for remote track events and attach to a video element
        sendingPeerConnection.current.ontrack = (event) => {
          console.log('Do i get a remote track on sender side');
          const remoteVideo = document.getElementById(
            'remoteVideo',
          ) as HTMLVideoElement;
          if (remoteVideo && !remoteVideo.srcObject) {
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.play();
          }
        };

        // Handle ICE candidate events
        sendingPeerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            wsRef.current?.send(
              JSON.stringify({
                type: 'ice-candidate',
                payload: {
                  target: userId, // ID of the user to send the ICE candidate to
                  candidate: event.candidate,
                },
              }),
            );
          }
        };

        // Handle negotiation-needed events (triggered automatically during setup)
        sendingPeerConnection.current.onnegotiationneeded = async () => {
          try {
            const offer = await sendingPeerConnection.current?.createOffer();
            await sendingPeerConnection.current?.setLocalDescription(offer);
            wsRef.current?.send(
              JSON.stringify({
                type: 'create-offer',
                payload: {
                  target: userId, // ID of the target user
                  sdp: sendingPeerConnection.current?.localDescription, // Use only the SDP string
                  type: sendingPeerConnection.current?.localDescription?.type,
                },
              }),
            );
          } catch (error) {
            console.error('Error during negotiation:', error);
          }
        };
      }
    } catch (error) {
      console.error('Error initializing video call:', error);
    }
  };

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
    // Check proxomity of the user to other users and call initiateVideoCall
    if (otherUsers) {
      otherUsers.forEach((user: any) => {
        const dx = user.x - userPosition.x;
        const dy = user.y - userPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= PROXIMITY_THRESHOLD) {
          console.log(`User ${user.id} is within proximity!`);
          initiateVideoCall(user.id); // Start video call or trigger proximity event
        }
      });
    }
  };

  const handleWebSocketMessage = async (event: MessageEvent) => {
    const data = JSON.parse(event.data);
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
        setOtherUsers((prev) => {
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
        setOtherUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.delete(data.payload.id);
          return newUsers;
        });
        break;
      }

      case 'user-moved': {
        setOtherUsers((prev) => {
          const newUsers = new Map(prev);
          const user = newUsers.get(data.payload.id);
          if (user) {
            user.x = data.payload.x;
            user.y = data.payload.y;
            newUsers.set(data.payload.id, user);
          }
          return newUsers;
        });
        break;
      }

      case 'create-offer': {
        const peerConnection = new RTCPeerConnection();
        receivingPeerConnectionRef.current = peerConnection;
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const localVideo = document.getElementById(
          'localVideo',
        ) as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = localStream;
          localVideo.play();
        }

        // Create a new RTCPeerConnection for User 2

        // Add the local stream tracks to the peer connection
        localStream.getTracks().forEach((track) => {
          receivingPeerConnectionRef.current?.addTrack(track, localStream);
        });
        console.log('Starting call with:', data.payload.from);
        // Listen for remote track events and attach to a video element

        if (receivingPeerConnectionRef.current) {
          receivingPeerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              wsRef.current?.send(
                JSON.stringify({
                  type: 'ice-candidate',
                  payload: {
                    target: data.payload.from,
                    candidate: event.candidate,
                    type: 'sender',
                  },
                }),
              );
            }
          };

          receivingPeerConnectionRef.current.ontrack = (event) => {
            console.log('ontrack fired', event.streams);
            const remoteVideo = document.getElementById(
              'remoteVideo',
            ) as HTMLVideoElement;

            if (remoteVideo) {
              // Check if the stream is already assigned to prevent redundant updates
              if (remoteVideo.srcObject !== event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];

                // Ensure the video plays after the source is set
                remoteVideo.onloadeddata = () => {
                  remoteVideo.play().catch((error) => {
                    console.error('Error playing remote video:', error);
                  });
                };

                console.log('Remote stream assigned and video is set to play.');
                console.log('Video tracks:', event.streams[0].getVideoTracks());
              } else {
                console.log(
                  'Remote stream is already assigned to the video element.',
                );
              }
            } else {
              console.error('Remote video element not found!');
            }
          };
          try {
            await receivingPeerConnectionRef.current?.setRemoteDescription(
              data.payload.offer,
            );
            console.log('Remote description set');
          } catch (e) {
            console.log(e);
          }
          // Create an answer to an offer
          const answer =
            await receivingPeerConnectionRef.current?.createAnswer();
          await receivingPeerConnectionRef.current?.setLocalDescription(answer);
          // Send the answer to the other user
          wsRef.current?.send(
            JSON.stringify({
              type: 'create-answer',
              payload: {
                target: data.payload.from,
                sdp: receivingPeerConnectionRef.current?.localDescription,
              },
            }),
          );
        }
        break;
      }

      case 'ice-candidate': {
        const processCandidate = async () => {
          let retries = 50;

          while (!receivingPeerConnectionRef.current && retries > 0) {
            console.log(
              `Waiting for receivingPeerConnectionRef.current , attempts left: ${retries}`,
            );
            retries--;
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 100ms
          }

          if (receivingPeerConnectionRef.current) {
            try {
              await receivingPeerConnectionRef.current.addIceCandidate(
                data.payload.candidate,
              );
              console.log('Successfully added ICE candidate');
            } catch (error) {
              console.error('Failed to add ICE candidate:', error);
            }
          } else {
            console.error(
              'Failed to initialize receivingPeerConnection for ICE candidate',
            );
          }
        };
        if (data.payload.type && data.payload.type === 'sender') {
          let retries = 50;

          while (!sendingPeerConnection && retries > 0) {
            console.log(
              `Waiting for sendingPeerConnection , attempts left: ${retries}`,
            );
            retries--;
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 100ms
          }

          if (sendingPeerConnection) {
            try {
              await sendingPeerConnection.current?.addIceCandidate(
                data.payload.candidate,
              );
              console.log('Successfully added ICE candidate');
            } catch (error) {
              console.error('Failed to add ICE candidate:', error);
            }
          } else {
            console.error(
              'Failed to initialize receivingPeerConnection for ICE candidate',
            );
          }
        }
        processCandidate();
        break;
      }

      case 'create-answer': {
        console.log('Answer recieved');
        try {
          await sendingPeerConnection?.current?.setRemoteDescription(
            data.payload.answer,
          );
          console.log('Answer set');
        } catch (e) {
          console.log(e);
        }

        break;
      }

      default:
        break;
    }
  };

  useEffect(() => {
    return () => {
      if (sendingPeerConnection) {
        sendingPeerConnection.current?.close();
      }
      const localVideo = document.getElementById(
        'localVideo',
      ) as HTMLVideoElement;
      if (localVideo && localVideo.srcObject) {
        const tracks = (localVideo.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Websocket Initialization
  useEffect(() => {
    wsRef.current = new WebSocket('ws://192.168.2.202:3001');
    wsRef.current.onopen = () => {
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
      <div className="video-container">
        <div className="video-box">
          <h3>Me</h3>
          <video id="localVideo" autoPlay muted></video>
        </div>

        <div className="video-box">
          <h3>Other User</h3>
          <video id="remoteVideo" autoPlay muted></video>
        </div>
      </div>
      <div className="game-container">
        <canvas ref={canvasRef} width={mapWidth} height={mapHeight}></canvas>
      </div>
    </>
  );
};

export default Game;
