-- Script d'insertion des utilisateurs Jo'Fé Digital
-- Mot de passe par défaut: jofe2024 (hashé avec bcrypt)
-- Hash bcrypt pour 'jofe2024': $2a$10$8K1p/a0dR1xqM8K3hVq8e.Vr7tA1p5b2c3d4e5f6g7h8i9j0k1l2m3

-- Note: Le hash ci-dessous est valide pour bcrypt avec le mot de passe 'jofe2024'
SET @default_password = '$2b$10$KL.kHQLRq53yBIl9MyphQeuE6n8boqIFrvwpeKwPgl5HO.bd7cdiC';

-- Vider les tables existantes (attention: supprime toutes les données!)
DELETE FROM permissions;
DELETE FROM channel_members;
DELETE FROM chat_channels;
DELETE FROM settings;
DELETE FROM clients;
DELETE FROM team_members;

-- Insérer les administrateurs
INSERT INTO team_members (id, name, role, department, username, password, is_admin, hourly_rate, skills, email, avatar, status, created_at, updated_at)
VALUES
(UUID(), 'Serge ASSALÉ', 'Directeur Création & Marketing', 'Direction', 'serge.assale', @default_password, TRUE, '15000', '["Stratégie", "Direction artistique", "Management"]', 'serge@jofedigital.com', 'SA', 'offline', NOW(), NOW()),
(UUID(), 'Enos GOUBA', 'Coordinateur Production', 'Production', 'enos.gouba', @default_password, TRUE, '12000', '["Coordination", "Planning", "Production"]', 'enos@jofedigital.com', 'EG', 'offline', NOW(), NOW());

-- Insérer l'équipe créative
INSERT INTO team_members (id, name, role, department, username, password, is_admin, hourly_rate, skills, email, avatar, status, created_at, updated_at)
VALUES
(UUID(), 'Paul Junior OUEDRAOGO', 'Graphiste Photomonteur', 'Création', 'paul.ouedraogo', @default_password, FALSE, '8000', '["Photoshop", "Photomontage", "Retouche"]', NULL, 'PO', 'offline', NOW(), NOW()),
(UUID(), 'Fortune YANOGO', 'Photographe/Vidéaste', 'Création', 'fortune.yanogo', @default_password, FALSE, '10000', '["Photographie", "Vidéo", "Éclairage"]', NULL, 'FY', 'offline', NOW(), NOW()),
(UUID(), 'Bientama PARÉ', 'Motion Designer', 'Création', 'bientama.pare', @default_password, FALSE, '9000', '["After Effects", "Animation", "Motion"]', NULL, 'BP', 'offline', NOW(), NOW()),
(UUID(), 'Issa CISSE', 'Graphiste Junior', 'Création', 'issa.cisse', @default_password, FALSE, '6000', '["Design graphique", "Illustration"]', NULL, 'IC', 'offline', NOW(), NOW()),
(UUID(), 'Jean-Jacques SAMPABAO', 'Directeur Artistique Junior', 'Création', 'jean.sampabao', @default_password, FALSE, '8500', '["Direction artistique", "Concept", "Brand Design"]', NULL, 'JS', 'offline', NOW(), NOW()),
(UUID(), 'Abdoul Latif OUEDRAOGO', 'Designer UI/UX', 'Création', 'latif.ouedraogo', @default_password, FALSE, '9500', '["UI/UX", "Figma", "Prototypage"]', NULL, 'AO', 'offline', NOW(), NOW());

-- Insérer l'équipe Communication & Marketing
INSERT INTO team_members (id, name, role, department, username, password, is_admin, hourly_rate, skills, email, avatar, status, created_at, updated_at)
VALUES
(UUID(), 'Florita KABORÉ', 'Responsable Médias Sociaux', 'Communication', 'florita.kabore', @default_password, FALSE, '7500', '["Social Media", "Ads", "Analytics"]', NULL, 'FK', 'offline', NOW(), NOW()),
(UUID(), 'Nebié WEBOU', 'Chef de Pub/Concepteur Rédacteur', 'Communication', 'nebie.webou', @default_password, FALSE, '8500', '["Rédaction", "Concept", "Stratégie"]', NULL, 'NW', 'offline', NOW(), NOW()),
(UUID(), 'Djamilatou GUIGUEMDE', 'Chef de Pub Stagiaire', 'Communication', 'djamilatou.guiguemde', @default_password, FALSE, '5000', '["Conception pub", "Recherche", "Analyse"]', NULL, 'DG', 'offline', NOW(), NOW()),
(UUID(), 'Linda KABORÉ', 'Conceptrice Rédactrice Lead', 'Communication', 'linda.kabore', @default_password, FALSE, '9500', '["Rédaction", "Concept", "Stratégie"]', NULL, 'LK', 'offline', NOW(), NOW()),
(UUID(), 'Maryse BOMBIRI', 'Community Manager', 'Communication', 'maryse.bombiri', @default_password, FALSE, '6500', '["Community", "Content", "Engagement"]', NULL, 'MB', 'offline', NOW(), NOW()),
(UUID(), 'Faridatou BARRY', 'Chef de Pub/CM', 'Communication', 'faridatou.barry', @default_password, FALSE, '7000', '["Chef de Pub", "Community", "Stratégie"]', NULL, 'FB', 'offline', NOW(), NOW());

