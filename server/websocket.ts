import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';

interface WSMessage {
  type: string;
  data: any;
  userId?: string;
  timestamp: number;
}

interface ConnectedUser {
  ws: WebSocket;
  memberId: string;
  memberName: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const connectedUsers = new Map<string, ConnectedUser>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'user_connect':
            const { memberId, memberName } = message.data;
            connectedUsers.set(memberId, { ws, memberId, memberName });
            
            // Update member status to online
            await storage.updateTeamMember(memberId, { status: 'online' });
            
            // Broadcast user online status
            broadcast({
              type: 'user_status_changed',
              data: { memberId, memberName, status: 'online' },
              timestamp: Date.now(),
            });
            break;

          case 'chat_message':
            // Store chat message
            const chatMessage = await storage.createChatMessage({
              content: message.data.content,
              senderId: message.data.senderId,
              channelId: message.data.channelId,
              messageType: 'text',
            });

            // Broadcast to all connected users in the channel
            broadcast({
              type: 'new_chat_message',
              data: chatMessage,
              timestamp: Date.now(),
            });
            break;

          case 'task_updated':
            // Broadcast task updates to all users
            broadcast({
              type: 'task_updated',
              data: message.data,
              timestamp: Date.now(),
            });
            break;

          case 'timer_started':
            // Broadcast timer start
            broadcast({
              type: 'timer_started',
              data: message.data,
              timestamp: Date.now(),
            });
            break;

          case 'request_dashboard_update':
            // Send fresh dashboard data to requesting client
            try {
              const dashboardStats = await storage.getDashboardStats();
              const teamStats = await storage.getTeamStats();
              
              ws.send(JSON.stringify({
                type: 'dashboard_update',
                data: { dashboardStats, teamStats },
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error('Error sending dashboard update:', error);
            }
            break;

          case 'request_team_update':
            // Send fresh team data to requesting client
            try {
              const teamStats = await storage.getTeamStats();
              
              ws.send(JSON.stringify({
                type: 'team_update',
                data: teamStats,
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error('Error sending team update:', error);
            }
            break;

          case 'timer_stopped':
            // Broadcast timer stop
            broadcast({
              type: 'timer_stopped',
              data: message.data,
              timestamp: Date.now(),
            });
            break;

          case 'project_updated':
            // Broadcast project updates
            broadcast({
              type: 'project_updated',
              data: message.data,
              timestamp: Date.now(),
            });
            break;

          case 'ping':
            // Respond to ping with pong
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' },
          timestamp: Date.now(),
        }));
      }
    });

    ws.on('close', async () => {
      // Find and remove user from connected users
      for (const [memberId, user] of Array.from(connectedUsers.entries())) {
        if (user.ws === ws) {
          connectedUsers.delete(memberId);
          
          // Update member status to offline
          await storage.updateTeamMember(memberId, { status: 'offline' });
          
          // Broadcast user offline status
          broadcast({
            type: 'user_status_changed',
            data: { memberId, memberName: user.memberName, status: 'offline' },
            timestamp: Date.now(),
          });
          break;
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcast(message: WSMessage, excludeUserId?: string) {
    const messageString = JSON.stringify(message);
    
    connectedUsers.forEach((user, memberId) => {
      if (excludeUserId && memberId === excludeUserId) return;
      
      if (user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(messageString);
      }
    });
  }

  // Send periodic dashboard updates every 30 seconds
  setInterval(async () => {
    try {
      const dashboardStats = await storage.getDashboardStats();
      const teamStats = await storage.getTeamStats();
      
      broadcast({
        type: 'auto_dashboard_update',
        data: { dashboardStats, teamStats },
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error sending periodic updates:', error);
    }
  }, 30000); // Every 30 seconds

  // Send heartbeat to keep connections alive
  setInterval(() => {
    broadcast({
      type: 'heartbeat',
      data: { connectedUsers: Array.from(connectedUsers.keys()) },
      timestamp: Date.now(),
    });
  }, 60000); // Every 60 seconds
}
