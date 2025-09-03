import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Network, 
  Grid, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  Plus, 
  Download, 
  Zap, 
  BarChart3,
  Filter,
  Settings,
  MessageSquare,
  RefreshCw,
  Target,
  Activity,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  project: string;
  member: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  progress: number;
  duration: number; // days
  dependencies: string[];
  critical: boolean;
  startDate: string;
  endDate: string;
}

interface Conflict {
  id: string;
  type: 'cycle' | 'overload' | 'date' | 'resource';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  tasks: string[];
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  load: number; // percentage
  maxCapacity: number; // hours per week
  currentTasks: number;
  color: string;
}

const teamMembers: TeamMember[] = [
  { id: 'serge', name: 'Serge ASSALÉ', avatar: 'SA', load: 78, maxCapacity: 40, currentTasks: 8, color: '#162C54' },
  { id: 'enos', name: 'Enos GOUBA', avatar: 'EG', load: 82, maxCapacity: 40, currentTasks: 6, color: '#3475BB' },
  { id: 'paul', name: 'Paul Junior OUEDRAOGO', avatar: 'PJ', load: 95, maxCapacity: 40, currentTasks: 12, color: '#37B6E9' },
  { id: 'fortune', name: 'Fortune YANOGO', avatar: 'FY', load: 72, maxCapacity: 40, currentTasks: 7, color: '#93C954' },
  { id: 'linda', name: 'Linda KABORÉ', avatar: 'LK', load: 88, maxCapacity: 40, currentTasks: 9, color: '#F68C1F' },
  { id: 'florita', name: 'Florita KABORÉ', avatar: 'FK', load: 65, maxCapacity: 40, currentTasks: 5, color: '#1A4278' },
  { id: 'jean', name: 'Jean-Jacques SAMPABAO', avatar: 'JJ', load: 76, maxCapacity: 40, currentTasks: 8, color: '#E74C3C' },
  { id: 'abdoul', name: 'Abdoul Latif OUEDRAOGO', avatar: 'AL', load: 91, maxCapacity: 40, currentTasks: 10, color: '#9B59B6' },
  { id: 'nebié', name: 'Nebié WEBOU', avatar: 'NW', load: 54, maxCapacity: 40, currentTasks: 4, color: '#34495E' },
  { id: 'djamilatou', name: 'Djamilatou GUIGUEMDE', avatar: 'DG', load: 67, maxCapacity: 40, currentTasks: 6, color: '#16A085' },
  { id: 'bientama', name: 'Bientama PARÉ', avatar: 'BP', load: 89, maxCapacity: 40, currentTasks: 11, color: '#E67E22' },
  { id: 'issa', name: 'Issa CISSE', avatar: 'IC', load: 43, maxCapacity: 40, currentTasks: 3, color: '#2ECC71' },
  { id: 'maryse', name: 'Maryse BOMBIRI', avatar: 'MB', load: 58, maxCapacity: 40, currentTasks: 5, color: '#8E44AD' },
  { id: 'faridatou', name: 'Faridatou BARRY', avatar: 'FB', load: 71, maxCapacity: 40, currentTasks: 7, color: '#D35400' }
];

