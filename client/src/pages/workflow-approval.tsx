import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  Eye, 
  MoreHorizontal,
  Check,
  X,
  RotateCcw,
  UserCheck,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

type WorkflowStatus = 'pending' | 'approved' | 'rejected' | 'in-progress';

interface WorkflowStep {
  id: string;
  name: string;
  status: WorkflowStatus;
  validator: string;
  date: string;
  description?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  progress: number;
  status: WorkflowStatus;
  currentStep: string;
  priority: 'normal' | 'high' | 'urgent';
  deadline: string;
  steps: WorkflowStep[];
  category: 'telecom' | 'finance' | 'digital' | 'corporate';
}

interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  steps: string[];
  duration: string;
  budget: string;
  description: string;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'telecom-campaign',
    name: 'Campagne Télécommunications',
    category: 'Télécommunications',
    steps: ['Brief Client', 'Stratégie', 'Concepts', 'Validation Client', 'Production', 'Tests', 'Livraison'],
    duration: '4-6 semaines',
    budget: '10-15M FCFA',
    description: 'Template complet pour campagnes télécommunications avec validation multi-étapes'
  },
  {
    id: 'banking-rebrand',
    name: 'Rebranding Bancaire',
    category: 'Finance & Banque',
    steps: ['Audit', 'Benchmark', 'Concepts', 'Présentation', 'Déclinaisons', 'Tests', 'Charte', 'Livraison'],
    duration: '6-8 semaines',
    budget: '20-30M FCFA',
    description: 'Workflow spécialisé pour projets de rebranding bancaire et financier'
  },
  {
    id: 'website-development',
    name: 'Site Web/Digital',
    category: 'Digital',
    steps: ['Cahier charges', 'Architecture', 'Maquettes', 'Développement', 'Tests', 'Recette', 'Corrections', 'Mise en ligne'],
    duration: '8-12 semaines',
    budget: '15-25M FCFA',
    description: 'Processus complet pour développement de sites web et solutions digitales'
  },
  {
    id: 'corporate-identity',
    name: 'Identité Corporate',
    category: 'Corporate',
    steps: ['Brief', 'Recherche', 'Concepts', 'Validation', 'Déclinaisons', 'Guide', 'Livraison'],
    duration: '5-7 semaines',
    budget: '12-20M FCFA',
    description: 'Création d\'identité visuelle pour entreprises et institutions'
  }
];

