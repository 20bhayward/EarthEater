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
            case GAME_STATE.GAME_OVER:
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
        // Main menu background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('EarthEater', this.canvas.width / 2, this.canvas.height / 3);
        
        // Subtitle
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Consume. Evolve. Conquer.', this.canvas.width / 2, this.canvas.height / 3 + 40);
        
        // Start prompt
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press Space to Start', this.canvas.width / 2, this.canvas.height * 2 / 3);
        
        // Controls hint
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Use Arrow Keys or WASD to move, Space to dig', this.canvas.width / 2, this.canvas.height * 2 / 3 + 40);
    }
    
    renderGameOver() {
        // Game over background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 3);
        
        // Stats
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Maximum Depth: ${Math.floor(this.player.maxDepthReached / 32)}m`, this.canvas.width / 2, this.canvas.height / 3 + 60);
        this.ctx.fillText(`Resources Collected: $${this.player.money}`, this.canvas.width / 2, this.canvas.height / 3 + 100);
        this.ctx.fillText(`Evolution Reached: ${this.capitalizeFirstLetter(this.player.evolutionManager.currentEvolution.type)}`, this.canvas.width / 2, this.canvas.height / 3 + 140);
        
        // Restart prompt
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height * 2 / 3);
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
        // Reset game components for a new game
        this.world = new World();
        this.player = new Player(GAME_WIDTH / 2, 100);
        this.camera = new Camera(this.player);
        
        // Place special objects in the world
        this.placeSpecialObjects();
        
        // Change game state to playing
        this.gameState = GAME_STATE.PLAYING;
        this.isPaused = false;
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