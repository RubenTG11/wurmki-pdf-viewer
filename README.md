# Wurm-KI PDF Viewer

Eine moderne Webanwendung zum Anzeigen, Betrachten und Herunterladen von PDF-Dokumenten aus einem Supabase Storage Bucket mit Email/Passwort-Authentifizierung und Admin-Panel.

## Features

- **Authentifizierung**: Registrierung und Login mit Email/Passwort über Supabase Auth
- **Admin-System**: Rollenbasierte Zugriffskontrolle mit User- und Admin-Rollen
- **Approval-Workflow**: Neue Benutzer müssen von Admins genehmigt werden
- **PDF-Bibliothek**: Übersichtliche Grid-Ansicht aller PDFs aus dem Supabase Storage Bucket
- **Pagination**: Anpassbare Seitengröße (5, 10 oder 25 PDFs pro Seite)
- **PDF-Anzeige**: PDFs öffnen sich in neuem Browser-Tab
- **Download**: PDFs direkt herunterladen
- **AI-Testfragen**: Generiere automatisch Testfragen mit OpenAI GPT-4.1-nano basierend auf Dokumentinhalten
- **Rate Limiting**: 5 Testfragen-Generierungen pro Stunde pro Benutzer
- **Markdown Support**: Vollständige Markdown-Unterstützung für Fragen/Antworten (Tabellen, Bilder, Code)
- **Dark Theme**: Modernes dunkles Design mit Wurm-KI Branding (Emerald/Teal Farbschema)
- **Responsive Design**: Optimiert für Desktop und Mobile mit Tailwind CSS
- **Session Persistence**: Automatischer Login bei Seiten-Reload

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication + Storage)
- **PDF-Rendering**: react-pdf + pdfjs-dist
- **Routing**: React Router v6
- **Icons**: react-icons

## Voraussetzungen

- Node.js (v18 oder höher empfohlen)
- npm oder yarn
- Supabase-Account mit konfiguriertem Projekt

## Installation

### 1. Repository klonen oder Dateien herunterladen

```bash
cd /media/ruben/Uni/SupabaseDocsViewer
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Erstelle eine `.env` Datei im Projekt-Root (basierend auf `.env.example`):

```bash
cp .env.example .env
```

Fülle die `.env` Datei mit deinen Supabase-Credentials:

```env
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
VITE_SUPABASE_BUCKET_NAME=fulldocs
```

**So findest du deine Supabase Credentials:**

1. Gehe zu [supabase.com](https://supabase.com) und öffne dein Projekt
2. Navigiere zu "Project Settings" → "API"
3. Kopiere:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## Supabase-Konfiguration

### 1. Authentication einrichten

1. Gehe zu "Authentication" → "Providers" in deinem Supabase Dashboard
2. Aktiviere "Email" als Authentication Provider
3. **Wichtig**: Deaktiviere Email-Bestätigung für automatische Freigabe:
   - Gehe zu "Authentication" → "Settings"
   - Unter "Email Auth" → deaktiviere "Enable email confirmations"

### 2. Datenbank-Tabelle erstellen

Erstelle die `user_profiles` Tabelle im SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON public.user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, is_approved)
  VALUES (NEW.id, NEW.email, 'user', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Ersten Admin-Benutzer erstellen

Nach der ersten Registrierung, erstelle einen Admin über den SQL Editor:

```sql
-- Finde deine User ID (ersetze 'deine-email@example.com' mit deiner Email)
SELECT id FROM auth.users WHERE email = 'deine-email@example.com';

-- Setze den Benutzer als Admin (ersetze 'USER_ID' mit der ID aus dem vorherigen Query)
UPDATE public.user_profiles
SET role = 'admin', is_approved = true
WHERE id = 'USER_ID';
```

### 4. Storage Bucket erstellen

1. Gehe zu "Storage" in deinem Supabase Dashboard
2. Erstelle einen neuen **Public** Bucket mit dem Namen `fulldocs`
3. Konfiguriere Bucket-Policies:

```sql
-- Public read access for all authenticated users
CREATE POLICY "Authenticated users can view PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fulldocs' AND auth.role() = 'authenticated');
```

4. Lade deine PDF-Dateien in den Bucket hoch

### 5. Rate Limiting für Testfragen einrichten

Führe das SQL-Script `setup-rate-limit.sql` im Supabase SQL Editor aus:

```sql
-- Kopiere und führe den Inhalt von setup-rate-limit.sql aus
```

Dieses Script erstellt:
- Tabelle `test_question_generations` für das Tracking
- RLS-Policies für Datenschutz
- Cleanup-Funktion für alte Einträge

## Entwicklung starten

```bash
npm run dev
```

Die Anwendung startet auf `http://localhost:3000` und öffnet sich automatisch im Browser.

