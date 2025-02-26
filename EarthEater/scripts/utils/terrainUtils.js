import { TILE_SIZE } from './constants.js';

// Tileset mapping - coordinates in the spritesheet
const TILE_MAPPING = {
    // Basic terrain
    'air': { x: 0, y: 0, solid: false, isDamaging: false, isOre: false },
    'dirt': { x: 0, y: 0, solid: true, isDamaging: false, isOre: false },
    'stone': { x: TILE_SIZE, y: 0, solid: true, isDamaging: false, isOre: false },
    'hardStone': { x: TILE_SIZE * 2, y: 0, solid: true, isDamaging: false, isOre: false },
    'darkStone': { x: TILE_SIZE * 3, y: 0, solid: true, isDamaging: false, isOre: false },
    
    // Common ores
    'coal': { x: 0, y: TILE_SIZE, solid: true, isDamaging: false, isOre: true },
    'copperOre': { x: TILE_SIZE, y: TILE_SIZE, solid: true, isDamaging: false, isOre: true },
    'ironOre': { x: TILE_SIZE * 2, y: TILE_SIZE, solid: true, isDamaging: false, isOre: true },
    'silverOre': { x: TILE_SIZE * 3, y: TILE_SIZE, solid: true, isDamaging: false, isOre: true },
    
    // Valuable ores
    'goldOre': { x: 0, y: TILE_SIZE * 2, solid: true, isDamaging: false, isOre: true },
    'gemOre': { x: TILE_SIZE, y: TILE_SIZE * 2, solid: true, isDamaging: false, isOre: true },
    'uraniumOre': { x: TILE_SIZE * 2, y: TILE_SIZE * 2, solid: true, isDamaging: false, isOre: true },
    'alienOre': { x: TILE_SIZE * 3, y: TILE_SIZE * 2, solid: true, isDamaging: false, isOre: true },
    
    // Special materials
    'crystal': { x: 0, y: TILE_SIZE * 3, solid: true, isDamaging: false, isOre: true },
    'voidCrystal': { x: TILE_SIZE, y: TILE_SIZE * 3, solid: true, isDamaging: false, isOre: true },
    'alienCrystal': { x: TILE_SIZE * 2, y: TILE_SIZE * 3, solid: true, isDamaging: false, isOre: true },
    'obsidian': { x: TILE_SIZE * 3, y: TILE_SIZE * 3, solid: true, isDamaging: false, isOre: false },
    
    // Obstacles and hazards
    'rock': { x: 0, y: TILE_SIZE * 4, solid: true, isDamaging: false, isOre: false, isObstacle: true },
    'lava': { x: TILE_SIZE, y: TILE_SIZE * 4, solid: false, isDamaging: true, isOre: false, isObstacle: true },
    'gas': { x: TILE_SIZE * 2, y: TILE_SIZE * 4, solid: false, isDamaging: true, isOre: false, isObstacle: true },
    'water': { x: TILE_SIZE * 3, y: TILE_SIZE * 4, solid: false, isDamaging: false, isOre: false, isObstacle: false },
    
    // Alien structures
    'alienRock': { x: 0, y: TILE_SIZE * 5, solid: true, isDamaging: false, isOre: false },
    'alienNest': { x: TILE_SIZE, y: TILE_SIZE * 5, solid: false, isDamaging: false, isOre: false },
    'alienArtifact': { x: TILE_SIZE * 2, y: TILE_SIZE * 5, solid: false, isDamaging: false, isOre: true },
    'clay': { x: TILE_SIZE * 3, y: TILE_SIZE * 5, solid: true, isDamaging: false, isOre: false },
    
    // Special objects and evolution items
    'drillerPart': { x: 0, y: TILE_SIZE * 6, solid: false, isDamaging: false, isOre: false, isSpecial: true },
    'alienEgg': { x: TILE_SIZE, y: TILE_SIZE * 6, solid: false, isDamaging: false, isOre: false, isSpecial: true },
    'crystalFormation': { x: TILE_SIZE * 2, y: TILE_SIZE * 6, solid: false, isDamaging: false, isOre: false, isSpecial: true },
    
    // Special
    'boundary': { x: TILE_SIZE * 3, y: TILE_SIZE * 6, solid: true, isDamaging: false, isOre: false }
};

