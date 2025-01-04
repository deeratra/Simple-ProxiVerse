import { User } from './User';

export class RoomManager {
  rooms: Map<string, User[]> = new Map();
  static instance: RoomManager;

  private constructor() {
    this.rooms = new Map();
  }
  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public removeUserFromRoom(roomId: string, user: User) {
    if (!this.rooms.has(roomId)) {
      return;
    }
    this.rooms.set(
      roomId,
      this.rooms.get(roomId)?.filter((u) => u.id !== user.id) ?? [],
    );
    console.log(`User removed from room ${roomId}`);
  }

  public addUserToRoom(roomId: string, user: User) {
    console.log(`Adding user to room ${roomId}`);
    if (!this.rooms.has(roomId)) {
      this.rooms?.set(roomId, [user]);
      console.log(`User added to room ${roomId}`);
    }
    this.rooms.set(roomId, [...(this.rooms.get(roomId) ?? []), user]);
  }

  public broadcast(message: any, user: User, roomId: string) {
    console.log('Room,,', this.rooms);
    this.rooms.get(roomId)?.forEach((u) => {
      if (u.id !== user.id) {
        console.log(`Broadcasting to user ${u.id}`);
        u.send(message);
      }
    });
  }

  // public sendToUser(message: any, userId: string) {
  //   this.rooms.forEach((users) => {
  //     users.forEach((user) => {
  //       if (user.id === userId) {
  //         user.send(message);
  //       }
  //     });
  //   });
  // }
}