## Build für Produktion

```bash
npm run build
```

Der optimierte Build wird im `dist/` Ordner erstellt.

## Projektstruktur

```
/media/ruben/Uni/SupabaseDocsViewer/
├── src/
│   ├── components/
│   │   ├── Auth/              # Login- und Registrierungsformulare
│   │   ├── PDFViewer/         # PDF-Anzeige-Komponenten
│   │   ├── Layout/            # Header, PrivateRoute
│   │   └── Common/            # Wiederverwendbare Komponenten
│   ├── contexts/              # React Context (Auth)
│   ├── hooks/                 # Custom Hooks (useAuth, usePDFs)
│   ├── lib/                   # Supabase Client
│   ├── pages/                 # Seiten-Komponenten
│   ├── utils/                 # Hilfsfunktionen und Konstanten
│   ├── App.jsx               # Haupt-App mit Routing
│   ├── main.jsx              # React Entry Point
│   └── index.css             # Tailwind CSS + Custom Styles
├── .env                      # Umgebungsvariablen (NICHT committen!)
├── .env.example              # Beispiel-Umgebungsvariablen
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Verwendung

### 1. Registrierung

1. Öffne die Anwendung
2. Klicke auf "Jetzt registrieren"
3. Gib Email und Passwort ein (min. 6 Zeichen)
4. Nach erfolgreicher Registrierung siehst du den Status "Warte auf Freigabe"
5. Ein Admin muss deinen Account genehmigen, bevor du Zugriff hast

### 2. Login

1. Gib deine Email und Passwort ein
2. Klicke auf "Anmelden"
3. Falls genehmigt: Du wirst zum Dashboard weitergeleitet
4. Falls nicht genehmigt: Du siehst eine Wartemeldung

### 3. PDFs anzeigen (Benutzer)

- **Grid-Ansicht**: Alle PDFs werden als Karten angezeigt
- **Pagination**: Wähle 5, 10 oder 25 PDFs pro Seite (Standard: 10)
- **PDF öffnen**: Klicke auf "Ansehen" um das PDF in neuem Tab zu öffnen
- **Download**: Klicke auf "Download" um das PDF herunterzuladen

### 4. Admin-Panel (nur für Admins)

Admins haben zusätzliche Funktionen:

- **Benutzerverwaltung**: Zugriff über "Admin Panel" in der Navigation
- **Benutzer genehmigen**: Klicke auf "Genehmigen" bei wartenden Benutzern
- **Genehmigung widerrufen**: Klicke auf "Widerrufen" bei genehmigten Benutzern
- **Benutzer löschen**: Lösche Benutzerprofile (mit Bestätigung)
- **Filter**: Zeige wartende, genehmigte oder alle Benutzer

### 5. Abmelden

Klicke auf den "Abmelden"-Button in der Header-Leiste

## Fehlerbehebung

### Problem: "Missing Supabase environment variables"

**Lösung**: Stelle sicher, dass die `.env` Datei existiert und alle erforderlichen Variablen enthält.

### Problem: PDFs werden nicht geladen

**Mögliche Ursachen:**
1. Bucket-Name in `.env` stimmt nicht mit dem tatsächlichen Bucket überein
2. Bucket ist nicht öffentlich oder Policies fehlen
3. Keine PDFs im Bucket vorhanden

**Lösung**:
- Überprüfe den Bucket-Namen in `.env`
- Stelle sicher, dass der Bucket öffentlich ist
- Überprüfe Storage Policies in Supabase

### Problem: Login funktioniert nicht

**Mögliche Ursachen:**
1. Email-Provider nicht aktiviert in Supabase
2. Falsche Credentials
3. Email-Bestätigung erforderlich

**Lösung**:
- Aktiviere Email-Provider in Supabase Auth Settings
- Überprüfe Email-Bestätigungs-Einstellungen in Supabase

### Problem: PDF-Viewer zeigt keine Seiten an

**Lösung**: Stelle sicher, dass der PDF.js Worker korrekt geladen wird. Überprüfe die Browser-Konsole auf Fehler.

## Deployment

### Automatisches Docker Image via GitHub Actions

Die App baut automatisch ein Docker Image, wenn du zu GitHub pushst. Siehe **[DEPLOYMENT.md](DEPLOYMENT.md)** für die komplette Anleitung.

**Schnellstart:**

1. Zu GitHub pushen → GitHub Actions baut automatisch das Image
2. Auf Coolify deployen: `docker-compose -f docker-compose.prod.yml up -d`
3. App läuft auf Port 5555

### Docker Deployment

Die Anwendung ist produktionsbereit für Docker und Coolify konfiguriert.

#### Mit Docker Compose (Lokal testen)

Erstelle eine `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wurm-ki-viewer:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_URL=https://dein-projekt.supabase.co
      - VITE_SUPABASE_ANON_KEY=dein-anon-key
      - VITE_SUPABASE_BUCKET_NAME=fulldocs
    restart: unless-stopped
