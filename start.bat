@echo off
title AKILI - Lanceur du Projet
color 0A

echo ============================================
echo         AKILI - Gestionnaire de Projet
echo ============================================
echo.

:MENU
echo Choisissez une option:
echo.
echo   [1] Demarrer le serveur de developpement
echo   [2] Installer les dependances (npm install)
echo   [3] Construire le projet (build)
echo   [4] Demarrer en production
echo   [5] Migrer la base de donnees
echo   [6] Seeder la base de donnees
echo   [7] Reset complet de la base de donnees
echo   [8] Ouvrir Drizzle Studio
echo   [9] Verifier le TypeScript
echo   [0] Quitter
echo.

set /p choix="Votre choix: "

if "%choix%"=="1" goto DEV
if "%choix%"=="2" goto INSTALL
if "%choix%"=="3" goto BUILD
if "%choix%"=="4" goto PROD
if "%choix%"=="5" goto MIGRATE
if "%choix%"=="6" goto SEED
if "%choix%"=="7" goto RESET
if "%choix%"=="8" goto STUDIO
if "%choix%"=="9" goto CHECK
if "%choix%"=="0" goto FIN

echo Option invalide. Reessayez.
echo.
goto MENU

:DEV
echo.
echo Demarrage du serveur de developpement...
echo Acces: http://localhost:5000
echo.
npm run dev
goto MENU

:INSTALL
echo.
echo Installation des dependances...
echo.
npm install
echo.
echo Installation terminee!
pause
goto MENU

:BUILD
echo.
echo Construction du projet...
echo.
npm run build
echo.
echo Build termine!
pause
goto MENU

:PROD
echo.
echo Demarrage en mode production...
echo.
npm run start
goto MENU

:MIGRATE
echo.
echo Migration de la base de donnees...
echo.
npm run db:migrate
echo.
echo Migration terminee!
pause
goto MENU

:SEED
echo.
echo Seeding de la base de donnees...
echo.
npm run db:seed
echo.
echo Seeding termine!
pause
goto MENU

:RESET
echo.
echo Reset complet de la base de donnees (migrate + seed)...
echo.
npm run db:reset
echo.
echo Reset termine!
pause
goto MENU

:STUDIO
echo.
echo Ouverture de Drizzle Studio...
echo.
npm run db:studio
goto MENU

:CHECK
echo.
echo Verification TypeScript...
echo.
npm run check
echo.
pause
goto MENU

:FIN
echo.
echo Au revoir!
exit