const projects: Project[] = [
  {
    id: 'moov-campaign',
    name: 'Campagne MOOV AFRICA - Data Mobile',
    client: 'MOOV AFRICA',
    budget: 12500000,
    progress: 65,
    status: 'in-progress',
    currentStep: 'concepts',
    priority: 'high',
    deadline: '2025-02-15',
    category: 'telecom',
    steps: [
      { id: 'brief', name: 'Brief Client', status: 'approved', validator: 'Linda KABORÉ', date: 'Il y a 2 jours', description: 'Validation du brief et objectifs campagne' },
      { id: 'strategy', name: 'Stratégie Créative', status: 'approved', validator: 'Serge ASSALÉ', date: 'Il y a 1 jour', description: 'Direction artistique et positionnement validés' },
      { id: 'concepts', name: 'Concepts Initiaux', status: 'in-progress', validator: 'Paul Junior OUEDRAOGO', date: 'En cours', description: 'Développement des concepts créatifs principaux' },
      { id: 'client-validation', name: 'Validation Client', status: 'pending', validator: 'En attente', date: '', description: 'Présentation client et ajustements' },
      { id: 'production', name: 'Production', status: 'pending', validator: 'En attente', date: '', description: 'Réalisation des supports finaux' }
    ]
  },
  {
    id: 'boa-rebrand',
    name: 'Rebranding BANK OF AFRICA',
    client: 'BANK OF AFRICA',
    budget: 25000000,
    progress: 45,
    status: 'pending',
    currentStep: 'benchmark',
    priority: 'urgent',
    deadline: '2025-03-01',
    category: 'finance',
    steps: [
      { id: 'audit', name: 'Audit Existant', status: 'approved', validator: 'Enos GOUBA', date: 'Il y a 3 jours', description: 'Analyse complète de l\'identité actuelle' },
      { id: 'benchmark', name: 'Benchmark Concurrentiel', status: 'pending', validator: 'Jean-Jacques SAMPABAO', date: 'En attente', description: 'Étude comparative du marché bancaire' },
      { id: 'concepts', name: 'Concepts Identité', status: 'pending', validator: 'En attente', date: '', description: 'Propositions nouvelles identités' }
    ]
  },
  {
    id: 'sunu-website',
    name: 'Site Web SUNU BURKINA',
    client: 'SUNU BURKINA',
    budget: 15000000,
    progress: 30,
    status: 'in-progress',
    currentStep: 'architecture',
    priority: 'normal',
    deadline: '2025-04-10',
    category: 'digital',
    steps: [
      { id: 'cahier', name: 'Cahier des Charges', status: 'approved', validator: 'Abdoul Latif OUEDRAOGO', date: 'Il y a 5 jours', description: 'Spécifications techniques et fonctionnelles' },
      { id: 'architecture', name: 'Architecture Site', status: 'in-progress', validator: 'Paul Junior OUEDRAOGO', date: 'En cours', description: 'Structure et arborescence du site' },
      { id: 'maquettes', name: 'Maquettes UI/UX', status: 'pending', validator: 'En attente', date: '', description: 'Design interfaces utilisateur' }
    ]
  },
  {
    id: 'roxgold-corporate',
    name: 'Identité Corporate ROXGOLD',
    client: 'ROXGOLD BURKINA',
    budget: 18000000,
    progress: 80,
    status: 'approved',
    currentStep: 'guide',
    priority: 'normal',
    deadline: '2025-01-30',
    category: 'corporate',
    steps: [
      { id: 'brief', name: 'Brief Corporate', status: 'approved', validator: 'Serge ASSALÉ', date: 'Il y a 10 jours', description: 'Positionnement et objectifs corporate' },
      { id: 'recherche', name: 'Recherche & Insights', status: 'approved', validator: 'Fortune YANOGO', date: 'Il y a 8 jours', description: 'Analyse marché et secteur minier' },
      { id: 'concepts', name: 'Concepts Identité', status: 'approved', validator: 'Jean-Jacques SAMPABAO', date: 'Il y a 5 jours', description: 'Propositions logo et charte' },
      { id: 'validation', name: 'Validation Client', status: 'approved', validator: 'Linda KABORÉ', date: 'Il y a 2 jours', description: 'Approbation finale concept' },
      { id: 'guide', name: 'Guide de Marque', status: 'in-progress', validator: 'Florita KABORÉ', date: 'En cours', description: 'Finalisation charte graphique' }
    ]
  }
];

