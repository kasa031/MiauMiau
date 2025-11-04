// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Add active class to clicked tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        btn.classList.add('active');
        
        // Update specific tabs when opened
        if (tabName === 'stats') {
            renderStats();
        } else if (tabName === 'shop') {
            renderShop();
        } else if (tabName === 'achievements') {
            renderAchievements();
        } else if (tabName === 'album') {
            renderAlbum();
        } else if (tabName === 'game') {
            renderOwnedItemsInGame();
        } else if (tabName === 'school') {
            // Hide all subject areas when opening school tab
            document.querySelectorAll('.subject-area').forEach(area => {
                area.style.display = 'none';
            });
        }
    });
});

// Current logged in user
let currentUser = null;

// Game state - extended with all new features
let gameState = {
    happiness: 50,
    hunger: 50,
    energy: 50,
    score: 0,
    level: 1,
    coins: 0,
    ownedItems: [],
    achievements: {},
    stats: {
        timesFed: 0,
        timesPlayed: 0,
        timesPetted: 0,
        timesSlept: 0,
        timesCleaned: 0,
        pizzaGiven: 0,
        bottleGiven: 0,
        handPetted: 0,
        catClicked: 0,
        totalPlayTime: 0,
        minigameScore: 0,
        itemsUsed: {} // Track usage of each item
    },
    cats: [
        { name: 'Katt 1', unlocked: true, happiness: 50, hunger: 50, energy: 50, emoji: '😸', image: null },
        { name: 'Katt 2', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😺', image: null },
        { name: 'Katt 3', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😻', image: null },
        { name: 'Babykatt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐱', image: 'Bilder/babycat.jpg', unlockLevel: 10 },
        { name: 'Brindle', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐈', image: 'Bilder/brindle.jpg', unlockLevel: 15 },
        { name: 'Rød katt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐈‍⬛', image: 'Bilder/redcat.jpg', unlockLevel: 20 },
        { name: 'Rosa katt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '💖', image: 'Bilder/Cat Pink GIF.gif', unlockLevel: 25, isGif: true }
    ],
    currentCat: 0,
    dailyChallenge: null,
    challengeProgress: 0,
    challengeCompleted: false,
    lastSave: Date.now(),
    actionCooldowns: {}, // Track when actions can be used again
    lastDailyReward: null, // Track last daily reward claim
    catTricks: [] // Track learned cat tricks
};

const catEmojis = ['😸', '😺', '😻', '😽', '🙀', '😼', '😾', '🐱'];

// Load game from localStorage for current user
function loadGame() {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`miaumiauGame_${currentUser}`);
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(gameState, parsed);
        // Calculate play time
        if (gameState.lastSave) {
            gameState.stats.totalPlayTime += (Date.now() - gameState.lastSave);
        }
    }
    updateAllDisplays();
}

// Save game to localStorage for current user
function saveGame() {
    if (!currentUser) return;
    
    gameState.lastSave = Date.now();
    localStorage.setItem(`miaumiauGame_${currentUser}`, JSON.stringify(gameState));
}

// ==================== USER MANAGEMENT ====================
function getUsers() {
    const usersJson = localStorage.getItem('miaumiauUsers');
    return usersJson ? JSON.parse(usersJson) : {};
}

function saveUsers(users) {
    localStorage.setItem('miaumiauUsers', JSON.stringify(users));
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-error').textContent = '';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-error').textContent = '';
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        document.getElementById('login-error').textContent = 'Vennligst fyll inn både brukernavn og passord!';
        return;
    }
    
    const users = getUsers();
    
    if (!users[username]) {
        document.getElementById('login-error').textContent = 'Brukernavn finnes ikke!';
        return;
    }
    
    if (users[username].password !== password) {
        document.getElementById('login-error').textContent = 'Feil passord!';
        return;
    }
    
    // Login successful
    currentUser = username;
    localStorage.setItem('miaumiauCurrentUser', username);
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('current-user-display').textContent = `Innlogget som: ${username} 🐱`;
    document.getElementById('logout-btn').style.display = 'inline-block';
    
    // Load user's game data
    loadGame();
    playClickSound();
}

