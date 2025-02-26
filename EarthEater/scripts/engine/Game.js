import InputManager from './InputManager.js';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, GAME_STATE } from '../utils/constants.js';
import World from './World.js';
import Player from '../entities/Player.js';
import Camera from './Camera.js';
import UIManager from './UIManager.js';
import { assets } from './AssetLoader.js';

export default class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTimestamp = 0;
        this.gameState = GAME_STATE.MENU;
        this.isPaused = false;
        
        // Set canvas dimensions
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game components
        this.inputManager = new InputManager(this.canvas);
        this.world = new World();
        this.player = new Player(GAME_WIDTH / 2, 100); // Start near the surface
        this.camera = new Camera(this.player);
        this.uiManager = new UIManager(this);
        
        // Special objects in the world (like the driller part for Machine path)
        this.placeSpecialObjects();
        
        // Debug mode toggle
        this.isDebugMode = false;
        window.DEBUG_MODE = this.isDebugMode;
        
        // Create key binding for debug mode
        window.addEventListener('keydown', (e) => {
            // Ctrl+D to toggle debug mode
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.isDebugMode = !this.isDebugMode;
                window.DEBUG_MODE = this.isDebugMode;
                console.log(`Debug mode: ${this.isDebugMode ? 'enabled' : 'disabled'}`);
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
    }
    
    start() {
        // Start with the main menu
        this.showMainMenu();
        
        // Start the game loop
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        // Calculate delta time in seconds
        const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // Cap at 0.1s to prevent huge jumps
        this.lastTimestamp = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Render the game
        this.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // Skip updates if game is paused
        if (this.isPaused) {
            // Still update UI even when paused
            this.uiManager.update(deltaTime);
            return;
        }
        
        // Update based on game state
        switch(this.gameState) {
            case GAME_STATE.PLAYING:
                // Update game components
                this.player.update(deltaTime, this.world, this.inputManager);
                this.camera.update(deltaTime);
                this.world.update(deltaTime, this.player);
                break;
                
            case GAME_STATE.MENU:
                // Handle menu input
                if (this.inputManager.isAction() || this.inputManager.isSpacePressed()) {
                    console.log("Start button pressed!");
                    this.startGame();
                }
                break;
                
            case GAME_STATE.GAME_OVER:
                // Handle game over input
                if (this.inputManager.isAction() || this.inputManager.isSpacePressed()) {
                    this.startGame();
                }
                break;
                
            case GAME_STATE.EVOLUTION:
            case GAME_STATE.UPGRADE:
                // Only update UI in these states
                break;
        }
        
        // Always update UI
        this.uiManager.update(deltaTime);
    }
    
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render based on game state
        switch(this.gameState) {
            case GAME_STATE.PLAYING:
            case GAME_STATE.PAUSED:
                // Set the camera transform
                this.ctx.save();
                this.camera.applyTransform(this.ctx);
                
                // Render the world
                this.world.render(this.ctx, this.camera);
                
                // Render the player
                this.player.render(this.ctx);
                
                // Reset the camera transform
                this.ctx.restore();
                break;
                
            case GAME_STATE.MENU:
                this.renderMainMenu();
                break;
                
            case GAME_STATE.GAME_OVER:
                this.renderGameOver();
                break;
        }
        
        // Always render UI on top (not affected by camera)
        this.uiManager.render(this.ctx);
        
        // Render debug info if enabled
        if (this.isDebugMode) {
            this.renderDebugInfo();
        }
    }
    
    renderMainMenu() {
        // Main menu background - more like Terraria
        const bgImage = new Image();
        bgImage.src = 'https://rare-gallery.com/uploads/posts/541284-terraria-game-world.jpg';
        
        // Draw background
        if (bgImage.complete) {
            // Draw image with slight darkening for better contrast
            this.ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback gradient background if image isn't loaded
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#004080');
            gradient.addColorStop(0.6, '#001933');
            gradient.addColorStop(1, '#000000');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Add some stars in the background
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < 100; i++) {
                const size = Math.random() * 2 + 1;
                this.ctx.fillRect(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height * 0.8,
                    size, 
                    size
                );
            }
        }
        
        // Menu panel
        const panelWidth = 500;
        const panelHeight = 400;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // Draw wooden panel background with pixel-art style (Terraria-like)
        this.drawTerrariaPanelBackground(panelX, panelY, panelWidth, panelHeight);
        
        // Title with Terraria-like style
        this.ctx.fillStyle = '#f8d878';
        this.ctx.font = 'bold 48px "Press Start 2P", Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text shadow for Terraria-like effect
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 4;
        this.ctx.shadowOffsetY = 4;
        this.ctx.fillText('EARTH EATER', this.canvas.width / 2, panelY + 80);
        
        // Subtitle
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.font = 'bold 18px "Press Start 2P", Verdana';
        this.ctx.fillText('Consume. Evolve. Conquer.', this.canvas.width / 2, panelY + 140);
        
        // Menu options with selected indicator
        this.drawTerrariaMenuButton('Start Game', this.canvas.width / 2, panelY + 210, true);
        this.drawTerrariaMenuButton('Options', this.canvas.width / 2, panelY + 270, false);
        this.drawTerrariaMenuButton('Exit', this.canvas.width / 2, panelY + 330, false);
        
        // Reset shadow
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        
        // Controls hint
        this.ctx.fillStyle = '#dfdfdf';
        this.ctx.font = '16px Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Use Arrow Keys or WASD to move, Space to select', this.canvas.width / 2, panelY + panelHeight + 30);
        
        // Version number
        this.ctx.fillStyle = '#999';
        this.ctx.font = '12px Verdana';
        this.ctx.fillText('v1.0.0', this.canvas.width - 50, this.canvas.height - 20);
    }
    
    // Terraria-style wooden panel background
    drawTerrariaPanelBackground(x, y, width, height) {
        // Panel background - dark with wood texture
        this.ctx.fillStyle = '#3e2718';
        this.ctx.fillRect(x, y, width, height);
        
        // Draw the wood texture pattern
        this.ctx.fillStyle = '#59381f';
        
        // Draw wood grain lines
        for (let i = 0; i < height; i += 8) {
            this.ctx.fillRect(x, y + i, width, 3);
        }
        
        // Thick border for Terraria-like panels
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#7d5736';
        this.ctx.strokeRect(x, y, width, height);
        
        // Inner border
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#cc9966';
        this.ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
        
        // Inner glow effect
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(255, 230, 150, 0.05)');
        gradient.addColorStop(0.5, 'rgba(255, 230, 150, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 230, 150, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 10, y + 10, width - 20, height - 20);
    }
    
    // Terraria-style menu button
    drawTerrariaMenuButton(text, x, y, isSelected) {
        const buttonWidth = 280;
        const buttonHeight = 50;
        const buttonX = x - buttonWidth / 2;
        const buttonY = y - buttonHeight / 2;
        
        // Button background
        this.ctx.fillStyle = isSelected ? '#8b5a2b' : '#59381f';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = isSelected ? '#e6c78b' : '#8b5a2b';
        this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button inner border
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = isSelected ? '#ffffff' : '#cc9966';
        this.ctx.strokeRect(buttonX + 3, buttonY + 3, buttonWidth - 6, buttonHeight - 6);
        
        // Selected indicator (arrow icon)
        if (isSelected) {
            this.ctx.fillStyle = '#f8d878';
            this.ctx.font = '24px Verdana';
            this.ctx.fillText('>', buttonX + 15, y);
        }
        
        // Button text
        this.ctx.fillStyle = isSelected ? '#f8d878' : '#e6c78b';
        this.ctx.font = isSelected ? 'bold 20px "Press Start 2P", Verdana' : '20px "Press Start 2P", Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(text, x, y);
    }
    
    // Keeping the old method for backwards compatibility but it won't be used
    drawMenuButton(text, x, y) {
        this.drawTerrariaMenuButton(text, x, y, false);
    }
    
    renderGameOver() {
        // Game over background - Terraria style
        const bgImage = new Image();
        bgImage.src = 'https://rare-gallery.com/uploads/posts/541284-terraria-game-world.jpg';
        
        if (bgImage.complete) {
            // Draw image with dark overlay
            this.ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Fallback dark red gradient
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#330000');
            gradient.addColorStop(1, '#000000');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Game over panel
        const panelWidth = 500;
        const panelHeight = 450;
        const panelX = (this.canvas.width - panelWidth) / 2;
        const panelY = (this.canvas.height - panelHeight) / 2;
        
        // Draw Terraria-style panel background with darker colors for game over
        this.ctx.fillStyle = '#2e0c08';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw the wood texture pattern in dark red
        this.ctx.fillStyle = '#491209';
        for (let i = 0; i < panelHeight; i += 8) {
            this.ctx.fillRect(panelX, panelY + i, panelWidth, 3);
        }
        
        // Thick border for Terraria-like panels
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#6d1717';
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Inner border
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#bc3636';
        this.ctx.strokeRect(panelX + 8, panelY + 8, panelWidth - 16, panelHeight - 16);
        
        // Game over text
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px "Press Start 2P", Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text shadow for Terraria-like effect
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 4;
        this.ctx.shadowOffsetY = 4;
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, panelY + 70);
        
        // Reset shadow for stats
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Stats panel
        const statsPanelY = panelY + 130;
        this.ctx.fillStyle = 'rgba(20, 0, 0, 0.5)';
        this.ctx.fillRect(panelX + 50, statsPanelY, panelWidth - 100, 180);
        this.ctx.strokeStyle = '#8b0000';
        this.ctx.strokeRect(panelX + 50, statsPanelY, panelWidth - 100, 180);
        
        // Stats header
        this.ctx.fillStyle = '#ffde7d';
        this.ctx.font = 'bold 24px "Press Start 2P", Verdana';
        this.ctx.fillText('STATS', this.canvas.width / 2, statsPanelY + 30);
        
        // Stats content
        this.ctx.fillStyle = '#dfdfdf';
        this.ctx.font = '16px Verdana';
        this.ctx.textAlign = 'left';
        
        const statsX = panelX + 70;
        const maxDepth = this.player.maxDepthReached ? Math.floor(this.player.maxDepthReached / 32) : Math.floor(this.player.y / 32);
        this.ctx.fillText(`Maximum Depth: ${maxDepth}m`, statsX, statsPanelY + 70);
        this.ctx.fillText(`Resources Collected: $${this.player.money}`, statsX, statsPanelY + 110);
        this.ctx.fillText(`Evolution Stage: ${this.capitalizeFirstLetter(this.player.evolutionManager.currentEvolution.type)}`, statsX, statsPanelY + 150);
        
        // Reset text alignment
        this.ctx.textAlign = 'center';
        
        // Restart button - Terraria style
        const buttonY = panelY + 340;
        this.drawTerrariaButton('Try Again', this.canvas.width / 2, buttonY, true);
        
        // Controls hint
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = '#dfdfdf';
        this.ctx.font = '16px Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, panelY + panelHeight - 30);
    }
    
    // Terraria-style button specially for game over screen
    drawTerrariaButton(text, x, y, isSelected) {
        const buttonWidth = 240;
        const buttonHeight = 60;
        const buttonX = x - buttonWidth / 2;
        const buttonY = y - buttonHeight / 2;
        
        // Button background - red for game over
        this.ctx.fillStyle = isSelected ? '#8b0000' : '#660000';
        this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#bc3636';
        this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button inner border
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.strokeRect(buttonX + 3, buttonY + 3, buttonWidth - 6, buttonHeight - 6);
        
        // Button text
        this.ctx.fillStyle = '#ffde7d';
        this.ctx.font = 'bold 24px "Press Start 2P", Verdana';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(text, x, y);
    }
    
    renderDebugInfo() {
        const debugY = 80;
        const lineHeight = 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, debugY, 200, 120);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - this.lastTimestamp))}`, 10, debugY + lineHeight);
        this.ctx.fillText(`Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 10, debugY + lineHeight * 2);
        this.ctx.fillText(`Depth: ${Math.floor(this.player.y / 32)}m`, 10, debugY + lineHeight * 3);
        this.ctx.fillText(`Evolution: ${this.player.evolutionManager.currentEvolution.type}`, 10, debugY + lineHeight * 4);
        this.ctx.fillText(`Branch: ${this.player.evolutionManager.currentBranch || 'None'}`, 10, debugY + lineHeight * 5);
    }
    
    showMainMenu() {
        this.gameState = GAME_STATE.MENU;
    }
    
    startGame() {
        console.log('Starting new game...');
        
        // Reset game components for a new game
        this.world = new World();
        this.player = new Player(GAME_WIDTH / 2, 100);
        this.camera = new Camera(this.player);
        
        // Place special objects in the world
        this.placeSpecialObjects();
        
        // Change game state to playing
        this.gameState = GAME_STATE.PLAYING;
        this.isPaused = false;
        
        console.log('Game state changed to PLAYING');
    }
    
    gameOver() {
        this.gameState = GAME_STATE.GAME_OVER;
    }
    
    pauseGame() {
        this.isPaused = true;
    }
    
    resumeGame() {
        this.isPaused = false;
    }
    
    placeSpecialObjects() {
        // Place the ancient driller part for the Machine evolution path
        // Choose a random depth between 100-200m
        const drillerDepth = 100 + Math.floor(Math.random() * 100);
        const drillerX = 20 + Math.floor(Math.random() * (GAME_WIDTH - 40));
        
        // Create a small cavern around the driller
        for (let y = drillerDepth - 2; y <= drillerDepth + 2; y++) {
            for (let x = drillerX - 2; x <= drillerX + 2; x++) {
                // Create air pockets
                this.world.setTileAt(x * TILE_SIZE, y * TILE_SIZE, 'air');
            }
        }
        
        // Place the driller part in the center
        this.world.setTileAt(drillerX * TILE_SIZE, drillerDepth * TILE_SIZE, 'drillerPart');
        
        // Log the location for debugging
        console.log(`Driller part placed at: ${drillerX * TILE_SIZE}, ${drillerDepth * TILE_SIZE} (${drillerDepth}m depth)`);
    }
    
    // Helper method to capitalize
    capitalizeFirstLetter(string) {
        if (!string) return '';
        // Handle camelCase (e.g., "giantWorm" -> "Giant Worm")
        const result = string.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
}