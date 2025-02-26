import Game from './engine/Game.js';
import { loadAssets } from './engine/AssetLoader.js';
import { generatePlaceholderImages } from './utils/PlaceholderAssets.js';
import { initSoundEffects } from './engine/SoundManager.js';
import { preloadLibraries } from './utils/LibraryLoader.js';

// Initialize the game when assets are loaded
window.addEventListener('load', async () => {
    try {
        console.log('EarthEater game starting...');
        
        // Show loading screen (already in HTML)
        updateLoadingProgress(10, 'Initializing game...');
        
        // Preload external libraries
        await preloadLibraries();
        console.log('Loaded external libraries');
        updateLoadingProgress(30, 'Loading libraries...');
        
        // Generate placeholder assets
        await generatePlaceholderImages();
        console.log('Generated placeholder assets');
        updateLoadingProgress(50, 'Creating game assets...');
        
        // Try to load any real assets if they exist
        try {
            await loadAssets();
            console.log('Loaded external assets');
        } catch (error) {
            console.warn('Using placeholder assets only:', error);
        }
        updateLoadingProgress(70, 'Loading assets...');
        
        // Initialize sound effects
        initSoundEffects();
        console.log('Sound system initialized');
        updateLoadingProgress(80, 'Initializing sound...');
        
        // Create and start the game
        const game = new Game();
        window.gameInstance = game; // Store for debug access
        updateLoadingProgress(90, 'Generating world...');
        
        // Start the game after a short delay to show loading complete
        setTimeout(() => {
            hideLoadingScreen();
            game.start();
            console.log('Game started');
        }, 1000);
        
        updateLoadingProgress(100, 'Ready to play!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px;">
                <h1>Failed to start the game</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
});

// Helper function to update loading progress
function updateLoadingProgress(percent, message) {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    
    if (message) {
        const loadingMessage = document.querySelector('.loading-container p');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
}

// Helper function to hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
}

// Add touch detection
function detectTouchDevice() {
    const touchControls = document.getElementById('touch-controls');
    if (touchControls) {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            touchControls.style.display = 'block';
            document.body.classList.add('touch-device');
            return true;
        }
    }
    return false;
}

// Setup touch controls
function setupTouchControls() {
    if (!detectTouchDevice()) return;
    
    const touchButtons = {
        up: document.getElementById('dpad-up'),
        right: document.getElementById('dpad-right'),
        down: document.getElementById('dpad-down'),
        left: document.getElementById('dpad-left'),
        action: document.getElementById('action-button')
    };
    
    // Track which buttons are being touched
    const touchState = {
        up: false,
        right: false,
        down: false,
        left: false,
        action: false
    };
    
    // Helper to update button state
    function updateButtonState(button, state) {
        if (state) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
    
    // Setup touch event listeners for each button
    for (const [key, button] of Object.entries(touchButtons)) {
        if (!button) continue;
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchState[key] = true;
            updateButtonState(button, true);
            window.gameInstance?.inputManager?.setTouchState(touchState);
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchState[key] = false;
            updateButtonState(button, false);
            window.gameInstance?.inputManager?.setTouchState(touchState);
        });
    }
}

// Setup touch controls after loading
window.addEventListener('load', setupTouchControls);