function handleSignup() {
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    
    if (!username || username.length < 3) {
        document.getElementById('login-error').textContent = 'Brukernavn må være minst 3 tegn!';
        return;
    }
    
    if (!password || password.length < 4) {
        document.getElementById('login-error').textContent = 'Passord må være minst 4 tegn!';
        return;
    }
    
    if (password !== passwordConfirm) {
        document.getElementById('login-error').textContent = 'Passordene matcher ikke!';
        return;
    }
    
    const users = getUsers();
    
    if (users[username]) {
        document.getElementById('login-error').textContent = 'Brukernavn er allerede i bruk!';
        return;
    }
    
    // Create new user
    users[username] = {
        password: password,
        createdAt: Date.now()
    };
    saveUsers(users);
    
    // Login as new user
    currentUser = username;
    localStorage.setItem('miaumiauCurrentUser', username);
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('current-user-display').textContent = `Innlogget som: ${username} 🐱`;
    document.getElementById('logout-btn').style.display = 'inline-block';
    
    // Reset game state for new user
    gameState = {
        happiness: 50,
        hunger: 50,
        energy: 50,
        score: 0,
        level: 1,
        coins: 0,
        ownedItems: [],
        achievements: {},
        stats: {
            timesFed: 0,
            timesPlayed: 0,
            timesPetted: 0,
            timesSlept: 0,
            timesCleaned: 0,
            pizzaGiven: 0,
            bottleGiven: 0,
            handPetted: 0,
            catClicked: 0,
            totalPlayTime: 0,
            minigameScore: 0,
            itemsUsed: {}
        },
        cats: [
            { name: 'Katt 1', unlocked: true, happiness: 50, hunger: 50, energy: 50, emoji: '😸', image: null },
            { name: 'Katt 2', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😺', image: null },
            { name: 'Katt 3', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😻', image: null },
            { name: 'Babykatt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐱', image: 'Bilder/babycat.jpg', unlockLevel: 10 },
            { name: 'Brindle', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐈', image: 'Bilder/brindle.jpg', unlockLevel: 15 },
            { name: 'Rød katt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '🐈‍⬛', image: 'Bilder/redcat.jpg', unlockLevel: 20 },
            { name: 'Rosa katt', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '💖', image: 'Bilder/Cat Pink GIF.gif', unlockLevel: 25, isGif: true }
        ],
        currentCat: 0,
        dailyChallenge: null,
        challengeProgress: 0,
        challengeCompleted: false,
        lastSave: Date.now(),
        actionCooldowns: {},
        lastDailyReward: null,
        catTricks: []
    };
    saveGame();
    updateAllDisplays();
    playSuccessSound();
    showMessage(`Velkommen, ${username}! 🎉 Spillet ditt er klart!`);
}

function handleLogout() {
    if (confirm('Er du sikker på at du vil logge ut? Fremgangen din er lagret!')) {
        saveGame(); // Save before logout
        currentUser = null;
        localStorage.removeItem('miaumiauCurrentUser');
        document.getElementById('login-overlay').style.display = 'flex';
        document.getElementById('current-user-display').textContent = '';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        showLogin();
        playClickSound();
    }
}

// Check if user is logged in on page load
function checkLogin() {
    const savedUser = localStorage.getItem('miaumiauCurrentUser');
    if (savedUser) {
        const users = getUsers();
        if (users[savedUser]) {
            currentUser = savedUser;
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('current-user-display').textContent = `Innlogget som: ${currentUser} 🐱`;
            document.getElementById('logout-btn').style.display = 'inline-block';
            loadGame();
            // Load saved background
            const savedBg = localStorage.getItem(`miaumiauBackground_${currentUser}`);
            if (savedBg) {
                applyBackground(savedBg);
            }
            return true;
        }
    }
    document.getElementById('login-overlay').style.display = 'flex';
    return false;
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Track play time continuously
let playTimeStart = Date.now();
setInterval(() => {
    const now = Date.now();
    const elapsed = now - playTimeStart;
    gameState.stats.totalPlayTime += elapsed;
    playTimeStart = now;
    
    // Update stats display if stats tab is open
    if (document.getElementById('stats-tab') && document.getElementById('stats-tab').classList.contains('active')) {
        renderStats();
    }
    
    // Save every 5 minutes to preserve play time
    if (Math.floor(gameState.stats.totalPlayTime / 1000) % 300 === 0) {
        saveGame();
    }
}, 1000); // Update every second

// Update stats display
function updateStats() {
    document.getElementById('happiness').textContent = gameState.happiness;
    document.getElementById('hunger').textContent = gameState.hunger;
    document.getElementById('energy').textContent = gameState.energy;
    
    // Update progress bars
    document.getElementById('happiness-bar').style.width = gameState.happiness + '%';
    document.getElementById('hunger-bar').style.width = gameState.hunger + '%';
    document.getElementById('energy-bar').style.width = gameState.energy + '%';
    
    // Update score and level
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    
    // Check level up - Much harder progression
    const oldLevel = gameState.level;
    // Level progression: 1=0, 2=500, 3=1500, 4=3000, 5=5000, etc.
    // Formula: level = floor(score/500) + 1, but with exponential growth
    let newLevel = 1;
    if (gameState.score >= 0 && gameState.score < 500) newLevel = 1;
    else if (gameState.score < 1500) newLevel = 2;
    else if (gameState.score < 3000) newLevel = 3;
    else if (gameState.score < 5000) newLevel = 4;
    else if (gameState.score < 7500) newLevel = 5;
    else if (gameState.score < 11000) newLevel = 6;
    else if (gameState.score < 16000) newLevel = 7;
    else if (gameState.score < 22000) newLevel = 8;
    else if (gameState.score < 30000) newLevel = 9;
    else if (gameState.score < 40000) newLevel = 10;
    else if (gameState.score < 55000) newLevel = 11;
    else if (gameState.score < 75000) newLevel = 12;
    else if (gameState.score < 100000) newLevel = 13;
    else if (gameState.score < 135000) newLevel = 14;
    else if (gameState.score < 180000) newLevel = 15;
    else if (gameState.score < 240000) newLevel = 16;
    else if (gameState.score < 320000) newLevel = 17;
    else if (gameState.score < 430000) newLevel = 18;
    else if (gameState.score < 580000) newLevel = 19;
    else if (gameState.score < 780000) newLevel = 20;
    else {
        // After level 20, continue with exponential growth
        newLevel = Math.floor(20 + Math.sqrt((gameState.score - 780000) / 10000));
    }
    
    // Cap maximum level much higher, or remove cap entirely
    const maxLevel = 999; // Very high cap, effectively unlimited
    gameState.level = Math.min(newLevel, maxLevel);
    
    if (gameState.level > oldLevel) {
        levelUpReward(gameState.level, oldLevel);
    }
    
    // Update bow color based on level
    updateBowForLevel(gameState.level);
    
    // Remove game finished screen - game continues indefinitely
    // Or make it much harder to reach (level 50+)
    // if (gameState.level >= 50 && oldLevel < 50) {
    //     setTimeout(() => {
    //         showGameFinishedScreen();
    //     }, 2000);
    // }
    
    // Update cat emoji based on mood
    const catEmoji = document.getElementById('cat-emoji');
    if (gameState.happiness > 70 && gameState.hunger < 30) {
        catEmoji.textContent = '😻';
    } else if (gameState.happiness > 50) {
        catEmoji.textContent = '😸';
    } else if (gameState.happiness > 30) {
        catEmoji.textContent = '😺';
    } else if (gameState.hunger > 70) {
        catEmoji.textContent = '😿';
    } else if (gameState.energy < 20) {
        catEmoji.textContent = '😴';
    } else {
        catEmoji.textContent = '🐱';
    }
    
    // Add bounce animation
    const gameCat = document.getElementById('game-cat');
    gameCat.style.animation = 'none';
    setTimeout(() => {
        gameCat.style.animation = 'bounce 0.5s ease';
    }, 10);
}

// Show message
function showMessage(text) {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = text;
    messageEl.classList.remove('show');
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Show bed when sleeping
function showBed(duration = 3000) {
    const bed = document.getElementById('bed');
    bed.classList.add('show');
    setTimeout(() => {
        bed.classList.remove('show');
    }, duration);
}

// Show food when eating
function showFood(foodType, duration = 2000) {
    const foodItem = document.getElementById('food-item');
    foodItem.className = 'food-item ' + foodType;
    foodItem.classList.add('show');
    setTimeout(() => {
        foodItem.classList.remove('show');
    }, duration);
}

// Create particle effects
function createParticles(element) {
    const particles = ['⭐', '✨', '🎉', '💫', '🌟'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 100) + 'px';
        particle.style.top = (rect.top + rect.height / 2) + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// Level-specific content and rewards
function levelUpReward(level, oldLevel) {
    const levelMessages = {
        1: { message: '🎉 Velkommen til nivå 1! Du starter ditt katteskap! 🐱', bonus: 0 },
        2: { message: '🎉 Nivå 2! Kattens sløyfe er nå rosa! Du får bonus poeng! 💖', bonus: 20 },
        3: { message: '🎉 Nivå 3! Blå sløyfe! Handlinger gir nå mer poeng! 💙', bonus: 30 },
        4: { message: '🎉 Nivå 4! Grønn sløyfe! Du er en fantastisk kattetaker! 💚', bonus: 40 },
        5: { message: '🎉 Nivå 5! Gullsløyfe! Du er en kattemester! ✨', bonus: 50 },
        6: { message: '🎉 Nivå 6! Regnbuesløyfe! Du er legendarisk! 🌈', bonus: 60 },
        7: { message: '🎉 Nivå 7! Diamantsløyfe! Du er helten til katter! 💎', bonus: 70 },
        8: { message: '🎉 Nivå 8! Magisk sløyfe! Du er en superstjerne! ⭐', bonus: 80 },
        9: { message: '🎉 Nivå 9! Legendarisk sløyfe! Du er utrolig! 🌟', bonus: 90 },
        10: { message: '🎉 Nivå 10! Meister-sløyfe! Du er den beste kattetakeren! 👑', bonus: 100 }
    };
    
    const reward = levelMessages[level] || { 
        message: `🎉 Nivå ${level}! Fantastisk jobb! Fortsett å ta vare på katten! 🎉`, 
        bonus: Math.min(level * 5, 200) // Cap bonus at 200 poeng
    };
    
    // Only give bonus for the level we just reached, not cumulative
    // This prevents infinite loops
    if (reward.bonus > 0 && level === oldLevel + 1) {
        gameState.score += reward.bonus;
        showMessage(`${reward.message} (+${reward.bonus} bonus poeng!)`);
    } else if (level === oldLevel + 1) {
        showMessage(reward.message);
    }
    
    // Special effects for level up
    if (level > oldLevel) {
        playLevelUpSound();
    }
    createParticles(document.getElementById('game-cat'));
    
    // Extra particles for higher levels
    if (level >= 5) {
        setTimeout(() => {
            createParticles(document.getElementById('game-cat'));
        }, 500);
    }
}

// Update bow color and style based on level
function updateBowForLevel(level) {
    const bow = document.querySelector('.cat-bow');
    const cappedLevel = Math.min(level, 20);
    const bowStyles = {
        1: { emoji: '🎀', color: '#ff69b4' },  // Pink
        2: { emoji: '💖', color: '#ff1493' },  // Deep pink
        3: { emoji: '💙', color: '#1e90ff' },  // Blue
        4: { emoji: '💚', color: '#32cd32' },  // Green
        5: { emoji: '✨', color: '#ffd700' },  // Gold
        6: { emoji: '🌈', color: '#ff6b6b' },  // Rainbow gradient
        7: { emoji: '💎', color: '#b0e0e6' },  // Diamond blue
        8: { emoji: '⭐', color: '#9370db' },  // Star purple
        9: { emoji: '🌟', color: '#ffa500' }, // Bright star
        10: { emoji: '👑', color: '#ffd700' }, // Crown gold
        11: { emoji: '💫', color: '#ff1493' }, // Sparkles
        12: { emoji: '🌙', color: '#9370db' }, // Moon
        13: { emoji: '☀️', color: '#ffd700' }, // Sun
        14: { emoji: '⚡', color: '#ffff00' }, // Lightning
        15: { emoji: '🔥', color: '#ff4500' }, // Fire
        16: { emoji: '❄️', color: '#00bfff' }, // Snowflake
        17: { emoji: '🌸', color: '#ff69b4' }, // Cherry blossom
        18: { emoji: '🌺', color: '#ff1493' }, // Hibiscus
        19: { emoji: '🌻', color: '#ffd700' }, // Sunflower
        20: { emoji: '🏆', color: '#ffd700' }  // Trophy
    };
    
    const style = bowStyles[cappedLevel] || bowStyles[20];
    bow.textContent = style.emoji;
    bow.style.filter = `drop-shadow(0 0 10px ${style.color})`;
    
    // Special animation for higher levels
    if (cappedLevel >= 5) {
        bow.style.animation = 'bowFloat 1.5s ease-in-out infinite, bowGlow 2s ease-in-out infinite';
    } else {
        bow.style.animation = 'bowFloat 2s ease-in-out infinite';
    }
}

// Get bonus multiplier for actions based on level
function getLevelBonusMultiplier(level) {
    // Cap multiplier to prevent too high scores
    const cappedLevel = Math.min(level, 20);
    if (cappedLevel >= 10) return 1.5;
    if (cappedLevel >= 7) return 1.4;
    if (cappedLevel >= 5) return 1.3;
    if (cappedLevel >= 3) return 1.2;
    return 1.0;
}

// Check if action is on cooldown
function isActionOnCooldown(actionId, cooldownSeconds = 2) {
    const now = Date.now();
    if (!gameState.actionCooldowns[actionId]) {
        gameState.actionCooldowns[actionId] = 0;
    }
    return (now - gameState.actionCooldowns[actionId]) < (cooldownSeconds * 1000);
}

// Set action cooldown
function setActionCooldown(actionId) {
    gameState.actionCooldowns[actionId] = Date.now();
}

// Update button cooldown visual with skip option
function updateButtonCooldown(buttonId, cooldownSeconds, actionId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    const originalText = btn.textContent;
    const skipCost = Math.max(5, Math.floor(cooldownSeconds / 2)); // Skip koster 5-10 mynter basert på cooldown
    
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    
    // Create skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'skip-cooldown-btn';
    skipBtn.textContent = `💰 Skip (${skipCost} mynter)`;
    skipBtn.title = 'Kjøp deg fri fra ventetid!';
    skipBtn.style.cssText = 'font-size: 12px; padding: 5px 10px; margin-left: 5px; background: linear-gradient(45deg, #ffd700, #ffed4e); border: none; border-radius: 10px; cursor: pointer; color: #333; font-weight: bold;';
    skipBtn.onclick = (e) => {
        e.stopPropagation();
        skipCooldown(actionId, buttonId, skipCost, originalText);
        skipBtn.remove();
    };
    
    let timeLeft = cooldownSeconds;
    let countdownInterval;
    
    const updateDisplay = () => {
        if (timeLeft > 0) {
            btn.textContent = `${originalText} (${timeLeft}s)`;
            timeLeft--;
        } else {
            clearInterval(countdownInterval);
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.textContent = originalText;
            if (skipBtn.parentNode) {
                skipBtn.remove();
            }
        }
    };
    
    // Insert skip button after the main button
    if (btn.parentNode) {
        btn.parentNode.insertBefore(skipBtn, btn.nextSibling);
    }
    
    countdownInterval = setInterval(updateDisplay, 1000);
    updateDisplay();
}

function skipCooldown(actionId, buttonId, cost, originalText) {
    if (gameState.coins < cost) {
        showMessage(`Du har ikke nok mynter! Trenger ${cost} mynter. 💰`);
        return;
    }
    
    gameState.coins -= cost;
    gameState.actionCooldowns[actionId] = 0; // Reset cooldown
    
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.textContent = originalText;
    }
    
    playBuySound();
    showMessage(`💰 Kjøpt deg fri! -${cost} mynter`);
    updateAllDisplays();
    saveGame();
}

// Game actions
document.getElementById('feed-btn').addEventListener('click', () => {
    if (isActionOnCooldown('feed', 2)) {
        showMessage('Katten spiser allerede! Vent litt... ⏳');
        return;
    }
    
    if (gameState.hunger < 10) {
        showMessage('Katten er mett! Den trenger ikke mer mat nå. 😊');
        return;
    }
    
    setActionCooldown('feed');
    updateButtonCooldown('feed-btn', 2, 'feed');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.hunger = Math.max(0, gameState.hunger - 20);
    gameState.happiness = Math.min(100, gameState.happiness + 10);
    gameState.energy = Math.min(100, gameState.energy + 10);
    gameState.score += Math.floor(5 * bonus);
    updateActionCounters('feed');
    playEatSound();
    showMessage('Mmm, takk! 🍖😸');
    showFood('meat', 2000);
    createParticles(document.getElementById('feed-btn'));
    updateStats();
    updateCatGifDisplay();
});

document.getElementById('play-btn').addEventListener('click', () => {
    if (isActionOnCooldown('play', 3)) {
        showMessage('Katten leker allerede! Vent litt... ⏳');
        return;
    }
    
    if (gameState.energy < 20) {
        showMessage('Jeg er for sliten... La meg hvile først! 😴');
        return;
    }
    
    setActionCooldown('play');
    updateButtonCooldown('play-btn', 3, 'play');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.energy = Math.max(0, gameState.energy - 15);
    gameState.happiness = Math.min(100, gameState.happiness + 15);
    gameState.score += Math.floor(10 * bonus);
    updateActionCounters('play');
    playPlaySound();
    showMessage('Så morsomt! La oss leke mer! 🎾😸');
    createParticles(document.getElementById('play-btn'));
    updateStats();
    updateCatGifDisplay();
});

document.getElementById('pet-btn').addEventListener('click', () => {
    if (isActionOnCooldown('pet', 1.5)) {
        showMessage('Katten koser allerede! Vent litt... ⏳');
        return;
    }
    
    setActionCooldown('pet');
    updateButtonCooldown('pet-btn', 1.5, 'pet');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.happiness = Math.min(100, gameState.happiness + 20);
    gameState.energy = Math.min(100, gameState.energy + 5);
    gameState.score += Math.floor(8 * bonus);
    updateActionCounters('pet');
    playPurrSound();
    showMessage('Purr purr purr... ❤️😸');
    createParticles(document.getElementById('pet-btn'));
    updateStats();
    updateCatGifDisplay();
});

document.getElementById('sleep-btn').addEventListener('click', () => {
    if (isActionOnCooldown('sleep', 5)) {
        showMessage('Katten sover allerede! La den sove lenger... 😴');
        return;
    }
    
    if (gameState.energy > 80) {
        showMessage('Katten er ikke sliten nok til å sove nå! Den vil heller leke! 🎾');
        return;
    }
    
    setActionCooldown('sleep');
    updateButtonCooldown('sleep-btn', 5, 'sleep');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.energy = Math.min(100, gameState.energy + 30);
    gameState.hunger = Math.min(100, gameState.hunger + 10);
    gameState.score += Math.floor(7 * bonus);
    updateActionCounters('sleep');
    playSleepSound();
    showMessage('Zzz... Takk for roen 😴');
    showBed(3000);
    updateStats();
});

document.getElementById('clean-btn').addEventListener('click', () => {
    if (isActionOnCooldown('clean', 4)) {
        showMessage('Katten er allerede ren! Vent litt... ⏳');
        return;
    }
    
    if (gameState.happiness > 90) {
        showMessage('Katten er allerede veldig glad! Den trenger ikke vask nå! 😊');
        return;
    }
    
    setActionCooldown('clean');
    updateButtonCooldown('clean-btn', 4, 'clean');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.happiness = Math.min(100, gameState.happiness + 10);
    gameState.energy = Math.max(0, gameState.energy - 5);
    gameState.score += Math.floor(6 * bonus);
    updateActionCounters('clean');
    showMessage('Så rent og fint! 🛁✨');
    createParticles(document.getElementById('clean-btn'));
    updateStats();
});

// Pizza action
document.getElementById('pizza-btn').addEventListener('click', () => {
    if (isActionOnCooldown('pizza', 3)) {
        showMessage('Katten spiser allerede! Vent litt... ⏳');
        return;
    }
    
    if (gameState.hunger < 15) {
        showMessage('Katten er mett! Den trenger ikke pizza nå. 😊');
        return;
    }
    
    setActionCooldown('pizza');
    updateButtonCooldown('pizza-btn', 3, 'pizza');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.hunger = Math.max(0, gameState.hunger - 25);
    gameState.happiness = Math.min(100, gameState.happiness + 20);
    gameState.energy = Math.min(100, gameState.energy + 15);
    gameState.score += Math.floor(12 * bonus);
    updateActionCounters('pizza');
    playEatSound();
    setTimeout(() => playHappySound(), 200);
    showMessage('Mmm, pizza er så godt! 🍕😻');
    showFood('pizza', 2000);
    createParticles(document.getElementById('pizza-btn'));
    updateStats();
});

// Bottle action
document.getElementById('bottle-btn').addEventListener('click', () => {
    if (isActionOnCooldown('bottle', 2.5)) {
        showMessage('Katten drikker allerede! Vent litt... ⏳');
        return;
    }
    
    if (gameState.hunger < 10) {
        showMessage('Katten er ikke sulten nok til tåteflaske nå. 😊');
        return;
    }
    
    setActionCooldown('bottle');
    updateButtonCooldown('bottle-btn', 2.5, 'bottle');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.hunger = Math.max(0, gameState.hunger - 15);
    gameState.happiness = Math.min(100, gameState.happiness + 15);
    gameState.energy = Math.min(100, gameState.energy + 10);
    gameState.score += Math.floor(9 * bonus);
    updateActionCounters('bottle');
    playEatSound();
    setTimeout(() => playPurrSound(), 150);
    showMessage('Mmm, koselig! 🍼😸');
    showFood('bottle', 2000);
    createParticles(document.getElementById('bottle-btn'));
    updateStats();
});

// Hand pet action
document.getElementById('hand-btn').addEventListener('click', () => {
    if (isActionOnCooldown('hand', 2)) {
        showMessage('Katten koser allerede! Vent litt... ⏳');
        return;
    }
    
    setActionCooldown('hand');
    updateButtonCooldown('hand-btn', 2, 'hand');
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.happiness = Math.min(100, gameState.happiness + 25);
    gameState.energy = Math.min(100, gameState.energy + 10);
    gameState.score += Math.floor(10 * bonus);
    updateActionCounters('hand');
    playPurrSound();
    setTimeout(() => playMeowSound(), 300);
    showMessage('Purr purr... Så godt! 👋😸');
    createParticles(document.getElementById('hand-btn'));
    updateStats();
});

// Cat click interaction
document.getElementById('game-cat').addEventListener('click', () => {
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.happiness = Math.min(100, gameState.happiness + 5);
    gameState.score += Math.floor(2 * bonus);
        updateActionCounters('click');
        playClickSound();
        setTimeout(() => playMeowSound(), 100);
        showMessage('Hei! 👋😸');
        createParticles(document.getElementById('game-cat'));
    updateStats();
});

// Periodic hunger increase
setInterval(() => {
    if (document.getElementById('game-tab').classList.contains('active')) {
        gameState.hunger = Math.min(100, gameState.hunger + 2);
        gameState.energy = Math.max(0, gameState.energy - 1);
        updateStats();
    }
}, 5000);

// ==================== SHOP SYSTEM ====================
const shopItems = [
    { id: 'ball', name: 'Ball 🎾', price: 50, emoji: '🎾', effect: 'happiness+5', useType: 'play', useLabel: 'Leke med ball' },
    { id: 'mouse', name: 'Kattemus 🐭', price: 75, emoji: '🐭', effect: 'happiness+8', useType: 'play', useLabel: 'Leke med mus' },
    { id: 'tree', name: 'Kloretre 🌳', price: 100, emoji: '🌳', effect: 'energy+10', useType: 'play', useLabel: 'Bruk kloretre' },
    { id: 'toy', name: 'Leksak 🧸', price: 60, emoji: '🧸', effect: 'happiness+6', useType: 'play', useLabel: 'Leke med leksak' },
    { id: 'feather', name: 'Fjærspill 🪶', price: 85, emoji: '🪶', effect: 'happiness+9', useType: 'play', useLabel: 'Leke med fjær' },
    { id: 'laser', name: 'Laserpeker 🔴', price: 120, emoji: '🔴', effect: 'happiness+12', useType: 'play', useLabel: 'Leke med laser' },
    { id: 'tunnel', name: 'Kattetunnel 🕳️', price: 150, emoji: '🕳️', effect: 'happiness+15', useType: 'play', useLabel: 'Lek i tunnel' },
    { id: 'pillow', name: 'Myk pute 💤', price: 70, emoji: '💤', effect: 'energy+15', useType: 'sleep', useLabel: 'Sove på pute' },
    { id: 'blanket', name: 'Varmt teppe 🛏️', price: 90, emoji: '🛏️', effect: 'energy+20', useType: 'sleep', useLabel: 'Sove under teppe' },
    { id: 'collar1', name: 'Rødt halsbånd 🔴', price: 80, emoji: '🔴', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'collar2', name: 'Blått halsbånd 🔵', price: 80, emoji: '🔵', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'collar3', name: 'Grønt halsbånd 🟢', price: 80, emoji: '🟢', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'collar4', name: 'Gull halsbånd ⭐', price: 150, emoji: '⭐', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'bell', name: 'Bjelle 🔔', price: 90, emoji: '🔔', effect: 'happiness+7', useType: 'cosmetic', useLabel: null },
    { id: 'bow1', name: 'Rosa sløyfe 🎀', price: 100, emoji: '🎀', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'bow2', name: 'Blå sløyfe 💙', price: 100, emoji: '💙', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'hat', name: 'Kattelue 🎩', price: 130, emoji: '🎩', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'glasses', name: 'Sunglasses 😎', price: 140, emoji: '😎', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'bg-pink', name: 'Rosa bakgrunn 🌸', price: 200, emoji: '🌸', effect: 'background', useType: 'cosmetic', useLabel: null },
    { id: 'bg-blue', name: 'Blå bakgrunn 💙', price: 200, emoji: '💙', effect: 'background', useType: 'cosmetic', useLabel: null },
    { id: 'bg-rainbow', name: 'Regnbue bakgrunn 🌈', price: 300, emoji: '🌈', effect: 'background', useType: 'cosmetic', useLabel: null },
    { id: 'bg-space', name: 'Rom bakgrunn 🚀', price: 350, emoji: '🚀', effect: 'background', useType: 'cosmetic', useLabel: null }
];

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    shopItems.forEach(item => {
        const owned = gameState.ownedItems.includes(item.id);
        const div = document.createElement('div');
        div.className = `shop-item ${owned ? 'owned' : ''}`;
        div.innerHTML = `
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">💰 ${item.price}</div>
            <button class="action-btn shop-btn" ${owned ? 'disabled' : ''} onclick="buyItem('${item.id}')">
                ${owned ? 'Eid ✓' : 'Kjøp'}
            </button>
        `;
        container.appendChild(div);
    });
}

function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    if (gameState.coins >= item.price && !gameState.ownedItems.includes(itemId)) {
        gameState.coins -= item.price;
        gameState.ownedItems.push(itemId);
        if (item.effect.startsWith('happiness')) {
            gameState.happiness = Math.min(100, gameState.happiness + parseInt(item.effect.split('+')[1]));
        } else if (item.effect.startsWith('energy')) {
            gameState.energy = Math.min(100, gameState.energy + parseInt(item.effect.split('+')[1]));
        } else if (item.effect === 'background') {
            applyBackground(itemId);
        }
        playBuySound();
        showMessage(`Du kjøpte ${item.name}! 🎉`);
        renderShop();
        renderOwnedItemsInGame();
        updateAllDisplays();
        saveGame();
    } else {
        showMessage('Du har ikke nok mynter! 💰');
    }
}

function applyBackground(bgId) {
    if (!gameState.ownedItems.includes(bgId)) return;
    
    const bgMap = {
        'bg-pink': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'bg-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'bg-rainbow': 'linear-gradient(135deg, #ff0000 0%, #ff7f00 16%, #ffff00 33%, #00ff00 50%, #0000ff 66%, #4b0082 83%, #9400d3 100%)',
        'bg-space': 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)'
    };
    
    if (bgMap[bgId]) {
        document.body.style.background = bgMap[bgId];
        document.body.style.backgroundSize = '100% 100%';
        document.body.style.animation = 'none';
        localStorage.setItem(`miaumiauBackground_${currentUser}`, bgId);
    }
}

// ==================== ACHIEVEMENTS SYSTEM ====================
const achievements = [
    { id: 'fed100', name: 'Kattemester', desc: 'Mat katten 100 ganger', icon: '🍖', target: 100, stat: 'timesFed' },
    { id: 'fed50', name: 'Kattetaker', desc: 'Mat katten 50 ganger', icon: '🍖', target: 50, stat: 'timesFed' },
    { id: 'fed10', name: 'Kattvenn', desc: 'Mat katten 10 ganger', icon: '🍖', target: 10, stat: 'timesFed' },
    { id: 'pet50', name: 'Koseekspert', desc: 'Kose katten 50 ganger', icon: '❤️', target: 50, stat: 'timesPetted' },
    { id: 'pet100', name: 'Koseguru', desc: 'Kose katten 100 ganger', icon: '💕', target: 100, stat: 'timesPetted' },
    { id: 'play30', name: 'Lekekamerat', desc: 'Lek med katten 30 ganger', icon: '🎾', target: 30, stat: 'timesPlayed' },
    { id: 'play100', name: 'Lekemester', desc: 'Lek med katten 100 ganger', icon: '🎮', target: 100, stat: 'timesPlayed' },
    { id: 'pizza10', name: 'Pizzaelsker', desc: 'Gi pizza 10 ganger', icon: '🍕', target: 10, stat: 'pizzaGiven' },
    { id: 'level10', name: 'Nivåmester', desc: 'Nå nivå 10', icon: '⭐', target: 10, stat: 'level', type: 'level' },
    { id: 'level20', name: 'Legende', desc: 'Nå nivå 20', icon: '🏆', target: 20, stat: 'level', type: 'level' },
    { id: 'level30', name: 'Superstjerne', desc: 'Nå nivå 30', icon: '🌟', target: 30, stat: 'level', type: 'level' },
    { id: 'score1000', name: 'Poengkonge', desc: 'Samle 1000 poeng', icon: '💰', target: 1000, stat: 'score', type: 'score' },
    { id: 'score5000', name: 'Poengmester', desc: 'Samle 5000 poeng', icon: '💎', target: 5000, stat: 'score', type: 'score' },
    { id: 'score10000', name: 'Poenglegende', desc: 'Samle 10000 poeng', icon: '👑', target: 10000, stat: 'score', type: 'score' },
    { id: 'minigame100', name: 'Minispillmester', desc: 'Få 100 poeng i minispill', icon: '🎯', target: 100, stat: 'minigameScore', type: 'minigame' },
    { id: 'minigame500', name: 'Minispillguru', desc: 'Få 500 poeng i minispill', icon: '🎪', target: 500, stat: 'minigameScore', type: 'minigame' },
    { id: 'coins100', name: 'Rik', desc: 'Samle 100 mynter', icon: '💵', target: 100, stat: 'coins', type: 'coins' },
    { id: 'coins500', name: 'Veldig rik', desc: 'Samle 500 mynter', icon: '💴', target: 500, stat: 'coins', type: 'coins' },
    { id: 'items5', name: 'Samler', desc: 'Eie 5 items', icon: '🛍️', target: 5, stat: 'ownedItems', type: 'items' },
    { id: 'items10', name: 'Storsamler', desc: 'Eie 10 items', icon: '🎁', target: 10, stat: 'ownedItems', type: 'items' },
    { id: 'clean50', name: 'Renlig', desc: 'Vask katten 50 ganger', icon: '🧼', target: 50, stat: 'timesCleaned' },
    { id: 'sleep50', name: 'Søvnmester', desc: 'La katten sove 50 ganger', icon: '😴', target: 50, stat: 'timesSlept' }
];

function checkAchievements() {
    achievements.forEach(achievement => {
        if (gameState.achievements[achievement.id]) return; // Already unlocked
        
        let progress = 0;
        if (achievement.type === 'level') {
            progress = gameState.level;
        } else if (achievement.type === 'score') {
            progress = gameState.score;
        } else if (achievement.type === 'minigame') {
            progress = gameState.stats.minigameScore || 0;
        } else if (achievement.type === 'coins') {
            progress = gameState.coins;
        } else if (achievement.type === 'items') {
            progress = gameState.ownedItems.length;
        } else {
            progress = gameState.stats[achievement.stat] || 0;
        }
        
        if (progress >= achievement.target) {
            gameState.achievements[achievement.id] = true;
            const reward = achievement.target >= 100 ? 100 : 50; // More coins for harder achievements
            gameState.coins += reward;
            playSuccessSound();
            showMessage(`🏆 Bedrift oppnådd: ${achievement.name}! +${reward} mynter! 🏆`);
            saveGame();
        }
    });
    renderAchievements();
}

function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    container.innerHTML = '';
    achievements.forEach(achievement => {
        const unlocked = gameState.achievements[achievement.id];
        let progress = 0;
        if (achievement.type === 'level') {
            progress = gameState.level;
        } else if (achievement.type === 'score') {
            progress = gameState.score;
        } else {
            progress = gameState.stats[achievement.stat] || 0;
        }
        const percent = Math.min(100, (progress / achievement.target) * 100);
        
        const div = document.createElement('div');
        div.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                <div class="achievement-progress">
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${percent}%"></div>
                    </div>
                    <span>${progress}/${achievement.target}</span>
                </div>
            </div>
            ${unlocked ? '<div class="achievement-badge">✓</div>' : ''}
        `;
        container.appendChild(div);
    });
}

// ==================== HELPER FUNCTIONS ====================
function updateDailyChallengeProgress(type) {
    if (gameState.dailyChallenge && gameState.dailyChallenge.type === type) {
        gameState.dailyChallenge.progress = Math.min(
            gameState.dailyChallenge.target, 
            gameState.dailyChallenge.progress + 1
        );
        updateDailyChallenge();
    }
}

// ==================== DAILY CHALLENGES ====================
function generateDailyChallenge() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`dailyChallenge_${currentUser}`);
    
    if (savedChallenge) {
        const challenge = JSON.parse(savedChallenge);
        if (challenge.date === today) {
            gameState.dailyChallenge = challenge;
            return;
        }
    }
    
    const challenges = [
        { type: 'feed', target: 5, reward: 50, desc: 'Mat katten 5 ganger i dag', icon: '🍖' },
        { type: 'play', target: 3, reward: 40, desc: 'Lek med katten 3 ganger', icon: '🎾' },
        { type: 'pet', target: 10, reward: 60, desc: 'Kose katten 10 ganger', icon: '❤️' },
        { type: 'sleep', target: 2, reward: 30, desc: 'La katten sove 2 ganger', icon: '😴' },
        { type: 'pizza', target: 2, reward: 70, desc: 'Gi pizza 2 ganger', icon: '🍕' },
        { type: 'clean', target: 3, reward: 45, desc: 'Vask katten 3 ganger', icon: '🛁' },
        { type: 'minigame', target: 1, reward: 80, desc: 'Spill et minispill', icon: '🎯' }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    challenge.date = today;
    challenge.progress = 0;
    gameState.dailyChallenge = challenge;
    localStorage.setItem(`dailyChallenge_${currentUser}`, JSON.stringify(challenge));
}

function updateDailyChallenge() {
    if (!gameState.dailyChallenge) {
        generateDailyChallenge();
    }
    const container = document.getElementById('daily-challenge');
    if (!container) return;
    
    const challenge = gameState.dailyChallenge;
    if (challenge.progress >= challenge.target && !gameState.challengeCompleted) {
        gameState.coins += challenge.reward;
        gameState.challengeCompleted = true;
        playChallengeSound();
        showMessage(`🎉 Daglig utfordring fullført! +${challenge.reward} mynter! 🎉`);
        if (currentUser) {
            localStorage.setItem(`dailyChallenge_${currentUser}`, JSON.stringify(challenge));
        }
        saveGame();
    }
    
    container.innerHTML = gameState.challengeCompleted ? 
        `<div class="challenge-complete">
            ✓ Utfordring fullført! 🎉<br>
            <small style="color: #666;">Flott jobbet! Hvorfor ikke leke med dine items, spille et minispill, eller utforske kattealbumet? Det er alltid noe morsomt å gjøre! 🎮</small>
        </div>` :
        `<div class="challenge-active">
            <strong>📅 Daglig utfordring:</strong> ${challenge.desc}
            <div class="challenge-progress">${challenge.progress}/${challenge.target} ${challenge.icon}</div>
        </div>`;
    
    // Update daily reward
    updateDailyReward();
}

// ==================== DAILY REWARD ====================
function updateDailyReward() {
    const container = document.getElementById('daily-reward-section');
    if (!container) return;
    
    const today = new Date().toDateString();
    const lastReward = gameState.lastDailyReward;
    
    if (lastReward === today) {
        container.innerHTML = `
            <div class="daily-reward-claimed">
                ✅ Daglig belønning hentet i dag! Kom tilbake i morgen! 🎁
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="daily-reward-available">
            <strong>🎁 Daglig belønning!</strong><br>
            <button class="action-btn" onclick="claimDailyReward()" style="margin-top: 10px;">
                Hent belønning! 🎉
            </button>
        </div>
    `;
}

function claimDailyReward() {
    const today = new Date().toDateString();
    if (gameState.lastDailyReward === today) {
        showMessage('Du har allerede hentet belønningen i dag! Kom tilbake i morgen! 🎁');
        return;
    }
    
    const rewards = [50, 75, 100, 125, 150];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    gameState.coins += reward;
    gameState.lastDailyReward = today;
    gameState.score += reward;
    
    playSuccessSound();
    showMessage(`🎁 Daglig belønning! Du fikk ${reward} mynter! 🎉`);
    updateDailyReward();
    updateAllDisplays();
    saveGame();
}

// ==================== CAT TRICKS ====================
function teachCatTrick(trick) {
    if (gameState.energy < 30) {
        showMessage('Katten er for sliten for å lære triks nå! La den hvile først! 😴');
        return;
    }
    
    if (gameState.happiness < 50) {
        showMessage('Katten er ikke glad nok! Kos og mat den først! ❤️');
        return;
    }
    
    if (isActionOnCooldown(`trick-${trick}`, 5)) {
        showMessage('Katten øver allerede! Vent litt! ⏳');
        return;
    }
    
    setActionCooldown(`trick-${trick}`);
    
    // Chance to learn trick based on level
    const learnChance = Math.min(0.9, 0.3 + (gameState.level * 0.02));
    const learned = Math.random() < learnChance;
    
    gameState.energy = Math.max(0, gameState.energy - 20);
    gameState.happiness = Math.min(100, gameState.happiness + 5);
    
    const trickNames = {
        'sit': 'Sitt',
        'jump': 'Hopp',
        'spin': 'Snurr',
        'dance': 'Dans'
    };
    
    const trickEmojis = {
        'sit': '🪑',
        'jump': '🦘',
        'spin': '🌪️',
        'dance': '💃'
    };
    
    if (learned && !gameState.catTricks.includes(trick)) {
        gameState.catTricks.push(trick);
        gameState.score += 50;
        gameState.coins += 25;
        playSuccessSound();
        showMessage(`🎉 Fantastisk! Katten lærte trikset "${trickNames[trick]}"! +50 poeng og +25 mynter! ${trickEmojis[trick]}`);
        
        // Show trick animation
        performCatTrick(trick);
    } else if (learned) {
        playPurrSound();
        showMessage(`Katten kan allerede "${trickNames[trick]}"! Den gjør det perfekt! ${trickEmojis[trick]}`);
        performCatTrick(trick);
    } else {
        playErrorSound();
        showMessage(`Katten prøvde, men klarte det ikke denne gangen. Prøv igjen! 💪`);
    }
    
    updateAllDisplays();
    saveGame();
}

function performCatTrick(trick) {
    const catEmoji = document.getElementById('cat-emoji');
    const catGif = document.getElementById('game-cat-gif');
    
    if (!catEmoji && !catGif) return;
    
    const tricks = {
        'sit': { emoji: '🪑', animation: 'sitDown 0.5s ease' },
        'jump': { emoji: '🦘', animation: 'jumpUp 0.6s ease' },
        'spin': { emoji: '🌪️', animation: 'spinAround 1s ease' },
        'dance': { emoji: '💃', animation: 'danceMove 1.5s ease infinite' }
    };
    
    const trickData = tricks[trick];
    if (!trickData) return;
    
    // Create temporary animation
    const originalStyle = catEmoji ? catEmoji.style.cssText : '';
    if (catEmoji) {
        catEmoji.style.animation = trickData.animation;
        catEmoji.textContent = trickData.emoji;
        
        setTimeout(() => {
            catEmoji.style.cssText = originalStyle;
            updateCatGifDisplay();
        }, 1500);
    }
    
    createParticles(catEmoji || catGif);
}

// ==================== MINIGAMES ====================
let mouseHuntInterval = null;
let mouseHuntTime = 30;
let mouseHuntScore = 0;

function startMouseHunt() {
    document.getElementById('mouse-hunt-area').style.display = 'block';
    mouseHuntScore = 0;
    mouseHuntTime = 30;
    document.getElementById('mouse-score').textContent = '0';
    document.getElementById('mouse-time').textContent = '30';
    
    const area = document.getElementById('mouse-hunt-area');
    area.innerHTML = `
        <div class="score-mini">Poeng: <span id="mouse-score">0</span></div>
        <div class="time-left">Tid igjen: <span id="mouse-time">30</span>s</div>
        <div class="mouse-game-area" id="mouse-area"></div>
    `;
    
    const mouseArea = document.getElementById('mouse-area');
    const timer = setInterval(() => {
        mouseHuntTime--;
        document.getElementById('mouse-time').textContent = mouseHuntTime;
        if (mouseHuntTime <= 0) {
            clearInterval(timer);
            if (mouseHuntInterval) clearInterval(mouseHuntInterval);
            gameState.coins += Math.floor(mouseHuntScore / 10);
            gameState.stats.minigameScore += mouseHuntScore;
            gameState.score += mouseHuntScore; // Add to total score
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${mouseHuntScore} poeng! +${Math.floor(mouseHuntScore/10)} mynter!`);
            mouseArea.innerHTML = `<button class="action-btn" onclick="startMouseHunt()">Spill igjen</button>`;
            updateStats(); // Update all stats including level
            renderStats(); // Update stats display
            saveGame();
        }
    }, 1000);
    
    mouseHuntInterval = setInterval(() => {
        const mouse = document.createElement('div');
        mouse.className = 'mouse';
        mouse.textContent = '🐭';
        mouse.style.left = Math.random() * 90 + '%';
        mouse.style.top = Math.random() * 80 + '%';
        mouse.onclick = function() {
            mouseHuntScore += 10;
            document.getElementById('mouse-score').textContent = mouseHuntScore;
            playClickSound();
            this.remove();
            createParticles(this);
        };
        mouseArea.appendChild(mouse);
        setTimeout(() => mouse.remove(), 2000);
    }, 1000);
}

let foodCatchInterval = null;
let foodCatchTime = 30;
let foodCatchScore = 0;
let foodPosition = 50;
let foodCatchTouchStartX = null;

let foodCatchKeyListener = null;
let foodCatchTouchListener = null;

function startFoodCatch() {
    document.getElementById('food-catch-area').style.display = 'block';
    foodCatchScore = 0;
    foodCatchTime = 30;
    foodPosition = 50;
    document.getElementById('food-score').textContent = '0';
    document.getElementById('food-time').textContent = '30';
    
    const container = document.getElementById('catch-container');
    
    // Remove old listeners if exist
    if (foodCatchKeyListener) {
        document.removeEventListener('keydown', foodCatchKeyListener);
    }
    if (foodCatchTouchListener && container) {
        const gameArea = container.querySelector('.catch-game-area');
        if (gameArea) {
            gameArea.removeEventListener('touchstart', foodCatchTouchListener.touchstart);
            gameArea.removeEventListener('touchmove', foodCatchTouchListener.touchmove);
        }
    }
    container.innerHTML = `
        <div class="catch-instructions">🎮 Bruk ← → piltastene, swipe eller knappene for å flytte katten!</div>
        <div class="catch-controls">
            <button class="catch-move-btn" id="catch-left-btn">←</button>
            <div class="catch-game-area">
                <div class="catch-cat" style="left: 50%;">😸</div>
                <div class="catch-food" style="display: none;"></div>
            </div>
            <button class="catch-move-btn" id="catch-right-btn">→</button>
        </div>
    `;
    
    let gameTimer = null;
    gameTimer = setInterval(() => {
        foodCatchTime--;
        document.getElementById('food-time').textContent = foodCatchTime;
        if (foodCatchTime <= 0) {
            clearInterval(gameTimer);
            if (foodCatchInterval) clearInterval(foodCatchInterval);
            if (intervals.left) clearInterval(intervals.left);
            if (intervals.right) clearInterval(intervals.right);
            if (foodCatchKeyListener) {
                document.removeEventListener('keydown', foodCatchKeyListener);
                foodCatchKeyListener = null;
            }
            if (foodCatchTouchListener) {
                const gameArea = container.querySelector('.catch-game-area');
                if (gameArea) {
                    gameArea.removeEventListener('touchstart', foodCatchTouchListener.touchstart);
                    gameArea.removeEventListener('touchmove', foodCatchTouchListener.touchmove);
                }
                foodCatchTouchListener = null;
            }
            gameState.coins += Math.floor(foodCatchScore / 10);
            gameState.stats.minigameScore += foodCatchScore;
            gameState.score += foodCatchScore; // Add to total score
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${foodCatchScore} poeng! +${Math.floor(foodCatchScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startFoodCatch()">Spill igjen</button>`;
            updateStats(); // Update all stats including level
            renderStats(); // Update stats display
            saveGame();
        }
    }, 1000);
    
    // Movement function
    const moveCat = (direction) => {
        if (direction === 'left' && foodPosition > 0) {
            foodPosition = Math.max(0, foodPosition - 5);
        }
        if (direction === 'right' && foodPosition < 95) {
            foodPosition = Math.min(95, foodPosition + 5);
        }
        const cat = document.querySelector('.catch-cat');
        if (cat) {
            cat.style.left = foodPosition + '%';
        }
    };
    
    // Add key listener for arrow keys
    foodCatchKeyListener = (e) => {
        if (e.key === 'ArrowLeft') moveCat('left');
        if (e.key === 'ArrowRight') moveCat('right');
    };
    document.addEventListener('keydown', foodCatchKeyListener);
    
    // Add touch listeners for iPad/mobile
    const gameArea = container.querySelector('.catch-game-area');
    foodCatchTouchListener = {
        touchstart: (e) => {
            e.preventDefault();
            foodCatchTouchStartX = e.touches[0].clientX;
        },
        touchmove: (e) => {
            e.preventDefault();
            if (foodCatchTouchStartX === null) return;
            const touchX = e.touches[0].clientX;
            const diff = foodCatchTouchStartX - touchX;
            
            if (Math.abs(diff) > 10) { // Minimum swipe distance
                if (diff > 0) {
                    moveCat('left');
                } else {
                    moveCat('right');
                }
                foodCatchTouchStartX = touchX; // Update for continuous movement
            }
        }
    };
    
    if (gameArea) {
        gameArea.addEventListener('touchstart', foodCatchTouchListener.touchstart, { passive: false });
        gameArea.addEventListener('touchmove', foodCatchTouchListener.touchmove, { passive: false });
    }
    
    // Add button listeners for touch devices with continuous movement
    const leftBtn = document.getElementById('catch-left-btn');
    const rightBtn = document.getElementById('catch-right-btn');
    
    // Store references for cleanup
    const intervals = { left: null, right: null };
    
    const startMoving = (direction) => {
        if (direction === 'left') {
            if (intervals.left) clearInterval(intervals.left);
            moveCat('left');
            intervals.left = setInterval(() => moveCat('left'), 50); // Move every 50ms
        } else {
            if (intervals.right) clearInterval(intervals.right);
            moveCat('right');
            intervals.right = setInterval(() => moveCat('right'), 50);
        }
    };
    
    const stopMoving = (direction) => {
        if (direction === 'left' && intervals.left) {
            clearInterval(intervals.left);
            intervals.left = null;
        }
        if (direction === 'right' && intervals.right) {
            clearInterval(intervals.right);
            intervals.right = null;
        }
    };
    
    if (leftBtn) {
        // Touch events
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startMoving('left');
        }, { passive: false });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopMoving('left');
        }, { passive: false });
        leftBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            stopMoving('left');
        }, { passive: false });
        
        // Mouse events
        leftBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startMoving('left');
        });
        leftBtn.addEventListener('mouseup', () => stopMoving('left'));
        leftBtn.addEventListener('mouseleave', () => stopMoving('left'));
        
        // Click fallback
        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            moveCat('left');
        });
    }
    
    if (rightBtn) {
        // Touch events
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startMoving('right');
        }, { passive: false });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopMoving('right');
        }, { passive: false });
        rightBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            stopMoving('right');
        }, { passive: false });
        
        // Mouse events
        rightBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startMoving('right');
        });
        rightBtn.addEventListener('mouseup', () => stopMoving('right'));
        rightBtn.addEventListener('mouseleave', () => stopMoving('right'));
        
        // Click fallback
        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            moveCat('right');
        });
    }
    
    
    let foodY = -10; // Start above screen
    let foodX = Math.random() * 80 + 10; // Random X position
    let foodActive = false;
    
    foodCatchInterval = setInterval(() => {
        const food = document.querySelector('.catch-food');
        const cat = document.querySelector('.catch-cat');
        
        if (!food || !cat) return;
        
        // Spawn new food if none is falling
        if (!foodActive || foodY > 100) {
            foodY = -5;
            foodX = Math.random() * 80 + 10; // Random position
            foodActive = true;
            food.style.display = 'block';
            food.textContent = '🍖';
        }
        
        // Make food fall
        foodY += 3;
        food.style.top = foodY + '%';
        food.style.left = foodX + '%';
        
        // Get positions
        const catLeft = parseFloat(cat.style.left) || 50;
        const catRight = catLeft + 5; // Cat is about 5% wide
        const foodLeft = foodX;
        const foodRight = foodX + 3; // Food is about 3% wide
        
        // Check if food is caught (food is near bottom and cat is under it)
        if (foodY > 80 && foodY < 95) {
            if ((foodLeft >= catLeft - 5 && foodLeft <= catRight + 5) || 
                (foodRight >= catLeft - 5 && foodRight <= catRight + 5)) {
                // Caught!
                foodCatchScore += 15;
                document.getElementById('food-score').textContent = foodCatchScore;
                foodY = -5; // Reset food
                foodX = Math.random() * 80 + 10;
                playEatSound();
                createParticles(cat);
            }
        }
        
        // If food reaches bottom, reset it
        if (foodY > 100) {
            foodY = -5;
            foodX = Math.random() * 80 + 10;
        }
    }, 50);
}