// Get tile information
export function getTileType(type) {
    return TILE_MAPPING[type] || TILE_MAPPING['air'];
}

// Check if a tile is solid (blocks movement)
export function isSolid(type) {
    const tile = TILE_MAPPING[type];
    return tile ? tile.solid : false;
}

// Check if tile is an ore/resource
export function isOre(type) {
    const tile = TILE_MAPPING[type];
    return tile ? tile.isOre : false;
}

// Check if tile is a damaging obstacle
export function isDamaging(type) {
    const tile = TILE_MAPPING[type];
    return tile ? tile.isDamaging : false;
}

// Check if tile is an obstacle
export function isObstacle(type) {
    const tile = TILE_MAPPING[type];
    return tile ? tile.isObstacle : false;
}

// Check if tile is a special object
export function isSpecial(type) {
    const tile = TILE_MAPPING[type];
    return tile ? tile.isSpecial : false;
}

// Group tiles by category for easier access
export const TERRAIN_CATEGORIES = {
    BASIC_TERRAIN: ['air', 'dirt', 'stone', 'hardStone', 'darkStone', 'clay'],
    COMMON_ORES: ['coal', 'copperOre', 'ironOre', 'silverOre'],
    VALUABLE_ORES: ['goldOre', 'gemOre', 'uraniumOre', 'alienOre'],
    SPECIAL_MATERIALS: ['crystal', 'voidCrystal', 'alienCrystal', 'obsidian'],
    OBSTACLES: ['rock', 'lava', 'gas', 'water'],
    ALIEN: ['alienRock', 'alienNest', 'alienArtifact'],
    SPECIAL_OBJECTS: ['drillerPart', 'alienEgg', 'crystalFormation']
};

// Simplified Perlin noise for terrain generation
export function generateNoise(width, height, scale, octaves, persistence, lacunarity, seed) {
    // This is a simple implementation - for a real game, consider using a library like simplex-noise
    
    // Seed the random number generator
    const seedRandom = function(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    };
    
    const rand = seedRandom(seed);
    
    // Generate a grid of random values for our "noise"
    const generateNoiseGrid = function(width, height, frequency) {
        const grid = new Array(height);
        for (let y = 0; y < height; y++) {
            grid[y] = new Array(width);
            for (let x = 0; x < width; x++) {
                // Use random values as our simple "noise"
                grid[y][x] = rand();
            }
        }
        return grid;
    };
    
    // Sample the grid using bilinear interpolation
    const sampleGrid = function(grid, x, y, width, height) {
        // Calculate grid coordinates
        const x0 = Math.floor(x) % width;
        const y0 = Math.floor(y) % height;
        const x1 = (x0 + 1) % width;
        const y1 = (y0 + 1) % height;
        
        // Calculate interpolation weights
        const sx = x - Math.floor(x);
        const sy = y - Math.floor(y);
        
        // Interpolate between grid point values
        const n0 = grid[y0][x0];
        const n1 = grid[y0][x1];
        const n2 = grid[y1][x0];
        const n3 = grid[y1][x1];
        
        const ix0 = lerp(n0, n1, sx);
        const ix1 = lerp(n2, n3, sx);
        
        return lerp(ix0, ix1, sy);
    };
    
    // Linear interpolation
    const lerp = function(a, b, t) {
        return a * (1 - t) + b * t;
    };
    
    // Generate noise grids for each octave
    const grids = [];
    for (let i = 0; i < octaves; i++) {
        grids.push(generateNoiseGrid(width, height, 1));
    }
    
    // Generate the final noise values
    const noiseValues = new Array(height);
    for (let y = 0; y < height; y++) {
        noiseValues[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            let amplitude = 1;
            let frequency = 1;
            let noiseValue = 0;
            let maxValue = 0;
            
            // Accumulate noise from each octave
            for (let i = 0; i < octaves; i++) {
                const sampleX = (x / scale) * frequency;
                const sampleY = (y / scale) * frequency;
                
                noiseValue += sampleGrid(grids[i], sampleX, sampleY, width, height) * amplitude;
                maxValue += amplitude;
                
                amplitude *= persistence;
                frequency *= lacunarity;
            }
            
            // Normalize the result
            noiseValues[y][x] = noiseValue / maxValue;
        }
    }
    
    return noiseValues;
}