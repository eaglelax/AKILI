import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square } from 'lucide-react';

interface TimerProps {
  taskId: string;
  isActive: boolean;
  canControl: boolean;
}

export function Timer({ taskId, isActive, canControl }: TimerProps) {
  const [localTime, setLocalTime] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startTimerMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/tasks/${taskId}/start-timer`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Chronomètre démarré",
        description: "Le suivi du temps a commencé",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/tasks/${taskId}/stop-timer`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Chronomètre arrêté",
        description: "Le temps a été enregistré",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update local timer every second when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setLocalTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  // Reset local time when timer becomes inactive
  useEffect(() => {
    if (!isActive) {
      setLocalTime(0);
    }
  }, [isActive]);

  const handleStart = () => {
    startTimerMutation.mutate();
  };

  const handleStop = () => {
    stopTimerMutation.mutate();
  };

  if (!canControl) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="px-2 py-1 text-xs"
        data-testid={`timer-readonly-${taskId}`}
      >
        <Square className="w-3 h-3" />
      </Button>
    );
  }

  if (isActive) {
    return (
      <Button
        onClick={handleStop}
        disabled={stopTimerMutation.isPending}
        variant="destructive"
        size="sm"
        className="px-2 py-1 text-xs timer-pulse"
        data-testid={`timer-stop-${taskId}`}
      >
        <Pause className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStart}
      disabled={startTimerMutation.isPending}
      variant="default"
      size="sm"
      className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600"
      data-testid={`timer-start-${taskId}`}
    >
      <Play className="w-3 h-3" />
    </Button>
  );
}
