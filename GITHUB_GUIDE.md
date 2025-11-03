# Guide: Publisere MiauMiau på GitHub Pages 🐱

## Steg 1: Opprett GitHub Repository

1. Gå til [github.com](https://github.com) og logg inn
2. Klikk på "+" oppe til høyre → "New repository"
3. Gi repositoryet et navn (f.eks. `MiauMiau` eller `katte-spill`)
4. Velg "Public" (må være public for GitHub Pages)
5. Ikke kryss av for README, .gitignore, eller license (vi har allerede filer)
6. Klikk "Create repository"

## Steg 2: Push filene til GitHub

### Første gang (initial setup):

1. Åpne terminal/kommandolinje i MiauMiau-mappen
2. Kjør disse kommandoene:

```bash
# Initialiser git (hvis ikke allerede gjort)
git init

# Legg til alle filer
git add .

# Lag første commit
git commit -m "Første versjon av MiauMiau kattespill"

# Legg til GitHub repository (erstatt USERNAME og REPO-NAVN med dine)
git remote add origin https://github.com/USERNAME/REPO-NAVN.git

# Push til GitHub
git branch -M main
git push -u origin main
```

### Hvis du allerede har git initialisert:

```bash
git add .
git commit -m "Oppdatert med spilleliste og alle funksjoner"
git push
```

## Steg 3: Aktiver GitHub Pages

1. Gå til ditt repository på GitHub
2. Klikk på "Settings" (øverst i repositoryet)
3. I venstremenyen, scroll ned og klikk på "Pages"
4. Under "Source", velg "Deploy from a branch"
5. Velg branch: `main`
6. Velg folder: `/ (root)`
7. Klikk "Save"

## Steg 4: Vent på publisering

- GitHub Pages kan ta 1-5 minutter å publisere
- Du får en melding når det er klart
- Nettsiden vil være tilgjengelig på: `https://USERNAME.github.io/REPO-NAVN/`

## Steg 5: Del med venner! 🎉

Del lenken med venner og familie. Alle kan nå spille spillet direkte i nettleseren!

**Eksempel URL:** `https://dinbruker.github.io/MiauMiau/`

## Viktig: Alle MP3-filene må være med!

Sørg for at alle 12 MP3-filene ligger i samme mappe som `index.html`:
- `01 - TAKEDOWN (JEONGYEON, JIHYO, CHAEYOUNG).mp3`
- `02 - How It's Done.mp3`
- `03 - Soda Pop.mp3`
- `04 - Golden.mp3`
- `05 - Strategy.mp3`
- `06 - Takedown.mp3`
- `07 - Your Idol.mp3`
- `08 - Free.mp3`
- `09 - What It Sounds Like.mp3`
- `10 - 사랑인가 봐 Love, Maybe.mp3`
- `11 - 오솔길 Path.mp3`
- `12 - Score Suite.mp3`

## Oppdatere spillet senere

Når du gjør endringer:

```bash
git add .
git commit -m "Beskrivelse av endringene"
git push
```

GitHub Pages oppdateres automatisk (kan ta 1-2 minutter).

## Tips

- ⚠️ GitHub Pages har en grense på 100MB per fil. MP3-filer kan være store - sjekk at de ikke er for store
- ✅ Spillet fungerer best i Chrome, Firefox, eller Edge
- 🎵 Musikk startes automatisk med lavt volum
- 📱 Spillet fungerer også på mobil og nettbrett!

