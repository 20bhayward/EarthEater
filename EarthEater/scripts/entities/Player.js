import { TILE_SIZE, EVOLUTION_BRANCHES } from '../utils/constants.js';
import { assets, playSound } from '../engine/AssetLoader.js';
import { EvolutionManager } from './EvolutionManager.js';
import { ParticleSystem } from '../engine/ParticleSystem.js';

export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Movement properties
        this.baseSpeed = 120; // Pixels per second
        this.currentSpeed = this.baseSpeed;
        this.maxFallSpeed = 300;
        
        // Mining properties
        this.baseDigPower = 1.0;
        this.digProgress = 0;
        this.isDigging = false;
        this.digTarget = null;
        this.digCooldown = 0;
        
        // Vital stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxHunger = 100;
        this.hunger = 100;
        this.hungerRate = 2; // Hunger decrease per second
        this.oxygen = 100; // For water environments
        this.maxOxygen = 100;
        
        // Resources
        this.resources = {};
        this.money = 0;
        
        // Evolution system
        this.evolutionManager = new EvolutionManager(this);
        
        // Followers (for Brood Queen path)
        this.followers = [];
        this.maxFollowers = 0;
        
        // Special mechanics
        this.hasFoundDriller = false;
        this.hasFusedWithDriller = false;
        this.specialGems = 0;
        
        // Visual effects
        this.particles = new ParticleSystem();
        this.digEffect = null;
        this.damageFlashTime = 0;
        
        // Animation
        this.direction = 'down';
        this.sprite = {
            frameX: 0,
            frameY: 0,
            totalFrames: 4,
            animationSpeed: 0.1,
            timer: 0
        };
        
        // Collision detection
        this.collisionOffsetX = 2;
        this.collisionOffsetY = 2;
        this.collisionWidth = TILE_SIZE - 4;
        this.collisionHeight = TILE_SIZE - 4;
        
        // Upgrades
        this.upgrades = [];
        this.appliedEffects = {
            digPower: 1.0,
            speedBonus: 1.0,
            hungerRateReduction: 1.0,
            nutritionBonus: 1.0,
            maxHungerBonus: 1.0,
            damageReduction: 1.0,
            lavaDamageReduction: 1.0,
            gasDamageReduction: 1.0,
            waterDamageReduction: 1.0
        };
    }
    
    update(deltaTime, world, inputManager) {
        // Update digging cooldown
        if (this.digCooldown > 0) {
            this.digCooldown -= deltaTime;
        }
        
        // Handle input and movement
        this.handleInput(inputManager);
        this.updatePosition(deltaTime, world);
        
        // Update vital stats
        this.updateVitalStats(deltaTime);
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Check for collisions with environment
        this.checkEnvironmentCollisions(world);
        
        // Update particles and effects
        this.particles.update(deltaTime);
        
        // Update followers (if any)
        this.updateFollowers(deltaTime, world);
        
        // Check for special events
        this.checkSpecialEvents(world);
        
        // Damage flash effect
        if (this.damageFlashTime > 0) {
            this.damageFlashTime -= deltaTime;
        }
    }
    
    handleInput(inputManager) {
        // Reset velocity
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Stop processing input if dead
        if (this.health <= 0) return;
        
        // Movement controls
        if (inputManager.isLeft()) {
            this.velocityX = -this.currentSpeed;
            this.direction = 'left';
        } else if (inputManager.isRight()) {
            this.velocityX = this.currentSpeed;
            this.direction = 'right';
        }
        
        if (inputManager.isUp()) {
            this.velocityY = -this.currentSpeed;
            this.direction = 'up';
        } else if (inputManager.isDown()) {
            this.velocityY = this.currentSpeed;
            this.direction = 'down';
        }
        
        // Normalize diagonal movement
        if (this.velocityX !== 0 && this.velocityY !== 0) {
            const factor = 1 / Math.sqrt(2);
            this.velocityX *= factor;
            this.velocityY *= factor;
        }
        
        // Mining/Action button
        this.isDigging = inputManager.isAction() && this.digCooldown <= 0;
    }
    
    updatePosition(deltaTime, world) {
        // Apply evolution-specific movement (flying, burrowing, etc.)
        this.applyEvolutionMovement(deltaTime);
        
        // If we're digging, don't move
        if (this.isDigging && this.digTarget) {
            return;
        }
        
        // Calculate new position
        let newX = this.x + this.velocityX * deltaTime;
        let newY = this.y + this.velocityY * deltaTime;
        
        // Check collision with world - move axis by axis to allow sliding
        if (this.canMoveTo(newX, this.y, world)) {
            this.x = newX;
        } 
        
        if (this.canMoveTo(this.x, newY, world)) {
            this.y = newY;
        }
    }
    
    applyEvolutionMovement(deltaTime) {
        // Apply different movement based on evolution path
        const evoType = this.evolutionManager.currentEvolution.type;
        const evoStage = this.evolutionManager.currentEvolution.stage;
        
        // Apply evolution-specific speed adjustments
        switch (this.evolutionManager.currentBranch) {
            case EVOLUTION_BRANCHES.WORM:
                // Worm gets faster digging but slower movement as it grows
                if (evoStage >= 3) {
                    this.currentSpeed = this.baseSpeed * 0.8 * this.appliedEffects.speedBonus;
                }
                break;
                
            case EVOLUTION_BRANCHES.MACHINE:
                // Machine gets faster movement but has more limited turning
                this.currentSpeed = this.baseSpeed * (1 + (evoStage * 0.1)) * this.appliedEffects.speedBonus;
                
                // Machine has momentum and can't turn as quickly
                if (evoStage >= 3) {
                    // Apply momentum physics
                    const momentum = 0.8; // Higher = more momentum
                    this.velocityX = this.velocityX * momentum;
                    this.velocityY = this.velocityY * momentum;
                }
                break;
                
            case EVOLUTION_BRANCHES.BROOD:
                // Brood gets slower as they grow but has more followers
                if (evoStage >= 3) {
                    this.currentSpeed = this.baseSpeed * 0.7 * this.appliedEffects.speedBonus;
                }
                break;
                
            default:
                // Larva/base form
                this.currentSpeed = this.baseSpeed * this.appliedEffects.speedBonus;
        }
    }
    
    canMoveTo(x, y, world) {
        // Get the evolution-specific movement capabilities
        const { canMoveThrough } = this.evolutionManager.getCurrentCapabilities();
        
        // Check collision with world tiles
        const left = x + this.collisionOffsetX;
        const right = x + this.collisionOffsetX + this.collisionWidth;
        const top = y + this.collisionOffsetY;
        const bottom = y + this.collisionOffsetY + this.collisionHeight;
        
        // Check corners
        const topLeft = world.getTileAt(left, top);
        const topRight = world.getTileAt(right, top);
        const bottomLeft = world.getTileAt(left, bottom);
        const bottomRight = world.getTileAt(right, bottom);
        
        // Check if can move through each tile
        return canMoveThrough(topLeft) && 
               canMoveThrough(topRight) && 
               canMoveThrough(bottomLeft) && 
               canMoveThrough(bottomRight);
    }
    
    updateVitalStats(deltaTime) {
        // Update hunger
        this.hunger = Math.max(0, this.hunger - (this.hungerRate * this.appliedEffects.hungerRateReduction * deltaTime));
        
        // If hunger reaches 0, start decreasing health
        if (this.hunger <= 0) {
            this.health = Math.max(0, this.health - (3 * deltaTime));
        }
        
        // If underwater, decrease oxygen
        if (this.isUnderwater) {
            this.oxygen = Math.max(0, this.oxygen - (5 * deltaTime));
            
            // If oxygen reaches 0, start decreasing health quickly
            if (this.oxygen <= 0) {
                this.health = Math.max(0, this.health - (10 * deltaTime));
            }
        } else {
            // Regenerate oxygen when not underwater
            this.oxygen = Math.min(this.maxOxygen, this.oxygen + (8 * deltaTime));
        }
        
        // Check if player is dead
        if (this.health <= 0) {
            this.die();
        }
    }
    
    updateAnimation(deltaTime) {
        // Skip animation updates if dead
        if (this.health <= 0) return;
        
        // Update animation frame
        this.sprite.timer += deltaTime;
        
        if (this.sprite.timer >= this.sprite.animationSpeed) {
            this.sprite.timer = 0;
            this.sprite.frameX = (this.sprite.frameX + 1) % this.sprite.totalFrames;
        }
        
        // Set frame row based on direction and evolution
        switch(this.direction) {
            case 'up': this.sprite.frameY = 0; break;
            case 'right': this.sprite.frameY = 1; break;
            case 'down': this.sprite.frameY = 2; break;
            case 'left': this.sprite.frameY = 3; break;
        }
    }
    
    checkEnvironmentCollisions(world) {
        // Check collisions with environmental hazards at the player's position
        const centerTile = world.getTileAt(this.x + this.width/2, this.y + this.height/2);
        
        // Get evolutionary resistances and vulnerabilities
        const { resistances, vulnerabilities } = this.evolutionManager.getCurrentCapabilities();
        
        // Handle special environments
        switch(centerTile.type) {
            case 'lava':
                if (resistances.includes('lava')) {
                    // Immune or reduced damage
                    if (resistances.includes('lava') !== 'immune') {
                        this.takeDamage(2 * deltaTime * (1 - this.appliedEffects.lavaDamageReduction));
                    }
                } else {
                    // Full damage
                    this.takeDamage(10 * deltaTime);
                    this.createDamageParticles('red');
                }
                break;
                
            case 'gas':
                if (resistances.includes('gas')) {
                    // Immune or reduced damage
                    if (resistances.includes('gas') !== 'immune') {
                        this.takeDamage(1 * deltaTime * (1 - this.appliedEffects.gasDamageReduction));
                    }
                } else {
                    // Full damage 
                    this.takeDamage(5 * deltaTime);
                    this.createDamageParticles('green');
                }
                break;
                
            case 'water':
                this.isUnderwater = true;
                // Check if water is a vulnerability
                if (vulnerabilities.includes('water')) {
                    this.takeDamage(1 * deltaTime * (1 - this.appliedEffects.waterDamageReduction));
                }
                break;
                
            default:
                this.isUnderwater = false;
        }
        
        // Check if at alien nest to restore hunger
        if (centerTile.type === 'alienNest') {
            // Restore hunger more quickly when at nest
            this.hunger = Math.min(this.maxHunger, this.hunger + (10 * deltaTime));
        }
    }
    
    updateFollowers(deltaTime, world) {
        // Skip if no followers or not on the Brood path
        if (this.followers.length === 0 || 
            this.evolutionManager.currentBranch !== EVOLUTION_BRANCHES.BROOD) {
            return;
        }
        
        // Update each follower
        for (let i = 0; i < this.followers.length; i++) {
            const follower = this.followers[i];
            
            // Basic follower behavior - move toward player with delay
            const dx = this.x - follower.x;
            const dy = this.y - follower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only move if not close to the player
            if (distance > TILE_SIZE * 3) {
                const speed = this.currentSpeed * 0.7;
                const vx = (dx / distance) * speed * deltaTime;
                const vy = (dy / distance) * speed * deltaTime;
                
                // Move follower
                follower.x += vx;
                follower.y += vy;
            }
            
            // Followers mine nearby resources automatically
            if (Math.random() < 0.1 && this.evolutionManager.currentEvolution.stage >= 3) {
                this.mineWithFollower(follower, world);
            }
            
            // Animate follower
            follower.frameX = (follower.frameX + 1) % 4;
        }
    }
    
    mineWithFollower(follower, world) {
        // Find a resource nearby the follower
        const searchRadius = TILE_SIZE * 2;
        
        // Check in a small grid around the follower
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                const tileX = follower.x + x * TILE_SIZE;
                const tileY = follower.y + y * TILE_SIZE;
                const tile = world.getTileAt(tileX, tileY);
                
                // If it's a resource the followers can mine, collect it
                if (tile && this.canFollowersMine(tile.type)) {
                    const resource = world.digTileAt(tileX, tileY, this.baseDigPower * 0.5);
                    
                    if (resource && resource.type !== 'inProgress') {
                        // Collect the resource
                        this.collectResource(resource);
                        
                        // Create visual effect
                        this.particles.createParticles(tileX, tileY, 5, '#FFFF00', 0.5);
                        
                        // Only mine one resource at a time
                        return;
                    }
                }
            }
        }
    }
    
    canFollowersMine(tileType) {
        // Followers can only mine basic resources, not special ones
        const basicResources = ['dirt', 'clay', 'stone', 'copperOre', 'ironOre', 'coal'];
        return basicResources.includes(tileType);
    }
    
    checkSpecialEvents(world) {
        // Check for special evolution triggers
        
        // Machine God path - check for driller parts
        if (!this.hasFoundDriller) {
            // Check nearby tiles for the driller part
            const searchRadius = TILE_SIZE * 2;
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            // Search in a small area around the player
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    const tileX = centerX + x * TILE_SIZE;
                    const tileY = centerY + y * TILE_SIZE;
                    const tile = world.getTileAt(tileX, tileY);
                    
                    // Found the special driller part
                    if (tile && tile.type === 'drillerPart') {
                        this.hasFoundDriller = true;
                        // Show notification to player
                        console.log("Found ancient driller technology!");
                        // Enable machine evolution path
                        this.evolutionManager.unlockBranch(EVOLUTION_BRANCHES.MACHINE);
                        
                        // Create special visual effect
                        this.particles.createParticles(tileX, tileY, 20, '#00FFFF', 1.5);
                        
                        // Remove the driller part from the world
                        world.setTileAt(tileX, tileY, 'air');
                        
                        // Play special sound
                        playSound('upgrade', 1.0);
                        break;
                    }
                }
            }
        }
    }
    
    mine(world) {
        // Get evolutionary mining capabilities
        const { digPower, specialMining } = this.evolutionManager.getCurrentCapabilities();
        
        // Calculate actual dig power
        const effectiveDigPower = this.baseDigPower * this.appliedEffects.digPower * digPower;
        
        // Determine target tile based on direction
        let targetX = this.x;
        let targetY = this.y;
        
        switch(this.direction) {
            case 'up': targetY -= TILE_SIZE; break;
            case 'right': targetX += TILE_SIZE; break;
            case 'down': targetY += TILE_SIZE; break;
            case 'left': targetX -= TILE_SIZE; break;
        }
        
        // Get the tile at target position
        const targetTile = world.getTileAt(targetX, targetY);
        
        // If the target is mineable
        if (targetTile && targetTile.type !== 'air' && targetTile.type !== 'boundary') {
            // Check if we can mine this tile with special mining abilities
            let canMine = true;
            
            // Special case: some tiles need special abilities to mine
            if (targetTile.type === 'rock' && !specialMining.includes('rock')) {
                canMine = false;
            } else if (targetTile.type === 'obsidian' && !specialMining.includes('obsidian')) {
                canMine = false;
            } else if (targetTile.type === 'alienRock' && !specialMining.includes('alienRock')) {
                canMine = false;
            }
            
            if (canMine) {
                // Attempt to dig the tile
                const result = world.digTileAt(targetX, targetY, effectiveDigPower);
                
                // Create mining particles
                this.particles.createParticles(
                    targetX + TILE_SIZE/2, 
                    targetY + TILE_SIZE/2, 
                    5, 
                    this.getMiningParticleColor(targetTile.type), 
                    0.5
                );
                
                // Play mining sound
                playSound('dig', 0.3);
                
                // Set a short cooldown between digs
                this.digCooldown = 0.2;
                
                // If we collected something
                if (result && result.type !== 'inProgress') {
                    this.collectResource(result);
                }
                
                // Mining consumes hunger
                this.hunger = Math.max(0, this.hunger - 0.5);
            } else {
                // Can't mine this block - show feedback
                this.particles.createParticles(
                    targetX + TILE_SIZE/2, 
                    targetY + TILE_SIZE/2, 
                    3, 
                    '#FF0000', 
                    0.3
                );
                playSound('hurt', 0.2);
            }
        }
    }
    
    getMiningParticleColor(tileType) {
        // Return appropriate particle color based on tile type
        switch(tileType) {
            case 'dirt': 
            case 'clay': 
                return '#8B4513';
            case 'stone': 
            case 'hardStone': 
            case 'rock': 
                return '#808080';
            case 'darkStone': 
            case 'obsidian': 
                return '#404040';
            case 'copperOre': return '#B87333';
            case 'ironOre': return '#A19D94';
            case 'silverOre': return '#C0C0C0';
            case 'goldOre': return '#FFD700';
            case 'gemOre': return '#4169E1';
            case 'uraniumOre': return '#3CB371';
            case 'alienOre': 
            case 'alienCrystal': 
            case 'alienRock': 
                return '#7CFC00';
            case 'crystal': 
            case 'voidCrystal': 
                return '#9370DB';
            default: return '#FFFFFF';
        }
    }
    
    collectResource(resource) {
        // Add to player's resources
        if (!this.resources[resource.type]) {
            this.resources[resource.type] = 0;
        }
        this.resources[resource.type]++;
        
        // Add money value
        if (resource.value) {
            this.money += resource.value;
        }
        
        // Restore hunger if it's edible
        if (resource.nutritionValue) {
            const nutritionValue = resource.nutritionValue * this.appliedEffects.nutritionBonus;
            this.hunger = Math.min(this.maxHunger, this.hunger + nutritionValue);
        }
        
        // Special case: void crystal needed for machine evolution
        if (resource.type === 'voidCrystal') {
            this.specialGems++;
            
            // If we have enough gems and the driller, enable fusion
            if (this.specialGems >= 3 && this.hasFoundDriller && !this.hasFusedWithDriller) {
                this.hasFusedWithDriller = true;
                this.evolutionManager.triggerSpecialEvolution('fuseDriller');
                
                // Create special effect
                this.particles.createParticles(
                    this.x + this.width/2, 
                    this.y + this.height/2, 
                    50, 
                    '#00FFFF', 
                    2.0
                );
                
                // Play special sound
                playSound('upgrade', 1.0);
            }
        }
        
        // Play collection sound
        playSound('collect', 0.5);
    }
    
    takeDamage(amount) {
        // Apply damage reduction from upgrades and evolution
        const damageReduction = this.appliedEffects.damageReduction;
        amount *= (1 - damageReduction);
        
        this.health = Math.max(0, this.health - amount);
        
        // Visual damage effect
        this.damageFlashTime = 0.2;
        
        if (this.health <= 0) {
            this.die();
        } else if (amount > 1) {
            // Only play hurt sound for significant damage
            playSound('hurt', 0.4);
        }
    }
    
    createDamageParticles(color) {
        // Only create particles occasionally to avoid too many particles
        if (Math.random() < 0.2) {
            this.particles.createParticles(
                this.x + this.width/2, 
                this.y + this.height/2, 
                3, 
                color, 
                0.3
            );
        }
    }
    
    die() {
        // Handle player death
        console.log("Player has died!");
        // Show game over information
        // Will be handled by the game state system
    }
    
    applyUpgrade(upgrade) {
        // Add upgrade to list
        this.upgrades.push(upgrade.id);
        
        // Apply upgrade effects
        if (upgrade.effect) {
            for (const [stat, value] of Object.entries(upgrade.effect)) {
                // Different stats are applied differently
                if (stat === 'digPower' || stat === 'speedBonus') {
                    this.appliedEffects[stat] *= value;
                } else if (stat.includes('DamageReduction')) {
                    this.appliedEffects[stat] += value;
                } else if (stat === 'maxHungerBonus') {
                    this.appliedEffects.maxHungerBonus += value;
                    this.maxHunger = 100 * (1 + this.appliedEffects.maxHungerBonus);
                } else if (stat === 'hungerRateReduction') {
                    this.appliedEffects.hungerRateReduction -= value;
                } else if (stat === 'nutritionBonus') {
                    this.appliedEffects.nutritionBonus += value;
                }
            }
        }
        
        // Play upgrade sound
        playSound('upgrade', 0.7);
    }
    
    evolve(evolutionType) {
        // Apply evolution using the evolution manager
        const success = this.evolutionManager.evolve(evolutionType);
        
        if (success) {
            // Apply evolution effects
            this.updateAppearance();
            
            // Special visual effects for evolution
            this.particles.createParticles(
                this.x + this.width/2, 
                this.y + this.height/2, 
                30, 
                '#FFFFFF', 
                1.5
            );
            
            // Play evolution sound
            playSound('upgrade', 1.0);
            
            return true;
        }
        
        return false;
    }
    
    updateAppearance() {
        // Update player appearance based on current evolution
        const evo = this.evolutionManager.currentEvolution;
        
        // Update size based on evolution
        if (evo.type !== 'larva') {
            // Size increases with evolution stage
            const stage = evo.stage || 1;
            
            if (stage >= 3) {
                this.width = TILE_SIZE * 1.3;
                this.height = TILE_SIZE * 1.3;
                this.collisionWidth = this.width - 4;
                this.collisionHeight = this.height - 4;
            }
            
            if (stage >= 4) {
                this.width = TILE_SIZE * 1.5;
                this.height = TILE_SIZE * 1.5;
                this.collisionWidth = this.width - 6;
                this.collisionHeight = this.height - 6;
            }
            
            if (stage >= 5) {
                this.width = TILE_SIZE * 2;
                this.height = TILE_SIZE * 2;
                this.collisionWidth = this.width - 8;
                this.collisionHeight = this.height - 8;
            }
        }
        
        // Update followers for Brood path
        if (this.evolutionManager.currentBranch === EVOLUTION_BRANCHES.BROOD) {
            const stage = evo.stage || 1;
            // Increase follower limit based on stage
            this.maxFollowers = stage * 3;
            
            // Add new followers up to the max
            while (this.followers.length < this.maxFollowers) {
                this.addFollower();
            }
        }
    }
    
    addFollower() {
        // Create a new follower that follows the player
        const offsetX = (Math.random() - 0.5) * TILE_SIZE * 5;
        const offsetY = (Math.random() - 0.5) * TILE_SIZE * 5;
        
        const follower = {
            x: this.x + offsetX,
            y: this.y + offsetY,
            frameX: Math.floor(Math.random() * 4),
            frameY: Math.floor(Math.random() * 4),
            size: TILE_SIZE * 0.7
        };
        
        this.followers.push(follower);
    }
    
    render(ctx) {
        // Skip if not visible
        if (!ctx) return;
        
        // Draw followers first (behind player)
        this.renderFollowers(ctx);
        
        // Draw particles 
        this.particles.render(ctx);
        
        // Get the appropriate sprite based on evolution
        const playerImage = assets.images['player'] || window.gameAssets?.images?.player;
        if (!playerImage) return;
        
        // Draw the player with damage flash effect if active
        if (this.damageFlashTime > 0) {
            ctx.globalAlpha = 0.7;
        }
        
        // Calculate sprite position based on evolution
        const evolutionRow = this.getEvolutionSpriteRow();
        const directionRow = this.sprite.frameY;
        
        // Calculate the sprite sheet coordinates
        const spriteX = this.sprite.frameX * TILE_SIZE;
        const spriteY = (evolutionRow * 4 + directionRow) * TILE_SIZE; // 4 directions per evolution
        
        // Draw the player sprite
        ctx.drawImage(
            playerImage,
            spriteX, spriteY, TILE_SIZE, TILE_SIZE,
            this.x - (this.width - TILE_SIZE)/2, // Center larger sprites
            this.y - (this.height - TILE_SIZE)/2,
            this.width, this.height
        );
        
        // Reset alpha if it was changed
        ctx.globalAlpha = 1.0;
        
        // Debug: draw collision box
        if (window.DEBUG_MODE) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(
                this.x + this.collisionOffsetX,
                this.y + this.collisionOffsetY,
                this.collisionWidth,
                this.collisionHeight
            );
        }
    }
    
    renderFollowers(ctx) {
        // Skip if no followers
        if (this.followers.length === 0) return;
        
        const playerImage = assets.images['player'] || window.gameAssets?.images?.player;
        if (!playerImage) return;
        
        // Calculate which row in sprite sheet to use for followers
        const followerRow = 0; // Default larva row
        
        // Draw each follower
        for (const follower of this.followers) {
            ctx.drawImage(
                playerImage,
                follower.frameX * TILE_SIZE, 
                (followerRow * 4 + follower.frameY) * TILE_SIZE,
                TILE_SIZE, TILE_SIZE,
                follower.x - follower.size/2,
                follower.y - follower.size/2,
                follower.size, follower.size
            );
        }
    }
    
    getEvolutionSpriteRow() {
        // Return the appropriate sprite row for the current evolution
        const evo = this.evolutionManager.currentEvolution;
        
        switch(evo.type) {
            case 'larva': return 0;
            
            // Worm path
            case 'worm': return 1;
            case 'giantWorm': return 2;
            case 'behemothWorm': return 3;
            case 'elderWorm': return 4;
            case 'wormGod': return 5;
            
            // Machine path
            case 'drillerFused': return 6;
            case 'mechAlien': return 7;
            case 'harvestMech': return 8;
            case 'worldEater': return 9;
            case 'machineGod': return 10;
            
            // Brood path
            case 'broodMother': return 11;
            case 'hiveMind': return 12;
            case 'swarmQueen': return 13;
            case 'broodEmpress': return 14;
            case 'broodQueen': return 15;
            
            default: return 0;
        }
    }
}