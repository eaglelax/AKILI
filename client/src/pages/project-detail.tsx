import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function ProjectDetail() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<string, string>>({
    'activeTimer1': '06:23:45'
  });

  // Données du projet MOOV AFRICA
  const projectData = {
    id: "moov-africa-2024",
    name: "Campagne MOOV AFRICA",
    description: "Nouvelle Identité Visuelle - Communication 360°",
    status: "En Cours",
    progress: 65,
    budget: 8500000,
    spent: 5520000,
    remaining: 2980000,
    daysLeft: 42,
    activeMembers: 7,
    totalTasks: 12,
    completedTasks: 12
  };

  // 14 membres d'équipe Jo'Fé Digital
  const teamMembers = {
    'serge': { name: 'Serge ASSALÉ', role: 'Directeur Création', initials: 'SA', color: '#162C54', rate: 15000 },
    'enos': { name: 'Enos GOUBA', role: 'Directeur Général', initials: 'EG', color: '#3475BB', rate: 18000 },
    'paul': { name: 'Paul Junior OUEDRAOGO', role: 'Graphiste Senior', initials: 'PO', color: '#37B6E9', rate: 8000 },
    'fortune': { name: 'Fortune YANOGO', role: 'Photographe', initials: 'FY', color: '#93C954', rate: 10000 },
    'bientama': { name: 'Bientama PARÉ', role: 'Motion Designer', initials: 'BP', color: '#F68C1F', rate: 9000 },
    'linda': { name: 'Linda KABORÉ', role: 'Graphiste', initials: 'LK', color: '#162C54', rate: 9500 },
    'florita': { name: 'Florita KABORÉ', role: 'Social Media Manager', initials: 'FK', color: '#3475BB', rate: 7500 }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Configuration du graphique budget
  const budgetChartData = {
    labels: ['Serge ASSALÉ', 'Paul OUEDRAOGO', 'Fortune YANOGO', 'Bientama PARÉ', 'Linda KABORÉ'],
    datasets: [{
      data: [480000, 1016000, 820000, 855000, 427500],
      backgroundColor: ['#162C54', '#3475BB', '#37B6E9', '#93C954', '#F68C1F'],
      borderWidth: 0
    }]
  };

  const budgetChartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: 'Open Sans',
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  // Timer actif qui s'incrémente
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach(timerId => {
          const [hours, minutes, seconds] = newTimers[timerId].split(':').map(Number);
          let totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
          
          const newHours = Math.floor(totalSeconds / 3600);
          const newMinutes = Math.floor((totalSeconds % 3600) / 60);
          const newSecs = totalSeconds % 60;
          
          newTimers[timerId] = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`;
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
              Vue d'Ensemble du Projet
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>Métriques Clés</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>65%</div>
                    <div style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px' }}>Progression</div>
                  </div>
                  <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--jofe-green)', marginBottom: '8px' }}>12/12</div>
                    <div style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px' }}>Tâches</div>
                  </div>
                  <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>7</div>
                    <div style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px' }}>Membres actifs</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>Équipe Assignée</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries(teamMembers).slice(0, 6).map(([id, member]) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--jofe-gray)', borderRadius: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)', fontWeight: '600' }}>
                        {member.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)', fontSize: '14px' }}>{member.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
              Timeline du Projet
            </h3>
            
            <div style={{ position: 'relative', padding: '20px 0' }}>
              <div style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '2px', background: 'var(--jofe-gray)' }}></div>
              
              <div style={{ position: 'relative', paddingLeft: '70px', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--jofe-green)', border: '3px solid var(--jofe-green)', zIndex: 1 }}></div>
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>Phase de Recherche Terminée</h4>
                  <p style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px', marginBottom: '8px' }}>Linda KABORÉ - Recherche références et moodboard</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>15 Nov 2024</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(147, 201, 84, 0.1)', color: 'var(--jofe-green)' }}>TERMINÉ</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: '70px', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--jofe-green)', border: '3px solid var(--jofe-green)', zIndex: 1 }}></div>
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>Création Logo Principal</h4>
                  <p style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px', marginBottom: '8px' }}>Paul Junior OUEDRAOGO - Logo et déclinaisons</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>22 Nov 2024</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(147, 201, 84, 0.1)', color: 'var(--jofe-green)' }}>TERMINÉ</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: '70px', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--jofe-white)', border: '3px solid var(--jofe-blue-light)', zIndex: 1 }}></div>
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>Animation Logo - En Cours</h4>
                  <p style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px', marginBottom: '8px' }}>Bientama PARÉ - Motion design logo</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>En cours</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(55, 182, 233, 0.1)', color: 'var(--jofe-blue-light)' }}>EN COURS</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: '70px', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--jofe-white)', border: '3px solid var(--jofe-blue-light)', zIndex: 1 }}></div>
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '8px' }}>Campagne Réseaux Sociaux - À Venir</h4>
                  <p style={{ color: 'var(--jofe-blue-medium)', fontSize: '14px', marginBottom: '8px' }}>Florita KABORÉ - Posts et stories</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>Prévu pour Décembre 2024</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(246, 140, 31, 0.1)', color: 'var(--jofe-orange)' }}>EN ATTENTE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-green)' }}>Tâches Terminées (7)</h4>
                
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Recherche références</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(147, 201, 84, 0.1)', color: 'var(--jofe-green)' }}>Terminé</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Linda KABORÉ - Moodboard et inspirations</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', color: 'var(--jofe-blue-medium)' }}>04:30:00</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-green)' }}>427,500 FCFA</span>
                  </div>
                </div>

                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Création logo principal</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(147, 201, 84, 0.1)', color: 'var(--jofe-green)' }}>Terminé</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Paul Junior OUEDRAOGO - Logo et déclinaisons</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', color: 'var(--jofe-blue-medium)' }}>12:45:30</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-green)' }}>1,020,000 FCFA</span>
                  </div>
                </div>

                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Shooting produits</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(147, 201, 84, 0.1)', color: 'var(--jofe-green)' }}>Terminé</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Fortune YANOGO - Photos produits MOOV</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', color: 'var(--jofe-blue-medium)' }}>08:15:20</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-green)' }}>825,333 FCFA</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-light)' }}>Tâches En Cours (3)</h4>
                
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Animation logo</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(55, 182, 233, 0.1)', color: 'var(--jofe-blue-light)' }}>En cours</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Bientama PARÉ - Motion design logo</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontFamily: 'Inter', fontWeight: '600', color: 'var(--jofe-blue-medium)', animation: 'pulse 2s ease-in-out infinite' }}>
                      {activeTimers['activeTimer1']}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'var(--jofe-orange)', color: 'var(--jofe-white)', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Pause</button>
                      <button style={{ background: 'var(--jofe-green)', color: 'var(--jofe-white)', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Stop</button>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Charte graphique</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(55, 182, 233, 0.1)', color: 'var(--jofe-blue-light)' }}>En cours</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Paul Junior OUEDRAOGO - Guidelines d'usage</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'Inter', fontWeight: '600', color: 'var(--jofe-blue-medium)' }}>03:12:18</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Play</button>
                      <button style={{ background: 'var(--jofe-green)', color: 'var(--jofe-white)', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}>Stop</button>
                    </div>
                  </div>
                </div>

                <h4 style={{ fontWeight: '600', marginBottom: '16px', marginTop: '24px', color: 'var(--jofe-orange)' }}>Tâches En Attente (2)</h4>
                
                <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h5 style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Campagne réseaux sociaux</h5>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: 'rgba(246, 140, 31, 0.1)', color: 'var(--jofe-orange)' }}>En attente</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', marginBottom: '8px' }}>Florita KABORÉ - Posts et stories</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Assigné à: Florita KABORÉ</span>
                    <button style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Démarrer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'budget':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                Budget Prévisionnel
              </h3>
              
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--jofe-gray)', borderRadius: '8px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Budget Total</div>
                    <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Alloué par MOOV AFRICA</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{formatCurrency(projectData.budget)}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--jofe-gray)', borderRadius: '8px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Coût Réalisé</div>
                    <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Tâches terminées</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--jofe-green)' }}>{formatCurrency(projectData.spent)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--jofe-green)' }}>65% du budget</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--jofe-gray)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Budget Restant</div>
                    <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Disponible</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--jofe-blue-light)' }}>{formatCurrency(projectData.remaining)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>35% restant</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>Répartition par Membre</h4>
                <div style={{ height: '300px' }}>
                  <Doughnut data={budgetChartData} options={budgetChartOptions} />
                </div>
              </div>
            </div>
            
            <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                Détail des Coûts
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                {[
                  { name: 'Serge ASSALÉ', hours: 32, rate: 15000, total: 480000 },
                  { name: 'Paul Junior OUEDRAOGO', hours: 127, rate: 8000, total: 1016000 },
                  { name: 'Fortune YANOGO', hours: 82, rate: 10000, total: 820000 },
                  { name: 'Bientama PARÉ', hours: 95, rate: 9000, total: 855000 },
                  { name: 'Linda KABORÉ', hours: 45, rate: 9500, total: 427500 }
                ].map((member, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.05)', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>{member.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>{member.hours}h × {formatCurrency(member.rate)}</div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)' }}>{formatCurrency(member.total)}</div>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid var(--jofe-gray)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)' }}>Total Coûts Équipe</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--jofe-green)' }}>{formatCurrency(3598500)}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Autres frais (matériel, etc.)</div>
                  <div style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)' }}>{formatCurrency(1921500)}</div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--jofe-gray)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--jofe-blue-deep)' }}>TOTAL RÉALISÉ</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--jofe-green)' }}>{formatCurrency(projectData.spent)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'files':
        return (
          <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', color: 'var(--jofe-blue-deep)' }}>
                Fichiers du Projet
              </h3>
              <button style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Uploader
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>Documents Client</h4>
                
                {[
                  { name: 'Brief_MOOV_AFRICA_2024.pdf', size: '2.4 MB', date: '15 Nov 2024', color: 'var(--jofe-orange)' },
                  { name: 'Charte_Existante_MOOV.pdf', size: '5.8 MB', date: '15 Nov 2024', color: 'var(--jofe-orange)' },
                  { name: 'References_Visuelles.zip', size: '28.5 MB', date: '16 Nov 2024', color: 'var(--jofe-blue-light)' }
                ].map((file, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--jofe-gray)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${file.color === 'var(--jofe-orange)' ? '246, 140, 31' : '55, 182, 233'}, 0.1)` }}>
                      <svg style={{ width: '20px', height: '20px', color: file.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>{file.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>{file.size} - Ajouté le {file.date}</div>
                    </div>
                    <button style={{ background: 'var(--jofe-white)', color: 'var(--jofe-blue-medium)', border: '1px solid var(--jofe-gray)', padding: '8px 12px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>Créations & Livrables</h4>
                
                {[
                  { name: 'Logo_MOOV_Final.ai', size: '15.2 MB', date: '22 Nov 2024', status: 'final' },
                  { name: 'Declinaisons_Logo.zip', size: '42.7 MB', date: '22 Nov 2024', status: 'final' },
                  { name: 'Animation_Logo_WIP.mp4', size: '125.3 MB', date: 'En cours', status: 'wip' },
                  { name: 'Photos_Produits_HD.zip', size: '89.4 MB', date: '20 Nov 2024', status: 'final' }
                ].map((file, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--jofe-gray)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: file.status === 'final' ? 'rgba(147, 201, 84, 0.1)' : 'rgba(55, 182, 233, 0.1)' }}>
                      <svg style={{ width: '20px', height: '20px', color: file.status === 'final' ? 'var(--jofe-green)' : 'var(--jofe-blue-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={file.name.includes('.mp4') ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"}></path>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>{file.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>{file.size} - {file.date}</div>
                    </div>
                    <button style={{ background: file.status === 'wip' ? 'var(--jofe-orange)' : 'var(--jofe-white)', color: file.status === 'wip' ? 'var(--jofe-white)' : 'var(--jofe-blue-medium)', border: file.status === 'wip' ? 'none' : '1px solid var(--jofe-gray)', padding: '8px 12px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                      {file.status === 'wip' ? 'Aperçu' : 'Télécharger'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                Discussion Projet
              </h3>
              
              <div style={{ marginBottom: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.02)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--jofe-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)', fontWeight: '600' }}>
                    SA
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Serge ASSALÉ</span>
                      <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>Il y a 2 heures</span>
                    </div>
                    <p style={{ color: 'var(--jofe-blue-deep)', fontSize: '14px' }}>
                      Excellente progression sur le logo ! Paul, pourrais-tu préparer les déclinaisons pour les supports print ?
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.02)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--jofe-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)', fontWeight: '600' }}>
                    PO
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Paul Junior OUEDRAOGO</span>
                      <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>Il y a 1 heure</span>
                    </div>
                    <p style={{ color: 'var(--jofe-blue-deep)', fontSize: '14px' }}>
                      Parfait ! Je commence les déclinaisons cet après-midi. Le client va adorer les nouvelles couleurs.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.02)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--jofe-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)', fontWeight: '600' }}>
                    BP
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Bientama PARÉ</span>
                      <span style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>Il y a 30 minutes</span>
                    </div>
                    <p style={{ color: 'var(--jofe-blue-deep)', fontSize: '14px' }}>
                      L'animation du logo avance bien ! Premier rendu dans 2 heures pour validation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--jofe-gray)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--jofe-blue-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)', fontWeight: '600' }}>
                    SA
                  </div>
                  <div style={{ flex: 1 }}>
                    <textarea 
                      placeholder="Ajouter un commentaire..."
                      style={{ width: '100%', padding: '12px', border: '1px solid var(--jofe-gray)', borderRadius: '8px', fontFamily: 'Open Sans', resize: 'vertical', minHeight: '80px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
                        Publier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ background: 'var(--jofe-white)', border: '1px solid var(--jofe-gray)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--jofe-blue-deep)' }}>
                Activité Récente
              </h3>
              
              <div>
                {[
                  { user: 'Paul Junior OUEDRAOGO', action: 'a téléchargé', item: 'Logo_MOOV_Final.ai', time: 'Il y a 1 heure', type: 'upload' },
                  { user: 'Bientama PARÉ', action: 'a démarré', item: 'Animation logo', time: 'Il y a 2 heures', type: 'task' },
                  { user: 'Fortune YANOGO', action: 'a terminé', item: 'Shooting produits', time: 'Il y a 1 jour', type: 'completed' },
                  { user: 'Linda KABORÉ', action: 'a ajouté un commentaire sur', item: 'Recherche références', time: 'Il y a 2 jours', type: 'comment' }
                ].map((activity, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.02)', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: activity.type === 'completed' ? 'var(--jofe-green)' : activity.type === 'upload' ? 'var(--jofe-blue-light)' : 'var(--jofe-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jofe-white)' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                          activity.type === 'completed' ? "M5 13l4 4L19 7" :
                          activity.type === 'upload' ? "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" :
                          activity.type === 'comment' ? "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" :
                          "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        }></path>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: 'var(--jofe-blue-deep)' }}>
                        <span style={{ fontWeight: '500' }}>{activity.user}</span> {activity.action} <span style={{ fontWeight: '500' }}>{activity.item}</span>
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', background: 'var(--jofe-white)', color: 'var(--jofe-black)', lineHeight: '1.6', minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      <div style={{ display: isMobileMenuOpen ? 'block' : 'none', position: 'fixed', top: '16px', left: '16px', zIndex: 50 }} className="md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ padding: '8px', borderRadius: '8px', background: 'var(--jofe-blue-light)', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

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
              <h1 style={{ fontFamily: 'Inter', fontSize: '20px', color: 'var(--jofe-blue-deep)', margin: 0 }}>
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
            
            <Link href="/time-tracking" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Chronométrage
            </Link>
            
            <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-white)', background: 'var(--jofe-blue-light)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Projets
            </Link>
            
            <Link href="/team" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              Équipe
            </Link>
            
            <Link href="/clients" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
              </svg>
              Clients
            </Link>
            
            <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Analytics
            </Link>
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
        {/* Project Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <h1 style={{ fontFamily: 'Inter', fontSize: '48px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                  {projectData.name}
                </h1>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', background: 'rgba(55, 182, 233, 0.1)', color: 'var(--jofe-blue-light)' }}>
                  {projectData.status}
                </span>
              </div>
              <p style={{ fontSize: '18px', color: 'var(--jofe-blue-medium)', marginBottom: '16px' }}>{projectData.description}</p>
              
              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-blue-deep)' }}>Progression du projet</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--jofe-blue-light)' }}>{projectData.progress}%</span>
                </div>
                <div style={{ background: 'var(--jofe-gray)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--jofe-blue-light)', height: '100%', borderRadius: '10px', width: `${projectData.progress}%`, transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
              
              {/* KPIs Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{formatCurrency(projectData.budget)}</div>
                  <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Budget (FCFA)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{projectData.daysLeft}</div>
                  <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Jours restants</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)' }}>{projectData.activeMembers}</div>
                  <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Membres actifs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-green)' }}>{projectData.completedTasks}/{projectData.totalTasks}</div>
                  <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Tâches</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button style={{ background: 'var(--jofe-white)', color: 'var(--jofe-blue-medium)', border: '1px solid var(--jofe-gray)', padding: '10px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Modifier
              </button>
              <button style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                Partager
              </button>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--jofe-gray)', padding: '0 24px' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'tasks', label: 'Tâches' },
              { id: 'budget', label: 'Budget' },
              { id: 'files', label: 'Fichiers' },
              { id: 'collaboration', label: 'Collaboration' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: 'none',
                  color: activeTab === tab.id ? 'var(--jofe-blue-light)' : 'var(--jofe-blue-medium)',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid var(--jofe-blue-light)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  fontWeight: '500'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <main style={{ padding: '24px' }}>
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            {renderTabContent()}
          </div>
        </main>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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

export default ProjectDetail;