function WorkflowApproval() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isDelegationOpen, setIsDelegationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'warning' | 'error' | 'info'}>>([]);

  // Statistics calculations
  const stats = {
    validationsInProgress: projects.filter(p => p.status === 'in-progress').length,
    averageValidationTime: '4.7h',
    approvalRate: Math.round((projects.filter(p => p.status === 'approved').length / projects.length) * 100),
    completedProjects: projects.filter(p => p.progress >= 80).length
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'approved': return '#93C954';
      case 'pending': return '#F68C1F';
      case 'rejected': return '#EF4444';
      case 'in-progress': return '#37B6E9';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <AlertCircle size={16} />;
      case 'rejected': return <X size={16} />;
      case 'in-progress': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getPriorityColor = (priority: 'normal' | 'high' | 'urgent') => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F68C1F';
      case 'normal': return '#93C954';
      default: return '#6B7280';
    }
  };

  const approveStep = (projectId: string, stepId: string) => {
    showNotification('Étape validée avec succès', 'success');
    // In real app, this would update the backend
  };

  const requestRevision = (projectId: string, stepId: string) => {
    setIsRevisionOpen(true);
    showNotification('Demande de révision ouverte', 'info');
  };

  const rejectStep = (projectId: string, stepId: string) => {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette étape ?')) {
      showNotification('Étape rejetée', 'error');
    }
  };

  const delegateApproval = (projectId: string, stepId: string) => {
    setIsDelegationOpen(true);
  };

  const renderWorkflowCard = (project: Project) => (
    <div key={project.id} style={{
      background: 'white',
      border: '1px solid #EBECED',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease'
    }}>
      {/* Project Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0, fontSize: '16px' }}>
            {project.name}
          </h4>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Client: {project.client} • Budget: {(project.budget / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            background: `rgba(${project.priority === 'urgent' ? '239, 68, 68' : project.priority === 'high' ? '246, 140, 31' : '147, 201, 84'}, 0.1)`,
            color: getPriorityColor(project.priority)
          }}>
            {project.priority === 'urgent' ? 'Urgent' : project.priority === 'high' ? 'Priorité' : 'Normal'}
          </span>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            background: `rgba(${getStatusColor(project.status).replace('#', '')}, 0.1)`,
            color: getStatusColor(project.status)
          }}>
            {project.status === 'in-progress' ? 'En cours' : 
             project.status === 'pending' ? 'En attente' :
             project.status === 'approved' ? 'Approuvé' : 'Rejeté'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: 'var(--jofe-blue-medium)' }}>Progression: {project.progress}%</span>
          <span style={{ color: '#6B7280' }}>Deadline: {new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
        </div>
        <div style={{
          background: '#EBECED',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, var(--jofe-blue-light), var(--jofe-green))',
            height: '100%',
            width: `${project.progress}%`,
            transition: 'width 0.5s ease',
            borderRadius: '10px'
          }} />
        </div>
      </div>

      {/* Workflow Steps */}
      <div style={{ marginTop: '20px' }}>
        {project.steps.map((step, index) => (
          <div key={step.id}>
            <div style={{
              background: step.status === 'pending' ? 'rgba(246, 140, 31, 0.05)' :
                         step.status === 'approved' ? 'rgba(147, 201, 84, 0.05)' :
                         step.status === 'rejected' ? 'rgba(239, 68, 68, 0.05)' :
                         step.status === 'in-progress' ? 'rgba(55, 182, 233, 0.05)' : 'white',
              border: `2px solid ${step.status === 'pending' ? '#F68C1F' :
                                 step.status === 'approved' ? '#93C954' :
                                 step.status === 'rejected' ? '#EF4444' :
                                 step.status === 'in-progress' ? '#37B6E9' : '#EBECED'}`,
              borderRadius: '8px',
              padding: '16px',
              margin: '8px 0',
              position: 'relative',
              transition: 'all 0.3s ease',
              animation: step.status === 'in-progress' ? 'pulse 2s ease-in-out infinite' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: getStatusColor(step.status) }}>
                    {getStatusIcon(step.status)}
                  </div>
                  <div>
                    <p style={{ fontWeight: '500', margin: 0, color: 'var(--jofe-blue-deep)' }}>
                      {step.name}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '2px 0 0 0' }}>
                      {step.status === 'pending' ? `En attente - ${step.validator}` :
                       step.status === 'in-progress' ? `En cours - ${step.validator}` :
                       `Validé par ${step.validator}`}
                    </p>
                    {step.description && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0 0' }}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {step.date}
                  </span>

                  {step.status === 'in-progress' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(55, 182, 233, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}>
                      <button
                        onClick={() => approveStep(project.id, step.id)}
                        style={{
                          background: '#93C954',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={12} />
                        Valider
                      </button>
                      <button
                        onClick={() => requestRevision(project.id, step.id)}
                        style={{
                          background: '#F68C1F',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RotateCcw size={12} />
                        Révision
                      </button>
                      <button
                        onClick={() => rejectStep(project.id, step.id)}
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <X size={12} />
                        Rejeter
                      </button>
                    </div>
                  )}

                  {step.status === 'pending' && index === 0 && (
                    <button
                      onClick={() => delegateApproval(project.id, step.id)}
                      style={{
                        background: 'var(--jofe-blue-medium)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <UserCheck size={12} />
                      Déléguer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Workflow Connector */}
            {index < project.steps.length - 1 && (
              <div style={{
                width: '2px',
                height: '20px',
                background: 'var(--jofe-blue-medium)',
                margin: '0 auto',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '-4px',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '10px solid var(--jofe-blue-medium)'
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.1)' }}>
            <CheckCircle size={24} style={{ color: 'var(--jofe-blue-light)' }} />
          </div>
          <span style={{ background: 'rgba(147, 201, 84, 0.1)', color: '#93C954', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
            +8%
          </span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Inter', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          {stats.validationsInProgress}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: '4px 0 0 0' }}>
          Validations en cours
        </p>
      </div>

      <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(147, 201, 84, 0.1)' }}>
            <Clock size={24} style={{ color: '#93C954' }} />
          </div>
          <span style={{ background: 'rgba(147, 201, 84, 0.1)', color: '#93C954', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
            2.3h
          </span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Inter', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          {stats.averageValidationTime}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: '4px 0 0 0' }}>
          Temps moyen validation
        </p>
      </div>

      <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(246, 140, 31, 0.1)' }}>
            <AlertCircle size={24} style={{ color: '#F68C1F' }} />
          </div>
          <span style={{ background: 'rgba(246, 140, 31, 0.1)', color: '#F68C1F', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
            Urgent
          </span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Inter', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          {stats.approvalRate}%
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: '4px 0 0 0' }}>
          Taux d'approbation
        </p>
      </div>

      <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(26, 66, 120, 0.1)' }}>
            <TrendingUp size={24} style={{ color: 'var(--jofe-blue-night)' }} />
          </div>
          <span style={{ background: 'rgba(147, 201, 84, 0.1)', color: '#93C954', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
            +12%
          </span>
        </div>
        <h3 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Inter', color: 'var(--jofe-blue-deep)', margin: 0 }}>
          {stats.completedProjects}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: '4px 0 0 0' }}>
          Projets livrés
        </p>
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
              <CheckCircle size={20} />
              Workflow & Approbations
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
                Workflow d'Approbation
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--jofe-blue-medium)', margin: 0 }}>
                Gestion des validations et jalons projets
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Notifications */}
              <button style={{ position: 'relative', padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--jofe-blue-medium)' }}>
                <MessageSquare size={24} />
                <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }} />
              </button>
              
              {/* Actions */}
              <button 
                onClick={() => setIsNewWorkflowOpen(true)}
                style={{ background: 'var(--jofe-blue-light)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} />
                Nouveau Workflow
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #EBECED', marginBottom: '24px' }}>
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'projects', label: 'Projets en cours' },
              { id: 'approvals', label: 'En attente d\'approbation' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'templates', label: 'Templates' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  cursor: 'pointer',
                  borderBottom: `2px solid ${activeTab === tab.id ? 'var(--jofe-blue-light)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  color: activeTab === tab.id ? 'var(--jofe-blue-deep)' : 'var(--jofe-blue-medium)',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  background: activeTab === tab.id ? 'rgba(55, 182, 233, 0.05)' : 'none',
                  border: 'none',
                  borderBottomWidth: '2px',
                  borderBottomStyle: 'solid'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              {renderKPIs()}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }} className="lg:grid-cols-2 grid-cols-1">
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #EBECED' }}>
                  <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
                    Workflows Actifs
                  </h3>
                  
                  {projects.filter(p => p.status === 'in-progress' || p.status === 'pending').slice(0, 2).map(renderWorkflowCard)}
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #EBECED', height: 'fit-content' }}>
                  <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--jofe-blue-deep)' }}>
                    Actions Rapides
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={() => showNotification('5 validations en attente de votre approbation', 'warning')}
                      style={{
                        background: 'rgba(246, 140, 31, 0.1)',
                        color: '#F68C1F',
                        border: '1px solid #F68C1F',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                    >
                      Voir Validations Urgentes (5)
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('templates')}
                      style={{
                        background: 'rgba(55, 182, 233, 0.1)',
                        color: 'var(--jofe-blue-light)',
                        border: '1px solid var(--jofe-blue-light)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                    >
                      Créer depuis Template
                    </button>
                    
                    <button
                      onClick={() => showNotification('Export du rapport en cours...', 'info')}
                      style={{
                        background: 'rgba(147, 201, 84, 0.1)',
                        color: '#93C954',
                        border: '1px solid #93C954',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                    >
                      Exporter Rapport
                    </button>
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #EBECED' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '12px' }}>
                      Équipe de Validation
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { name: 'Serge ASSALÉ', role: 'Directeur Création', avatar: 'SA', color: 'var(--jofe-blue-light)' },
                        { name: 'Linda KABORÉ', role: 'Chef de Pub Lead', avatar: 'LK', color: 'var(--jofe-green)' },
                        { name: 'Enos GOUBA', role: 'Coordinateur', avatar: 'EG', color: 'var(--jofe-orange)' }
                      ].map(member => (
                        <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: member.color,
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {member.avatar}
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, color: 'var(--jofe-blue-deep)' }}>
                              {member.name}
                            </p>
                            <p style={{ fontSize: '10px', color: '#6B7280', margin: 0 }}>
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h3 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
                Tous les Projets en Workflow
              </h3>
              {projects.map(renderWorkflowCard)}
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <h3 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
                Validations en Attente
              </h3>
              {projects.filter(p => p.status === 'pending' || p.steps.some(s => s.status === 'in-progress')).map(renderWorkflowCard)}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
                Analytics Workflow
              </h3>
              
              {renderKPIs()}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', height: '300px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                    Temps de Validation par Étape
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#6B7280' }}>
                    <BarChart3 size={48} />
                    <span style={{ marginLeft: '12px' }}>Graphique à implémenter</span>
                  </div>
                </div>
                
                <div style={{ background: 'white', border: '1px solid #EBECED', borderRadius: '12px', padding: '24px', height: '300px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                    Taux d'Approbation
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#6B7280' }}>
                    <TrendingUp size={48} />
                    <span style={{ marginLeft: '12px' }}>Graphique à implémenter</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <h3 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
                Templates de Workflow
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {workflowTemplates.map(template => (
                  <div key={template.id} style={{
                    background: 'white',
                    border: '1px solid #EBECED',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(22, 44, 84, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0, fontSize: '16px' }}>
                        {template.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', margin: '4px 0' }}>
                        {template.category}
                      </p>
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.5' }}>
                      {template.description}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', color: 'var(--jofe-blue-medium)' }}>
                      <span>{template.steps.length} étapes</span>
                      <span>{template.duration}</span>
                    </div>
                    
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--jofe-green)', marginBottom: '16px' }}>
                      {template.budget}
                    </div>
                    
                    <button
                      onClick={() => {
                        showNotification(`Template "${template.name}" sélectionné`, 'success');
                        setIsNewWorkflowOpen(true);
                      }}
                      style={{
                        width: '100%',
                        background: 'var(--jofe-blue-light)',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} />
                      Utiliser ce Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              background: 'white',
              border: '1px solid #EBECED',
              borderLeft: `4px solid ${notification.type === 'success' ? '#93C954' : 
                                   notification.type === 'warning' ? '#F68C1F' :
                                   notification.type === 'error' ? '#EF4444' : 'var(--jofe-blue-medium)'}`,
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              marginBottom: '8px',
              maxWidth: '350px',
              animation: 'slideInRight 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>
                {notification.type === 'success' ? '✓' : 
                 notification.type === 'warning' ? '⚠' :
                 notification.type === 'error' ? '✗' : 'ⓘ'}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--jofe-blue-deep)' }}>
                {notification.message}
              </span>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals would go here - simplified for brevity */}
      {isNewWorkflowOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '24px' }}>
              Nouveau Workflow
            </h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Fonctionnalité en développement...
            </p>
            <button
              onClick={() => setIsNewWorkflowOpen(false)}
              style={{
                background: 'var(--jofe-blue-light)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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

export default WorkflowApproval;