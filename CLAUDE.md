# CLAUDE.md - Project Information and Commands

This file contains essential information about the EarthEater project to assist Claude in providing consistent and helpful responses.

## Project Overview

EarthEater is a browser-based game where players control an alien creature that burrows through the earth, collects resources, and evolves through different stages. The game features three distinct evolution paths, procedurally generated terrain, and resource management.

## Common Commands

### Local Development

Run a local web server to test the game:
```bash
cd EarthEater
python -m http.server
```

This will serve the game at http://localhost:8000

### File Structure Organization

- `EarthEater/index.html` - Main HTML file
- `EarthEater/scripts/` - Contains all JavaScript code
  - `engine/` - Core game systems
    - `Game.js` - Main game loop and state management
    - `AssetLoader.js` - Asset loading and management
    - `InputManager.js` - Keyboard, mouse, and touch controls
    - `SoundManager.js` - Audio system
    - `ParticleSystem.js` - Visual effects
    - `UIManager.js` - User interface and menus
    - `World.js` - Procedural world generation
    - `Camera.js` - Camera and view management
  - `entities/` - Game objects
    - `Player.js` - Main player character
    - `EvolutionManager.js` - Evolution system and paths
  - `utils/` - Helper functions and constants
    - `constants.js` - Game constants and configuration
    - `terrainUtils.js` - Terrain generation utilities
    - `LibraryLoader.js` - External library management
    - `PlaceholderAssets.js` - Generated placeholder assets
- `EarthEater/styles/` - CSS files
  - `main.css` - Main game styles
- `EarthEater/assets/` - Game assets
  - `images/` - Image assets
  - `audio/` - Sound effects and music

## Code Style Preferences

- Use ES6 module syntax (`import`/`export`)
- 4-space indentation
- Camel case for variables and functions (`playerHealth`, `moveAlien`)
- PascalCase for classes (`Player`, `World`)
- Single quotes for strings
- JSDoc comments for public functions
- Use `const` and `let` instead of `var`
- Use arrow functions for callbacks

## Project-Specific Notes

### Evolution System

The game has three main evolution paths:
1. Worm Path (digger) - 6 stages ending with "Worm God"
2. Brood Path (swarm) - 5 stages ending with "Brood Queen"
3. Machine Path (tech) - 5 stages ending with "Machine God"

Each path has unique abilities, strengths, and weaknesses.

### Game Mechanics

- Hunger decreases over time and must be replenished
- Resources have both monetary value and nutrition value
- Deeper areas contain more valuable resources
- Different terrain types have varying durability
- Environmental hazards (lava, gas, water) affect the player differently based on evolution
- Special locations include caves, underground lakes, alien nests, and magma chambers
- The Machine Path requires finding a special driller part hidden in the world

### Libraries Used

- Howler.js for audio (loaded from CDN)
- TWEEN.js for animations (loaded from CDN)
- Built-in HTML5 Canvas for rendering
- Built-in Web Audio API as a fallback when Howler.js is not available

## Asset Generation

The game uses procedurally generated placeholder assets with the following structure:

- Tiles: 32×32 pixel tiles in a spritesheet (4 columns × 8 rows)
  - Row 1: Basic terrain (dirt, stone, hard stone, dark stone)
  - Row 2: Common ores (coal, copper, iron, silver)
  - Row 3: Valuable ores (gold, gem, uranium, alien)
  - Row 4: Special materials (crystal, void crystal, alien crystal, obsidian)
  - Row 5: Obstacles (rock, lava, gas, water)
  - Row 6: Alien structures (alien rock, alien nest, alien artifact, clay)
  - Row 7: Special objects (driller part, alien egg, crystal formation, boundary)

- Player: 32×32 pixel frames in multiple rows
  - 4 frames per animation
  - 4 rows per evolution type (up, right, down, left)
  - 16 evolution types total (1 base form + 15 evolutions)

## Planned Features

Current development priorities:
- Add more visual feedback for player actions
- Implement saves/persistence
- Add more diverse terrain features
- Balance resource distribution and evolution costs
- Add sounds for all actions and events

## Known Issues

- Players might not discover the Machine path if they don't find the hidden driller part
- Touch controls need sensitivity adjustment
- Performance can decrease after extended playtime due to particle accumulation