// ==================== CAT BATTLE MINIGAME ====================
let catBattleInterval = null;
let catBattleTime = 30;
let catBattleScore = 0;
let battleAttackReady = false;

function startCatBattle() {
    document.getElementById('cat-battle-area').style.display = 'block';
    catBattleScore = 0;
    catBattleTime = 30;
    battleAttackReady = false;
    document.getElementById('battle-score').textContent = '0';
    document.getElementById('battle-time').textContent = '30';
    
    const container = document.getElementById('battle-container');
    container.innerHTML = `
        <img src="Bilder/Cat Battle GIF.gif" alt="Kattkamp" class="battle-cat-gif" style="position: absolute; left: 20%;">
        <img src="Bilder/Cat Battle GIF.gif" alt="Fiende" class="battle-enemy-gif" style="position: absolute; right: 20%; transform: scaleX(-1);">
        <button class="battle-attack-btn" id="battle-attack-btn">Angrep!</button>
    `;
    
    const attackBtn = document.getElementById('battle-attack-btn');
    
    const timer = setInterval(() => {
        catBattleTime--;
        document.getElementById('battle-time').textContent = catBattleTime;
        if (catBattleTime <= 0) {
            clearInterval(timer);
            if (catBattleInterval) clearInterval(catBattleInterval);
            gameState.coins += Math.floor(catBattleScore / 10);
            gameState.stats.minigameScore += catBattleScore;
            gameState.score += catBattleScore;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${catBattleScore} poeng! +${Math.floor(catBattleScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startCatBattle()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    // Make attack button ready at random intervals
    catBattleInterval = setInterval(() => {
        if (!battleAttackReady) {
            battleAttackReady = true;
            attackBtn.classList.add('ready');
            attackBtn.textContent = 'ANGREP NÅ!';
            
            // Auto-disable after 1 second if not clicked
            setTimeout(() => {
                if (battleAttackReady) {
                    battleAttackReady = false;
                    attackBtn.classList.remove('ready');
                    attackBtn.textContent = 'Vent...';
                }
            }, 1000);
        }
    }, 2000 + Math.random() * 2000);
    
    attackBtn.onclick = () => {
        if (battleAttackReady) {
            catBattleScore += 20;
            document.getElementById('battle-score').textContent = catBattleScore;
            battleAttackReady = false;
            attackBtn.classList.remove('ready');
            attackBtn.textContent = 'Angrep!';
            playClickSound();
            createParticles(attackBtn);
            
            // Enemy bounces back
            const enemy = document.querySelector('.battle-enemy');
            enemy.style.animation = 'none';
            setTimeout(() => {
                enemy.style.animation = 'battleBounce 0.5s ease infinite';
            }, 10);
        } else {
            showMessage('Ikke nå! Vent til knappen lyser! ⚠️');
        }
    };
}

// ==================== CAT SCRATCH MINIGAME ====================
let catScratchInterval = null;
let catScratchTime = 30;
let catScratchScore = 0;
let scratchButtons = [];

function startCatScratch() {
    document.getElementById('cat-scratch-area').style.display = 'block';
    catScratchScore = 0;
    catScratchTime = 30;
    document.getElementById('scratch-score').textContent = '0';
    document.getElementById('scratch-time').textContent = '30';
    
    const container = document.getElementById('scratch-container');
    container.innerHTML = '<div class="scratch-tree" id="scratch-tree"></div>';
    
    const tree = document.getElementById('scratch-tree');
    scratchButtons = [];
    
    // Create 4 scratch buttons
    for (let i = 0; i < 4; i++) {
        const btn = document.createElement('div');
        btn.className = 'scratch-button';
        btn.textContent = '🐾';
        btn.dataset.index = i;
        btn.onclick = () => {
            if (btn.classList.contains('active')) {
                catScratchScore += 15;
                document.getElementById('scratch-score').textContent = catScratchScore;
                btn.classList.remove('active');
                playClickSound();
                createParticles(btn);
            }
        };
        tree.appendChild(btn);
        scratchButtons.push(btn);
    }
    
    const timer = setInterval(() => {
        catScratchTime--;
        document.getElementById('scratch-time').textContent = catScratchTime;
        if (catScratchTime <= 0) {
            clearInterval(timer);
            if (catScratchInterval) clearInterval(catScratchInterval);
            gameState.coins += Math.floor(catScratchScore / 10);
            gameState.stats.minigameScore += catScratchScore;
            gameState.score += catScratchScore;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${catScratchScore} poeng! +${Math.floor(catScratchScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startCatScratch()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    // Activate random buttons
    catScratchInterval = setInterval(() => {
        // Deactivate all
        scratchButtons.forEach(btn => btn.classList.remove('active'));
        
        // Activate 1-2 random buttons
        const numActive = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numActive; i++) {
            const randomBtn = scratchButtons[Math.floor(Math.random() * scratchButtons.length)];
            randomBtn.classList.add('active');
            
            // Auto-deactivate after 2 seconds
            setTimeout(() => {
                randomBtn.classList.remove('active');
            }, 2000);
        }
    }, 2500);
}

// ==================== CAT HUNT MINIGAME ====================
let catHuntInterval = null;
let catHuntTime = 30;
let catHuntScore = 0;
let huntCatPosition = 50;
let huntTargets = [];

function startCatHunt() {
    document.getElementById('cat-hunt-area').style.display = 'block';
    catHuntScore = 0;
    catHuntTime = 30;
    huntCatPosition = 50;
    huntTargets = [];
    document.getElementById('hunt-score').textContent = '0';
    document.getElementById('hunt-time').textContent = '30';
    
    const container = document.getElementById('hunt-container');
    container.innerHTML = `
        <div class="hunt-cat" style="left: 50%;">😸</div>
        <div class="catch-controls" style="position: absolute; bottom: 10px; width: 100%;">
            <button class="catch-move-btn" id="hunt-left-btn">←</button>
            <button class="catch-move-btn" id="hunt-right-btn">→</button>
        </div>
    `;
    
    const timer = setInterval(() => {
        catHuntTime--;
        document.getElementById('hunt-time').textContent = catHuntTime;
        if (catHuntTime <= 0) {
            clearInterval(timer);
            if (catHuntInterval) clearInterval(catHuntInterval);
            huntTargets.forEach(target => target.remove());
            huntTargets = [];
            gameState.coins += Math.floor(catHuntScore / 10);
            gameState.stats.minigameScore += catHuntScore;
            gameState.score += catHuntScore;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${catHuntScore} poeng! +${Math.floor(catHuntScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startCatHunt()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    // Movement
    const moveCat = (direction) => {
        if (direction === 'left' && huntCatPosition > 0) {
            huntCatPosition = Math.max(0, huntCatPosition - 5);
        }
        if (direction === 'right' && huntCatPosition < 95) {
            huntCatPosition = Math.min(95, huntCatPosition + 5);
        }
        const cat = document.querySelector('.hunt-cat');
        if (cat) {
            cat.style.left = huntCatPosition + '%';
        }
    };
    
    // Button listeners
    const leftBtn = document.getElementById('hunt-left-btn');
    const rightBtn = document.getElementById('hunt-right-btn');
    const huntIntervals = { left: null, right: null };
    
    const startMoving = (direction) => {
        if (direction === 'left') {
            if (huntIntervals.left) clearInterval(huntIntervals.left);
            moveCat('left');
            huntIntervals.left = setInterval(() => moveCat('left'), 50);
        } else {
            if (huntIntervals.right) clearInterval(huntIntervals.right);
            moveCat('right');
            huntIntervals.right = setInterval(() => moveCat('right'), 50);
        }
    };
    
    const stopMoving = (direction) => {
        if (direction === 'left' && huntIntervals.left) {
            clearInterval(huntIntervals.left);
            huntIntervals.left = null;
        }
        if (direction === 'right' && huntIntervals.right) {
            clearInterval(huntIntervals.right);
            huntIntervals.right = null;
        }
    };
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startMoving('left'); }, { passive: false });
        leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopMoving('left'); }, { passive: false });
        leftBtn.addEventListener('mousedown', () => startMoving('left'));
        leftBtn.addEventListener('mouseup', () => stopMoving('left'));
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startMoving('right'); }, { passive: false });
        rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopMoving('right'); }, { passive: false });
        rightBtn.addEventListener('mousedown', () => startMoving('right'));
        rightBtn.addEventListener('mouseup', () => stopMoving('right'));
    }
    
    // Spawn targets (birds and fish)
    catHuntInterval = setInterval(() => {
        const target = document.createElement('div');
        target.className = 'hunt-target';
        target.textContent = Math.random() > 0.5 ? '🐦' : '🐟';
        target.style.left = Math.random() * 80 + 10 + '%';
        target.style.top = '-5%';
        let targetY = -5;
        
        const targetInterval = setInterval(() => {
            targetY += 2;
            target.style.top = targetY + '%';
            
            const cat = document.querySelector('.hunt-cat');
            if (cat && targetY > 80) {
                const catLeft = parseFloat(cat.style.left) || 50;
                const targetLeft = parseFloat(target.style.left);
                
                if (Math.abs(catLeft - targetLeft) < 10) {
                    catHuntScore += 20;
                    document.getElementById('hunt-score').textContent = catHuntScore;
                    target.remove();
                    clearInterval(targetInterval);
                    playEatSound();
                    createParticles(cat);
                    return;
                }
            }
            
            if (targetY > 100) {
                target.remove();
                clearInterval(targetInterval);
            }
        }, 50);
        
        container.appendChild(target);
        huntTargets.push(target);
    }, 1500);
}

// ==================== NYAN CAT MINIGAME ====================
let nyanCatInterval = null;
let nyanCatTime = 60;
let nyanCatScore = 0;

function startNyanCat() {
    document.getElementById('nyan-cat-area').style.display = 'block';
    nyanCatScore = 0;
    nyanCatTime = 60;
    document.getElementById('nyan-score').textContent = '0';
    document.getElementById('nyan-time').textContent = '60';
    
    const container = document.getElementById('nyan-container');
    container.innerHTML = `
        <img src="Bilder/Nyan Cat GIF.gif" alt="Nyan Cat" class="nyan-cat-gif">
        <div class="nyan-rainbow"></div>
    `;
    
    const timer = setInterval(() => {
        nyanCatTime--;
        document.getElementById('nyan-time').textContent = nyanCatTime;
        if (nyanCatTime <= 0) {
            clearInterval(timer);
            if (nyanCatInterval) clearInterval(nyanCatInterval);
            gameState.coins += Math.floor(nyanCatScore / 5);
            gameState.stats.minigameScore += nyanCatScore;
            gameState.score += nyanCatScore;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${nyanCatScore} poeng! +${Math.floor(nyanCatScore/5)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startNyanCat()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    // Create stars
    nyanCatInterval = setInterval(() => {
        const star = document.createElement('div');
        star.className = 'nyan-star';
        star.textContent = '⭐';
        star.style.top = Math.random() * 80 + 10 + '%';
        star.style.left = '100%';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(star);
        
        // Click stars for points
        star.onclick = () => {
            nyanCatScore += 10;
            document.getElementById('nyan-score').textContent = nyanCatScore;
            star.remove();
            playClickSound();
            createParticles(star);
        };
        
        setTimeout(() => star.remove(), 5000);
    }, 500);
}

// ==================== BORED CAT MINIGAME ====================
let boredCatInterval = null;
let boredCatTime = 30;
let boredCatScore = 0;

function startBoredCat() {
    document.getElementById('bored-cat-area').style.display = 'block';
    boredCatScore = 0;
    boredCatTime = 30;
    document.getElementById('bored-score').textContent = '0';
    document.getElementById('bored-time').textContent = '30';
    
    const container = document.getElementById('bored-container');
    container.innerHTML = `
        <img src="Bilder/Bored Cat GIF.gif" alt="Kjedelig katt" class="bored-cat-gif">
    `;
    
    const timer = setInterval(() => {
        boredCatTime--;
        document.getElementById('bored-time').textContent = boredCatTime;
        if (boredCatTime <= 0) {
            clearInterval(timer);
            if (boredCatInterval) clearInterval(boredCatInterval);
            gameState.coins += Math.floor(boredCatScore / 10);
            gameState.stats.minigameScore += boredCatScore;
            gameState.score += boredCatScore;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${boredCatScore} poeng! +${Math.floor(boredCatScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startBoredCat()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    // Spawn activities around the bored cat
    const activities = ['🎾', '🧶', '🐭', '🎈', '🏐', '🎯', '🎨', '🎪'];
    
    boredCatInterval = setInterval(() => {
        const activity = document.createElement('div');
        activity.className = 'bored-activity';
        activity.textContent = activities[Math.floor(Math.random() * activities.length)];
        activity.style.left = Math.random() * 80 + 10 + '%';
        activity.style.top = Math.random() * 60 + 20 + '%';
        
        activity.onclick = function() {
            boredCatScore += 15;
            document.getElementById('bored-score').textContent = boredCatScore;
            this.remove();
            playPlaySound();
            createParticles(this);
        };
        
        container.appendChild(activity);
        
        // Remove after 3 seconds if not clicked
        setTimeout(() => {
            if (activity.parentNode) {
                activity.remove();
            }
        }, 3000);
    }, 1500);
}

// ==================== READING GAME ====================
let readingGameInterval = null;
let readingGameTime = 60;
let readingGameScore = 0;
let currentReadingQuestion = null;

const readingWords = [
    // Enkle ord (4 bokstaver)
    { emoji: '🐱', word: 'KATT', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'easy' },
    { emoji: '🐶', word: 'HUND', wrongs: ['BIL', 'BALL', 'TRE'], difficulty: 'easy' },
    { emoji: '🍎', word: 'EPLE', wrongs: ['BIL', 'BOK', 'BALL'], difficulty: 'easy' },
    { emoji: '🏠', word: 'HUS', wrongs: ['BIL', 'BOK', 'BALL'], difficulty: 'easy' },
    { emoji: '🚗', word: 'BIL', wrongs: ['HUS', 'BOK', 'BALL'], difficulty: 'easy' },
    { emoji: '📚', word: 'BOK', wrongs: ['BIL', 'HUS', 'BALL'], difficulty: 'easy' },
    { emoji: '⚽', word: 'BALL', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'easy' },
    { emoji: '🌳', word: 'TRE', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'easy' },
    { emoji: '🛏️', word: 'SENG', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'easy' },
    { emoji: '🧸', word: 'BAMSE', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'medium' },
    { emoji: '🎨', word: 'FARGE', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'medium' },
    { emoji: '🍕', word: 'PIZZA', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'medium' },
    { emoji: '🍼', word: 'FLASKE', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'medium' },
    { emoji: '🎈', word: 'BALLONG', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'hard' },
    { emoji: '🎾', word: 'BALL', wrongs: ['BIL', 'HUS', 'BOK'], difficulty: 'easy' },
    // Flere ord
    { emoji: '🌙', word: 'MÅNE', wrongs: ['SOL', 'STJERNE', 'SKY'], difficulty: 'easy' },
    { emoji: '☀️', word: 'SOL', wrongs: ['MÅNE', 'STJERNE', 'SKY'], difficulty: 'easy' },
    { emoji: '⭐', word: 'STJERNE', wrongs: ['SOL', 'MÅNE', 'SKY'], difficulty: 'medium' },
    { emoji: '🌊', word: 'HAV', wrongs: ['SOL', 'SKY', 'TRE'], difficulty: 'easy' },
    { emoji: '🌸', word: 'BLOMST', wrongs: ['TRE', 'GRESS', 'BLAD'], difficulty: 'medium' },
    { emoji: '🎵', word: 'MUSIKK', wrongs: ['SANG', 'LYD', 'LÅT'], difficulty: 'hard' },
    { emoji: '🎭', word: 'TEATER', wrongs: ['FILM', 'SANG', 'DANS'], difficulty: 'hard' },
    { emoji: '🏰', word: 'SLOTT', wrongs: ['HUS', 'BOR', 'GÅRD'], difficulty: 'medium' },
    { emoji: '👑', word: 'KRONE', wrongs: ['HATT', 'SKO', 'HANSKE'], difficulty: 'medium' },
    { emoji: '🦄', word: 'ENHØRNING', wrongs: ['HEST', 'KATT', 'HUND'], difficulty: 'hard' },
    { emoji: '🌈', word: 'REGNBUE', wrongs: ['SKY', 'SOL', 'MÅNE'], difficulty: 'hard' },
    { emoji: '🎪', word: 'SIRKUS', wrongs: ['TEATER', 'FILM', 'KONSERT'], difficulty: 'hard' },
    { emoji: '🚀', word: 'ROMMRÅKETT', wrongs: ['BIL', 'FLY', 'BÅT'], difficulty: 'hard' },
    { emoji: '🎁', word: 'PRESANG', wrongs: ['BOK', 'BALL', 'BAMSE'], difficulty: 'medium' },
    { emoji: '🎄', word: 'JULETRE', wrongs: ['TRE', 'BLOMST', 'GRESS'], difficulty: 'medium' },
    { emoji: '🍰', word: 'KAKE', wrongs: ['EPLE', 'PIZZA', 'BRØD'], difficulty: 'easy' },
    { emoji: '🍦', word: 'ISKREM', wrongs: ['KAKE', 'PIZZA', 'EPLE'], difficulty: 'medium' },
    { emoji: '🎂', word: 'BURSDAGSKAKE', wrongs: ['KAKE', 'ISKREM', 'PIZZA'], difficulty: 'hard' }
];

function startReadingGame() {
    document.getElementById('reading-game-area').style.display = 'block';
    readingGameScore = 0;
    readingGameTime = 60;
    document.getElementById('reading-score').textContent = '0';
    document.getElementById('reading-time').textContent = '60';
    
    const container = document.getElementById('reading-container');
    
    const timer = setInterval(() => {
        readingGameTime--;
        document.getElementById('reading-time').textContent = readingGameTime;
        if (readingGameTime <= 0) {
            clearInterval(timer);
            if (readingGameInterval) clearInterval(readingGameInterval);
            gameState.coins += Math.floor(readingGameScore / 5);
            gameState.stats.minigameScore += readingGameScore * 2; // Bonus for lesing
            gameState.score += readingGameScore * 2;
            updateDailyChallengeProgress('minigame');
            showMessage(`Tid er ute! Du fikk ${readingGameScore} poeng! +${Math.floor(readingGameScore/5)} mynter! Bra jobbet med lesingen! 📚`);
            container.innerHTML = `<button class="action-btn" onclick="startReadingGame()">Spill igjen</button>`;
            updateStats();
            renderStats();
            saveGame();
        }
    }, 1000);
    
    function showNextQuestion() {
        if (readingGameTime <= 0) return;
        
        const question = readingWords[Math.floor(Math.random() * readingWords.length)];
        currentReadingQuestion = question;
        
        // Create wrong answers array
        const allWords = [question.word, ...question.wrongs];
        // Shuffle
        for (let i = allWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
        }
        
        container.innerHTML = `
            <div class="reading-question">Hva er dette?</div>
            <div class="reading-image">${question.emoji}</div>
            <div class="reading-words"></div>
            <div class="reading-feedback"></div>
        `;
        
        const wordsContainer = container.querySelector('.reading-words');
        const feedback = container.querySelector('.reading-feedback');
        
        allWords.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'reading-word-btn';
            btn.textContent = word;
            btn.onclick = () => {
                if (word === question.word) {
                    // Correct! Points based on difficulty
                    let points = 10;
                    if (question.difficulty === 'medium') points = 15;
                    if (question.difficulty === 'hard') points = 25;
                    
                    btn.classList.add('correct');
                    readingGameScore += points;
                    document.getElementById('reading-score').textContent = readingGameScore;
                    feedback.textContent = `🎉 Riktig! +${points} poeng! Bra jobbet! 🎉`;
                    feedback.style.color = '#00b894';
                    playSuccessSound();
                    createParticles(btn);
                    
                    setTimeout(() => {
                        showNextQuestion();
                    }, 1500);
                } else {
                    // Wrong
                    btn.classList.add('wrong');
                    feedback.textContent = '❌ Prøv igjen! Du klarer det! 💪';
                    feedback.style.color = '#e74c3c';
                    playErrorSound();
                    
                    setTimeout(() => {
                        btn.classList.remove('wrong');
                        feedback.textContent = '';
                    }, 1000);
                }
            };
            wordsContainer.appendChild(btn);
        });
    }
    
    showNextQuestion();
}

// ==================== KATTESKOLE ====================

// Math Game (Kattergening)
let mathScore = 0;
let mathQuestionsAnswered = 0;

function startMathGame() {
    document.getElementById('math-area').style.display = 'block';
    mathScore = 0;
    mathQuestionsAnswered = 0;
    
    const container = document.getElementById('math-area');
    showNextMathQuestion(container);
}

function showNextMathQuestion(container) {
    // Generate random math problem (up to 10)
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    if (operation === '+') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * (11 - num1));
        answer = num1 + num2;
    } else if (operation === '-') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * num1);
        answer = num1 - num2;
    } else if (operation === '×') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        if (answer > 10) {
            // Make sure answer is <= 10
            num2 = Math.floor(10 / num1);
            answer = num1 * num2;
        }
    } else { // division
        answer = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        num1 = answer * num2;
        if (num1 > 10) {
            num2 = 1;
            answer = num1;
        }
    }
    
    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
        const wrong = answer + Math.floor(Math.random() * 10) - 5;
        if (wrong !== answer && wrong >= 0 && wrong <= 10 && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
        }
    }
    
    // Shuffle answers
    const allAnswers = [answer, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    // Visual representation with cats
    const catDisplay = '🐱'.repeat(num1) + (operation === '+' ? ' + ' : operation === '-' ? ' - ' : operation === '×' ? ' × ' : ' ÷ ') + '🐱'.repeat(num2);
    
    container.innerHTML = `
        <div class="math-score">Poeng: ${mathScore} | Riktige: ${mathQuestionsAnswered}</div>
        <div class="math-cats">${operation === '+' ? '🐱'.repeat(num1) + ' + ' + '🐱'.repeat(num2) : 
                           operation === '×' ? '🐱'.repeat(num1) + ' × ' + num2 + ' = ?' : 
                           `${num1} ${operation} ${num2} = ?`}</div>
        <div class="math-question">${num1} ${operation} ${num2} = ?</div>
        <div class="math-answers"></div>
        <div class="math-feedback"></div>
    `;
    
    const answersContainer = container.querySelector('.math-answers');
    const feedback = container.querySelector('.math-feedback');
    
    allAnswers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'math-answer-btn';
        btn.textContent = ans;
        btn.onclick = () => {
            if (ans === answer) {
                btn.classList.add('correct');
                mathScore += 10;
                mathQuestionsAnswered++;
                feedback.textContent = '🎉 Riktig! Bra jobbet! 🎉';
                feedback.style.color = '#00b894';
                playSuccessSound();
                createParticles(btn);
                
                setTimeout(() => {
                    showNextMathQuestion(container);
                }, 1500);
            } else {
                btn.classList.add('wrong');
                feedback.textContent = '❌ Prøv igjen! Du klarer det! 💪';
                feedback.style.color = '#e74c3c';
                playErrorSound();
                
                setTimeout(() => {
                    btn.classList.remove('wrong');
                    feedback.textContent = '';
                }, 1000);
            }
        };
        answersContainer.appendChild(btn);
    });
}

// Hygiene Info (Kattehygiene)
function showHygieneInfo() {
    const container = document.getElementById('hygiene-area');
    container.style.display = 'block';
    
    container.innerHTML = `
        <div class="hygiene-content">
            <h2 style="color: #667eea; font-size: 32px; margin-bottom: 20px; text-align: center;">🧼 Kattehygiene - Lær om katters renslighet!</h2>
            
            <div class="hygiene-fact">
                <h3>🐾 Katter pusser seg selv</h3>
                <p>Katter bruker tungen sin til å pusse pelsen! Tungen har små stive "børster" som kalles papillae. Disse hjelper med å fjerne løs hår, støv og skitt. Katter kan bruke opptil 30% av tiden sin på å pusse seg!</p>
            </div>
            
            <div class="hygiene-fact">
                <h3>💧 Katter liker ikke vann</h3>
                <p>Mange katter liker ikke å bade i vann. Dette er fordi kattenes pels ikke tørker fort, og de kan bli kalde. Katter bruker heller tungen sin til å holde seg rene!</p>
            </div>
            
            <div class="hygiene-fact">
                <h3>🧹 Katter begraver avføringen sin</h3>
                <p>Katter er veldig rene! De begraver avføringen sin i sand for å skjule lukten. Dette gjør de for å holde seg trygge fra rovdyr i naturen.</p>
            </div>
            
            <div class="hygiene-fact">
                <h3>👅 Tungen er en børste</h3>
                <p>Kattens tunge fungerer som en børste! Den har små hår som kalles papillae som peker bakover. Disse hjelper med å fjerne løs hår og holde pelsen ren og glatt.</p>
            </div>
            
            <div class="hygiene-fact">
                <h3>🐱 Katter vasker ansiktet</h3>
                <p>Katter vasker ansiktet med potene sine! De fukter poten med spytt og bruker den som en vaskeklutt. De starter alltid med å vaske ansiktet, og så går de videre til resten av kroppen.</p>
            </div>
            
            <div class="hygiene-fact">
                <h3>⏰ Katter pusser seg ofte</h3>
                <p>En katt kan bruke flere timer hver dag på å pusse seg! De gjør dette for å holde pelsen ren, fjerne løs hår, og for å holde seg avslappet. Pussing gjør også at katter lukter godt!</p>
            </div>
            
            <button class="action-btn" onclick="document.getElementById('hygiene-area').style.display='none'" style="margin-top: 20px;">
                Lukk
            </button>
        </div>
    `;
}

// Cooking Game (Kattemat)
let selectedIngredients = [];

function startCookingGame() {
    const container = document.getElementById('cooking-area');
    container.style.display = 'block';
    selectedIngredients = [];
    
    const ingredients = [
        { emoji: '🍖', name: 'Kjøtt', good: true },
        { emoji: '🐟', name: 'Fisk', good: true },
        { emoji: '🥛', name: 'Melk', good: true },
        { emoji: '🧀', name: 'Ost', good: true },
        { emoji: '🥚', name: 'Egg', good: true },
        { emoji: '🥕', name: 'Gulrot', good: true },
        { emoji: '🍎', name: 'Eple', good: false },
        { emoji: '🍫', name: 'Sjokolade', good: false, danger: true },
        { emoji: '🧅', name: 'Løk', good: false, danger: true },
        { emoji: '🌶️', name: 'Chili', good: false, danger: true },
        { emoji: '🍇', name: 'Druer', good: false, danger: true },
        { emoji: '☕', name: 'Kaffe', good: false }
    ];
    
    container.innerHTML = `
        <h2 style="text-align: center; color: #667eea; font-size: 28px; margin-bottom: 20px;">🍽️ Lag mat til katten!</h2>
        <p style="text-align: center; font-size: 18px; margin-bottom: 20px;">Velg ingredienser og lag en god matrett!</p>
        <div class="cooking-ingredients"></div>
        <div class="cooking-bowl" id="cooking-bowl">🥣</div>
        <button class="cook-btn" onclick="cookMeal()">Lag mat! 🍽️</button>
        <div class="cooking-result" id="cooking-result"></div>
    `;
    
    const ingredientsContainer = container.querySelector('.cooking-ingredients');
    
    ingredients.forEach(ing => {
        const btn = document.createElement('button');
        btn.className = 'ingredient-btn';
        btn.textContent = ing.emoji;
        btn.title = ing.name;
        btn.onclick = () => {
            if (selectedIngredients.includes(ing)) {
                selectedIngredients = selectedIngredients.filter(i => i !== ing);
                btn.classList.remove('selected');
            } else {
                selectedIngredients.push(ing);
                btn.classList.add('selected');
            }
            updateCookingBowl();
        };
        ingredientsContainer.appendChild(btn);
    });
}

function updateCookingBowl() {
    const bowl = document.getElementById('cooking-bowl');
    if (selectedIngredients.length === 0) {
        bowl.textContent = '🥣';
    } else {
        bowl.textContent = selectedIngredients.map(i => i.emoji).join('');
    }
}

function cookMeal() {
    const resultDiv = document.getElementById('cooking-result');
    
    if (selectedIngredients.length === 0) {
        resultDiv.textContent = '❌ Du må velge minst én ingrediens!';
        resultDiv.style.color = '#e74c3c';
        return;
    }
    
    const goodIngredients = selectedIngredients.filter(i => i.good).length;
    const badIngredients = selectedIngredients.filter(i => !i.good && !i.danger).length;
    const dangerIngredients = selectedIngredients.filter(i => i.danger).length;
    
    let result = '';
    let points = 0;
    let coins = 0;
    
    if (dangerIngredients > 0) {
        result = `⚠️ Oi! Noen av ingrediensene er farlige for katter! Katten spiser ikke dette. Prøv igjen! 🐱`;
        resultDiv.style.color = '#e74c3c';
        playErrorSound();
    } else if (goodIngredients >= 3 && badIngredients === 0) {
        result = `🎉 Perfekt! Katten elsker maten! Den er veldig mett og glad! +${points = 50} poeng og +${coins = 25} mynter! 🐱❤️`;
        resultDiv.style.color = '#00b894';
        gameState.happiness = Math.min(100, gameState.happiness + 15);
        gameState.hunger = Math.max(0, gameState.hunger - 25);
        playSuccessSound();
    } else if (goodIngredients >= 2) {
        result = `😸 Bra! Katten liker maten! Den er mett og fornøyd! +${points = 30} poeng og +${coins = 15} mynter!`;
        resultDiv.style.color = '#00b894';
        gameState.happiness = Math.min(100, gameState.happiness + 10);
        gameState.hunger = Math.max(0, gameState.hunger - 20);
        playSuccessSound();
    } else if (goodIngredients >= 1) {
        result = `😊 OK! Katten spiser litt, men ville hatt mer kjøtt eller fisk! +${points = 15} poeng!`;
        resultDiv.style.color = '#f39c12';
        gameState.hunger = Math.max(0, gameState.hunger - 10);
        playClickSound();
    } else {
        result = `😐 Katten spiser ikke dette. Katter trenger kjøtt eller fisk! Prøv igjen!`;
        resultDiv.style.color = '#e74c3c';
        playErrorSound();
    }
    
    resultDiv.textContent = result;
    gameState.score += points;
    gameState.coins += coins;
    
    if (points > 0) {
        createParticles(resultDiv);
        updateAllDisplays();
        saveGame();
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
        selectedIngredients = [];
        document.querySelectorAll('.ingredient-btn').forEach(btn => btn.classList.remove('selected'));
        updateCookingBowl();
        resultDiv.textContent = '';
    }, 3000);
}

// Art Game (Katteestetikk)
let artCanvas = null;
let artContext = null;
let isDrawing = false;
let currentColor = '#000000';
let currentTool = 'pen';

function startArtGame() {
    const container = document.getElementById('art-area');
    container.style.display = 'block';
    
    container.innerHTML = `
        <h2 style="text-align: center; color: #667eea; font-size: 28px; margin-bottom: 20px;">🎨 Tegn en katt!</h2>
        <p style="text-align: center; font-size: 18px; margin-bottom: 20px;">Bruk fargene og tegn din egen katt!</p>
        <div class="art-tools">
            <button class="art-tool-btn" onclick="setArtTool('pen')">✏️ Penn</button>
            <button class="art-tool-btn" onclick="setArtTool('eraser')">🧹 Viskelær</button>
            <button class="art-tool-btn" onclick="clearArtCanvas()">🗑️ Slett alt</button>
        </div>
        <div class="art-controls">
            <div class="color-btn" style="background: #000000;" onclick="setArtColor('#000000')" title="Svart"></div>
            <div class="color-btn" style="background: #ff6b6b;" onclick="setArtColor('#ff6b6b')" title="Rød"></div>
            <div class="color-btn" style="background: #4ecdc4;" onclick="setArtColor('#4ecdc4')" title="Tyrkis"></div>
            <div class="color-btn" style="background: #ffe66d;" onclick="setArtColor('#ffe66d')" title="Gul"></div>
            <div class="color-btn" style="background: #95e1d3;" onclick="setArtColor('#95e1d3')" title="Mint"></div>
            <div class="color-btn" style="background: #f38181;" onclick="setArtColor('#f38181')" title="Rosa"></div>
            <div class="color-btn" style="background: #aa96da;" onclick="setArtColor('#aa96da')" title="Lilla"></div>
            <div class="color-btn" style="background: #fcbad3;" onclick="setArtColor('#fcbad3')" title="Lys rosa"></div>
            <div class="color-btn" style="background: #667eea;" onclick="setArtColor('#667eea')" title="Blå"></div>
            <div class="color-btn" style="background: #ffd93d;" onclick="setArtColor('#ffd93d')" title="Gull"></div>
        </div>
        <div class="art-canvas-container">
            <canvas class="art-canvas" id="art-canvas" width="400" height="400"></canvas>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button class="action-btn" onclick="saveArtDrawing()">💾 Lagre tegning</button>
            <button class="action-btn" onclick="showArtDrawing()">🖼️ Vis min tegning</button>
        </div>
    `;
    
    artCanvas = document.getElementById('art-canvas');
    artContext = artCanvas.getContext('2d');
    
    // Set initial color
    setArtColor('#000000');
    
    // Drawing event listeners
    artCanvas.addEventListener('mousedown', startDrawing);
    artCanvas.addEventListener('mousemove', draw);
    artCanvas.addEventListener('mouseup', stopDrawing);
    artCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support for mobile
    artCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = artCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        isDrawing = true;
        artContext.beginPath();
        artContext.moveTo(x, y);
    });
    
    artCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = artCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        artContext.lineTo(x, y);
        artContext.stroke();
    });
    
    artCanvas.addEventListener('touchend', () => {
        isDrawing = false;
    });
}

