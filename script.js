// Main application controller
class DOOMTitleScreen {
    constructor() {
        this.isLoaded = false;
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        
        // Wait for all components to load
        await this.loadComponents();
        
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.startMainSequence();
    }

    async loadComponents() {
        // Simulate loading time for dramatic effect
        const loadingSteps = [
            { text: 'INITIALIZING HELL...', delay: 500 },
            { text: 'LOADING DEMONS...', delay: 800 },
            { text: 'PREPARING WEAPONS...', delay: 600 },
            { text: 'READY TO RIP AND TEAR...', delay: 400 }
        ];

        const loadingText = document.querySelector('.loading-text');
        const loadingProgress = document.querySelector('.loading-progress');
        
        for (let i = 0; i < loadingSteps.length; i++) {
            const step = loadingSteps[i];
            loadingText.textContent = step.text;
            loadingProgress.style.width = `${((i + 1) / loadingSteps.length) * 100}%`;
            await this.delay(step.delay);
        }
    }

    setupEventListeners() {
        // Menu button interactions
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach(button => {
            button.addEventListener('click', this.handleMenuClick.bind(this));
            button.addEventListener('mouseenter', this.playHoverSound.bind(this));
        });

        // Audio controls
        const muteButton = document.getElementById('mute-button');
        const volumeControl = document.getElementById('volume-control');
        
        muteButton.addEventListener('click', this.toggleMute.bind(this));
        volumeControl.addEventListener('input', this.adjustVolume.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyPress.bind(this));

        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    handleMenuClick(event) {
        const action = event.currentTarget.dataset.action;
        this.playClickSound();
        
        switch (action) {
            case 'start':
                this.startGame();
                break;
            case 'load':
                this.loadGame();
                break;
            case 'options':
                this.showOptions();
                break;
            case 'quit':
                this.quitGame();
                break;
        }
    }

    startGame() {
        this.showMessage('STARTING NEW GAME...', () => {
            // Game start logic would go here
            console.log('Starting new game...');
        });
    }

    loadGame() {
        this.showMessage('LOADING SAVED GAME...', () => {
            // Load game logic would go here
            console.log('Loading saved game...');
        });
    }

    showOptions() {
        this.showMessage('OPENING OPTIONS...', () => {
            // Options menu logic would go here
            console.log('Opening options...');
        });
    }

    quitGame() {
        this.showMessage('ARE YOU SURE? (Y/N)', () => {
            // Quit confirmation logic would go here
            console.log('Quit game...');
        });
    }

    showMessage(text, callback) {
        // Create a temporary message overlay
        const overlay = document.createElement('div');
        overlay.className = 'message-overlay';
        overlay.innerHTML = `
            <div class="message-content">
                <h2>${text}</h2>
                <div class="message-glow"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (callback) callback();
        }, 2000);
    }

    handleKeyPress(event) {
        switch (event.code) {
            case 'Enter':
                // Simulate clicking the first menu button
                const firstButton = document.querySelector('.menu-button');
                if (firstButton) firstButton.click();
                break;
            case 'Escape':
                // Show quit confirmation
                const quitButton = document.querySelector('[data-action="quit"]');
                if (quitButton) quitButton.click();
                break;
            case 'KeyM':
                // Toggle mute
                this.toggleMute();
                break;
        }
    }

    playHoverSound() {
        // Play hover sound effect
        this.playSound('hover');
    }

    playClickSound() {
        // Play click sound effect
        this.playSound('click');
    }

    playSound(type) {
        // Sound playing logic would interface with music_player.js
        if (window.musicPlayer) {
            window.musicPlayer.playEffect(type);
        }
    }

    toggleMute() {
        const muteButton = document.getElementById('mute-button');
        if (window.musicPlayer) {
            const isMuted = window.musicPlayer.toggleMute();
            muteButton.textContent = isMuted ? '🔇' : '🔊';
        }
    }

    adjustVolume(event) {
        const volume = event.target.value / 100;
        if (window.musicPlayer) {
            window.musicPlayer.setVolume(volume);
        }
    }

    handleResize() {
        // Handle window resize events
        if (window.fireShader) {
            window.fireShader.resize();
        }
    }

    handleVisibilityChange() {
        // Pause/resume when tab becomes visible/hidden
        if (document.hidden) {
            if (window.musicPlayer) window.musicPlayer.pause();
        } else {
            if (window.musicPlayer) window.musicPlayer.resume();
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    startMainSequence() {
        // Start the main title screen sequence
        this.isLoaded = true;
        
        // Trigger any final animations or effects
        document.body.classList.add('loaded');
        
        // Start particle effects if available
        if (window.particleSystem) {
            window.particleSystem.start();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Loading screen styles
const loadingStyles = `
#loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.5s ease;
}

.loading-content {
    text-align: center;
    color: #ff0000;
}

.loading-logo {
    font-family: 'Metal Mania', cursive;
    font-size: 4rem;
    font-weight: bold;
    text-shadow: 0 0 20px #ff0000;
    margin-bottom: 30px;
    animation: loadingPulse 2s ease-in-out infinite;
}

.loading-bar {
    width: 300px;
    height: 6px;
    background: #330000;
    border: 2px solid #ff0000;
    border-radius: 3px;
    margin: 20px auto;
    overflow: hidden;
}

.loading-progress {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #ff0000, #ff4400, #ff0000);
    transition: width 0.3s ease;
    box-shadow: 0 0 10px #ff0000;
}

.loading-text {
    font-family: 'Metal Mania', cursive;
    font-size: 1.2rem;
    color: #ff4400;
    margin-top: 20px;
    letter-spacing: 2px;
}

.message-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.message-content {
    position: relative;
    text-align: center;
    color: #ff0000;
    font-family: 'Metal Mania', cursive;
    font-size: 2rem;
    text-shadow: 0 0 20px #ff0000;
}

.message-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.2) 0%, transparent 70%);
    animation: messageGlow 1s ease-in-out infinite alternate;
}

@keyframes loadingPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes messageGlow {
    0% { opacity: 0.3; }
    100% { opacity: 0.8; }
}
`;

// Inject loading screen styles
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    window.doomTitleScreen = new DOOMTitleScreen();
});

