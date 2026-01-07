-- Migration: Suppression du champ hourly_rate de la table team_members
-- Date: 2026-01-03

ALTER TABLE team_members DROP COLUMN hourly_rate;
