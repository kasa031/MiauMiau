# GitHub Setup for MiauMiau - Steg for steg guide 🐱

## Steg 1: Opprett nytt repository på GitHub

1. Gå til https://github.com (du er allerede logget inn som `kasa031`)
2. Klikk på den grønne **"New"** knappen (til høyre for "Find a repository...")
3. Fyll inn:
   - **Repository name:** `MiauMiau` (eller et annet navn du vil ha)
   - **Description:** `Katteparadis spill for barn 🐱`
   - Velg **Public** (må være public for GitHub Pages)
   - **IKKE** kryss av for README, .gitignore, eller license (vi har allerede filer)
4. Klikk **"Create repository"**

## Steg 2: Push filene fra din datamaskin

Åpne **PowerShell** eller **Command Prompt** i MiauMiau-mappen og kjør disse kommandoene:

```bash
# Hvis du ikke har git initialisert enda
git init

# Legg til alle filer
git add .

# Lag første commit
git commit -m "Første versjon av MiauMiau kattespill med spilleliste"

# Legg til GitHub repository (bruk ditt faktiske repository-navn)
git remote add origin https://github.com/kasa031/MiauMiau.git

# Push til GitHub
git branch -M main
git push -u origin main
```

**Merk:** Hvis GitHub ber om brukernavn/passord:
- Brukernavn: `kasa031`
- Passord: Bruk en **Personal Access Token** (ikke ditt GitHub-passord)
  - Gå til: Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generer en ny token med "repo" tilgang

## Steg 3: Aktiver GitHub Pages

1. Gå til ditt nye repository: https://github.com/kasa031/MiauMiau
2. Klikk på **"Settings"** (øverst i repositoryet)
3. I venstremenyen, scroll ned og klikk på **"Pages"**
4. Under **"Source"**, velg:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klikk **"Save"**

## Steg 4: Vent på publisering

- GitHub Pages kan ta 1-5 minutter å publisere
- Du får en melding når det er klart
- Nettsiden vil være tilgjengelig på: **https://kasa031.github.io/MiauMiau/**

## Steg 5: Test og del! 🎉

1. Gå til lenken: https://kasa031.github.io/MiauMiau/
2. Test at alt fungerer
3. Del lenken med venner og familie!

## Viktig: Alle MP3-filene må være med i git

Før du pusher, sjekk at alle 12 MP3-filene ligger i MiauMiau-mappen:
- ✅ `01 - TAKEDOWN (JEONGYEON, JIHYO, CHAEYOUNG).mp3`
- ✅ `02 - How It's Done.mp3`
- ✅ `03 - Soda Pop.mp3`
- ✅ `04 - Golden.mp3`
- ✅ `05 - Strategy.mp3`
- ✅ `06 - Takedown.mp3`
- ✅ `07 - Your Idol.mp3`
- ✅ `08 - Free.mp3`
- ✅ `09 - What It Sounds Like.mp3`
- ✅ `10 - 사랑인가 봐 Love, Maybe.mp3`
- ✅ `11 - 오솔길 Path.mp3`
- ✅ `12 - Score Suite.mp3`

## Fremtidige oppdateringer

Når du gjør endringer og vil oppdatere nettsiden:

```bash
git add .
git commit -m "Beskrivelse av endringene"
git push
```

GitHub Pages oppdateres automatisk (kan ta 1-2 minutter).

## Tips

- ⚠️ GitHub har grense på 100MB per fil. Sjekk at MP3-filene ikke er for store
- ✅ Hvis du får problemer med push, prøv å slette `.git` mappen og start på nytt
- 🎵 Test spillet lokalt først for å sikre at alle filer fungerer
- 📱 Spillet fungerer på både datamaskin, mobil og nettbrett!

