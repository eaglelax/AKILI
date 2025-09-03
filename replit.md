# Jo'Fé Digital Team Management System

## Overview

Jo'Fé Digital is a comprehensive team management system designed for a marketing and creative agency in Burkina Faso. The application provides real-time task tracking with automated timekeeping, project management, team collaboration, client relationship management, and performance analytics. The system is built as a web-based platform supporting up to 14 concurrent users with role-based access control, featuring a French interface with FCFA currency formatting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query v5 for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Jo'Fé Digital brand colors (turquoise primary, orange secondary)
- **Real-time Communication**: WebSocket integration for live updates and chat functionality
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Dual authentication system (Replit OAuth + custom team login)
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Features**: WebSocket server for live collaboration and chat
- **Password Security**: bcryptjs for password hashing and verification

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle with migrations support for schema management
- **Key Tables**: 
  - Users (Replit auth integration)
  - Team members with role-based permissions
  - Tasks with automated time tracking
  - Projects with client associations
  - Clients with revenue tracking
  - Time entries for precise time management
  - Chat system with channels and messages
  - Performance metrics and analytics

### Authentication & Authorization
- **Dual Auth System**: Replit OAuth for development + custom team authentication
- **Role-Based Access**: Two-tier system (Admin: Serge ASSALÉ & Enos GOUBA, Members: 12 others)
- **Password Strategy**: Standard password "jofe2024" for members, separate admin password
- **Session Security**: HTTP-only cookies with PostgreSQL session storage

### Real-time Features
- **WebSocket Implementation**: Custom WebSocket server on `/ws` path
- **Live Updates**: Task status changes, timer updates, team member presence
- **Chat System**: Real-time messaging with channels and direct messages
- **Collaboration**: Concurrent editing with conflict resolution
- **Presence Tracking**: Online/offline status for team members

### Time Tracking System
- **Automatic Timers**: Background timers that persist across browser sessions
- **Permission Model**: Members can only control their own task timers
- **Admin Controls**: Admins can manage any timer and modify time entries
- **Precision Tracking**: Second-level accuracy with database persistence

## Pages Architecture (100 Pages Total)

### 🔐 AUTHENTIFICATION & SÉCURITÉ
- Page 1 - Page de connexion avec sélection utilisateur ✅
- Page 2 - Tableau de bord d'accueil personnalisé par rôle
- Page 3 - Gestion des profils utilisateurs et permissions ✅

### ⏱️ CHRONOMÉTRAGE & TÂCHES
- Page 4 - Gestion des tâches avec chronométrage automatique ✅
- Page 5 - Vue détaillée d'une tâche avec timer ✅
- Page 6 - Historique des temps de travail par membre ✅
- Page 7 - Configuration des permissions de chronométrage ✅

### 📊 ANALYTICS & REPORTING
- Page 8 - Dashboard analytics principal avec KPIs ✅
- Page 9 - Rapports détaillés (2 semaines, mensuel, trimestriel) ✅
- Page 10 - Graphiques pour présentations CODIR
- Page 11 - Analyse productivité par membre/équipe ✅
- Page 12 - ROI et rentabilité par client/projet ✅

### 📋 GESTION DE PROJETS
- Page 13 - Liste des projets actifs/terminés
- Page 14 - Création/édition de projet
- Page 15 - Vue détaillée d'un projet
- Page 16 - Diagramme de Gantt interactif
- Page 17 - Templates de projets pré-configurés
- Page 18 - Workflow d'approbation et jalons
- Page 19 - Gestion des dépendances entre tâches

### 👥 GESTION D'ÉQUIPE
- Page 20 - Vue d'ensemble de l'équipe (14 membres) ✅
- Page 21 - Profil détaillé d'un membre
- Page 22 - Calendrier partagé et disponibilités
- Page 23 - Gestion des congés et absences
- Page 24 - Compétences et formations par membre
- Page 25 - Évaluation de performance mensuelle
- Page 26 - Attribution automatique des tâches

### 💼 GESTION CLIENTS
- Page 27 - Portfolio des 33 clients
- Page 28 - Profil détaillé d'un client
- Page 29 - Historique complet par client
- Page 30 - Ajout/modification de client
- Page 31 - Satisfaction client et feedback
- Page 32 - Pipeline commercial et prospects
- Page 33 - Contrats et budgets annuels

