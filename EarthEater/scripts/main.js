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
        updateLoadingProgress(5, 'Initializing game...');
        
        // Load web fonts if available
        if (window.WebFont) {
            try {
                await new Promise((resolve) => {
                    WebFont.load({
                        google: {
                            families: ['Press Start 2P', 'VT323']
                        },
                        active: resolve,
                        inactive: resolve, // Continue even if fonts fail
                        timeout: 2000 // 2 second timeout
                    });
                });
                console.log('Custom fonts loaded');
            } catch (e) {
                console.warn('Failed to load custom fonts:', e);
            }
        }
        updateLoadingProgress(15, 'Loading fonts...');
        
        // Preload external libraries
        await preloadLibraries();
        console.log('Loaded external libraries');
        updateLoadingProgress(30, 'Loading libraries...');
        
        // Generate placeholder assets (simulating slow load for effect)
        await new Promise(resolve => setTimeout(resolve, 500));
        updateLoadingProgress(40, 'Creating tiles...');
        
        await generatePlaceholderImages();
        console.log('Generated placeholder assets');
        updateLoadingProgress(55, 'Creating sprites...');
        
        // Load external sprite assets from sprite databases
        try {
            // Try to load better assets from online sprite repositories or our own assets
            const externalAssetUrls = [
                'https://api.opsive.com/assets/UltimateCharacterController/demo/sprites/sheet1.png',
                'https://www.spriters-resource.com/resources/sheets/36/38772.png'
            ];
            
            for (const url of externalAssetUrls) {
                const img = new Image();
                img.src = url;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue even if this specific asset fails
                    
                    // Add a timeout in case the image never loads or errors
                    setTimeout(resolve, 3000);
                });
            }
            
            // Try to load any local assets if they exist
            await loadAssets();
            console.log('Loaded external assets');
        } catch (error) {
            console.warn('Using placeholder assets only:', error);
        }
        updateLoadingProgress(70, 'Loading assets...');
        
        // Simulate world generation (add a slight delay for UX)
        await new Promise(resolve => setTimeout(resolve, 800));
        updateLoadingProgress(80, 'Generating terrain...');
        
        // Initialize sound effects
        initSoundEffects();
        console.log('Sound system initialized');
        updateLoadingProgress(90, 'Initializing sound...');
        
        // Add more loading steps for polish
        await new Promise(resolve => setTimeout(resolve, 300));
        updateLoadingProgress(95, 'Preparing underground...');
        
        // Create and start the game
        const game = new Game();
        window.gameInstance = game; // Store for debug access
        
        // Final loading step
        await new Promise(resolve => setTimeout(resolve, 200));
        updateLoadingProgress(100, 'Ready to dig!');
        
        // Start the game after a short delay to show loading complete
        setTimeout(() => {
            hideLoadingScreen();
            game.start();
            
            // Add click handler to start game button
            const canvas = document.getElementById('gameCanvas');
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                
                // Check if click is within the start game button area
                const buttonX = canvas.width / 2;
                const buttonY = (canvas.height - 400) / 2 + 210; // Matches position in renderMainMenu
                const buttonWidth = 280;
                const buttonHeight = 50;
                
                if (x >= buttonX - buttonWidth/2 && 
                    x <= buttonX + buttonWidth/2 && 
                    y >= buttonY - buttonHeight/2 && 
                    y <= buttonY + buttonHeight/2 &&
                    game.gameState === 'menu') {
                    
                    console.log('Start button clicked!');
                    game.startGame();
                }
            });
            
            console.log('Game started');
        }, 1500); // Slightly longer delay for UX
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px; font-family: Verdana, sans-serif;">
                <h1 style="color: #ffde7d; text-shadow: 3px 3px 0 #000;">Game Failed to Start</h1>
                <p style="color: #dfdfdf; margin: 20px 0;">${error.message}</p>
                <button style="background: #4d2e19; color: #ffde7d; border: 3px solid #965f2c; padding: 10px 20px; font-size: 16px; cursor: pointer;" onclick="location.reload()">Try Again</button>
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