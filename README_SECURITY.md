# Sikkerhetsretningslinjer

## ⚠️ VIKTIG: Aldri commit sensitiv informasjon!

### Hva som IKKE skal committes:
- API-nøkler (OpenRouter, OpenAI, etc.)
- Passord
- Privatnøkler
- Token/autentiseringsnøkler
- Personlige data

### Hvordan håndtere API-nøkler:
1. **Bruk environment variables** (.env-fil som er i .gitignore)
2. **Bruk config.js** som er i .gitignore og last den dynamisk
3. **Bruk server-side** for API-kall hvis mulig

### Hvis du har committet en API-nøkkel ved uhell:
1. **Roterer nøkkelen umiddelbart** (gjør den gammel ugyldig)
2. **Fjern den fra Git-historikken** ved behov
3. **Oppdater .gitignore** for å forhindre fremtidige commits

### Eksempel på .env-fil:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### Eksempel på config.js (som IKKE skal committes):
```javascript
const config = {
    openrouterApiKey: 'sk-or-v1-xxxxxxxxxxxxx'
};
```

