# Deployment Anleitung

## GitHub Container Registry Setup

### 1. GitHub Repository erstellen

```bash
git init
git add .
git commit -m "Initial commit: Wurm-KI PDF Viewer"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### 2. GitHub Package Visibility einstellen

Nach dem ersten Push:

1. Gehe zu deinem GitHub Repository
2. Klicke auf "Packages" (rechte Seite)
3. Klicke auf dein Package (supabasedocsviewer)
4. Gehe zu "Package settings"
5. Unter "Danger Zone" → "Change visibility" → **Public** setzen (damit Coolify ohne Auth zugreifen kann)

### 3. Automatischer Build

Sobald du zu GitHub pushst:
- GitHub Actions startet automatisch
- Baut das Docker Image
- Pusht es zu `ghcr.io/USERNAME/supabasedocsviewer:latest`
- Du kannst den Build-Status unter "Actions" in GitHub sehen

## Deployment auf Coolify

### Variante 1: Docker Compose (Empfohlen)

1. **Auf dem Coolify Server:**

```bash
# Repository clonen
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY

# Warte bis GitHub Actions das Image gebaut hat (1-2 Minuten)

# Mit Production Compose starten
docker-compose -f docker-compose.prod.yml up -d
```

2. **Image-Namen anpassen in `docker-compose.prod.yml`:**
   - Ersetze `USERNAME` mit deinem GitHub Username
   - Z.B.: `ghcr.io/ruben/supabasedocsviewer:latest`

### Variante 2: Coolify GUI

1. **In Coolify ein neues Projekt erstellen:**
   - Klicke auf "New Resource" → "Application"
   - Wähle "Docker Image"

2. **Image konfigurieren:**
   - Image: `ghcr.io/USERNAME/supabasedocsviewer:latest`
   - Port: `80` (intern)

3. **Umgebungsvariablen setzen:**
   ```
   VITE_SUPABASE_URL=http://supabasekong-b484gk8g4k80go88s8k8ocko.138.199.215.24.sslip.io
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   VITE_SUPABASE_BUCKET_NAME=fulldocs
   ```

4. **Port Mapping:**
   - Interner Port: `80`
   - Externer Port: `5555` (oder deine Wahl)

5. **Deploy:**
   - Klicke auf "Deploy"
   - Coolify pullt das Image und startet den Container

### Variante 3: Manuell mit Docker

```bash
# Image pullen
docker pull ghcr.io/USERNAME/supabasedocsviewer:latest

# Container starten
docker run -d \
  -p 5555:80 \
  -e VITE_SUPABASE_URL=http://supabasekong-b484gk8g4k80go88s8k8ocko.138.199.215.24.sslip.io \
  -e VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... \
  -e VITE_SUPABASE_BUCKET_NAME=fulldocs \
  --name wurm-ki-viewer \
  --restart unless-stopped \
  ghcr.io/USERNAME/supabasedocsviewer:latest
```

## Updates deployen

### 1. Code ändern und pushen

```bash
git add .
git commit -m "Update feature XYZ"
git push
```

### 2. Warten auf Build (1-2 Minuten)

GitHub Actions baut automatisch ein neues Image mit dem Tag `latest`

### 3. Auf Coolify/Server aktualisieren

**Mit Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

**Mit Docker:**
```bash
docker pull ghcr.io/USERNAME/supabasedocsviewer:latest
docker stop wurm-ki-viewer
docker rm wurm-ki-viewer
# Dann docker run command von oben wiederholen
```

**In Coolify GUI:**
- Klicke auf "Redeploy" (Coolify pullt automatisch das neueste Image)

## Troubleshooting

### Problem: "Error response from daemon: pull access denied"

**Lösung:** Package ist auf "Private" gesetzt
1. Gehe zu GitHub → Packages → dein Package
2. Package Settings → Change visibility → **Public**

### Problem: GitHub Actions Build schlägt fehl

**Lösung:** Checke die Logs
1. GitHub Repository → Actions Tab
2. Klicke auf den fehlgeschlagenen Workflow
3. Checke die Logs für Fehlermeldungen

### Problem: Container startet nicht

**Lösung:** Checke Container Logs
```bash
docker logs wurm-ki-viewer
```

## Wichtige URLs

- App: `http://deine-ip:5555`
- GitHub Packages: `https://github.com/USERNAME?tab=packages`
- GitHub Actions: `https://github.com/USERNAME/REPOSITORY/actions`