const tasks: Task[] = [
  // MOOV AFRICA Campaign
  { id: 'moov-1', name: 'Brief Client', project: 'MOOV AFRICA', member: 'Linda KABORÉ', status: 'completed', progress: 100, duration: 3, dependencies: [], critical: true, startDate: '2025-01-15', endDate: '2025-01-18' },
  { id: 'moov-2', name: 'Stratégie Créative', project: 'MOOV AFRICA', member: 'Serge ASSALÉ', status: 'completed', progress: 100, duration: 4, dependencies: ['moov-1'], critical: true, startDate: '2025-01-18', endDate: '2025-01-22' },
  { id: 'moov-3', name: 'Concepts Initiaux', project: 'MOOV AFRICA', member: 'Paul Junior OUEDRAOGO', status: 'in-progress', progress: 75, duration: 5, dependencies: ['moov-2'], critical: true, startDate: '2025-01-22', endDate: '2025-01-27' },
  { id: 'moov-4', name: 'Production Photo', project: 'MOOV AFRICA', member: 'Fortune YANOGO', status: 'pending', progress: 0, duration: 6, dependencies: ['moov-3'], critical: true, startDate: '2025-01-27', endDate: '2025-02-02' },
  { id: 'moov-5', name: 'Motion Design', project: 'MOOV AFRICA', member: 'Abdoul Latif OUEDRAOGO', status: 'pending', progress: 0, duration: 4, dependencies: ['moov-3'], critical: false, startDate: '2025-01-27', endDate: '2025-01-31' },
  { id: 'moov-6', name: 'Validation Client', project: 'MOOV AFRICA', member: 'Linda KABORÉ', status: 'pending', progress: 0, duration: 2, dependencies: ['moov-4', 'moov-5'], critical: true, startDate: '2025-02-02', endDate: '2025-02-04' },

  // BANK OF AFRICA Rebranding
  { id: 'boa-1', name: 'Audit Existant', project: 'BANK OF AFRICA', member: 'Enos GOUBA', status: 'completed', progress: 100, duration: 5, dependencies: [], critical: false, startDate: '2025-01-10', endDate: '2025-01-15' },
  { id: 'boa-2', name: 'Benchmark Concurrentiel', project: 'BANK OF AFRICA', member: 'Jean-Jacques SAMPABAO', status: 'in-progress', progress: 45, duration: 4, dependencies: ['boa-1'], critical: false, startDate: '2025-01-15', endDate: '2025-01-19' },
  { id: 'boa-3', name: 'Concepts Identité', project: 'BANK OF AFRICA', member: 'Serge ASSALÉ', status: 'pending', progress: 0, duration: 8, dependencies: ['boa-2'], critical: false, startDate: '2025-01-19', endDate: '2025-01-27' },
  { id: 'boa-4', name: 'Déclinaisons', project: 'BANK OF AFRICA', member: 'Florita KABORÉ', status: 'pending', progress: 0, duration: 6, dependencies: ['boa-3'], critical: false, startDate: '2025-01-27', endDate: '2025-02-02' },

  // SUNU BURKINA Website
  { id: 'sunu-1', name: 'Cahier des Charges', project: 'SUNU BURKINA', member: 'Abdoul Latif OUEDRAOGO', status: 'completed', progress: 100, duration: 4, dependencies: [], critical: false, startDate: '2025-01-08', endDate: '2025-01-12' },
  { id: 'sunu-2', name: 'Architecture Site', project: 'SUNU BURKINA', member: 'Bientama PARÉ', status: 'in-progress', progress: 60, duration: 5, dependencies: ['sunu-1'], critical: false, startDate: '2025-01-12', endDate: '2025-01-17' },
  { id: 'sunu-3', name: 'Maquettes UI/UX', project: 'SUNU BURKINA', member: 'Paul Junior OUEDRAOGO', status: 'blocked', progress: 0, duration: 7, dependencies: ['sunu-2'], critical: false, startDate: '2025-01-17', endDate: '2025-01-24' },
  { id: 'sunu-4', name: 'Développement', project: 'SUNU BURKINA', member: 'Abdoul Latif OUEDRAOGO', status: 'pending', progress: 0, duration: 10, dependencies: ['sunu-3'], critical: false, startDate: '2025-01-24', endDate: '2025-02-03' },

  // ROXGOLD Corporate
  { id: 'roxgold-1', name: 'Brief Corporate', project: 'ROXGOLD', member: 'Serge ASSALÉ', status: 'completed', progress: 100, duration: 3, dependencies: [], critical: false, startDate: '2025-01-05', endDate: '2025-01-08' },
  { id: 'roxgold-2', name: 'Recherche Secteur', project: 'ROXGOLD', member: 'Fortune YANOGO', status: 'completed', progress: 100, duration: 4, dependencies: ['roxgold-1'], critical: false, startDate: '2025-01-08', endDate: '2025-01-12' },
  { id: 'roxgold-3', name: 'Concepts Logo', project: 'ROXGOLD', member: 'Jean-Jacques SAMPABAO', status: 'completed', progress: 100, duration: 6, dependencies: ['roxgold-2'], critical: false, startDate: '2025-01-12', endDate: '2025-01-18' },
  { id: 'roxgold-4', name: 'Guide de Marque', project: 'ROXGOLD', member: 'Florita KABORÉ', status: 'in-progress', progress: 85, duration: 5, dependencies: ['roxgold-3'], critical: false, startDate: '2025-01-18', endDate: '2025-01-23' }
];

