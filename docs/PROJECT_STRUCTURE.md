# Prosjektstruktur for MiauMiau 🐱

## 📁 Mappestruktur

```
MiauMiau/
├── audio/                    # Alle lydfiler (MP3, FLAC)
│   ├── 01 - TAKEDOWN...mp3
│   ├── 02 - How It's Done.mp3
│   └── ...
│
├── Bilder/                   # Alle bilder og GIF-filer
│   ├── babycat.jpg
│   ├── Cat Pink GIF.gif
│   └── ...
│
├── icons/                    # PWA-ikoner i alle størrelser
│   ├── icon-16x16.png
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── ...
│
├── docs/                     # Dokumentasjon
│   ├── SETUP.md             # Hovedoppsettsguide
│   ├── API_KEY_VALIDATION.md # API-nøkkel validering
│   ├── DEPLOYMENT.md        # Deployment-informasjon
│   └── *_OLD.md             # Gamle dokumentasjonsfiler (kan slettes)
│
├── assets/                   # Ekstra ressurser (hvis nødvendig)
│   ├── audio/
│   └── images/
│
├── index.html               # Hoved-HTML-fil
├── script.js                # Hoved-JavaScript-fil
├── styles.css               # Hoved-CSS-fil
├── manifest.json            # PWA manifest
├── service-worker.js        # Service Worker for PWA
├── config.js                # API-nøkkel (IKKE commit!)
├── README.md                # Hoveddokumentasjon
└── TODO.md                  # TODO-liste
```

## 📝 Filbeskrivelser

### Kjernefiler
- **index.html** - Hoved-HTML-fil med all struktur
- **script.js** - All JavaScript-logikk (10,000+ linjer)
- **styles.css** - All CSS-styling
- **manifest.json** - PWA-konfigurasjon
- **service-worker.js** - Offline-støtte og caching

### Konfigurasjon
- **config.js** - API-nøkkel (IKKE commit til Git!)
- **README.md** - Hoveddokumentasjon
- **TODO.md** - Oppgaveliste

### Dokumentasjon (docs/)
- **SETUP.md** - Komplett oppsettsguide
- **API_KEY_VALIDATION.md** - Hvordan validere API-nøkkel
- **DEPLOYMENT.md** - Deployment-informasjon
- **PROJECT_STRUCTURE.md** - Denne filen

### Ressurser
- **audio/** - Alle lydfiler (MP3, FLAC)
- **Bilder/** - Alle bilder og GIF-filer
- **icons/** - PWA-ikoner

## 🔄 Endringer fra gammel struktur

### Før:
- MP3-filer i rotmappen
- Flere dokumentasjonsfiler i rotmappen
- Uorganisert struktur

### Nå:
- ✅ Alle lydfiler i `audio/` mappen
- ✅ All dokumentasjon i `docs/` mappen
- ✅ Ryddig og organisert struktur
- ✅ Oppdaterte filstier i kode

## 📌 Viktige notater

1. **config.js** skal ALDRI committes til Git
2. **audio/** mappen inneholder alle lydfiler
3. **docs/** mappen inneholder all dokumentasjon
4. Gamle dokumentasjonsfiler er flyttet til `docs/*_OLD.md` (kan slettes)

## 🚀 Neste steg

- [ ] Slett gamle dokumentasjonsfiler (`docs/*_OLD.md`) hvis de ikke trengs
- [ ] Oppdater `.gitignore` hvis nødvendig
- [ ] Test at alle filstier fungerer etter reorganisering

