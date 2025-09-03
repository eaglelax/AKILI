import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';

interface Task {
  id: string;
  name: string;
  assignee: string;
  duration: number;
  startDate: string;
  status: 'todo' | 'progress' | 'done' | 'blocked';
  progress: number;
  dependencies?: string[];
}

interface Project {
  name: string;
  color: string;
  tasks: Task[];
}

interface GanttData {
  projects: Record<string, Project>;
}

function Gantt() {
  const [currentZoom, setCurrentZoom] = useState<'day' | 'week' | 'month'>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showResourceView, setShowResourceView] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  // Données des projets Jo'Fé Digital
  const [ganttData] = useState<GanttData>({
    projects: {
      moov: {
        name: "Campagne MOOV AFRICA",
        color: "moov",
        tasks: [
          { id: "moov-1", name: "Brief et Analyse Client", assignee: "Serge A.", duration: 2, startDate: "2024-01-08", status: "done", progress: 100 },
          { id: "moov-2", name: "Recherche Créative", assignee: "Linda K.", duration: 3, startDate: "2024-01-10", status: "done", progress: 100, dependencies: ["moov-1"] },
          { id: "moov-3", name: "Concept Visual", assignee: "Paul J.", duration: 4, startDate: "2024-01-15", status: "progress", progress: 75, dependencies: ["moov-2"] },
          { id: "moov-4", name: "Shooting Photo", assignee: "Fortune Y.", duration: 2, startDate: "2024-01-18", status: "progress", progress: 50, dependencies: ["moov-3"] },
          { id: "moov-5", name: "Motion Design", assignee: "Bientama P.", duration: 5, startDate: "2024-01-22", status: "todo", progress: 0, dependencies: ["moov-4"] },
          { id: "moov-6", name: "Montage Final", assignee: "Paul J.", duration: 3, startDate: "2024-01-29", status: "todo", progress: 0, dependencies: ["moov-5"] }
        ]
      },
      bank: {
        name: "Rebranding BANK OF AFRICA",
        color: "bank",
        tasks: [
          { id: "bank-1", name: "Audit Identité Actuelle", assignee: "Serge A.", duration: 3, startDate: "2024-01-15", status: "done", progress: 100 },
          { id: "bank-2", name: "Propositions Logo", assignee: "Jean-Jacques S.", duration: 5, startDate: "2024-01-18", status: "progress", progress: 60, dependencies: ["bank-1"] },
          { id: "bank-3", name: "Charte Graphique", assignee: "Abdoul L.", duration: 4, startDate: "2024-01-25", status: "todo", progress: 0, dependencies: ["bank-2"] },
          { id: "bank-4", name: "Déclinaisons Print", assignee: "Issa C.", duration: 3, startDate: "2024-01-31", status: "todo", progress: 0, dependencies: ["bank-3"] }
        ]
      },
      sunu: {
        name: "Site web SUNU BURKINA",
        color: "sunu",
        tasks: [
          { id: "sunu-1", name: "Cahier des Charges", assignee: "Nebié W.", duration: 2, startDate: "2024-01-10", status: "done", progress: 100 },
          { id: "sunu-2", name: "Wireframes", assignee: "Abdoul L.", duration: 4, startDate: "2024-01-12", status: "done", progress: 100, dependencies: ["sunu-1"] },
          { id: "sunu-3", name: "Design UI/UX", assignee: "Abdoul L.", duration: 6, startDate: "2024-01-18", status: "progress", progress: 80, dependencies: ["sunu-2"] },
          { id: "sunu-4", name: "Développement Front", assignee: "Externe", duration: 10, startDate: "2024-01-26", status: "todo", progress: 0, dependencies: ["sunu-3"] },
          { id: "sunu-5", name: "Intégration Contenu", assignee: "Florita K.", duration: 3, startDate: "2024-02-09", status: "todo", progress: 0, dependencies: ["sunu-4"] }
        ]
      },
      roxgold: {
        name: "Logo ROXGOLD",
        color: "roxgold",
        tasks: [
          { id: "roxgold-1", name: "Briefing Client", assignee: "Enos G.", duration: 1, startDate: "2024-01-22", status: "done", progress: 100 },
          { id: "roxgold-2", name: "Recherches Visuelles", assignee: "Jean-Jacques S.", duration: 2, startDate: "2024-01-23", status: "progress", progress: 70, dependencies: ["roxgold-1"] },
          { id: "roxgold-3", name: "Propositions Logo", assignee: "Jean-Jacques S.", duration: 3, startDate: "2024-01-25", status: "todo", progress: 0, dependencies: ["roxgold-2"] },
          { id: "roxgold-4", name: "Révisions", assignee: "Jean-Jacques S.", duration: 2, startDate: "2024-01-30", status: "todo", progress: 0, dependencies: ["roxgold-3"] }
        ]
      }
    }
  });

  const teamMembers = [
    'Serge ASSALÉ', 'Paul Junior OUEDRAOGO', 'Fortune YANOGO', 'Bientama PARÉ', 
    'Issa CISSE', 'Florita KABORÉ', 'Nebié WEBOU', 'Djamilatou GUIGUEMDE', 
    'Jean-Jacques SAMPABAO', 'Abdoul Latif OUEDRAOGO', 'Linda KABORÉ', 
    'Maryse BOMBIRI', 'Faridatou BARRY', 'Enos GOUBA'
  ];

  const getPixelsPerDay = () => {
    switch (currentZoom) {
      case 'day': return 40;
      case 'week': return 20;
      case 'month': return 4;
      default: return 20;
    }
  };

  const getDaysInUnit = () => {
    switch (currentZoom) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 7;
    }
  };

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  };

  const generateTimelineScale = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    const units = [];
    
    let current = new Date(startDate);
    const pixelsPerDay = getPixelsPerDay();
    
    while (current <= endDate) {
      const width = pixelsPerDay * getDaysInUnit();
      let label = '';
      
      if (currentZoom === 'day') {
        label = current.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        current.setDate(current.getDate() + 1);
      } else if (currentZoom === 'week') {
        label = `Sem. ${getWeekNumber(current)}`;
        current.setDate(current.getDate() + 7);
      } else {
        label = current.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        current.setMonth(current.getMonth() + 1);
      }
      
      units.push({ label, width });
    }
    
    return units;
  };

  const toggleProject = (projectId: string) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const getProjectColor = (taskId: string) => {
    for (const [projectId, project] of Object.entries(ganttData.projects)) {
      if (project.tasks.some(task => task.id === taskId)) {
        return project.color;
      }
    }
    return 'moov';
  };

  const calculateTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate);
    const baseDate = new Date(2024, 0, 1);
    const daysDiff = Math.floor((startDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const pixelsPerDay = getPixelsPerDay();
    
    return {
      left: daysDiff * pixelsPerDay,
      width: task.duration * pixelsPerDay
    };
  };

  const renderTasks = () => {
    const tasks: JSX.Element[] = [];
    let rowIndex = 0;
    
    Object.entries(ganttData.projects).forEach(([projectId, project]) => {
      if (!collapsedProjects[projectId]) {
        project.tasks.forEach((task) => {
          const { left, width } = calculateTaskPosition(task);
          const topPosition = rowIndex * 40 + 60;
          
          tasks.push(
            <div
              key={task.id}
              className={`gantt-bar ${project.color} ${selectedTask === task.id ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${width}px`,
                top: `${topPosition}px`,
                height: '24px',
                borderRadius: '4px',
                cursor: 'move',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: '12px',
                color: 'white',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => setSelectedTask(task.id)}
              onDoubleClick={() => {
                setSelectedTask(task.id);
                setIsTaskModalOpen(true);
              }}
            >
              {task.progress > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${task.progress}%`,
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px 0 0 4px',
                    transition: 'all 0.3s ease'
                  }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{task.name}</span>
            </div>
          );
          rowIndex++;
        });
      }
    });
    
    return tasks;
  };

  const positionTodayLine = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const pixelsPerDay = getPixelsPerDay();
    
    return daysDiff * pixelsPerDay;
  };

  const timelineUnits = generateTimelineScale();
  const todayPosition = positionTodayLine();

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
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Planning Gantt
            </a>
          </nav>
        </div>
        
        {/* User Info */}
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jofe-blue-light)' }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h1 style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
              Planning Gantt Interactif
            </h1>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Nouvelle Tâche
              </button>
            </div>
          </div>
        </header>

        {/* Gantt Container */}
        <main style={{ padding: '24px' }}>
          {/* Toolbar */}
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderBottom: 'none', borderRadius: '12px 12px 0 0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Vue:</span>
              {(['day', 'week', 'month'] as const).map(zoom => (
                <button
                  key={zoom}
                  onClick={() => setCurrentZoom(zoom)}
                  style={{
                    background: currentZoom === zoom ? 'var(--jofe-blue-medium)' : 'var(--jofe-white)',
                    color: currentZoom === zoom ? 'var(--jofe-white)' : 'var(--jofe-blue-medium)',
                    border: '1px solid var(--jofe-gray)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {zoom === 'day' ? 'Jour' : zoom === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowCriticalPath(!showCriticalPath)}
                style={{
                  background: showCriticalPath ? 'var(--jofe-orange)' : 'var(--jofe-white)',
                  color: showCriticalPath ? 'var(--jofe-white)' : 'var(--jofe-blue-medium)',
                  border: '1px solid var(--jofe-gray)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Chemin critique
              </button>
              <button
                onClick={() => setShowResourceView(!showResourceView)}
                style={{
                  background: showResourceView ? 'var(--jofe-green)' : 'var(--jofe-white)',
                  color: showResourceView ? 'var(--jofe-white)' : 'var(--jofe-blue-medium)',
                  border: '1px solid var(--jofe-gray)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Vue ressources
              </button>
            </div>
          </div>

          {/* Gantt Main */}
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '0 0 12px 12px', overflow: 'hidden', height: 'calc(100vh - 300px)', minHeight: '600px', display: 'flex' }}>
            {/* Sidebar gauche avec les tâches */}
            <div style={{ width: '300px', background: 'var(--jofe-white)', borderRight: '1px solid var(--jofe-gray)', overflowY: 'auto' }}>
              {Object.entries(ganttData.projects).map(([projectId, project]) => (
                <div key={projectId} style={{ borderBottom: '1px solid var(--jofe-gray)' }}>
                  <div
                    onClick={() => toggleProject(projectId)}
                    style={{ background: 'rgba(22, 44, 84, 0.05)', padding: '12px 16px', fontWeight: '600', color: 'var(--jofe-blue-deep)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>📊 {project.name}</span>
                    <span>{project.tasks.length} tâches</span>
                  </div>
                  {!collapsedProjects[projectId] && (
                    <div>
                      {project.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task.id)}
                          style={{
                            padding: '8px 16px',
                            borderBottom: '1px solid rgba(235, 236, 237, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: selectedTask === task.id ? 'rgba(55, 182, 233, 0.1)' : 'transparent',
                            borderLeft: selectedTask === task.id ? '3px solid var(--jofe-blue-light)' : 'none'
                          }}
                        >
                          <div style={{ flex: 1, fontSize: '14px', color: 'var(--jofe-blue-deep)' }}>
                            {task.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', background: 'rgba(52, 117, 187, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                            {task.assignee}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', fontWeight: '500' }}>
                            {task.duration}j
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, background: 'var(--jofe-white)', position: 'relative', overflow: 'auto' }}>
              {/* Timeline Header */}
              <div style={{ background: 'var(--jofe-white)', borderBottom: '2px solid var(--jofe-gray)', height: '60px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'end', padding: '0 20px' }}>
                <div style={{ display: 'flex', height: '100%', alignItems: 'end' }}>
                  {timelineUnits.map((unit, index) => (
                    <div
                      key={index}
                      style={{
                        borderLeft: '1px solid var(--jofe-gray)',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: 'var(--jofe-blue-medium)',
                        textAlign: 'center',
                        minWidth: `${unit.width}px`
                      }}
                    >
                      {unit.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Body */}
              <div ref={timelineBodyRef} style={{ position: 'relative', padding: '20px', height: 'calc(100% - 60px)' }}>
                {/* Grid Lines */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  {timelineUnits.map((unit, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        borderLeft: '1px solid rgba(235, 236, 237, 0.5)',
                        top: 0,
                        bottom: 0,
                        left: `${index * unit.width}px`
                      }}
                    />
                  ))}
                </div>

                {/* Today Line */}
                <div style={{ position: 'absolute', borderLeft: '2px solid var(--jofe-orange)', top: 0, bottom: 0, left: `${todayPosition}px`, zIndex: 10 }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '-25px', background: 'var(--jofe-orange)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                    Aujourd'hui
                  </div>
                </div>

                {/* Gantt Bars */}
                <div>
                  {renderTasks()}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
            <div style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '12px' }}>Légende</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg, var(--jofe-blue-light), var(--jofe-blue-medium))' }}></div>
                <span>Campagne MOOV AFRICA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg, var(--jofe-green), #7BB946)' }}></div>
                <span>Rebranding BANK OF AFRICA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg, var(--jofe-orange), #E67E0C)' }}></div>
                <span>Site web SUNU BURKINA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg, var(--jofe-blue-deep), var(--jofe-blue-night))' }}></div>
                <span>Logo ROXGOLD</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Zoom Controls */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button 
          onClick={() => setCurrentZoom('day')}
          style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Zoom +"
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        <button 
          onClick={() => setCurrentZoom('month')}
          style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Zoom -"
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        .gantt-bar.moov { 
          background: linear-gradient(135deg, var(--jofe-blue-light), var(--jofe-blue-medium)); 
        }
        .gantt-bar.bank { 
          background: linear-gradient(135deg, var(--jofe-green), #7BB946); 
        }
        .gantt-bar.sunu { 
          background: linear-gradient(135deg, var(--jofe-orange), #E67E0C); 
        }
        .gantt-bar.roxgold { 
          background: linear-gradient(135deg, var(--jofe-blue-deep), var(--jofe-blue-night)); 
        }
        .gantt-bar:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}

export default Gantt;