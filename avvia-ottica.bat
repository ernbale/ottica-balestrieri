@echo off
title Gestionale Ottica Balestrieri
color 0A

echo.
echo ========================================
echo   GESTIONALE OTTICA BALESTRIERI
echo ========================================
echo.
echo Avvio del server di sviluppo...
echo.
echo Una volta avviato, apri il browser:
echo   http://localhost:3001
echo.
echo Per fermare il server: CTRL+C
echo ========================================
echo.

cd /d "C:\Users\Pc Soggiorno\ottica-balestrieri"
npm run dev

pause
