import { 
    TILE_SIZE, 
    WORLD_WIDTH, 
    WORLD_HEIGHT,
    TERRAIN_SEED,
    TERRAIN_SCALE,
    TERRAIN_OCTAVES,
    TERRAIN_PERSISTENCE,
    TERRAIN_LACUNARITY
} from '../utils/constants.js';
import { 
    getTileType, 
    generateNoise, 
    TERRAIN_CATEGORIES,
    isOre
} from '../utils/terrainUtils.js';

export default class World {
    constructor() {
        // Initialize the world grid
        this.width = WORLD_WIDTH / TILE_SIZE;
        this.height = WORLD_HEIGHT / TILE_SIZE;
        this.grid = [];
        
        // Generate the terrain
        this.generateTerrain();
        
        // Initialize update counters
        this.updateCounter = 0;
        this.updateFrequency = 10; // Update the world (like fluid simulation) every 10 frames
        
        console.log('World initialized with dimensions:', this.width, 'x', this.height);
    }
    
    generateTerrain() {
        console.log('Generating terrain...');
        
        // Initialize the grid with empty cells
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 'air';
            }
        }
        
        // Generate terrain in chunks for better performance
        const chunkSize = 16; // 16x16 tile chunks
        const chunksX = Math.ceil(this.width / chunkSize);
        const chunksY = Math.ceil(this.height / chunkSize);
        
        console.log(`Generating world in ${chunksX}x${chunksY} chunks...`);
        
        // Pre-compute all noise maps at once
        console.log('Computing noise maps...');
        const terrainNoise = generateNoise(
            this.width, 
            this.height, 
            TERRAIN_SCALE, 
            TERRAIN_OCTAVES, 
            TERRAIN_PERSISTENCE, 
            TERRAIN_LACUNARITY, 
            TERRAIN_SEED
        );
        
        const caveNoise = generateNoise(
            this.width, 
            this.height, 
            TERRAIN_SCALE / 2, 
            TERRAIN_OCTAVES, 
            TERRAIN_PERSISTENCE, 
            TERRAIN_LACUNARITY, 
            TERRAIN_SEED + 1000
        );
        
        const oreNoise = generateNoise(
            this.width, 
            this.height, 
            TERRAIN_SCALE / 4, 
            TERRAIN_OCTAVES, 
            TERRAIN_PERSISTENCE, 
            TERRAIN_LACUNARITY, 
            TERRAIN_SEED + 2000
        );
        
        const specialNoise = generateNoise(
            this.width, 
            this.height, 
            TERRAIN_SCALE / 3, 
            TERRAIN_OCTAVES, 
            TERRAIN_PERSISTENCE, 
            TERRAIN_LACUNARITY, 
            TERRAIN_SEED + 3000
        );
        
        // Generate terrain chunk by chunk
        console.log('Building terrain chunks...');
        for (let chunkY = 0; chunkY < chunksY; chunkY++) {
            for (let chunkX = 0; chunkX < chunksX; chunkX++) {
                this.generateChunk(
                    chunkX, chunkY, 
                    chunkSize, 
                    terrainNoise, 
                    caveNoise, 
                    oreNoise, 
                    specialNoise
                );
            }
        }
        
        // Add boundary walls on the edges to prevent going out of bounds
        for (let y = 0; y < this.height; y++) {
            this.grid[y][0] = 'boundary';
            this.grid[y][this.width - 1] = 'boundary';
        }
        
        for (let x = 0; x < this.width; x++) {
            this.grid[this.height - 1][x] = 'boundary';
        }
        
        console.log('Terrain generation complete');
    }
    
    // Generate a single chunk of terrain
    generateChunk(chunkX, chunkY, chunkSize, terrainNoise, caveNoise, oreNoise, specialNoise) {
        const startX = chunkX * chunkSize;
        const startY = chunkY * chunkSize;
        const endX = Math.min(startX + chunkSize, this.width);
        const endY = Math.min(startY + chunkSize, this.height);
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Surface level - always air in the first few rows
                if (y < 3) {
                    this.grid[y][x] = 'air';
                    continue;
                }
                
                // Surface dirt (first 5 layers after the air)
                if (y < 8) {
                    this.grid[y][x] = 'dirt';
                    continue;
                }
                
                // Beyond this point, use noise to determine terrain
                
                // Base noise value determines if this is solid or a cave
                const baseNoiseValue = terrainNoise[y][x];
                const caveNoiseValue = caveNoise[y][x];
                const oreNoiseValue = oreNoise[y][x];
                const specialNoiseValue = specialNoise[y][x];
                
                // Cave generation - if cave noise is high, make an air pocket
                if (caveNoiseValue > 0.7 && y > 15) {
                    this.grid[y][x] = 'air';
                    continue;
                }
                
                // Default to basic terrain - change with depth
                let terrainType = 'dirt';
                
                // Determine terrain type based on depth
                if (y > 50) {
                    terrainType = 'darkStone';
                } else if (y > 30) {
                    terrainType = 'hardStone';
                } else if (y > 15) {
                    terrainType = 'stone';
                }
                
                // Generate ores based on depth and noise
                if (oreNoiseValue > 0.8) {
                    // Distribution changes with depth
                    if (y > 45 && oreNoiseValue > 0.92) {
                        // Deep valuable ores
                        const roll = Math.random();
                        if (roll < 0.3) {
                            terrainType = 'uraniumOre';
                        } else if (roll < 0.6) {
                            terrainType = 'alienOre';
                        } else {
                            terrainType = 'gemOre';
                        }
                    } else if (y > 25 && oreNoiseValue > 0.85) {
                        // Medium depth ores
                        const roll = Math.random();
                        if (roll < 0.4) {
                            terrainType = 'ironOre';
                        } else if (roll < 0.7) {
                            terrainType = 'silverOre';
                        } else {
                            terrainType = 'goldOre';
                        }
                    } else if (y > 10 && oreNoiseValue > 0.8) {
                        // Common ores near surface
                        const roll = Math.random();
                        if (roll < 0.6) {
                            terrainType = 'coal';
                        } else {
                            terrainType = 'copperOre';
                        }
                    }
                }
                
                // Generate special features (rare)
                if (specialNoiseValue > 0.93 && y > 20) {
                    // Obstacles and hazards
                    if (specialNoiseValue > 0.97) {
                        const roll = Math.random();
                        if (roll < 0.3 && y > 35) {
                            terrainType = 'lava';
                        } else if (roll < 0.6 && y > 15) {
                            terrainType = 'gas';
                        } else if (roll < 0.9 && y > 25) {
                            terrainType = 'water';
                        } else {
                            terrainType = 'rock';
                        }
                    } 
                    // Special crystals and alien structures (very rare)
                    else if (specialNoiseValue > 0.95 && y > 30) {
                        const roll = Math.random();
                        if (roll < 0.3 && y > 40) {
                            terrainType = 'alienRock';
                        } else if (roll < 0.5 && y > 35) {
                            terrainType = 'alienNest';
                        } else if (roll < 0.7 && y > 30) {
                            terrainType = 'crystal';
                        } else if (roll < 0.9 && y > 45) {
                            terrainType = 'voidCrystal';
                        } else if (y > 50) {
                            terrainType = 'alienCrystal';
                        }
                    }
                }
                
                // Set the terrain type
                this.grid[y][x] = terrainType;
            }
        }
    }
    
    getTileAt(x, y) {
        // Convert world coordinates to grid coordinates
        const gridX = Math.floor(x / TILE_SIZE);
        const gridY = Math.floor(y / TILE_SIZE);
        
        // Check if coordinates are within bounds
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return 'boundary'; // Out of bounds is treated as a solid boundary
        }
        
        // Make sure the grid exists at these coordinates
        if (!this.grid[gridY] || this.grid[gridY][gridX] === undefined) {
            console.warn(`Tried to access an undefined tile at ${gridX}, ${gridY}`);
            return 'boundary';
        }
        
        return this.grid[gridY][gridX];
    }
    
    // Function to dig a tile and collect resources
    digTileAt(x, y, digPower) {
        // Convert world coordinates to grid coordinates
        const gridX = Math.floor(x / TILE_SIZE);
        const gridY = Math.floor(y / TILE_SIZE);
        
        // Check if coordinates are within bounds
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return null; // Can't dig outside the world
        }
        
        // Get the current tile type
        const tileType = this.grid[gridY][gridX];
        
        // Check if the tile is diggable
        if (tileType === 'air' || tileType === 'boundary') {
            return null; // Can't dig air or boundary
        }
        
        // Get tile durability
        const durability = this.getTileDurability(tileType);
        
        // Check if the dig power is sufficient
        if (digPower >= durability) {
            // Successfully dug the tile
            this.grid[gridY][gridX] = 'air';
            
            // Return the collected resource
            return {
                type: tileType,
                value: this.getResourceValue(tileType),
                nutritionValue: this.getNutritionValue(tileType)
            };
        } else {
            // Not enough power to dig in one go
            return { type: 'inProgress' };
        }
    }
    
    // Get the durability of a tile type
    getTileDurability(tileType) {
        const durabilityMap = {
            'dirt': 1,
            'stone': 2,
            'hardStone': 3,
            'darkStone': 4,
            'coal': 1.5,
            'copperOre': 2,
            'ironOre': 2.5,
            'silverOre': 3,
            'goldOre': 3,
            'gemOre': 3.5,
            'uraniumOre': 4,
            'alienOre': 4.5,
            'crystal': 3,
            'voidCrystal': 4,
            'alienCrystal': 5,
            'obsidian': 6,
            'rock': 2,
            'alienRock': 3,
            'clay': 1.5
        };
        
        return durabilityMap[tileType] || 1;
    }
    
    // Get the resource value of a tile type
    getResourceValue(tileType) {
        const valueMap = {
            'coal': 5,
            'copperOre': 10,
            'ironOre': 15,
            'silverOre': 25,
            'goldOre': 50,
            'gemOre': 75,
            'uraniumOre': 100,
            'alienOre': 150,
            'crystal': 40,
            'voidCrystal': 120,
            'alienCrystal': 200,
            'alienArtifact': 300
        };
        
        return valueMap[tileType] || 1;
    }
    
    // Get the nutrition value of a tile type
    getNutritionValue(tileType) {
        const nutritionMap = {
            'dirt': 1,
            'clay': 0.5,
            'coal': 2,
            'copperOre': 3,
            'ironOre': 4,
            'silverOre': 5,
            'goldOre': 7,
            'gemOre': 8,
            'uraniumOre': 10,
            'alienOre': 15,
            'crystal': 8,
            'voidCrystal': 12,
            'alienCrystal': 20
        };
        
        return nutritionMap[tileType] || 0;
    }
    
    setTileAt(x, y, tileType) {
        // Convert world coordinates to grid coordinates
        const gridX = Math.floor(x / TILE_SIZE);
        const gridY = Math.floor(y / TILE_SIZE);
        
        // Check if coordinates are within bounds
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return false; // Can't set tiles out of bounds
        }
        
        // Set the tile
        this.grid[gridY][gridX] = tileType;
        return true;
    }
    
    // Check if a point is within a solid tile
    isSolidAt(x, y) {
        const tileType = this.getTileAt(x, y);
        const tileInfo = getTileType(tileType);
        return tileInfo.solid;
    }
    
    // Check if a point is within an ore tile
    isOreAt(x, y) {
        const tileType = this.getTileAt(x, y);
        return isOre(tileType);
    }
    
    // Update function - for things like fluid simulation, mob spawning, etc.
    update(deltaTime, player) {
        // Only update every few frames for performance
        this.updateCounter += 1;
        if (this.updateCounter < this.updateFrequency) {
            return;
        }
        this.updateCounter = 0;
        
        // Get the player's current grid position
        const playerGridX = Math.floor(player.x / TILE_SIZE);
        const playerGridY = Math.floor(player.y / TILE_SIZE);
        
        // Only update a region around the player
        const updateRadius = 20; // Tiles
        
        // Simple water/lava/gas flow simulation
        for (let y = Math.max(0, playerGridY - updateRadius); y < Math.min(this.height, playerGridY + updateRadius); y++) {
            for (let x = Math.max(0, playerGridX - updateRadius); x < Math.min(this.width, playerGridX + updateRadius); x++) {
                const tileType = this.grid[y][x];
                
                // Handle fluid flow (water, lava, gas)
                if (tileType === 'water' || tileType === 'lava' || tileType === 'gas') {
                    // For simplicity, only handle downward flow for now
                    if (y < this.height - 1 && this.grid[y + 1][x] === 'air') {
                        // Fluid flows down
                        this.grid[y][x] = 'air';
                        this.grid[y + 1][x] = tileType;
                    }
                    // Try to flow sideways if blocked below
                    else if (y < this.height - 1 && (this.grid[y + 1][x] !== 'air' && this.grid[y + 1][x] !== tileType)) {
                        // Try to flow left or right (randomly choose)
                        const flowLeft = Math.random() < 0.5;
                        
                        if (flowLeft && x > 0 && this.grid[y][x - 1] === 'air') {
                            this.grid[y][x] = 'air';
                            this.grid[y][x - 1] = tileType;
                        } else if (!flowLeft && x < this.width - 1 && this.grid[y][x + 1] === 'air') {
                            this.grid[y][x] = 'air';
                            this.grid[y][x + 1] = tileType;
                        }
                    }
                }
                
                // Gas rises
                if (tileType === 'gas') {
                    if (y > 0 && this.grid[y - 1][x] === 'air') {
                        // Gas flows up
                        this.grid[y][x] = 'air';
                        this.grid[y - 1][x] = tileType;
                    }
                }
            }
        }
    }
    
    // Render the world
    render(ctx, camera) {
        // Get the visible area based on the camera position
        const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - Math.ceil(camera.width / TILE_SIZE / 2));
        const endX = Math.min(this.width, startX + Math.ceil(camera.width / TILE_SIZE) + 2);
        
        const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - Math.ceil(camera.height / TILE_SIZE / 2));
        const endY = Math.min(this.height, startY + Math.ceil(camera.height / TILE_SIZE) + 2);
        
        // Render only the visible tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tileType = this.grid[y][x];
                
                // Skip rendering air tiles
                if (tileType === 'air') continue;
                
                // Get the tile's source position in the spritesheet
                const tile = getTileType(tileType);
                
                // Draw the tile
                ctx.fillStyle = this.getTileColor(tileType);
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                // Add a slight border to make tiles more visible
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    // Helper method to get a color for each tile type (for development/testing)
    getTileColor(tileType) {
        switch (tileType) {
            case 'dirt': return '#8B4513'; 
            case 'stone': return '#808080'; 
            case 'hardStone': return '#696969'; 
            case 'darkStone': return '#464646'; 
            case 'coal': return '#333333'; 
            case 'copperOre': return '#B87333'; 
            case 'ironOre': return '#A19D94'; 
            case 'silverOre': return '#C0C0C0'; 
            case 'goldOre': return '#FFD700'; 
            case 'gemOre': return '#9370DB'; 
            case 'uraniumOre': return '#4BC076'; 
            case 'alienOre': return '#DA70D6'; 
            case 'crystal': return '#87CEEB'; 
            case 'voidCrystal': return '#483D8B'; 
            case 'alienCrystal': return '#FF1493'; 
            case 'obsidian': return '#000000'; 
            case 'rock': return '#A0522D'; 
            case 'lava': return '#FF4500'; 
            case 'gas': return '#ADFF2F'; 
            case 'water': return '#1E90FF'; 
            case 'alienRock': return '#8A2BE2'; 
            case 'alienNest': return '#FF69B4'; 
            case 'alienArtifact': return '#00FFFF'; 
            case 'clay': return '#A52A2A'; 
            case 'drillerPart': return '#DAA520'; 
            case 'alienEgg': return '#FF00FF'; 
            case 'crystalFormation': return '#40E0D0'; 
            case 'boundary': return '#000000'; 
            default: return '#FFFFFF'; 
        }
    }
}