const conflicts: Conflict[] = [
  {
    id: 'conflict-1',
    type: 'cycle',
    title: 'Cycle détecté',
    description: 'MOOV AFRICA: Validation Client dépend de Production Photo qui dépend de Motion Design qui dépend de Validation Client',
    severity: 'high',
    tasks: ['moov-4', 'moov-5', 'moov-6']
  },
  {
    id: 'conflict-2',
    type: 'overload',
    title: 'Surcharge ressource',
    description: 'Paul Junior OUEDRAOGO : 95% de charge (au-dessus du seuil de 90%)',
    severity: 'high',
    tasks: ['moov-3', 'sunu-3']
  },
  {
    id: 'conflict-3',
    type: 'date',
    title: 'Date impossible',
    description: 'SUNU BURKINA: Maquettes bloquées, retard sur développement prévu',
    severity: 'medium',
    tasks: ['sunu-3', 'sunu-4']
  },
  {
    id: 'conflict-4',
    type: 'resource',
    title: 'Conflit de ressource',
    description: 'Serge ASSALÉ assigné simultanément sur MOOV et BOA aux mêmes dates',
    severity: 'medium',
    tasks: ['moov-2', 'boa-3']
  }
];

function DependencyManagement() {
  const [currentView, setCurrentView] = useState<'network' | 'matrix'>('network');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'warning' | 'error' | 'info'}>>([]);
  const [showCriticalPath, setShowCriticalPath] = useState(false);

  // Statistics calculations
  const stats = {
    totalTasks: tasks.length,
    activeDependencies: tasks.reduce((acc, task) => acc + task.dependencies.length, 0),
    conflicts: conflicts.length,
    criticalPaths: tasks.filter(t => t.critical).length,
    teamLoad: Math.round(teamMembers.reduce((acc, member) => acc + member.load, 0) / teamMembers.length)
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#93C954';
      case 'in-progress': return '#37B6E9';
      case 'pending': return '#F68C1F';
      case 'blocked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'blocked': return 'Bloqué';
      default: return 'Inconnu';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#93C954';
    if (progress >= 50) return '#F68C1F';
    return '#37B6E9';
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedProject !== 'all' && !task.project.toLowerCase().includes(selectedProject)) return false;
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    return true;
  });

  const criticalTasks = tasks.filter(task => task.critical);

  const resolveConflict = (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (conflict) {
      showNotification(`Conflit résolu: ${conflict.title}`, 'success');
      // In real app, this would update the backend
    }
  };

  const optimizeDependencies = () => {
    showNotification('Optimisation des dépendances en cours...', 'info');
    setTimeout(() => {
      showNotification('Optimisation terminée: 3 conflits résolus, charge équilibrée', 'success');
    }, 3000);
  };

  const createDependency = () => {
    showNotification('Nouvelle dépendance créée avec succès', 'success');
  };

  const simulateDelay = () => {
    showNotification('Simulation de retard: Impact calculé sur 5 tâches dépendantes', 'warning');
  };

  const generateReport = () => {
    showNotification('Génération du rapport détaillé...', 'info');
    setTimeout(() => {
      showNotification('Rapport généré et téléchargé avec succès', 'success');
    }, 2000);
  };

  const exportData = () => {
    showNotification('Export des données en cours...', 'info');
    setTimeout(() => {
      showNotification('Données exportées au format Excel', 'success');
    }, 1500);
  };

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const updateMessages = [
        'Nouvelle tâche ajoutée au projet MOOV AFRICA',
        'Validation client reçue pour BANK OF AFRICA',
        'Retard détecté sur le projet SUNU BURKINA',
        'Ressource libérée: Issa CISSE disponible',
        'Progression mise à jour: ROXGOLD 85% terminé'
      ];
      
      if (Math.random() < 0.3) {
        const message = updateMessages[Math.floor(Math.random() * updateMessages.length)];
        const type = Math.random() < 0.5 ? 'info' : Math.random() < 0.7 ? 'success' : 'warning';
        showNotification(message, type);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const renderNetworkView = () => (
    <div style={{ 
      background: 'white', 
      border: '1px solid #EBECED', 
      borderRadius: '12px', 
      padding: '24px',
      minHeight: '600px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          Diagramme de Dépendances
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCriticalPath(!showCriticalPath)}
            style={{
              background: showCriticalPath ? 'var(--jofe-orange)' : 'white',
              color: showCriticalPath ? 'white' : 'var(--jofe-blue-medium)',
              border: '1px solid #EBECED',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Target size={14} />
            Chemin Critique
          </button>
          <button
            onClick={() => showNotification('Layout réinitialisé', 'info')}
            style={{
              background: 'white',
              color: 'var(--jofe-blue-medium)',
              border: '1px solid #EBECED',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Simplified Network Visualization */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        padding: '20px',
        background: '#F8F9FA',
        borderRadius: '8px',
        minHeight: '500px'
      }}>
        {filteredTasks.map(task => (
          <div
            key={task.id}
            style={{
              background: 'white',
              border: task.critical && showCriticalPath ? '3px solid var(--jofe-orange)' : '1px solid #EBECED',
              borderRadius: '8px',
              padding: '16px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: task.critical && showCriticalPath ? '0 4px 12px rgba(246, 140, 31, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onClick={() => showNotification(`Tâche: ${task.name} - ${task.member} (${getStatusLabel(task.status)})`, 'info')}
          >
            {task.critical && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'var(--jofe-orange)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                CRITIQUE
              </div>
            )}

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', marginBottom: '4px' }}>
                {task.project}
              </div>
              <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)', fontSize: '14px' }}>
                {task.name}
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--jofe-blue-medium)' }}>{task.member}</span>
                <span style={{ color: getStatusColor(task.status) }}>{task.progress}%</span>
              </div>
              <div style={{
                background: '#EBECED',
                height: '4px',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: getProgressColor(task.progress),
                  height: '100%',
                  width: `${task.progress}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: `rgba(${getStatusColor(task.status).replace('#', '')}, 0.1)`,
                color: getStatusColor(task.status),
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {getStatusLabel(task.status)}
              </span>
              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                {task.duration}j
              </span>
            </div>

            {task.dependencies.length > 0 && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #EBECED' }}>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>
                  Dépend de: {task.dependencies.length} tâche{task.dependencies.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMatrixView = () => (
    <div style={{ 
      background: 'white', 
      border: '1px solid #EBECED', 
      borderRadius: '12px', 
      padding: '24px',
      minHeight: '600px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          Matrice des Dépendances
        </h3>
        <button
          onClick={() => showNotification('Matrice exportée au format Excel', 'success')}
          style={{
            background: 'white',
            color: 'var(--jofe-blue-medium)',
            border: '1px solid #EBECED',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download size={14} />
          Exporter Matrice
        </button>
      </div>

      {/* Matrix Grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${filteredTasks.length}, 60px)`,
          gap: '1px',
          background: '#EBECED',
          borderRadius: '8px',
          overflow: 'hidden',
          minWidth: '800px'
        }}>
          {/* Header row */}
          <div style={{
            background: 'var(--jofe-blue-light)',
            color: 'white',
            padding: '12px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Tâches
          </div>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                background: 'var(--jofe-blue-light)',
                color: 'white',
                padding: '8px 4px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: '600',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              {task.name.substring(0, 15)}...
            </div>
          ))}

          {/* Matrix rows */}
          {filteredTasks.map(rowTask => (
            <React.Fragment key={rowTask.id}>
              <div style={{
                background: 'white',
                padding: '12px',
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--jofe-blue-deep)'
              }}>
                <div>{rowTask.name}</div>
                <div style={{ fontSize: '10px', color: '#6B7280' }}>{rowTask.project}</div>
              </div>
              {filteredTasks.map(colTask => {
                const hasDependency = rowTask.dependencies.includes(colTask.id);
                const isCritical = rowTask.critical && colTask.critical;
                return (
                  <div
                    key={colTask.id}
                    style={{
                      background: hasDependency ? 
                        (isCritical ? 'rgba(246, 140, 31, 0.3)' : 'rgba(55, 182, 233, 0.2)') : 
                        'white',
                      padding: '8px',
                      textAlign: 'center',
                      cursor: hasDependency ? 'pointer' : 'default',
                      fontSize: '12px'
                    }}
                    onClick={() => hasDependency && showNotification(`Dépendance: ${colTask.name} → ${rowTask.name}`, 'info')}
                  >
                    {hasDependency ? (isCritical ? '⚠️' : '✓') : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', background: 'var(--jofe-white)', color: 'var(--jofe-black)', lineHeight: '1.6', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: '256px', background: 'white', borderRight: '1px solid #E5E7EB', zIndex: 40 }} className="hidden md:block">
        <div style={{ padding: '24px' }}>
          {/* Logo JoFé+ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-deep)', borderRadius: '50%', width: '20px', height: '20px', top: 0, left: '10px', animation: 'rotate 8s linear infinite' }}></div>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-medium)', borderRadius: '50%', width: '20px', height: '20px', top: '15px', left: 0, animation: 'rotate 8s linear infinite' }}></div>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-light)', borderRadius: '50%', width: '20px', height: '20px', top: '15px', right: 0, animation: 'rotate 8s linear infinite' }}></div>
            </div>
            <div>
              <h1 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                jofé<span style={{ color: 'var(--jofe-blue-light)' }}>+</span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: 0 }}>Digital Excellence</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav style={{ marginBottom: '24px' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2z"></path>
              </svg>
              Tableau de Bord
            </Link>
            
            <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Projets
            </Link>
            
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-white)', background: 'var(--jofe-blue-light)', textDecoration: 'none', marginBottom: '8px' }}>
              <Network size={20} />
              Dépendances
            </a>
            
            <Link href="/team" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <Users size={20} />
              Équipe
            </Link>
            
            <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <BarChart3 size={20} />
              Analytics
            </Link>
          </nav>
        </div>
        
        {/* User Info */}
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jofe-blue-light)', color: 'white', fontWeight: '500', fontSize: '14px' }}>
              SA
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: 'var(--jofe-blue-deep)', margin: 0 }}>Serge ASSALÉ</p>
              <p style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', margin: 0 }}>Directeur Création</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '256px' }} className="md:ml-64 ml-0">
        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                Gestion des Dépendances
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--jofe-blue-medium)', margin: 0 }}>
                Visualisation et optimisation des interdépendances de projets
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Notifications */}
              <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--jofe-blue-medium)' }}>
                <MessageSquare size={24} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              </button>
              
              {/* Settings */}
              <button style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--jofe-blue-medium)' }}>
                <Settings size={24} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px' }}>
          {/* Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{stats.totalTasks}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Tâches Interconnectées</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{stats.activeDependencies}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Dépendances Actives</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>{stats.conflicts}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Conflits Détectés</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{stats.criticalPaths}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Chemins Critiques</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{stats.teamLoad}%</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Charge d'Équipe</div>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'white', border: '1px solid #EBECED', borderRadius: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('network')}
              style={{
                background: currentView === 'network' ? 'var(--jofe-blue-light)' : 'white',
                color: currentView === 'network' ? 'white' : 'var(--jofe-blue-medium)',
                border: '1px solid #EBECED',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Network size={16} />
              Vue Réseau
            </button>
            
            <button
              onClick={() => setCurrentView('matrix')}
              style={{
                background: currentView === 'matrix' ? 'var(--jofe-blue-light)' : 'white',
                color: currentView === 'matrix' ? 'white' : 'var(--jofe-blue-medium)',
                border: '1px solid #EBECED',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Grid size={16} />
              Vue Matrice
            </button>
            
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #EBECED', borderRadius: '6px', background: 'white', color: 'var(--jofe-blue-medium)', fontSize: '14px' }}
            >
              <option value="all">Tous les projets</option>
              <option value="moov">MOOV AFRICA</option>
              <option value="bank">BANK OF AFRICA</option>
              <option value="sunu">SUNU BURKINA</option>
              <option value="roxgold">ROXGOLD</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #EBECED', borderRadius: '6px', background: 'white', color: 'var(--jofe-blue-medium)', fontSize: '14px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="critical">Chemin critique</option>
              <option value="in-progress">En cours</option>
              <option value="pending">En attente</option>
              <option value="blocked">Bloqué</option>
              <option value="completed">Terminé</option>
            </select>
            
            <button
              onClick={optimizeDependencies}
              style={{
                background: 'white',
                color: 'var(--jofe-blue-medium)',
                border: '1px solid #EBECED',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={16} />
              Optimiser
            </button>
            
            <button
              onClick={exportData}
              style={{
                background: 'white',
                color: 'var(--jofe-blue-medium)',
                border: '1px solid #EBECED',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} />
              Exporter
            </button>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }} className="lg:grid-cols-2 grid-cols-1">
            {/* Visualization Panel */}
            <div>
              {currentView === 'network' ? renderNetworkView() : renderMatrixView()}
            </div>

            {/* Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Conflicts Panel */}
              <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                  Conflits Détectés
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {conflicts.map(conflict => (
                    <div
                      key={conflict.id}
                      style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#EF4444', fontSize: '14px' }}>
                            {conflict.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {conflict.description}
                          </div>
                        </div>
                        <button
                          onClick={() => resolveConflict(conflict.id)}
                          style={{
                            background: 'var(--jofe-orange)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Résoudre
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Path */}
              <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                  Chemin Critique
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {criticalTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      style={{
                        borderLeft: '4px solid var(--jofe-orange)',
                        background: 'rgba(246, 140, 31, 0.05)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px', color: 'var(--jofe-blue-deep)' }}>
                          {task.name}
                        </span>
                        <span style={{
                          background: 'rgba(246, 140, 31, 0.2)',
                          color: 'var(--jofe-orange)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          CRITIQUE
                        </span>
                      </div>
                      <div style={{
                        background: '#EBECED',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          background: task.progress < 50 ? '#EF4444' : task.progress < 80 ? 'var(--jofe-orange)' : 'var(--jofe-green)',
                          height: '100%',
                          width: `${task.progress}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {task.member} • {task.duration} jours • {task.progress}% terminé
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                  Actions Rapides
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={createDependency}
                    style={{
                      background: 'var(--jofe-blue-light)',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    <Plus size={16} />
                    Nouvelle Dépendance
                  </button>
                  
                  <button
                    onClick={simulateDelay}
                    style={{
                      background: 'white',
                      color: 'var(--jofe-blue-medium)',
                      border: '1px solid #EBECED',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    <Clock size={16} />
                    Simuler Retard
                  </button>
                  
                  <button
                    onClick={generateReport}
                    style={{
                      background: 'white',
                      color: 'var(--jofe-blue-medium)',
                      border: '1px solid #EBECED',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    <BarChart3 size={16} />
                    Rapport Détaillé
                  </button>
                </div>
              </div>

              {/* Team Load */}
              <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ fontFamily: 'Inter', fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                  Charge Équipe
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {teamMembers.slice(0, 6).map(member => (
                    <div key={member.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--jofe-blue-deep)' }}>
                          {member.name.split(' ')[0]} {member.name.split(' ')[1]}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: member.load > 90 ? '#EF4444' : member.load > 80 ? 'var(--jofe-orange)' : 'var(--jofe-green)' }}>
                          {member.load}%
                        </span>
                      </div>
                      <div style={{
                        background: '#EBECED',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: member.load > 90 ? '#EF4444' : member.load > 80 ? 'var(--jofe-orange)' : 'var(--jofe-green)',
                          height: '100%',
                          width: `${member.load}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              background: notification.type === 'success' ? '#93C954' : 
                         notification.type === 'warning' ? '#F68C1F' :
                         notification.type === 'error' ? '#EF4444' : 'var(--jofe-blue-light)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              marginBottom: '8px',
              maxWidth: '350px',
              animation: 'slideInRight 0.3s ease',
              fontSize: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {notification.type === 'success' && <CheckCircle size={16} />}
              {notification.type === 'warning' && <AlertTriangle size={16} />}
              {notification.type === 'error' && <XCircle size={16} />}
              {notification.type === 'info' && <AlertCircle size={16} />}
              <span>{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        :root {
          --jofe-blue-deep: #162C54;
          --jofe-blue-night: #1A4278;
          --jofe-blue-medium: #3475BB;
          --jofe-blue-light: #37B6E9;
          --jofe-black: #000000;
          --jofe-gray: #EBECED;
          --jofe-white: #FFFFFF;
          --jofe-green: #93C954;
          --jofe-orange: #F68C1F;
        }
      `}</style>
    </div>
  );
}

export default DependencyManagement;