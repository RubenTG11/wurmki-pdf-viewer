export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  ADMIN_DASHBOARD: '/admin',
  NOT_FOUND: '*'
}

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

export const PDF_VIEWER_CONFIG = {
  DEFAULT_SCALE: 1.0,
  MAX_SCALE: 3.0,
  MIN_SCALE: 0.5,
  SCALE_STEP: 0.25
}

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentifizierung fehlgeschlagen. Bitte versuche es erneut.',
  FETCH_PDFS_FAILED: 'PDFs konnten nicht geladen werden. Bitte aktualisiere die Seite.',
  DOWNLOAD_FAILED: 'Download fehlgeschlagen. Bitte versuche es erneut.',
  INVALID_CREDENTIALS: 'Ungültige E-Mail oder Passwort.',
  REGISTRATION_FAILED: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.',
  EMAIL_REQUIRED: 'E-Mail ist erforderlich.',
  PASSWORD_REQUIRED: 'Passwort ist erforderlich.',
  PASSWORD_TOO_SHORT: 'Passwort muss mindestens 6 Zeichen lang sein.',
  PASSWORDS_DONT_MATCH: 'Passwörter stimmen nicht überein.'
}
