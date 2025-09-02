import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { WSMessage } from '@/types';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Send user connection message
        const currentUser = localStorage.getItem('currentTeamMember');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          sendMessage({
            type: 'user_connect',
            data: { memberId: user.id, memberName: user.name },
            timestamp: Date.now(),
          });
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else {
          toast({
            title: "Connexion perdue",
            description: "Impossible de se reconnecter au serveur. Veuillez actualiser la page.",
            variant: "destructive",
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const handleMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'user_status_changed':
        // Update team member status in cache
        queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
        break;

      case 'new_chat_message':
        // Update chat messages cache
        queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
        
        // Show notification if message is not from current user
        const currentUser = JSON.parse(localStorage.getItem('currentTeamMember') || '{}');
        if (message.data.senderId !== currentUser.id) {
          toast({
            title: "Nouveau message",
            description: `${message.data.senderName}: ${message.data.content.substring(0, 50)}...`,
          });
        }
        break;

      case 'task_updated':
        // Update tasks cache
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
        break;

      case 'timer_started':
      case 'timer_stopped':
        // Update specific task and dashboard stats
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
        
        toast({
          title: message.type === 'timer_started' ? "Chronomètre démarré" : "Chronomètre arrêté",
          description: `Tâche: ${message.data.taskName}`,
        });
        break;

      case 'project_updated':
        // Update projects cache
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        break;

      case 'notification':
        // Show notification
        toast({
          title: message.data.title,
          description: message.data.message,
          variant: message.data.type === 'error' ? 'destructive' : 'default',
        });
        
        // Update notifications cache
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        break;

      case 'heartbeat':
        // Update connected users info
        console.log('Connected users:', message.data.connectedUsers);
        break;

      case 'pong':
        // Handle ping response
        break;

      default:
        console.log('Unhandled WebSocket message:', message);
    }
  };

  const sendMessage = (message: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  };

  useEffect(() => {
    connect();

    // Send periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      sendMessage({
        type: 'ping',
        data: {},
        timestamp: Date.now(),
      });
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { sendMessage, isConnected: wsRef.current?.readyState === WebSocket.OPEN };
}
