import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopNavBar from "@/components/TopNavBar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Send,
  Hash,
  Users,
  FolderOpen,
  MessageSquare,
  Loader2,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'project' | 'direct';
  projectId?: string;
  projectName?: string;
  isPrivate: boolean;
  createdAt: string;
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  channelId: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isEdited: boolean;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les canaux accessibles par l'utilisateur
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/chat/channels"],
  });

  const channels = (channelsData as any)?.data || [];

  // Charger les messages du canal sélectionné
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedChannel?.id],
    enabled: !!selectedChannel?.id,
  });

  const messages = (messagesData as any)?.data || [];

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { channelId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/chat/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedChannel?.id] });
      scrollToBottom();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll vers le bas lors du chargement des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sélectionner le premier canal par défaut
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedChannel) return;

    sendMessageMutation.mutate({
      channelId: selectedChannel.id,
      content: messageInput.trim(),
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredChannels = channels.filter((channel: ChatChannel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="lg:ml-72 h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#162C54] flex items-center gap-2">
                <MessageSquare className="w-7 h-7 text-[#37B6E9]" />
                Messages
              </h1>
              <p className="text-sm text-gray-500">
                {selectedChannel ? selectedChannel.name : 'Sélectionnez une conversation'}
              </p>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Liste des canaux */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Liste des canaux */}
            <div className="flex-1 overflow-y-auto">
              {filteredChannels.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune conversation</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Vous serez ajouté automatiquement aux conversations des projets qui vous sont assignés
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredChannels.map((channel: ChatChannel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedChannel?.id === channel.id ? 'bg-blue-50 border-l-4 border-[#37B6E9]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          channel.type === 'project' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {channel.type === 'project' ? (
                            <FolderOpen className="w-5 h-5 text-[#37B6E9]" />
                          ) : (
                            <Hash className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-[#162C54] truncate">{channel.name}</h3>
                            {channel.unreadCount && channel.unreadCount > 0 && (
                              <span className="bg-[#37B6E9] text-white text-xs px-2 py-0.5 rounded-full">
                                {channel.unreadCount}
                              </span>
                            )}
                          </div>
                          {channel.projectName && (
                            <p className="text-xs text-[#37B6E9] mt-0.5">Projet: {channel.projectName}</p>
                          )}
                          {channel.description && (
                            <p className="text-xs text-gray-500 truncate mt-1">{channel.description}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedChannel ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-[#37B6E9]" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun message</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Commencez la conversation en envoyant un message
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message: ChatMessage) => {
                        const isOwn = message.senderId === user?.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              {!isOwn && (
                                <p className="text-xs text-gray-600 mb-1 px-1">
                                  {message.senderName || 'Utilisateur'}
                                </p>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isOwn
                                    ? 'bg-[#37B6E9] text-white'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                {message.isEdited && (
                                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                    (modifié)
                                  </p>
                                )}
                              </div>
                              <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input de message */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Écrivez votre message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#37B6E9] resize-none"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="bg-[#37B6E9] hover:bg-[#3475BB] text-white px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span className="hidden sm:inline">Envoyer</span>
                        </>
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-400 mt-2">
                    Appuyez sur Entrée pour envoyer • Shift + Entrée pour une nouvelle ligne
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500">
                    Choisissez un canal dans la liste pour commencer à échanger
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
