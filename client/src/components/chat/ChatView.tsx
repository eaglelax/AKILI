import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, Users, MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, ChatChannel, TeamMember } from '@shared/schema';

export function ChatView() {
  const [selectedChannelId, setSelectedChannelId] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery({
    queryKey: ['/api/chat/channels'],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/messages', selectedChannelId],
    enabled: !!selectedChannelId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['/api/team-members'],
  });

  // Get current user from session storage or API
  useEffect(() => {
    const storedUser = localStorage.getItem('currentTeamMember');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error('Utilisateur non connecté');
      
      await apiRequest('POST', '/api/chat/messages', {
        content,
        channelId: selectedChannelId,
        senderId: currentUser.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedChannelId] });
      setMessageInput('');
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    sendMessageMutation.mutate(messageInput.trim());
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId);
    return member?.name || 'Utilisateur inconnu';
  };

  const getMemberInitials = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId);
    if (!member) return 'U';
    return member.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'general': return Hash;
      case 'project': return Hash;
      case 'direct': return MessageCircle;
      default: return Hash;
    }
  };

  const defaultChannels = [
    { id: 'general', name: 'général', type: 'general', isPrivate: false, members: [], unreadCount: 0 },
    { id: 'moov-africa', name: 'moov-africa', type: 'project', isPrivate: false, members: [], unreadCount: 0 },
    { id: 'bank-of-africa', name: 'bank-of-africa', type: 'project', isPrivate: false, members: [], unreadCount: 0 },
    { id: 'creatifs', name: 'créatifs', type: 'general', isPrivate: false, members: [], unreadCount: 0 },
  ];

  const displayChannels = channels.length > 0 ? channels : defaultChannels;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Chat d'Équipe</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Channels Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Canaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {displayChannels.map((channel: any) => {
                const Icon = getChannelIcon(channel.type);
                const isSelected = channel.id === selectedChannelId;
                
                return (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    data-testid={`channel-${channel.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{channel.name}</span>
                      </div>
                      {channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <CardHeader className="pb-3 pt-6">
              <CardTitle className="text-base">Messages Directs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamMembers.slice(0, 5).map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                  data-testid={`dm-${member.id}`}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getMemberInitials(member.id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' : 
                      member.status === 'busy' ? 'bg-red-500' :
                      member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <span className="text-sm text-foreground">{member.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3">
          <Card className="border border-border h-96 flex flex-col">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-primary" />
                <CardTitle className="text-base" data-testid="current-channel-name">
                  {displayChannels.find((c: any) => c.id === selectedChannelId)?.name || selectedChannelId}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Canal principal de l'équipe • {teamMembers.length} membres
              </p>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucun message dans ce canal</p>
                    <p className="text-sm text-muted-foreground">Soyez le premier à démarrer la conversation!</p>
                  </div>
                ) : (
                  messages.map((message: ChatMessage) => (
                    <div key={message.id} className="flex items-start space-x-3" data-testid={`message-${message.id}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getMemberInitials(message.senderId)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-foreground" data-testid={`message-sender-${message.id}`}>
                            {getMemberName(message.senderId)}
                          </span>
                          <span className="text-xs text-muted-foreground" data-testid={`message-time-${message.id}`}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground" data-testid={`message-content-${message.id}`}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending || !currentUser}
                  data-testid="input-message"
                />
                <Button 
                  type="submit" 
                  disabled={sendMessageMutation.isPending || !messageInput.trim() || !currentUser}
                  size="sm"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* Online Members */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Membres en ligne</span>
            <Badge variant="secondary" className="ml-2">
              {teamMembers.filter((m: TeamMember) => m.status === 'online').length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {teamMembers
              .filter((member: TeamMember) => member.status === 'online')
              .map((member: TeamMember) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 bg-muted rounded-lg p-2"
                  data-testid={`online-member-${member.id}`}
                >
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getMemberInitials(member.id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-foreground">{member.name}</span>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
