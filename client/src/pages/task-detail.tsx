import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import { 
  Calendar,
  User,
  Building,
  DollarSign,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle,
  Edit,
  Share,
  Upload,
  MessageSquare,
  Paperclip,
  Download,
  FileText,
  Image,
  Flag,
  ArrowLeft
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TimerSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  cost: number;
  status: "active" | "completed" | "paused";
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface TaskFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const { user } = useAuth();
  const taskId = params?.id;
  
  // Initialize WebSocket connection
  useWebSocket();

  // Timer state
  const [currentTime, setCurrentTime] = useState("02:34:12");
  const [timerStatus, setTimerStatus] = useState<"running" | "paused" | "stopped">("running");
  const [startTime] = useState(Date.now() - (2 * 3600 + 34 * 60 + 12) * 1000);
  
  // Comment state
  const [newComment, setNewComment] = useState("");
  
  // File upload state
  const [isDragOver, setIsDragOver] = useState(false);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (timerStatus === "running") {
        const elapsed = Date.now() - startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        setCurrentTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus, startTime]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Mock data - would come from API in real app
  const taskData = {
    id: "MOOV-001",
    title: "Création campagne publicitaire MOOV AFRICA Q1",
    description: "Développement de la campagne \"Connectons l'Afrique\" avec visuels print et digital pour le lancement du nouveau forfait data",
    status: "en-cours",
    priority: "haute",
    assignedTo: "Paul OUEDRAOGO",
    client: "MOOV AFRICA",
    deadline: "15 Fév 2025",
    budget: 2500000,
    progress: 67,
    totalTime: "12:45:38",
    currentCost: 102000,
    hourlyRate: 8000
  };

  const timerSessions: TimerSession[] = [
    { id: "1", startTime: "09:00", endTime: "12:30", duration: 3.5 * 60, cost: 28000, status: "completed" },
    { id: "2", startTime: "14:00", endTime: "17:15", duration: 3.25 * 60, cost: 26000, status: "completed" },
    { id: "3", startTime: "18:30", duration: 2.57 * 60, cost: 20560, status: "active" }
  ];

  const comments: Comment[] = [
    {
      id: "1",
      author: "Directeur Création",
      content: "Excellent travail sur les premières maquettes ! La direction artistique correspond parfaitement au brief MOOV. Peux-tu ajuster les couleurs pour qu'elles soient plus vibrantes ?",
      timestamp: "Il y a 2h"
    },
    {
      id: "2",
      author: "Paul OUEDRAOGO",
      content: "Merci pour le retour ! J'intègre les ajustements de couleurs et je partage la v2 demain matin. J'ai aussi préparé quelques variantes pour le format digital.",
      timestamp: "Il y a 1h"
    }
  ];

  const taskFiles: TaskFile[] = [
    { id: "1", name: "Brief_MOOV_Q1.pdf", size: "2.3 MB", type: "pdf", url: "#" },
    { id: "2", name: "Maquettes_v1.psd", size: "45.7 MB", type: "psd", url: "#" }
  ];

  const recentActivity = [
    { type: "timer", message: "Timer démarrée", time: "Il y a 2h 34m", color: "var(--jofe-green)" },
    { type: "file", message: "Fichier ajouté", time: "Il y a 3h", color: "var(--jofe-blue-light)" },
    { type: "status", message: "Statut modifié", time: "Il y a 1 jour", color: "var(--jofe-orange)" }
  ];

  const handleTimerControl = (action: "play" | "pause" | "stop") => {
    if (action === "play" && timerStatus !== "running") {
      setTimerStatus("running");
    } else if (action === "pause" && timerStatus === "running") {
      setTimerStatus("paused");
    } else if (action === "stop") {
      if (window.confirm("Êtes-vous sûr de vouloir arrêter définitivement ce timer ?")) {
        setTimerStatus("stopped");
        setCurrentTime("00:00:00");
      }
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Add comment logic here
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  const handleFileUpload = (files: FileList) => {
    console.log("Files uploaded:", Array.from(files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        
        <div className="w-full overflow-auto">
        
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/tasks" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </Link>
              <div className="jofe-logo"></div>
              <div>
                <h1 className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font">Suivi Tâches</h1>
                <p className="text-sm text-[var(--jofe-blue-medium)]">Détail de la Tâche</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-[var(--jofe-gray)] transition-colors">
                <Share className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </button>
              <Button className="btn-primary text-white px-4 py-2 rounded-lg">
                <Calendar className="w-4 h-4 mr-2" />
                Planifier
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne Principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* En-tête Tâche */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="status-badge status-en-cours px-3 py-1 rounded-full text-xs font-medium uppercase">
                        En cours
                      </span>
                      <span className="text-sm text-[var(--jofe-blue-medium)]">{taskData.id}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font mb-2">
                      {taskData.title}
                    </h2>
                    <p className="text-[var(--jofe-blue-medium)] text-sm mb-4">
                      {taskData.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flag className="w-5 h-5 text-[var(--jofe-orange)]" />
                    <span className="text-sm font-medium text-[var(--jofe-orange)]">Priorité Haute</span>
                  </div>
                </div>

                {/* Méta-informations */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-[var(--jofe-gray)] rounded-lg">
                    <User className="w-5 h-5 text-[var(--jofe-blue-medium)] mx-auto mb-1" />
                    <p className="text-xs text-[var(--jofe-blue-medium)]">Assigné à</p>
                    <p className="font-semibold text-[var(--jofe-blue-deep)] text-sm">{taskData.assignedTo}</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--jofe-gray)] rounded-lg">
                    <Building className="w-5 h-5 text-[var(--jofe-blue-medium)] mx-auto mb-1" />
                    <p className="text-xs text-[var(--jofe-blue-medium)]">Client</p>
                    <p className="font-semibold text-[var(--jofe-blue-deep)] text-sm">{taskData.client}</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--jofe-gray)] rounded-lg">
                    <Calendar className="w-5 h-5 text-[var(--jofe-blue-medium)] mx-auto mb-1" />
                    <p className="text-xs text-[var(--jofe-blue-medium)]">Échéance</p>
                    <p className="font-semibold text-[var(--jofe-blue-deep)] text-sm">{taskData.deadline}</p>
                  </div>
                  <div className="text-center p-3 bg-[var(--jofe-gray)] rounded-lg">
                    <DollarSign className="w-5 h-5 text-[var(--jofe-green)] mx-auto mb-1" />
                    <p className="text-xs text-[var(--jofe-blue-medium)]">Budget</p>
                    <p className="font-semibold text-[var(--jofe-green)] text-sm">{formatCurrency(taskData.budget)}</p>
                  </div>
                </div>

                {/* Barre de Progression */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--jofe-blue-deep)]">Progression</span>
                    <span className="text-sm font-medium text-[var(--jofe-blue-medium)]">{taskData.progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--jofe-gray)] rounded-full h-2">
                    <div 
                      className="progress-bar h-2 rounded-full" 
                      style={{width: `${taskData.progress}%`}}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Chronométrage */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] jofe-font mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Chronométrage Temps Réel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Timer Principal */}
                  <div className="text-center">
                    <div className={`rounded-xl p-6 mb-4 ${timerStatus === 'running' ? 'timer-running' : timerStatus === 'paused' ? 'bg-[var(--jofe-orange)]' : 'bg-gray-500'}`}>
                      <p className="text-sm text-white opacity-80 mb-2">Temps Actuel</p>
                      <p className={`text-3xl font-bold text-white jofe-font ${timerStatus === 'running' ? 'timer-pulse' : ''}`}>
                        {currentTime}
                      </p>
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => handleTimerControl('play')}
                        disabled={timerStatus === 'running'}
                        className="btn-success text-white p-2 rounded-lg"
                        data-testid="button-timer-play"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleTimerControl('pause')}
                        disabled={timerStatus !== 'running'}
                        className="btn-warning text-white p-2 rounded-lg"
                        data-testid="button-timer-pause"
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleTimerControl('stop')}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        data-testid="button-timer-stop"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Temps Total */}
                  <div className="text-center p-4 bg-[var(--jofe-gray)] rounded-lg">
                    <Clock className="w-6 h-6 text-[var(--jofe-blue-medium)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--jofe-blue-medium)] mb-1">Temps Total</p>
                    <p className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font">{taskData.totalTime}</p>
                  </div>

                </div>

                {/* Historique des Sessions */}
                <div className="border-t border-[var(--jofe-gray)] pt-4">
                  <h4 className="font-semibold text-[var(--jofe-blue-deep)] mb-3">Historique des Sessions</h4>
                  <div className="space-y-2">
                    {timerSessions.map((session, index) => (
                      <div key={session.id} className="flex justify-between items-center p-3 bg-[var(--jofe-gray)] rounded-lg">
                        <div>
                          <p className="font-medium text-[var(--jofe-blue-deep)]">Session {index + 1}</p>
                          <p className="text-sm text-[var(--jofe-blue-medium)]">
                            Aujourd'hui {session.startTime} - {session.endTime || 'En cours'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${session.status === 'active' ? 'text-[var(--jofe-orange)]' : 'text-[var(--jofe-blue-deep)]'}`}>
                            {Math.floor(session.duration / 60)}h {Math.floor(session.duration % 60)}m
                          </p>
                          <p className={`text-sm ${session.status === 'active' ? 'text-[var(--jofe-orange)]' : 'text-[var(--jofe-green)]'}`}>
                            {session.status === 'active' ? 'En cours...' : 'Terminé'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Commentaires */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] jofe-font mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Commentaires Collaboratifs
                </h3>

                {/* Nouveau Commentaire */}
                <div className="mb-6">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-[var(--jofe-blue-light)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 border border-[var(--jofe-gray)] rounded-lg focus:border-[var(--jofe-blue-light)] focus:outline-none resize-none" 
                        rows={3} 
                        placeholder="Ajouter un commentaire..."
                        data-testid="textarea-new-comment"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex space-x-2">
                          <button className="p-1 text-[var(--jofe-blue-medium)] hover:text-[var(--jofe-blue-deep)] transition-colors">
                            <Paperclip className="w-4 h-4" />
                          </button>
                        </div>
                        <Button 
                          onClick={handleCommentSubmit}
                          className="btn-primary text-white px-4 py-2 rounded-lg text-sm"
                          data-testid="button-submit-comment"
                        >
                          Publier
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des Commentaires */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-card bg-[var(--jofe-gray)] p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-[var(--jofe-blue-medium)] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold text-[var(--jofe-blue-deep)]">{comment.author}</p>
                            <span className="text-xs text-[var(--jofe-blue-medium)]">{comment.timestamp}</span>
                          </div>
                          <p className="text-[var(--jofe-blue-deep)]">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions Rapides */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] jofe-font mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full btn-primary text-white p-3 rounded-lg" data-testid="button-mark-complete">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer Terminé
                  </Button>
                  <Button className="w-full border border-[var(--jofe-blue-light)] text-[var(--jofe-blue-medium)] p-3 rounded-lg hover:bg-[var(--jofe-gray)] transition-colors" data-testid="button-edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button className="w-full border border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] p-3 rounded-lg hover:bg-[var(--jofe-gray)] transition-colors" data-testid="button-share">
                    <Share className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </Card>

              {/* Fichiers Attachés */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] jofe-font mb-4 flex items-center">
                  <Paperclip className="w-5 h-5 mr-2" />
                  Fichiers
                </h3>

                {/* Zone de Drop */}
                <div 
                  className={`file-attachment p-6 rounded-lg text-center mb-4 border-2 border-dashed transition-all ${
                    isDragOver 
                      ? 'border-[var(--jofe-blue-light)] bg-[rgba(55,182,233,0.02)]' 
                      : 'border-[var(--jofe-gray)]'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  onDrop={handleDrop}
                  data-testid="file-drop-zone"
                >
                  <Upload className="w-8 h-8 text-[var(--jofe-blue-medium)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--jofe-blue-medium)]">Glissez vos fichiers ici</p>
                  <button className="text-xs text-[var(--jofe-blue-light)] hover:underline">ou cliquez pour parcourir</button>
                </div>

                {/* Liste des Fichiers */}
                <div className="space-y-2">
                  {taskFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-3 p-3 bg-[var(--jofe-gray)] rounded-lg">
                      {file.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : (
                        <Image className="w-5 h-5 text-blue-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--jofe-blue-deep)]">{file.name}</p>
                        <p className="text-xs text-[var(--jofe-blue-medium)]">{file.size}</p>
                      </div>
                      <button className="p-1 text-[var(--jofe-blue-medium)] hover:text-[var(--jofe-blue-deep)]">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Activité Récente */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] jofe-font mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Activité
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2" 
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div>
                        <p className="text-sm text-[var(--jofe-blue-deep)]">{activity.message}</p>
                        <p className="text-xs text-[var(--jofe-blue-medium)]">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}