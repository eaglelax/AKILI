import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';
import { wsMessageSchema, WSMessage } from './validators';
import { z } from 'zod';

// ============================================
// Types WebSocket
// ============================================

interface ConnectedUser {
  ws: WebSocket;
  memberId: string;
  memberName: string;
  isAdmin: boolean;
  connectedAt: Date;
}

interface OutgoingMessage {
  type: string;
  data: any;
  timestamp: number;
}

// ============================================
// Validation et Sécurité
// ============================================

function validateMessage(data: string): { success: true; message: WSMessage } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(data);
    const validated = wsMessageSchema.parse(parsed);
    return { success: true, message: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      };
    }
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

function sanitizeContent(content: string): string {
  // Basic XSS prevention for chat messages
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ============================================
// WebSocket Setup
// ============================================

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const connectedUsers = new Map<string, ConnectedUser>();

  // Broadcast to all connected users
  function broadcast(message: OutgoingMessage, options?: {
    excludeUserId?: string;
    onlyToUsers?: string[];
    onlyToAdmins?: boolean;
  }) {
    const messageString = JSON.stringify(message);

    connectedUsers.forEach((user, memberId) => {
      // Skip excluded user
      if (options?.excludeUserId && memberId === options.excludeUserId) return;

      // Filter to specific users
      if (options?.onlyToUsers && !options.onlyToUsers.includes(memberId)) return;

      // Filter to admins only
      if (options?.onlyToAdmins && !user.isAdmin) return;

      if (user.ws.readyState === WebSocket.OPEN) {
        user.ws.send(messageString);
      }
    });
  }

  // Send to specific user
  function sendToUser(memberId: string, message: OutgoingMessage) {
    const user = connectedUsers.get(memberId);
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message));
    }
  }

  // Send error response
  function sendError(ws: WebSocket, errorMessage: string, code: string = 'ERROR') {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: errorMessage, code },
        timestamp: Date.now(),
      }));
    }
  }

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    let currentMemberId: string | null = null;

    ws.on('message', async (data) => {
      // Validate message
      const validation = validateMessage(data.toString());

      if (!validation.success) {
        console.error('WebSocket validation error:', validation.error);
        sendError(ws, validation.error, 'VALIDATION_ERROR');
        return;
      }

      const message = validation.message;

      try {
        switch (message.type) {
          // ============================================
          // Connection Management
          // ============================================
          case 'user_connect': {
            const { memberId, memberName } = message.data;

            // Verify member exists
            const member = await storage.getTeamMember(memberId);
            if (!member) {
              sendError(ws, 'Member not found', 'MEMBER_NOT_FOUND');
              return;
            }

            currentMemberId = memberId;
            connectedUsers.set(memberId, {
              ws,
              memberId,
              memberName,
              isAdmin: member.isAdmin || false,
              connectedAt: new Date()
            });

            // Update member status to online
            await storage.updateTeamMember(memberId, { status: 'online' });

            // Send confirmation to user
            ws.send(JSON.stringify({
              type: 'connection_confirmed',
              data: {
                memberId,
                memberName,
                isAdmin: member.isAdmin,
                connectedUsers: Array.from(connectedUsers.keys())
              },
              timestamp: Date.now(),
            }));

            // Broadcast user online status to others
            broadcast({
              type: 'user_status_changed',
              data: { memberId, memberName, status: 'online' },
              timestamp: Date.now(),
            }, { excludeUserId: memberId });

            console.log(`User connected: ${memberName} (${memberId})`);
            break;
          }

          case 'user_disconnect': {
            const { memberId } = message.data;

            if (connectedUsers.has(memberId)) {
              const user = connectedUsers.get(memberId)!;
              connectedUsers.delete(memberId);

              await storage.updateTeamMember(memberId, { status: 'offline' });

              broadcast({
                type: 'user_status_changed',
                data: { memberId, memberName: user.memberName, status: 'offline' },
                timestamp: Date.now(),
              });
            }
            break;
          }

          // ============================================
          // Chat Messages
          // ============================================
          case 'chat_message': {
            const { content, channelId, senderId, mentions } = message.data;

            // Verify sender is connected
            if (!currentMemberId || currentMemberId !== senderId) {
              sendError(ws, 'Unauthorized sender', 'UNAUTHORIZED');
              return;
            }

            // Verify channel exists
            const channel = await storage.getChannel(channelId);
            if (!channel) {
              sendError(ws, 'Channel not found', 'CHANNEL_NOT_FOUND');
              return;
            }

            // Sanitize and store chat message
            const sanitizedContent = sanitizeContent(content);
            const chatMessage = await storage.createChatMessage({
              content: sanitizedContent,
              senderId,
              channelId,
              messageType: 'text',
              mentions: mentions || [],
            });

            // Get sender info for the broadcast
            const sender = connectedUsers.get(senderId);

            // Broadcast to all connected users
            broadcast({
              type: 'new_chat_message',
              data: {
                ...chatMessage,
                senderName: sender?.memberName,
              },
              timestamp: Date.now(),
            });

            // Send notifications to mentioned users
            if (mentions && mentions.length > 0) {
              for (const mentionedId of mentions) {
                await storage.createNotification({
                  recipientId: mentionedId,
                  senderId,
                  title: 'Nouvelle mention',
                  message: `${sender?.memberName || 'Quelqu\'un'} vous a mentionné dans un message`,
                  type: 'mention',
                  relatedType: 'message',
                  relatedId: chatMessage.id,
                });

                // Real-time notification
                sendToUser(mentionedId, {
                  type: 'notification',
                  data: {
                    type: 'mention',
                    title: 'Nouvelle mention',
                    message: `${sender?.memberName || 'Quelqu\'un'} vous a mentionné`,
                    channelId,
                  },
                  timestamp: Date.now(),
                });
              }
            }
            break;
          }

          // ============================================
          // Task Updates
          // ============================================
          case 'task_updated': {
            const { taskId, changes } = message.data;

            // Verify task exists
            const task = await storage.getTask(taskId);
            if (!task) {
              sendError(ws, 'Task not found', 'TASK_NOT_FOUND');
              return;
            }

            // Broadcast task update to all users
            broadcast({
              type: 'task_updated',
              data: { taskId, changes, updatedBy: currentMemberId },
              timestamp: Date.now(),
            });

            // Notify assigned user if different from updater
            if (task.assignedTo && task.assignedTo !== currentMemberId) {
              sendToUser(task.assignedTo, {
                type: 'notification',
                data: {
                  type: 'task_updated',
                  title: 'Tâche mise à jour',
                  message: `La tâche "${task.name}" a été modifiée`,
                  taskId,
                },
                timestamp: Date.now(),
              });
            }
            break;
          }

          // ============================================
          // Timer Operations
          // ============================================
          case 'timer_started': {
            const { taskId, memberId } = message.data;

            // Verify authorization
            if (currentMemberId !== memberId) {
              const currentUser = connectedUsers.get(currentMemberId || '');
              if (!currentUser?.isAdmin) {
                sendError(ws, 'Cannot start timer for another user', 'UNAUTHORIZED');
                return;
              }
            }

            // Broadcast timer start
            broadcast({
              type: 'timer_started',
              data: { taskId, memberId, startedAt: new Date().toISOString() },
              timestamp: Date.now(),
            });

            console.log(`Timer started: Task ${taskId} by member ${memberId}`);
            break;
          }

          case 'timer_stopped': {
            const { taskId, memberId, duration } = message.data;

            // Broadcast timer stop
            broadcast({
              type: 'timer_stopped',
              data: { taskId, memberId, duration, stoppedAt: new Date().toISOString() },
              timestamp: Date.now(),
            });

            console.log(`Timer stopped: Task ${taskId}, duration: ${duration}ms`);
            break;
          }

          // ============================================
          // Project Updates
          // ============================================
          case 'project_updated': {
            const { projectId, changes } = message.data;

            // Verify project exists
            const project = await storage.getProject(projectId);
            if (!project) {
              sendError(ws, 'Project not found', 'PROJECT_NOT_FOUND');
              return;
            }

            // Broadcast project update
            broadcast({
              type: 'project_updated',
              data: { projectId, changes, updatedBy: currentMemberId },
              timestamp: Date.now(),
            });
            break;
          }

          // ============================================
          // Dashboard Updates
          // ============================================
          case 'request_dashboard_update': {
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
              sendError(ws, 'Failed to fetch dashboard data', 'FETCH_ERROR');
            }
            break;
          }

          case 'request_team_update': {
            try {
              const teamStats = await storage.getTeamStats();
              const onlineMembers = Array.from(connectedUsers.keys());

              ws.send(JSON.stringify({
                type: 'team_update',
                data: { ...teamStats, onlineMembers },
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error('Error sending team update:', error);
              sendError(ws, 'Failed to fetch team data', 'FETCH_ERROR');
            }
            break;
          }

          // ============================================
          // Ping/Pong
          // ============================================
          case 'ping': {
            ws.send(JSON.stringify({
              type: 'pong',
              data: { serverTime: new Date().toISOString() },
              timestamp: Date.now(),
            }));
            break;
          }

          default:
            // This should never happen due to Zod validation
            console.warn(`Unknown message type received`);
            sendError(ws, 'Unknown message type', 'UNKNOWN_TYPE');
        }
      } catch (error) {
        console.error('WebSocket handler error:', error);
        sendError(ws, 'Internal server error', 'INTERNAL_ERROR');
      }
    });

    ws.on('close', async () => {
      // Find and remove user from connected users
      if (currentMemberId) {
        const user = connectedUsers.get(currentMemberId);
        if (user) {
          connectedUsers.delete(currentMemberId);

          // Update member status to offline
          await storage.updateTeamMember(currentMemberId, { status: 'offline' });

          // Broadcast user offline status
          broadcast({
            type: 'user_status_changed',
            data: { memberId: currentMemberId, memberName: user.memberName, status: 'offline' },
            timestamp: Date.now(),
          });

          console.log(`User disconnected: ${user.memberName} (${currentMemberId})`);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // ============================================
  // Periodic Updates
  // ============================================

  // Send periodic dashboard updates every 30 seconds
  setInterval(async () => {
    if (connectedUsers.size === 0) return;

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
    if (connectedUsers.size === 0) return;

    broadcast({
      type: 'heartbeat',
      data: {
        connectedUsers: Array.from(connectedUsers.entries()).map(([id, user]) => ({
          memberId: id,
          memberName: user.memberName,
          isAdmin: user.isAdmin,
          connectedAt: user.connectedAt.toISOString(),
        }))
      },
      timestamp: Date.now(),
    });
  }, 60000); // Every 60 seconds

  // Clean up stale connections every 5 minutes
  setInterval(() => {
    const now = Date.now();
    connectedUsers.forEach((user, memberId) => {
      if (user.ws.readyState !== WebSocket.OPEN) {
        connectedUsers.delete(memberId);
        console.log(`Cleaned up stale connection: ${memberId}`);
      }
    });
  }, 300000); // Every 5 minutes

  console.log('WebSocket server initialized with validation');

  return wss;
}