```

Dann starten:

```bash
docker-compose up -d
```

#### Mit Coolify

1. **In Coolify ein neues Projekt erstellen**:
   - Gehe zu deinem Coolify Dashboard
   - Klicke auf "New Resource" → "Application"
   - Wähle "Docker Image" oder "Git Repository"

2. **Git Repository verbinden** (empfohlen):
   - Verbinde dein Git Repository
   - Branch: `main` oder `master`
   - Build Pack: **Dockerfile**

3. **Umgebungsvariablen setzen** (siehe `.env.production.example`):
   ```
   VITE_SUPABASE_URL=http://dein-supabase-server.io
   VITE_SUPABASE_ANON_KEY=dein-anon-key
   VITE_SUPABASE_BUCKET_NAME=fulldocs
   VITE_OPENAI_API_KEY=sk-proj-dein-openai-key
   VITE_OPENAI_MODEL=gpt-4.1-nano
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   ```

4. **Port-Konfiguration**:
   - Interner Port: **80**
   - Externer Port: **443** (mit SSL/TLS)

5. **Domain konfigurieren**:
   - Füge deine Domain hinzu
   - Aktiviere automatisches SSL/TLS

6. **Deploy starten**:
   - Klicke auf "Deploy"
   - Coolify baut automatisch das Docker Image und startet den Container

#### Manueller Docker Build

```bash
# Image bauen
docker build -t wurm-ki-viewer .

# Container starten
docker run -d \
  -p 8080:80 \
  -e VITE_SUPABASE_URL=https://dein-projekt.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=dein-anon-key \
  -e VITE_SUPABASE_BUCKET_NAME=fulldocs \
  --name wurm-ki-viewer \
  wurm-ki-viewer
```

### Wichtig für Produktion

1. **Umgebungsvariablen**: Setze alle Umgebungsvariablen in deiner Deployment-Plattform
2. **HTTPS**: Aktiviere SSL/TLS (Coolify macht das automatisch)
3. **Supabase Settings**:
   - Füge deine Produktions-URL zu den Redirect URLs hinzu
   - Gehe zu: Supabase Dashboard → Authentication → URL Configuration
   - Füge hinzu: `https://deine-domain.com/**`
4. **CORS**: Sollte automatisch funktionieren, da Supabase Anon Key verwendet wird

## Sicherheit

- **Umgebungsvariablen**: Die `.env` Datei wird von Git ignoriert. Niemals Credentials committen!
- **Supabase Anon Key**: Der anon key ist sicher für den Browser, da Supabase Row Level Security (RLS) verwendet
- **Storage Policies**: Konfiguriere passende Storage Policies basierend auf deinen Anforderungen
- **HTTPS**: Verwende immer HTTPS in Produktion

## Lizenz

MIT

## Support

Bei Fragen oder Problemen:
1. Überprüfe die Supabase-Dokumentation: https://supabase.com/docs
2. Überprüfe react-pdf Dokumentation: https://github.com/wojtekmaj/react-pdf

## Changelog

### Version 3.0.0
- AI-Testfragen-Generierung mit OpenAI GPT-4.1-nano
- Intelligente Chunk-Auswahl aus Supabase `documents` Tabelle
- Rate Limiting: 5 Generierungen pro Stunde pro Benutzer
- Markdown-Rendering für Fragen und Antworten
- Support für Tabellen, Bilder und Code in Testfragen
- Visuelles Feedback für Rate-Limit-Status
- Button wird ausgegraut, wenn Limit erreicht ist
- Testfragen-Modal mit erweiterbaren Antworten

### Version 2.0.0
- Admin-System mit Rollenbasierter Zugriffskontrolle
- Approval-Workflow für neue Benutzer
- Benutzerverwaltungs-Panel für Admins
- Dark Theme mit Wurm-KI Branding
- Pagination mit konfigurierbarer Seitengröße
- PDF-Anzeige in neuem Browser-Tab
- Docker und Coolify Deployment Support

### Version 1.0.0
- Initiales Release
- Email/Passwort-Authentifizierung
- PDF-Anzeige aus Supabase Storage
- PDF-Viewer mit Zoom und Navigation
- Download-Funktionalität
- Responsive Design
