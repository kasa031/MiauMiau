# Oppsettsguide for MiauMiau 🐱

## Innholdsfortegnelse
1. [API-nøkkel setup](#api-nøkkel-setup)
2. [GitHub Pages deployment](#github-pages-deployment)
3. [PWA setup](#pwa-setup)
4. [Sikkerhet](#sikkerhet)

---

## API-nøkkel setup

### ⚠️ VIKTIG SIKKERHET

**API-nøkkelen din skal ALDRI committes til Git!**

### Slik setter du opp OpenRouter API-nøkkelen:

1. **Opprett `config.js` filen** (hvis den ikke allerede eksisterer)
   - Denne filen er allerede i `.gitignore` og vil ikke bli committet

2. **Legg inn din API-nøkkel i `config.js`**:
   ```javascript
   const CONFIG = {
       OPENROUTER_API_KEY: 'sk-or-v1-din-nøkkel-her'
   };
   ```

3. **Sjekk at `config.js` er i `.gitignore`**:
   - Filen skal allerede være i `.gitignore`
   - Dette sikrer at den ikke blir committet ved uhell

4. **Test at alt fungerer**:
   - Åpne nettleseren din
   - Sjekk konsollen for eventuelle feilmeldinger
   - Prøv AI-katt-chat funksjonen

### Hvis du har committet en API-nøkkel ved uhell:

1. **Roterer nøkkelen umiddelbart** på OpenRouter
2. **Fjern den fra Git-historikken** (hvis nødvendig)
3. **Opprett ny nøkkel** og legg den i `config.js`
4. **Sjekk at `.gitignore` er oppdatert**

### Hvordan bruke API-nøkkelen i koden:

```javascript
// API-nøkkelen lastes automatisk fra config.js
// Bruk funksjonen callOpenRouterAPI() for API-kall
const result = await callOpenRouterAPI([
    { role: 'user', content: 'Hallo!' }
]);
```

---

## GitHub Pages deployment

### Steg 1: Opprett GitHub Repository

1. Gå til [github.com](https://github.com) og logg inn
2. Klikk på "+" oppe til høyre → "New repository"
3. Gi repositoryet et navn (f.eks. `MiauMiau`)
4. Velg "Public" (må være public for GitHub Pages)
5. Ikke kryss av for README, .gitignore, eller license
6. Klikk "Create repository"

### Steg 2: Push filene til GitHub

**Første gang (initial setup):**

```bash
# Initialiser git (hvis ikke allerede gjort)
git init

# Legg til alle filer
git add .

# Lag første commit
git commit -m "Første versjon av MiauMiau kattespill"

# Legg til GitHub repository (erstatt USERNAME og REPO-NAVN)
git remote add origin https://github.com/USERNAME/REPO-NAVN.git

# Push til GitHub
git branch -M main
git push -u origin main
```

**Fremtidige oppdateringer:**

```bash
git add .
git commit -m "Beskrivelse av endringene"
git push
```

### Steg 3: Aktiver GitHub Pages

1. Gå til ditt repository på GitHub
2. Klikk på "Settings" (øverst i repositoryet)
3. I venstremenyen, scroll ned og klikk på "Pages"
4. Under "Source", velg "Deploy from a branch"
5. Velg branch: `main`
6. Velg folder: `/ (root)`
7. Klikk "Save"

### Steg 4: Vent på publisering

- GitHub Pages kan ta 1-5 minutter å publisere
- Du får en melding når det er klart
- Nettsiden vil være tilgjengelig på: `https://USERNAME.github.io/REPO-NAVN/`

---

## PWA setup

MiauMiau er en **Progressive Web App (PWA)** som kan installeres på enheter.

### Implementerte funksjoner:

- ✅ Web App Manifest (`manifest.json`)
- ✅ Service Worker (`service-worker.js`) for offline-støtte
- ✅ App-ikoner i alle størrelser
- ✅ Installerbarhet på alle plattformer

### Hvordan teste PWA:

1. **Lokal testing:**
   - Åpne i Chrome/Edge
   - Gå til DevTools (F12) → Application → Service Workers
   - Test offline-modus

2. **Installere appen:**
   - **Chrome/Edge:** Klikk på install-ikonet i adresselinjen
   - **Mobile:** "Legg til hjem-skjerm" fra nettlesermenyen
   - **iOS Safari:** Del → Legg til hjem-skjerm
   - **Windows:** Installer-knapp i nettleseren

3. **Offline-testing:**
   - DevTools → Network → Throttling → Offline
   - Appen skal fortsatt fungere

### Neste steg (valgfritt):

- [ ] Push-notifikasjoner
- [ ] Background sync
- [ ] Share API
- [ ] Badge API (for notifikasjoner)

---

## Sikkerhet

### ⚠️ VIKTIG: Aldri commit sensitiv informasjon!

### Hva som IKKE skal committes:

- API-nøkler (OpenRouter, OpenAI, etc.)
- Passord
- Privatnøkler
- Token/autentiseringsnøkler
- Personlige data

### Hvordan håndtere API-nøkler:

1. **Bruk `config.js`** som er i `.gitignore` og last den dynamisk
2. **Bruk environment variables** (.env-fil som er i .gitignore)
3. **Bruk server-side** for API-kall hvis mulig

### Hvis du har committet en API-nøkkel ved uhell:

1. **Roterer nøkkelen umiddelbart** (gjør den gammel ugyldig)
2. **Fjern den fra Git-historikken** ved behov
3. **Oppdater `.gitignore`** for å forhindre fremtidige commits

---

## Tips

- ⚠️ GitHub Pages har en grense på 100MB per fil
- ✅ Spillet fungerer best i Chrome, Firefox, eller Edge
- 🎵 Musikk ligger i `audio/` mappen
- 📱 Spillet fungerer også på mobil og nettbrett!

