# Progressive Web App (PWA) Setup for MiauMiau 🐱📱

## Liste over hva som trengs for PWA

### ✅ 1. Web App Manifest (manifest.json)
- App-navn og beskrivelse
- Ikoner i forskjellige størrelser (192x192, 512x512)
- Start-URL og display-modus
- Farger for tema og statusbar
- Orientering (portrett/landscape)

### ✅ 2. Service Worker (service-worker.js)
- Offline-støtte
- Caching av ressurser (HTML, CSS, JS, bilder)
- Strategi for caching (Cache First, Network First, etc.)
- Oppdatering av cache ved nye versjoner

### ✅ 3. App-ikoner
- Generere ikoner i forskjellige størrelser
- Legge til favicon
- PWA-ikoner (192x192, 512x512)

### ✅ 4. HTML-oppdateringer
- Linke til manifest.json
- Registrere service worker
- Legge til meta-tags for PWA
- Apple touch icons

### ✅ 5. Offline-funksjonalitet
- Offline-meldinger
- Cache-strategi for localStorage
- Håndtering av offline-tilstand

### ✅ 6. Installerbar
- Install-prompt
- "Legg til hjem-skjerm" funksjonalitet
- Installeringsinstruksjoner

---

## Implementeringsstatus

- [x] Web App Manifest opprettet (manifest.json)
- [x] Service Worker implementert (service-worker.js)
- [x] HTML oppdatert med PWA-støtte (meta tags, manifest link)
- [x] Service Worker registrering i script.js
- [x] Offline-funksjonalitet (caching)
- [x] Installerbarhet (beforeinstallprompt)
- [x] Ikon-generator verktøy (icons/generate-icons.html)
- [x] App-ikoner generert (alle 10 størrelser er på plass i icons-mappen)

---

## Hvordan teste PWA

1. **Lokal testing:**
   - Åpne i Chrome/Edge
   - Gå til DevTools (F12) → Application → Service Workers
   - Test offline-modus

2. **Installere appen:**
   - Chrome/Edge: Klikk på install-ikonet i adresselinjen
   - Mobile: "Legg til hjem-skjerm" fra nettlesermenyen

3. **Offline-testing:**
   - DevTools → Network → Throttling → Offline
   - Appen skal fortsatt fungere

---

## Neste steg (valgfritt)

- [ ] Push-notifikasjoner
- [ ] Background sync
- [ ] Share API
- [ ] Badge API (for notifikasjoner)

