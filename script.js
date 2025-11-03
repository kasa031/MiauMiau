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
        }
    });
});

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
        { name: 'Katt 1', unlocked: true, happiness: 50, hunger: 50, energy: 50, emoji: '😸' },
        { name: 'Katt 2', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😺' },
        { name: 'Katt 3', unlocked: false, happiness: 50, hunger: 50, energy: 50, emoji: '😻' }
    ],
    currentCat: 0,
    dailyChallenge: null,
    challengeProgress: 0,
    challengeCompleted: false,
    lastSave: Date.now(),
    actionCooldowns: {} // Track when actions can be used again
};

const catEmojis = ['😸', '😺', '😻', '😽', '🙀', '😼', '😾', '🐱'];

// Load game from localStorage
function loadGame() {
    const saved = localStorage.getItem('miaumiauGame');
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

// Save game to localStorage
function saveGame() {
    gameState.lastSave = Date.now();
    localStorage.setItem('miaumiauGame', JSON.stringify(gameState));
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
    
    // Check level up
    const oldLevel = gameState.level;
    const newLevel = Math.floor(gameState.score / 100) + 1;
    
    // Cap maximum level to prevent infinite loops
    const maxLevel = 20;
    gameState.level = Math.min(newLevel, maxLevel);
    
    if (gameState.level > oldLevel && gameState.level <= maxLevel) {
        levelUpReward(gameState.level, oldLevel);
    }
    
    // Update bow color based on level
    updateBowForLevel(gameState.level);
    
    // Check if game is finished (level 20 reached)
    if (gameState.level >= maxLevel && oldLevel < maxLevel) {
        setTimeout(() => {
            showGameFinishedScreen();
        }, 2000); // Show after 2 seconds to let level up message show first
    }
    
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

// Update button cooldown visual
function updateButtonCooldown(buttonId, cooldownSeconds) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    
    let timeLeft = cooldownSeconds;
    const originalText = btn.textContent;
    
    const countdown = setInterval(() => {
        timeLeft--;
        btn.textContent = `${originalText} (${timeLeft}s)`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.textContent = originalText;
        }
    }, 1000);
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
    updateButtonCooldown('feed-btn', 2);
    
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
    updateButtonCooldown('play-btn', 3);
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.energy = Math.max(0, gameState.energy - 15);
    gameState.happiness = Math.min(100, gameState.happiness + 15);
    gameState.score += Math.floor(10 * bonus);
    updateActionCounters('play');
    playPlaySound();
    showMessage('Så morsomt! La oss leke mer! 🎾😸');
    createParticles(document.getElementById('play-btn'));
    updateStats();
});

