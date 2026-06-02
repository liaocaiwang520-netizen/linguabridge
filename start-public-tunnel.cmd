@echo off
set "APP_DIR=%~dp0"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
set "CLOUDFLARED_EXE=%APP_DIR%cloudflared.exe"
cd /d "%APP_DIR%"

if not exist "%CLOUDFLARED_EXE%" (
  echo cloudflared.exe was not found in:
  echo %APP_DIR%
  echo Please ask Codex to download cloudflared again.
  pause
  exit /b 1
)

echo Starting local website on http://127.0.0.1:4173 ...
start "LionLingo Preview" cmd /k ""%NODE_EXE%" "%APP_DIR%preview-server.js""

echo Starting public Cloudflare Tunnel ...
echo Look for a line like: https://xxxx.trycloudflare.com
echo Keep this window open while using the public link.
"%CLOUDFLARED_EXE%" tunnel --url http://127.0.0.1:4173
pause
