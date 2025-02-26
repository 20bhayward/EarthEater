// Game dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;
export const WORLD_WIDTH = 1024; // 32 tiles across (1024px at 32px tiles)
export const WORLD_HEIGHT = 2048; // 64 tiles high (2048px at 32px tiles)

// Game states
export const GAME_STATE = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    EVOLUTION: 'evolution',
    UPGRADE: 'upgrade',
    GAME_OVER: 'gameOver'
};

// Player constants
export const PLAYER_SPEED = 200;
export const PLAYER_DIG_SPEED = 2; // Blocks per second
export const PLAYER_FALL_SPEED = 300;
export const PLAYER_JUMP_FORCE = 400;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_MAX_HUNGER = 100;
export const PLAYER_MAX_OXYGEN = 100;
export const HUNGER_DEPLETION_RATE = 0.5; // Per second
export const OXYGEN_DEPLETION_RATE = 1; // Per second

// Resource values
export const RESOURCE_VALUES = {
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

// Terrain generation constants
export const TERRAIN_SEED = Math.floor(Math.random() * 10000);
export const TERRAIN_SCALE = 50;
export const TERRAIN_OCTAVES = 4;
export const TERRAIN_PERSISTENCE = 0.5;
export const TERRAIN_LACUNARITY = 2.0;

// Evolution costs
export const EVOLUTION_COSTS = {
    // Worm Path
    'basicWorm': 0,
    'burrower': 100,
    'tunneler': 250,
    'earthWorm': 500,
    'rockEater': 1000,
    'wormGod': 2000,
    
    // Brood Path
    'broodling': 150,
    'swarmHost': 300,
    'hiveMind': 600,
    'broodQueen': 1500,
    
    // Machine Path
    'driller': 200,
    'excavator': 400,
    'miningMech': 800,
    'terraformer': 1200,
    'machineGod': 2500
};

// Evolution requirements (special items needed)
export const EVOLUTION_REQUIREMENTS = {
    'driller': 'drillerPart',
    'broodling': 'alienEgg',
    'rockEater': 'crystalFormation'
};

// Tile difficulty/durability (higher = harder to mine)
export const TILE_DURABILITY = {
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