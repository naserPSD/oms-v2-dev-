// notification.gateway.ts
import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:4000',
    ], // adjust to your frontend URL in production
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // store userId -> socketId mapping
  private userSockets: Map<number, string> = new Map();

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {
    [...this.userSockets.entries()].forEach(([userId, socketId]) => {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { userId: number }) {
    this.userSockets.set(payload.userId, client.id);
    // Join company room if needed
    // client.join(`company_${companyId}`);
  }

  sendNotification(userId: number, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // New method for attendance updates
  sendAttendanceUpdate(userId: number, dashboardData: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('attendanceUpdate', {
        type: 'dashboardStats',
        data: dashboardData,
      });
    }
  }

  // Broadcast to all users in a company
  broadcastAttendanceUpdate(companyId: number, dashboardData: any) {
    // Emit to a company room
    this.server
      .to(`company_${companyId}`)
      .emit('companyAttendanceUpdate', dashboardData);

    // Or emit to all connected users
    this.server.emit('attendanceUpdate', {
      type: 'companyUpdate',
      companyId,
      data: dashboardData,
    });
  }
}
