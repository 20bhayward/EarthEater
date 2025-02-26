import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export default class Camera {
    constructor(target) {
        this.target = target;
        this.x = 0;
        this.y = 0;
        this.width = GAME_WIDTH;
        this.height = GAME_HEIGHT;
        this.smoothFactor = 0.1; // How quickly the camera follows the target (0-1)
        this.maxShakeIntensity = 0;
        this.shakeDecay = 5; // How quickly the shake effect decays per second
        this.shakeTime = 0;
    }
    
    update(deltaTime) {
        // Calculate target position
        const targetX = this.target.x;
        const targetY = this.target.y;
        
        // Smooth follow with interpolation
        this.x += (targetX - this.x) * this.smoothFactor;
        this.y += (targetY - this.y) * this.smoothFactor;
        
        // Update screen shake if active
        if (this.maxShakeIntensity > 0) {
            // Reduce shake intensity over time
            this.maxShakeIntensity -= this.shakeDecay * deltaTime;
            
            // Ensure shake intensity doesn't go negative
            if (this.maxShakeIntensity < 0) {
                this.maxShakeIntensity = 0;
            }
        }
    }
    
    // Apply the camera transformation to the context
    applyTransform(ctx) {
        // Calculate the center position of the canvas
        const canvasCenterX = ctx.canvas.width / 2;
        const canvasCenterY = ctx.canvas.height / 2;
        
        // Add screen shake if active
        let shakeX = 0;
        let shakeY = 0;
        
        if (this.maxShakeIntensity > 0) {
            shakeX = (Math.random() * 2 - 1) * this.maxShakeIntensity;
            shakeY = (Math.random() * 2 - 1) * this.maxShakeIntensity;
        }
        
        // Translate the context so that the camera position is at the center of the canvas
        ctx.translate(
            canvasCenterX - Math.round(this.x) + shakeX,
            canvasCenterY - Math.round(this.y) + shakeY
        );
    }
    
    // Add a screen shake effect
    shake(intensity, duration) {
        this.maxShakeIntensity = Math.max(this.maxShakeIntensity, intensity);
        this.shakeTime = Math.max(this.shakeTime, duration);
    }
}