function setArtColor(color) {
    currentColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.style.background === color || btn.style.backgroundColor === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    artContext.strokeStyle = color;
    artContext.fillStyle = color;
}

function setArtTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.art-tool-btn').forEach(btn => {
        btn.style.background = tool === 'pen' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                               tool === 'eraser' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 
                               'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    });
    
    if (tool === 'eraser') {
        artContext.strokeStyle = '#ffffff';
        artContext.globalCompositeOperation = 'destination-out';
    } else {
        artContext.strokeStyle = currentColor;
        artContext.globalCompositeOperation = 'source-over';
    }
}

function clearArtCanvas() {
    if (confirm('Er du sikker på at du vil slette hele tegningen?')) {
        artContext.clearRect(0, 0, artCanvas.width, artCanvas.height);
        playClickSound();
    }
}

function startDrawing(e) {
    isDrawing = true;
    const rect = artCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    artContext.beginPath();
    artContext.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = artCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    artContext.lineWidth = currentTool === 'eraser' ? 20 : 5;
    artContext.lineCap = 'round';
    artContext.lineJoin = 'round';
    artContext.lineTo(x, y);
    artContext.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function saveArtDrawing() {
    const imageData = artCanvas.toDataURL();
    localStorage.setItem(`artDrawing_${currentUser}`, imageData);
    gameState.score += 20;
    gameState.coins += 10;
    playSuccessSound();
    showMessage('🎨 Tegningen er lagret! +20 poeng og +10 mynter!');
    updateAllDisplays();
    saveGame();
}

function showArtDrawing() {
    const saved = localStorage.getItem(`artDrawing_${currentUser}`);
    if (saved) {
        const img = document.createElement('img');
        img.src = saved;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '15px';
        img.style.border = '3px solid #667eea';
        
        const container = document.getElementById('art-area');
        const displayDiv = document.createElement('div');
        displayDiv.style.textAlign = 'center';
        displayDiv.style.marginTop = '20px';
        displayDiv.innerHTML = '<h3>Din lagrede tegning:</h3>';
        displayDiv.appendChild(img);
        displayDiv.innerHTML += '<button class="action-btn" onclick="this.parentElement.remove()" style="margin-top: 10px;">Lukk</button>';
        container.appendChild(displayDiv);
    } else {
        showMessage('Du har ingen lagrede tegninger ennå! Tegn først! 🎨');
    }
}

// ==================== INTERACTIVE CAT IMAGES ====================
function showCatImageInfo(imagePath, catName) {
    showMessage(`👆 Du klikket på ${catName}! 🐱`);
    playPurrSound();
    
    // Special animation for all images
    const imgMap = {
        'babycat.jpg': '1',
        'brindle.jpg': '2',
        'redcat.jpg': '3',
        'Cat Pink GIF.gif': '4',
        'Bored Cat GIF.gif': '5',
        'Cat Battle GIF.gif': '6'
    };
    
    const imgId = imgMap[imagePath];
    if (imgId) {
        const img = document.getElementById(`cat-img-${imgId}`);
        if (img) {
            img.style.transform = 'scale(1.3) rotate(360deg)';
            setTimeout(() => {
                img.style.transform = '';
            }, 600);
        }
    }
}

// ==================== STATS DISPLAY ====================
function renderStats() {
    const container = document.getElementById('stats-grid');
    const stats = [
        { label: 'Ganger matet', value: gameState.stats.timesFed, icon: '🍖' },
        { label: 'Ganger lekt', value: gameState.stats.timesPlayed, icon: '🎾' },
        { label: 'Ganger koset', value: gameState.stats.timesPetted, icon: '❤️' },
        { label: 'Ganger sovet', value: gameState.stats.timesSlept, icon: '😴' },
        { label: 'Ganger vasket', value: gameState.stats.timesCleaned, icon: '🛁' },
        { label: 'Pizza gitt', value: gameState.stats.pizzaGiven, icon: '🍕' },
        { label: 'Tåteflaske gitt', value: gameState.stats.bottleGiven, icon: '🍼' },
        { label: 'Katt klikket', value: gameState.stats.catClicked, icon: '👋' },
        { label: 'Totalt poeng', value: gameState.score, icon: '⭐' },
        { label: 'Høyeste nivå', value: gameState.level, icon: '🏆' },
        { label: 'Total spilletid', value: formatTime(gameState.stats.totalPlayTime), icon: '⏱️' },
        { label: 'Minispill-poeng', value: gameState.stats.minigameScore, icon: '🎯' }
    ];
    
    container.innerHTML = '';
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `
            <div class="stat-icon">${stat.icon}</div>
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        `;
        container.appendChild(div);
    });
    
    // Add owned items section
    if (gameState.ownedItems.length > 0) {
        const itemsHeader = document.createElement('div');
        itemsHeader.className = 'stat-card stat-header';
        itemsHeader.style.gridColumn = '1 / -1';
        itemsHeader.innerHTML = `
            <div class="stat-icon">🛒</div>
            <div class="stat-label" style="font-size: 24px; font-weight: bold;">Eide items fra butikken</div>
        `;
        container.appendChild(itemsHeader);
        
        gameState.ownedItems.forEach(itemId => {
            const item = shopItems.find(i => i.id === itemId);
            if (item) {
                const useCount = gameState.stats.itemsUsed[itemId] || 0;
                const div = document.createElement('div');
                div.className = 'stat-card item-stat-card';
                div.innerHTML = `
                    <div class="stat-icon">${item.emoji}</div>
                    <div class="stat-label">${item.name}</div>
                    <div class="stat-value">Brukt: ${useCount}x</div>
                `;
                container.appendChild(div);
            }
        });
    }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}t ${minutes % 60}m`;
    return `${minutes}m`;
}

// ==================== ALBUM/CAT SELECTION ====================
function renderAlbum() {
    const cat = gameState.cats[gameState.currentCat];
    const container = document.getElementById('album-cat-display');
    
    const unlockLevel = cat.unlockLevel || ((gameState.currentCat + 1) * 5);
    
    let imageHtml = '';
    if (cat.image && cat.unlocked) {
        const imageClass = cat.isGif ? 'album-cat-image album-cat-gif' : 'album-cat-image';
        imageHtml = `<img src="${cat.image}" alt="${cat.name}" class="${imageClass}">`;
    } else if (cat.image && !cat.unlocked) {
        imageHtml = `<img src="${cat.image}" alt="${cat.name}" class="album-cat-image album-cat-locked">`;
    }
    
    container.innerHTML = `
        <div class="album-cat-info">
            ${imageHtml}
            <div class="album-cat-emoji">${cat.emoji}</div>
            <div class="album-cat-name">${cat.name}</div>
            <div class="album-cat-status ${cat.unlocked ? '' : 'locked'}">
                ${cat.unlocked ? 
                    `<div>Lykke: ${cat.happiness}%</div>
                     <div>Sult: ${cat.hunger}%</div>
                     <div>Energi: ${cat.energy}%</div>` :
                    `🔒 Låst - Nå nivå ${unlockLevel} for å låse opp`}
            </div>
        </div>
    `;
    
    // Unlock cats based on level
    gameState.cats.forEach((cat, index) => {
        const requiredLevel = cat.unlockLevel || ((index + 1) * 5);
        if (!cat.unlocked && gameState.level >= requiredLevel) {
            cat.unlocked = true;
            showMessage(`🎉 ${cat.name} er nå låst opp! 🎉`);
            saveGame();
        }
    });
}

document.querySelectorAll('.cat-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.currentCat = parseInt(btn.dataset.cat);
        renderAlbum();
    });
});

// ==================== SEASONAL EVENTS ====================
function checkSeasonalEvents() {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();
    
    // Christmas
    if (month === 11 && date >= 1 && date <= 25) {
        document.body.classList.add('christmas');
    }
    // Halloween
    if (month === 9 && date >= 25) {
        document.body.classList.add('halloween');
    }
    // Easter
    if (month === 2 && date >= 15 && date <= 30) {
        document.body.classList.add('easter');
    }
}

// ==================== RENDER OWNED ITEMS IN GAME ====================
function renderOwnedItemsInGame() {
    const container = document.getElementById('owned-items-section');
    if (!container) return;
    
    const usableItems = gameState.ownedItems
        .map(id => shopItems.find(item => item.id === id))
        .filter(item => item && (item.useType === 'play' || item.useType === 'sleep'));
    
    if (usableItems.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = '<h3 style="margin-bottom: 15px; color: #333;">🎮 Bruk dine items:</h3><div class="owned-items-buttons"></div>';
    const buttonsContainer = container.querySelector('.owned-items-buttons');
    
    usableItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'action-btn item-use-btn';
        btn.id = `item-btn-${item.id}`;
        btn.textContent = item.useLabel || item.name;
        btn.onclick = () => useItem(item.id);
        buttonsContainer.appendChild(btn);
    });
}

// ==================== USE ITEM FUNCTION ====================
function useItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || !gameState.ownedItems.includes(itemId)) {
        showMessage('Du eier ikke dette itemet! 💰');
        return;
    }
    
    if (item.useType === 'cosmetic') {
        showMessage(`${item.name} er kun kosmetisk! Det ser bra ut på katten! ✨`);
        return;
    }
    
    // Check cooldown for item usage
    const actionId = `item-${itemId}`;
    if (isActionOnCooldown(actionId, 3)) {
        if (item.useType === 'play') {
            showMessage('Katten leker allerede med dette! Vent litt... ⏳');
        } else if (item.useType === 'sleep') {
            showMessage('Katten sover allerede på dette! Vent litt... ⏳');
        }
        return;
    }
    
    if (item.useType === 'play' && gameState.energy < 20) {
        showMessage('Jeg er for sliten... La meg hvile først! 😴');
        return;
    }
    
    if (item.useType === 'sleep' && gameState.energy > 80) {
        showMessage('Katten er ikke sliten nok til å sove nå! Den vil heller leke! 🎾');
        return;
    }
    
    setActionCooldown(actionId);
    updateButtonCooldown(`item-btn-${itemId}`, 3, actionId);
    
    // Track usage
    if (!gameState.stats.itemsUsed[itemId]) {
        gameState.stats.itemsUsed[itemId] = 0;
    }
    gameState.stats.itemsUsed[itemId]++;
    
    // Different effects based on item
    const bonus = getLevelBonusMultiplier(gameState.level);
    let happinessGain = 0;
    let energyChange = 0;
    let scoreGain = 0;
    let message = '';
    
    switch(itemId) {
        case 'tree': // Kloretre - gir energi og lykke
            happinessGain = 20;
            energyChange = -10; // Uses some energy to scratch
            scoreGain = 15;
            message = 'Katten klør seg på kloretreet! Så fornøyd! 🌳😸';
            break;
        case 'ball': // Ball - standard leke
            happinessGain = 18;
            energyChange = -12;
            scoreGain = 12;
            message = 'Så gøy å leke med ballen! 🎾😸';
            break;
        case 'mouse': // Kattemus - ekstra lykke
            happinessGain = 25;
            energyChange = -10;
            scoreGain = 14;
            message = 'Katten jager musen! Så morsomt! 🐭😸';
            break;
        case 'toy': // Leksak - god leke
            happinessGain = 22;
            energyChange = -11;
            scoreGain = 13;
            message = 'Katten elsker leksaken! 🧸😸';
            break;
        case 'feather': // Fjærspill
            happinessGain = 24;
            energyChange = -10;
            scoreGain = 14;
            message = 'Katten hopper etter fjæren! 🪶😸';
            break;
        case 'laser': // Laserpeker
            happinessGain = 28;
            energyChange = -12;
            scoreGain = 16;
            message = 'Katten jager laserpunktet! 🔴😸';
            break;
        case 'tunnel': // Kattetunnel
            happinessGain = 30;
            energyChange = -15;
            scoreGain = 18;
            message = 'Katten løper gjennom tunnelen! 🕳️😸';
            break;
        case 'pillow': // Pute - søvn
            happinessGain = 10;
            energyChange = 25;
            scoreGain = 8;
            message = 'Katten sover så godt på puten! 💤😸';
            updateActionCounters('sleep');
            playSleepSound();
            showMessage(message);
            createParticles(document.getElementById('game-cat'));
            updateStats();
            renderOwnedItemsInGame();
            updateAllDisplays();
            saveGame();
            return;
        case 'blanket': // Teppe - søvn
            happinessGain = 12;
            energyChange = 30;
            scoreGain = 9;
            message = 'Katten sover godt under teppet! 🛏️😸';
            updateActionCounters('sleep');
            playSleepSound();
            showMessage(message);
            createParticles(document.getElementById('game-cat'));
            updateStats();
            renderOwnedItemsInGame();
            updateAllDisplays();
            saveGame();
            return;
        default:
            if (item.useType === 'play') {
                happinessGain = 15;
                energyChange = -10;
                scoreGain = 10;
                message = `Katten leker med ${item.name}! 😸`;
            } else {
                happinessGain = 10;
                energyChange = 20;
                scoreGain = 8;
                message = `Katten bruker ${item.name}! 😸`;
            }
    }
    
    if (item.useType === 'play') {
        gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
        gameState.energy = Math.max(0, gameState.energy + energyChange);
        gameState.score += Math.floor(scoreGain * bonus);
        updateActionCounters('play');
        playPlaySound();
    } else {
        gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
        gameState.energy = Math.min(100, gameState.energy + energyChange);
        gameState.score += Math.floor(scoreGain * bonus);
        updateActionCounters('sleep');
        playSleepSound();
    }
    showMessage(message);
    createParticles(document.getElementById('game-cat'));
    updateStats();
    renderOwnedItemsInGame();
    saveGame();
}

// ==================== UPDATE ALL DISPLAYS ====================
function updateAllDisplays() {
    updateStats();
    document.getElementById('coins').textContent = gameState.coins;
    renderShop();
    checkAchievements();
    updateDailyChallenge();
    renderStats();
    renderAlbum();
    renderOwnedItemsInGame();
    updateCatGifDisplay();
}

// Update cat GIF display based on mood/state
function updateCatGifDisplay() {
    const catGif = document.getElementById('game-cat-gif');
    const catEmoji = document.getElementById('cat-emoji');
    if (!catGif || !catEmoji) return;
    
    // Show GIF based on cat's state
    if (gameState.happiness < 30 && gameState.energy < 30) {
        // Very bored/sad
        catGif.src = 'Bilder/Bored Cat GIF.gif';
        catGif.style.display = 'block';
        catEmoji.style.display = 'none';
    } else if (gameState.happiness < 50) {
        // Bored
        catGif.src = 'Bilder/Bored Cat GIF.gif';
        catGif.style.display = 'block';
        catEmoji.style.display = 'none';
    } else if (gameState.happiness > 80 && gameState.energy > 80) {
        // Very happy - show pink cat
        catGif.src = 'Bilder/Cat Pink GIF.gif';
        catGif.style.display = 'block';
        catEmoji.style.display = 'none';
    } else {
        // Normal - show emoji
        catGif.style.display = 'none';
        catEmoji.style.display = 'inline';
    }
}

// ==================== UPDATE ACTION COUNTERS ====================
function updateActionCounters(action) {
    switch(action) {
        case 'feed': gameState.stats.timesFed++; break;
        case 'play': gameState.stats.timesPlayed++; break;
        case 'pet': gameState.stats.timesPetted++; break;
        case 'sleep': gameState.stats.timesSlept++; break;
        case 'clean': gameState.stats.timesCleaned++; break;
        case 'pizza': gameState.stats.pizzaGiven++; break;
        case 'bottle': gameState.stats.bottleGiven++; break;
        case 'hand': gameState.stats.handPetted++; break;
        case 'click': gameState.stats.catClicked++; break;
    }
    
    // Update daily challenge
    if (gameState.dailyChallenge && gameState.dailyChallenge.type === action) {
        gameState.dailyChallenge.progress++;
        updateDailyChallenge();
    }
    
    // Earn coins
    gameState.coins += 1;
    
    checkAchievements();
    saveGame();
}

// ==================== SOUND EFFECTS (Web Audio API) ====================
let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silent fail if audio fails
    }
}

// Sound effects for different actions
function playPurrSound() {
    // Purring sound - multiple quick tones
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playSound(150 + Math.random() * 50, 0.1, 'sine', 0.2);
        }, i * 100);
    }
}

function playMeowSound() {
    // Cat meow - rising then falling tone
    playSound(300, 0.1, 'sine', 0.3);
    setTimeout(() => playSound(400, 0.1, 'sine', 0.3), 100);
    setTimeout(() => playSound(250, 0.15, 'sine', 0.3), 200);
}

function playHappySound() {
    // Happy sound - ascending tones
    playSound(523, 0.1, 'sine', 0.3); // C
    setTimeout(() => playSound(659, 0.1, 'sine', 0.3), 100); // E
    setTimeout(() => playSound(784, 0.15, 'sine', 0.3), 200); // G
}

function playClickSound() {
    // Simple click
    playSound(800, 0.05, 'square', 0.2);
}

function playSuccessSound() {
    // Success fanfare
    playSound(523, 0.15, 'sine', 0.4); // C
    setTimeout(() => playSound(659, 0.15, 'sine', 0.4), 150); // E
    setTimeout(() => playSound(784, 0.2, 'sine', 0.4), 300); // G
    setTimeout(() => playSound(1047, 0.25, 'sine', 0.4), 450); // C (high)
}

function playErrorSound() {
    // Error sound - gentle beep
    playSound(300, 0.2, 'sine', 0.3);
    setTimeout(() => playSound(250, 0.2, 'sine', 0.3), 200);
}

function playLevelUpSound() {
    // Level up sound - exciting ascending
    playSound(440, 0.1, 'sine', 0.4); // A
    setTimeout(() => playSound(554, 0.1, 'sine', 0.4), 100); // C#
    setTimeout(() => playSound(659, 0.15, 'sine', 0.4), 200); // E
    setTimeout(() => playSound(880, 0.2, 'sine', 0.5), 350); // A (high)
}

function playBuySound() {
    // Purchase sound - ching!
    playSound(1000, 0.1, 'square', 0.3);
    setTimeout(() => playSound(1200, 0.1, 'square', 0.3), 100);
}

function playChallengeSound() {
    // Challenge complete
    playSound(392, 0.15, 'sine', 0.4); // G
    setTimeout(() => playSound(523, 0.15, 'sine', 0.4), 150); // C
    setTimeout(() => playSound(659, 0.2, 'sine', 0.4), 300); // E
}

function playGameOverSound() {
    // Game over - descending tones
    playSound(659, 0.2, 'sine', 0.4); // E
    setTimeout(() => playSound(554, 0.2, 'sine', 0.4), 200); // C#
    setTimeout(() => playSound(440, 0.3, 'sine', 0.4), 400); // A
}

function playEatSound() {
    // Eating sound - quick munch
    playSound(200, 0.05, 'square', 0.2);
    setTimeout(() => playSound(180, 0.05, 'square', 0.2), 50);
    setTimeout(() => playSound(160, 0.05, 'square', 0.2), 100);
}

function playSleepSound() {
    // Sleeping - gentle low tones
    playSound(150, 0.3, 'sine', 0.2);
    setTimeout(() => playSound(140, 0.3, 'sine', 0.2), 300);
}

function playPlaySound() {
    // Play sound - bouncy
    playSound(523, 0.1, 'sine', 0.3);
    setTimeout(() => playSound(659, 0.1, 'sine', 0.3), 80);
    setTimeout(() => playSound(784, 0.1, 'sine', 0.3), 160);
}

// Initialize audio on first user interaction
let audioInitialized = false;
function ensureAudio() {
    if (!audioInitialized && audioContext === null) {
        initAudio();
        audioInitialized = true;
    }
}

// Enable audio on any click (browser requirement)
document.addEventListener('click', ensureAudio, { once: true });
document.addEventListener('touchstart', ensureAudio, { once: true });

// ==================== BACKGROUND MUSIC PLAYLIST ====================
// Spilleliste med alle 12 låtene
const playlist = [
    { title: 'TAKEDOWN', file: '01 - TAKEDOWN (JEONGYEON, JIHYO, CHAEYOUNG).mp3' },
    { title: "How It's Done", file: '02 - How It\'s Done.mp3' },
    { title: 'Soda Pop', file: '03 - Soda Pop.mp3' },
    { title: 'Golden', file: '04 - Golden.mp3' },
    { title: 'Strategy', file: '05 - Strategy.mp3' },
    { title: 'Takedown', file: '06 - Takedown.mp3' },
    { title: 'Your Idol', file: '07 - Your Idol.mp3' },
    { title: 'Free', file: '08 - Free.mp3' },
    { title: 'What It Sounds Like', file: '09 - What It Sounds Like.mp3' },
    { title: '사랑인가 봐 Love, Maybe', file: '10 - 사랑인가 봐 Love, Maybe.mp3' },
    { title: '오솔길 Path', file: '11 - 오솔길 Path.mp3' },
    { title: 'Score Suite', file: '12 - Score Suite.mp3' }
];

let backgroundMusic = null;
let musicPlaying = false;
let musicInitialized = false;
let currentTrackIndex = 3; // Start med "Golden" (index 3)

function initBackgroundMusic() {
    if (musicInitialized) return;
    musicInitialized = true;
    
    backgroundMusic = document.getElementById('background-music');
    if (!backgroundMusic) return;
    
    // Set initial volume to 20% (low background volume)
    backgroundMusic.volume = 0.2;
    
    // When a song ends, play next one
    backgroundMusic.addEventListener('ended', playNextTrack);
    
    // Volume control
    const volumeSlider = document.getElementById('music-volume');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            backgroundMusic.volume = volume;
        });
    }
    
    // Music toggle button
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', toggleMusic);
    }
    
    // Previous/Next buttons
    const prevBtn = document.getElementById('music-prev-btn');
    const nextBtn = document.getElementById('music-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', playPreviousTrack);
    if (nextBtn) nextBtn.addEventListener('click', playNextTrack);
    
    // Load first track
    loadTrack(currentTrackIndex);
    
    // Try to play music on first user interaction (autoplay restrictions)
    // Also try immediately in case autoplay is allowed
    tryPlayMusic();
    
    // If autoplay was blocked, try again on first user interaction
    const tryOnInteraction = () => {
        if (!musicPlaying) {
            tryPlayMusic();
        }
    };
    document.addEventListener('click', tryOnInteraction, { once: true });
    document.addEventListener('touchstart', tryOnInteraction, { once: true });
}

function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index;
    const track = playlist[index];
    backgroundMusic.src = track.file;
    backgroundMusic.load();
    
    // Update display
    const currentSongEl = document.getElementById('current-song');
    if (currentSongEl) {
        currentSongEl.textContent = `🎵 ${currentTrackIndex + 1}/${playlist.length}: ${track.title}`;
    }
    
    // If music was playing, continue playing
    if (musicPlaying) {
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Could not play track:', error);
            });
        }
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
}

function playPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
}

function tryPlayMusic() {
    if (!backgroundMusic || !backgroundMusic.src) return;
    
    // Try to play music
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                musicPlaying = true;
                updateMusicButton();
            })
            .catch(error => {
                // Autoplay blocked - user needs to interact
                console.log('Autoplay blocked, waiting for user interaction');
                musicPlaying = false;
                updateMusicButton();
            });
    }
}

function toggleMusic() {
    if (!backgroundMusic) return;
    
    if (musicPlaying) {
        backgroundMusic.pause();
        musicPlaying = false;
    } else {
        // Make sure we have a track loaded
        if (!backgroundMusic.src) {
            loadTrack(currentTrackIndex);
        }
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    musicPlaying = true;
                })
                .catch(error => {
                    console.log('Could not play music:', error);
                });
        }
    }
    updateMusicButton();
}

function updateMusicButton() {
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    if (!musicToggleBtn) return;
    
    if (musicPlaying) {
        musicToggleBtn.textContent = '⏸️';
        musicToggleBtn.title = 'Pause musikk';
    } else {
        musicToggleBtn.textContent = '▶️';
        musicToggleBtn.title = 'Spill musikk';
    }
}

// Initialize
// Check login first
const isLoggedIn = checkLogin();

// Check if welcome screen should be shown (only if logged in)
if (isLoggedIn) {
    const hasSeenWelcome = localStorage.getItem(`hasSeenWelcome_${currentUser}`);
    if (!hasSeenWelcome) {
        document.getElementById('welcome-overlay').style.display = 'flex';
    }
    
    initAudio();
    initBackgroundMusic();
    loadGame();
    playTimeStart = Date.now(); // Start tracking play time from now
    updateStats();
    checkSeasonalEvents();
}

// Welcome screen function
function closeWelcome() {
    document.getElementById('welcome-overlay').style.display = 'none';
    if (currentUser) {
        localStorage.setItem(`hasSeenWelcome_${currentUser}`, 'true');
    }
}
if (isLoggedIn) {
    generateDailyChallenge();
    updateDailyChallenge();
}

// Show game finished screen
function showGameFinishedScreen() {
    const finishedScreen = document.getElementById('game-finished-screen');
    finishedScreen.classList.add('show');
    
    // Play success fanfare
    setTimeout(() => playSuccessSound(), 500);
    setTimeout(() => playLevelUpSound(), 1000);
    
    // Create lots of particles to celebrate!
    const gameCat = document.getElementById('game-cat');
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticles(gameCat);
        }, i * 100);
    }
}

// Restart game function
document.getElementById('restart-game-btn').addEventListener('click', () => {
    // Reset game state
    gameState = {
        happiness: 50,
        hunger: 50,
        energy: 50,
        score: 0,
        level: 1
    };
    
    // Hide finished screen
    document.getElementById('game-finished-screen').classList.remove('show');
    
    // Reset bow to level 1
    updateBowForLevel(1);
    
    // Update stats
    updateStats();
    
    // Show welcome message
    showMessage('🎉 Spillet er startet på nytt! Lykke til! 🐱');
});

// Show initial level info
setTimeout(() => {
    if (gameState.level === 1) {
        showMessage('🎉 Velkommen! Ta vare på katten og stig i nivå! 🐱');
    }
}, 1000);

// Make floating cats clickable for fun
document.querySelectorAll('.floating-cat').forEach(cat => {
    cat.addEventListener('click', () => {
        cat.style.transform = 'scale(1.5) rotate(360deg)';
        cat.style.transition = 'transform 0.5s';
        setTimeout(() => {
            cat.style.transform = '';
        }, 500);
    });
});