-- Créer les permissions pour chaque membre
INSERT INTO permissions (id, member_id, can_view_all_tasks, can_edit_all_tasks, can_delete_tasks, can_view_all_projects, can_edit_all_projects, can_manage_clients, can_manage_team, can_view_analytics, can_manage_permissions, can_export_data, daily_hour_limit, max_overtime_hours, created_at, updated_at)
SELECT UUID(), id, is_admin, is_admin, is_admin, is_admin, is_admin, is_admin, is_admin, is_admin, is_admin, is_admin, 8, 4, NOW(), NOW()
FROM team_members;

-- Créer le canal général
INSERT INTO chat_channels (id, name, description, type, is_private, created_by, created_at, updated_at)
SELECT UUID(), 'Général', 'Canal de discussion générale de l''équipe Jo''Fé Digital', 'general', FALSE, id, NOW(), NOW()
FROM team_members WHERE is_admin = TRUE LIMIT 1;

-- Ajouter tous les membres au canal général
INSERT INTO channel_members (id, channel_id, member_id, role, joined_at)
SELECT UUID(), (SELECT id FROM chat_channels WHERE name = 'Général' LIMIT 1), id, CASE WHEN is_admin THEN 'admin' ELSE 'member' END, NOW()
FROM team_members;

-- Insérer les paramètres système
INSERT INTO settings (id, `key`, value, category, created_at, updated_at)
VALUES
(UUID(), 'auto_start_timers', 'true', 'timers', NOW(), NOW()),
(UUID(), 'background_timers', 'true', 'timers', NOW(), NOW()),
(UUID(), 'deadline_alerts', 'true', 'notifications', NOW(), NOW()),
(UUID(), 'strict_mode', 'false', 'permissions', NOW(), NOW()),
(UUID(), 'daily_limit_hours', '8', 'timers', NOW(), NOW()),
(UUID(), 'mandatory_break_minutes', '60', 'timers', NOW(), NOW()),
(UUID(), 'overtime_multiplier', '1.5', 'timers', NOW(), NOW()),
(UUID(), 'company_name', '"Jo''Fé Digital"', 'general', NOW(), NOW()),
(UUID(), 'currency', '"FCFA"', 'general', NOW(), NOW());

-- Insérer quelques clients
INSERT INTO clients (id, name, type, monthly_budget, satisfaction, is_active, created_at, updated_at)
VALUES
(UUID(), 'MOOV AFRICA', 'Télécommunications', '2500000', '4.9', TRUE, NOW(), NOW()),
(UUID(), 'BANK OF AFRICA', 'Services Financiers', '1800000', '4.7', TRUE, NOW(), NOW()),
(UUID(), 'VINCENT & ASSOCIES', 'Cabinet d''Avocats', '650000', '4.8', TRUE, NOW(), NOW()),
(UUID(), 'ANEREE', 'Énergie', '450000', '4.5', TRUE, NOW(), NOW()),
(UUID(), 'JO''FE DIGITAL', 'Marketing Digital', '300000', '5.0', TRUE, NOW(), NOW()),
(UUID(), 'ORANGE BURKINA', 'Télécommunications', '2200000', '4.6', TRUE, NOW(), NOW()),
(UUID(), 'CORIS BANK', 'Services Financiers', '1500000', '4.8', TRUE, NOW(), NOW()),
(UUID(), 'ONATEL', 'Télécommunications', '1800000', '4.4', TRUE, NOW(), NOW()),
(UUID(), 'SONABEL', 'Énergie', '900000', '4.3', TRUE, NOW(), NOW()),
(UUID(), 'TOTAL BURKINA', 'Pétrole & Gaz', '1200000', '4.5', TRUE, NOW(), NOW());

SELECT 'Seed terminé avec succès!' AS message;
SELECT COUNT(*) AS 'Nombre de membres' FROM team_members;
