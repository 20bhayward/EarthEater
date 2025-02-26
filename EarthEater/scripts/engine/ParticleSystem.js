/**
 * Particle system for visual effects
 * Creates and manages particles for various game effects
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500; // Limit to prevent performance issues
    }
    
    /**
     * Create a burst of particles at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles to create
     * @param {string} color - Color of particles
     * @param {number} duration - Duration in seconds
     */
    createParticles(x, y, count, color, duration = 1.0) {
        // Limit particle count to prevent performance issues
        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < actualCount; i++) {
            // Random velocity
            const speed = 20 + Math.random() * 30;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const size = 2 + Math.random() * 3;
            
            // Random lifespan within the duration
            const lifespan = 0.5 + Math.random() * duration;
            
            // Add particle to the system
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: size,
                color: color,
                alpha: 1.0,
                lifespan: lifespan,
                remainingLife: lifespan
            });
        }
    }
    
    /**
     * Create a directional particle burst
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} directionX - X direction
     * @param {number} directionY - Y direction
     * @param {number} count - Number of particles
     * @param {string} color - Color of particles
     * @param {number} duration - Duration in seconds
     */
    createDirectionalParticles(x, y, directionX, directionY, count, color, duration = 1.0) {
        const angleBase = Math.atan2(directionY, directionX);
        const angleSpread = Math.PI / 4; // 45 degree spread
        
        // Limit particle count
        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < actualCount; i++) {
            // Random velocity with direction bias
            const speed = 20 + Math.random() * 30;
            const angle = angleBase + (Math.random() - 0.5) * angleSpread;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const size = 2 + Math.random() * 3;
            
            // Random lifespan within the duration
            const lifespan = 0.5 + Math.random() * duration;
            
            // Add particle to the system
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: size,
                color: color,
                alpha: 1.0,
                lifespan: lifespan,
                remainingLife: lifespan
            });
        }
    }
    
    /**
     * Create a trail effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} count - Number of particles
     * @param {string} color - Color of particles
     * @param {number} duration - Duration in seconds
     */
    createTrail(x, y, count, color, duration = 0.5) {
        // Limit particle count
        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        
        for (let i = 0; i < actualCount; i++) {
            // Random velocity but much slower
            const speed = 5 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Random size
            const size = 1 + Math.random() * 2;
            
            // Shorter lifespan for trail effects
            const lifespan = 0.2 + Math.random() * duration;
            
            // Add particle to the system
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: size,
                color: color,
                alpha: 0.7,
                lifespan: lifespan,
                remainingLife: lifespan
            });
        }
    }
    
    /**
     * Create special effects for abilities
     * @param {string} type - Type of effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Color of effect
     */
    createSpecialEffect(type, x, y, color) {
        switch(type) {
            case 'earthShake':
                // Earth shake effect - bursts of debris
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.createParticles(
                            x + (Math.random() - 0.5) * 40, 
                            y + (Math.random() - 0.5) * 40, 
                            10, 
                            color || '#8B4513', 
                            1.5
                        );
                    }, i * 200);
                }
                break;
                
            case 'burrowCharge':
                // Burrow charge effect - directional tunnel
                this.createDirectionalParticles(
                    x, y, 
                    Math.cos(Math.random() * Math.PI * 2), 
                    Math.sin(Math.random() * Math.PI * 2), 
                    15, 
                    color || '#8B4513', 
                    1.0
                );
                break;
                
            case 'powerDrill':
                // Power drill effect - concentrated particles
                this.createParticles(x, y, 20, color || '#CCCCCC', 0.8);
                break;
                
            case 'beamDrill':
                // Beam drill effect - focused energy
                const angle = Math.random() * Math.PI * 2;
                const length = 50;
                const endX = x + Math.cos(angle) * length;
                const endY = y + Math.sin(angle) * length;
                
                // Create particles along the beam
                for (let i = 0; i < 10; i++) {
                    const t = i / 10;
                    const px = x + (endX - x) * t;
                    const py = y + (endY - y) * t;
                    
                    this.createParticles(px, py, 3, color || '#00FFFF', 0.5);
                }
                break;
                
            case 'evolution':
                // Evolution effect - grand burst
                this.createParticles(x, y, 30, color || '#FFFFFF', 2.0);
                break;
                
            case 'acid':
                // Acid effect - bubbling particles
                this.createParticles(x, y, 15, color || '#7CFC00', 1.0);
                break;
                
            case 'teleport':
                // Teleport effect - fade in/out with particles
                this.createParticles(x, y, 25, color || '#9370DB', 1.0);
                break;
                
            case 'collect':
                // Collection effect - rising particles
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const px = x + (Math.random() - 0.5) * 10;
                        const py = y + (Math.random() - 0.5) * 10;
                        
                        this.particles.push({
                            x: px,
                            y: py,
                            vx: 0,
                            vy: -20 - Math.random() * 10,
                            size: 2 + Math.random() * 2,
                            color: color || '#FFFF00',
                            alpha: 1.0,
                            lifespan: 1.0,
                            remainingLife: 1.0
                        });
                    }, i * 100);
                }
                break;
                
            default:
                // Default special effect
                this.createParticles(x, y, 10, color || '#FFFFFF', 1.0);
        }
    }
    
    /**
     * Update all particles
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Apply gravity
            particle.vy += 20 * deltaTime;
            
            // Apply drag
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Update lifespan and alpha
            particle.remainingLife -= deltaTime;
            particle.alpha = particle.remainingLife / particle.lifespan;
            
            // Remove dead particles
            if (particle.remainingLife <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // If we have too many particles, remove oldest ones
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }
    
    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        if (!ctx || this.particles.length === 0) return;
        
        // Render all active particles
        ctx.save();
        
        for (const particle of this.particles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
}