document.getElementById('pet-btn').addEventListener('click', () => {
    if (isActionOnCooldown('pet', 1.5)) {
        showMessage('Katten koser allerede! Vent litt... ⏳');
        return;
    }
    
    setActionCooldown('pet');
    updateButtonCooldown('pet-btn', 1.5);
    
    const bonus = getLevelBonusMultiplier(gameState.level);
    gameState.happiness = Math.min(100, gameState.happiness + 20);
    gameState.energy = Math.min(100, gameState.energy + 5);
    gameState.score += Math.floor(8 * bonus);
    updateActionCounters('pet');
    playPurrSound();
    showMessage('Purr purr purr... ❤️😸');
    createParticles(document.getElementById('pet-btn'));
    updateStats();
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
    updateButtonCooldown('sleep-btn', 5);
    
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
    updateButtonCooldown('clean-btn', 4);
    
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
    updateButtonCooldown('pizza-btn', 3);
    
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
    updateButtonCooldown('bottle-btn', 2.5);
    
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
    updateButtonCooldown('hand-btn', 2);
    
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
    { id: 'collar1', name: 'Rødt halsbånd 🔴', price: 80, emoji: '🔴', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'collar2', name: 'Blått halsbånd 🔵', price: 80, emoji: '🔵', effect: 'style', useType: 'cosmetic', useLabel: null },
    { id: 'bell', name: 'Bjelle 🔔', price: 90, emoji: '🔔', effect: 'happiness+7', useType: 'cosmetic', useLabel: null }
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

// ==================== ACHIEVEMENTS SYSTEM ====================
const achievements = [
    { id: 'fed100', name: 'Kattemester', desc: 'Mat katten 100 ganger', icon: '🍖', target: 100, stat: 'timesFed' },
    { id: 'fed50', name: 'Kattetaker', desc: 'Mat katten 50 ganger', icon: '🍖', target: 50, stat: 'timesFed' },
    { id: 'fed10', name: 'Kattvenn', desc: 'Mat katten 10 ganger', icon: '🍖', target: 10, stat: 'timesFed' },
    { id: 'pet50', name: 'Koseekspert', desc: 'Kose katten 50 ganger', icon: '❤️', target: 50, stat: 'timesPetted' },
    { id: 'play30', name: 'Lekekamerat', desc: 'Lek med katten 30 ganger', icon: '🎾', target: 30, stat: 'timesPlayed' },
    { id: 'pizza10', name: 'Pizzaelsker', desc: 'Gi pizza 10 ganger', icon: '🍕', target: 10, stat: 'pizzaGiven' },
    { id: 'level10', name: 'Nivåmester', desc: 'Nå nivå 10', icon: '⭐', target: 10, stat: 'level', type: 'level' },
    { id: 'level20', name: 'Legende', desc: 'Nå nivå 20', icon: '🏆', target: 20, stat: 'level', type: 'level' },
    { id: 'score1000', name: 'Poengkonge', desc: 'Samle 1000 poeng', icon: '💰', target: 1000, stat: 'score', type: 'score' }
];

function checkAchievements() {
    achievements.forEach(achievement => {
        if (gameState.achievements[achievement.id]) return; // Already unlocked
        
        let progress = 0;
        if (achievement.type === 'level') {
            progress = gameState.level;
        } else if (achievement.type === 'score') {
            progress = gameState.score;
        } else {
            progress = gameState.stats[achievement.stat] || 0;
        }
        
        if (progress >= achievement.target) {
            gameState.achievements[achievement.id] = true;
            gameState.coins += 50; // Reward coins
            playSuccessSound();
            showMessage(`🏆 Bedrift oppnådd: ${achievement.name}! +50 mynter! 🏆`);
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

// ==================== DAILY CHALLENGES ====================
function generateDailyChallenge() {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('dailyChallenge');
    
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
        { type: 'pizza', target: 2, reward: 70, desc: 'Gi pizza 2 ganger', icon: '🍕' }
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    challenge.date = today;
    challenge.progress = 0;
    gameState.dailyChallenge = challenge;
    localStorage.setItem('dailyChallenge', JSON.stringify(challenge));
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
        saveGame();
    }
    
    container.innerHTML = gameState.challengeCompleted ? 
        `<div class="challenge-complete">✓ Utfordring fullført! Kom tilbake i morgen!</div>` :
        `<div class="challenge-active">
            <strong>📅 Daglig utfordring:</strong> ${challenge.desc}
            <div class="challenge-progress">${challenge.progress}/${challenge.target} ${challenge.icon}</div>
        </div>`;
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

let foodCatchKeyListener = null;

function startFoodCatch() {
    document.getElementById('food-catch-area').style.display = 'block';
    foodCatchScore = 0;
    foodCatchTime = 30;
    foodPosition = 50;
    document.getElementById('food-score').textContent = '0';
    document.getElementById('food-time').textContent = '30';
    
    // Remove old key listener if exists
    if (foodCatchKeyListener) {
        document.removeEventListener('keydown', foodCatchKeyListener);
    }
    
    const container = document.getElementById('catch-container');
    container.innerHTML = `
        <div class="catch-instructions">🎮 Bruk ← → piltastene for å flytte katten!</div>
        <div class="catch-cat" style="left: 50%;">😸</div>
        <div class="catch-food" style="display: none;"></div>
    `;
    
    const timer = setInterval(() => {
        foodCatchTime--;
        document.getElementById('food-time').textContent = foodCatchTime;
        if (foodCatchTime <= 0) {
            clearInterval(timer);
            if (foodCatchInterval) clearInterval(foodCatchInterval);
            if (foodCatchKeyListener) {
                document.removeEventListener('keydown', foodCatchKeyListener);
                foodCatchKeyListener = null;
            }
            gameState.coins += Math.floor(foodCatchScore / 10);
            gameState.stats.minigameScore += foodCatchScore;
            gameState.score += foodCatchScore; // Add to total score
            showMessage(`Tid er ute! Du fikk ${foodCatchScore} poeng! +${Math.floor(foodCatchScore/10)} mynter!`);
            container.innerHTML = `<button class="action-btn" onclick="startFoodCatch()">Spill igjen</button>`;
            updateStats(); // Update all stats including level
            renderStats(); // Update stats display
            saveGame();
        }
    }, 1000);
    
    // Add key listener for arrow keys
    foodCatchKeyListener = (e) => {
        if (e.key === 'ArrowLeft' && foodPosition > 0) {
            foodPosition -= 5;
        }
        if (e.key === 'ArrowRight' && foodPosition < 95) {
            foodPosition += 5;
        }
        const cat = document.querySelector('.catch-cat');
        if (cat) {
            cat.style.left = foodPosition + '%';
        }
    };
    document.addEventListener('keydown', foodCatchKeyListener);
    
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
    container.innerHTML = `
        <div class="album-cat-info">
            <div class="album-cat-emoji">${cat.emoji}</div>
            <div class="album-cat-name">${cat.name}</div>
            <div class="album-cat-status ${cat.unlocked ? '' : 'locked'}">
                ${cat.unlocked ? 
                    `<div>Lykke: ${cat.happiness}%</div>
                     <div>Sult: ${cat.hunger}%</div>
                     <div>Energi: ${cat.energy}%</div>` :
                    '🔒 Låst - Nå nivå ' + ((gameState.currentCat + 1) * 5) + ' for å låse opp'}
            </div>
        </div>
    `;
    
    // Unlock cats based on level
    gameState.cats.forEach((cat, index) => {
        if (!cat.unlocked && gameState.level >= (index + 1) * 5) {
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
        .filter(item => item && item.useType === 'play');
    
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
    
    if (item.useType !== 'play') {
        showMessage(`${item.name} er kun kosmetisk! Det ser bra ut på katten! ✨`);
        return;
    }
    
    // Check cooldown for item usage
    const actionId = `item-${itemId}`;
    if (isActionOnCooldown(actionId, 3)) {
        showMessage('Katten leker allerede med dette! Vent litt... ⏳');
        return;
    }
    
    if (gameState.energy < 20) {
        showMessage('Jeg er for sliten... La meg hvile først! 😴');
        return;
    }
    
    setActionCooldown(actionId);
    updateButtonCooldown(`item-btn-${itemId}`, 3);
    
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
        default:
            happinessGain = 15;
            energyChange = -10;
            scoreGain = 10;
            message = `Katten leker med ${item.name}! 😸`;
    }
    
    gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
    gameState.energy = Math.max(0, gameState.energy + energyChange);
    gameState.score += Math.floor(scoreGain * bonus);
    updateActionCounters('play');
    playPlaySound();
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
initAudio();
initBackgroundMusic();
loadGame();
playTimeStart = Date.now(); // Start tracking play time from now
updateStats();
checkSeasonalEvents();
generateDailyChallenge();
updateDailyChallenge();

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