### 💬 COMMUNICATION & COLLABORATION
- Page 34 - Chat intégré par projet
- Page 35 - Centre de notifications
- Page 36 - Système de @mentions
- Page 37 - Partage de fichiers par projet
- Page 38 - Validation en ligne des créations
- Page 39 - Historique des modifications
- Page 40 - Commentaires détaillés sur tâches

### 🎨 SPÉCIFICITÉS CRÉATIVES
- Page 41 - Banque d'assets centralisée
- Page 42 - Portfolio et galerie projets
- Page 43 - Suivi des versions créatives
- Page 44 - Validation créative avec annotations
- Page 45 - Planning de production détaillée
- Page 46 - Suivi du matériel créatif
- Page 47 - Métriques créatives et impact

### 💰 FINANCE & FACTURATION
- Page 48 - Tableau de bord financier
- Page 49 - Gestion des devis
- Page 50 - Gestion des factures
- Page 51 - Suivi des paiements
- Page 52 - Calcul automatique des marges
- Page 53 - Prévisionnel CA par période
- Page 54 - Budget vs réalisé temps réel
- Page 55 - Alertes dépassement budget

### 🧠 BUSINESS INTELLIGENCE
- Page 56 - Dashboard CEO/Direction synthétique
- Page 57 - Analyse concurrentielle
- Page 58 - Prédictions tendances marché
- Page 59 - Optimisation des ressources
- Page 60 - Analyse des risques projets
- Page 61 - KPIs personnalisables
- Page 62 - Reporting réglementaire automatisé

### 🏆 AGENT DU MOIS
- Page 63 - Système de scoring avec 8 critères
- Page 64 - Classement mensuel complet
- Page 65 - Évaluation détaillée par membre
- Page 66 - Historique des performances
- Page 67 - Système de récompenses

### ⚙️ ADMINISTRATION & CONFIGURATION
- Page 68 - Panneau d'administration (ADMIN uniquement)
- Page 69 - Gestion des membres d'équipe
- Page 70 - Configuration des taux horaires
- Page 71 - Paramètres système
- Page 72 - Audit trail et logs
- Page 73 - Sauvegarde et restauration
- Page 74 - Import/Export données massives

### 📱 INTERFACES MOBILES
- Page 75 - Dashboard mobile optimisé
- Page 76 - Gestion tâches mobile
- Page 77 - Chat mobile
- Page 78 - Notifications push mobile

### 🔧 OUTILS TECHNIQUES
- Page 79 - API intégrations (Adobe, Slack, Google Drive)
- Page 80 - Mode hors-ligne avec synchronisation
- Page 81 - Exports multi-formats
- Page 82 - Sécurité avancée et chiffrement

### 📅 PLANIFICATION & CALENDRIER
- Page 83 - Vue calendrier globale
- Page 84 - Planning hebdomadaire
- Page 85 - Réservation de ressources
- Page 86 - Gestion des deadlines

### 📈 TABLEAUX DE BORD SPÉCIALISÉS
- Page 87 - Dashboard créatif pour designers
- Page 88 - Dashboard commercial pour chefs de pub
- Page 89 - Dashboard production pour coordinateurs
- Page 90 - Dashboard RH pour gestion équipe

### 🔍 RECHERCHE & FILTRES
- Page 91 - Recherche globale avancée
- Page 92 - Filtres multi-critères
- Page 93 - Historique des recherches

### 📊 EXPORTS & IMPRESSIONS
- Page 94 - Centre d'export
- Page 95 - Templates de rapports
- Page 96 - Générateur de PDF

### 🎯 PAGES SPÉCIALES
- Page 97 - Page d'erreur 404 personnalisée
- Page 98 - Page de maintenance
- Page 99 - Aide et documentation
- Page 100 - À propos et crédits

## External Dependencies

### Database & Hosting
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **@radix-ui/***: Comprehensive accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework for consistent styling
- **class-variance-authority**: Type-safe variant handling for components
- **lucide-react**: Modern icon library with consistent design

### Development & Build
- **vite**: Fast build tool with hot module replacement
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Real-time & Communication
- **ws**: WebSocket library for real-time bidirectional communication
- **@tanstack/react-query**: Powerful data fetching and caching library

### Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for form integration
- **zod**: TypeScript-first schema validation library

### Utilities & Security
- **bcryptjs**: Password hashing and verification
- **date-fns**: Modern date utility library for French localization
- **memoizee**: Function memoization for performance optimization