# Oppsettsinstruksjoner for API-nøkkel

## ⚠️ VIKTIG SIKKERHET

**API-nøkkelen din skal ALDRI committes til Git!**

## Slik setter du opp API-nøkkelen:

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

## Hvis du har committet en API-nøkkel ved uhell:

1. **Roterer nøkkelen umiddelbart** på OpenRouter
2. **Fjern den fra Git-historikken** (hvis nødvendig)
3. **Opprett ny nøkkel** og legg den i `config.js`
4. **Sjekk at `.gitignore` er oppdatert**

## Nåværende API-nøkkel:

API-nøkkelen er lagret i `config.js` (som ikke er i Git).
Nøkkelen som er implementert: `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`

## Hvordan bruke API-nøkkelen i koden:

```javascript
// API-nøkkelen lastes automatisk fra config.js
// Bruk funksjonen callOpenRouterAPI() for API-kall
const result = await callOpenRouterAPI([
    { role: 'user', content: 'Hallo!' }
]);
```

