import { WebSocket } from 'ws';
import { RoomManager } from './RoomMananger';
import client from '@repo/db/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export class User {
  public id?: string;
  private x: number;
  private y: number;
  private roomId?: string;
  private ws: WebSocket;


  constructor(ws: WebSocket) {
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on('message', async(data) => {
      const parsedData = JSON.parse(data.toString());
      console.log('received: %s', parsedData);
      console.log('RoomId', this.roomId);
      switch (parsedData.type) {
        case 'join': {
          const roomId = parsedData.payload.roomId;
          this.roomId = roomId;
          const token = parsedData.payload.token;
          console.log('token', token);
          const userId = (jwt.verify(token, JWT_SECRET || '') as JwtPayload).userId;
          if (!userId) {
            this.ws.close();
            return;
          }
          this.id = userId;

          const room = await client.room.findUnique({
            where: {
              id: roomId,
            },
            include: {
              elements: {
                include: {
                  element: true, // Includes detailed information about elements specific to the room
                },
              },
              map: {
                include: {
                  mapElements: {
                    include: {
                      element: true, // Includes detailed information about elements specific to the map
                    },
                  },
                },
              },
            },
          });
          if (!room) {
            this.ws.close()
            return;
        }
            
          RoomManager.getInstance().addUserToRoom(roomId, this);
          this.x = Math.floor(Math.random() * (room.map?.width || 1000));
          this.y = Math.floor(Math.random() * (room.map?.height || 1000));
          this.send({
            type: 'room-joined',
            payload: {
              spawn: {
                x: this.x,
                y: this.y,
              },
              users:
                RoomManager.getInstance()
                  .rooms.get(roomId)
                  ?.filter((user) => user.id !== this.id)
                  ?.map((user) => ({ id: user.id, x: user.x, y: user.y })) ?? [],
            },
          });

          RoomManager.getInstance().broadcast({
            type: 'user-joined',
            payload: {
              id: this.id,
              x: this.x,
              y: this.y,
            },
          }, this, roomId);
          break;
        }
        

        case 'move': {
          console.log('User Moving');
          const moveX = parsedData.payload.x;
          const moveY = parsedData.payload.y;
          const xDisplacement = Math.abs(moveX - this.x);
          const yDisplacement = Math.abs(moveY - this.y);
          console.log('xDisplacement', xDisplacement);
          console.log('yDisplacement', yDisplacement);
          if((xDisplacement === 10 && yDisplacement===0)  || (xDisplacement===0 && yDisplacement===10)){
            this.x = moveX;
            this.y = moveY;
            RoomManager.getInstance().broadcast({
              type: 'user-moved',
              payload: {
                x: this.x,
                y: this.y,
                id: this.id,
              },
            }, this, this.roomId || '');
            return;
          }
          this.send({
            type: 'movement-rejected',
            payload: {
              x: this.x,
              y: this.y,
            },
          });
            
        }
      }
    });
  }

  remove() {
    RoomManager.getInstance().broadcast({
      type: 'user-left',
      payload: {
        userId: this.id,
      },
    }, this, this.roomId || '');
    RoomManager.getInstance().removeUserFromRoom(this.roomId!, this);
  }

  send(payload: any) {
    this.ws.send(JSON.stringify(payload));
  }
}
function getRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
