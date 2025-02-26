# EarthEater

EarthEater is an engaging browser-based game where you play as an alien creature that burrows through the earth, collecting resources, evolving, and uncovering secrets.

## Game Concept

You control an alien organism with the ability to consume earth and minerals. Your mission is to dig deeper, collect valuable resources, evolve your alien form, and discover the mysteries hidden beneath the surface. But beware - you must manage your hunger and return to your nest before starving!

## Key Features

### Three Distinct Evolution Paths

EarthEater features three unique evolution branches, each with their own playstyle:

1. **Worm God Path (6 stages)**
   - Specializes in efficient digging and burrowing
   - Evolves into larger, more powerful forms
   - Eventually becomes immune to environmental hazards
   - Final form: The Worm God, a massive entity that can devour almost any terrain

2. **Brood Queen Path (5 stages)**
   - Commands worker drones that assist in mining
   - Number of followers increases with evolution
   - Creates a mining swarm to collect resources efficiently
   - Final form: The Brood Queen, commanding a vast army of specialized drones

3. **Machine God Path (5 stages)**
   - Requires finding an ancient drilling machine in the world
   - Fuses alien biology with machine technology
   - Gains powerful mechanical abilities but with unique weaknesses
   - Final form: The Machine God, perfectly merging biology and technology

### Dynamic Procedural World

- Procedurally generated underground world with varying terrain types
- Multiple biomes and layers as you dig deeper
- Special locations like caverns, underground lakes, and alien nests
- Resource distribution that changes with depth - more valuable ores are found deeper

### Resource Collection and Management

- Mine different types of earth and ores for resources
- Resources provide both monetary value and nutrition for your alien
- Return to nests to restore hunger levels
- Spend resources on evolutions and upgrades

### Environmental Hazards

- Navigate through obstacles like hard rocks, lava pockets, and gas vents
- Different evolution paths have different resistances and vulnerabilities
- Dynamic fluids (lava, water) that can flow and spread
- Gas pockets that rise and dissipate

## How to Play

### Installation

1. Clone this repository or download the ZIP file
2. Open the EarthEater directory in your preferred web server
   - For local testing, you can use Python's built-in HTTP server:
     ```
     cd EarthEater
     python -m http.server
     ```
   - Then open http://localhost:8000 in your browser

### Controls

#### Keyboard
- **WASD** or **Arrow Keys**: Move your alien
- **Spacebar** or **E**: Dig/interact
- **Escape**: Open menu
- **Tab**: View evolution tree

#### Touch (Mobile)
- **Virtual D-Pad** (left side): Move your alien
- **Action Button** (right side): Dig/interact
- **Menu Buttons** (top): Access different game features

### Gameplay Tips

1. **Resource Management**
   - Keep an eye on your hunger level
   - Return to nests (glowing alien structures) to restore hunger
   - Collect valuable resources to fund evolutions

2. **Evolution Strategy**
   - Choose your evolution path based on your playstyle:
     - Worm Path: Solo digger with high durability
     - Brood Path: Command followers for efficient resource collection
     - Machine Path: Technical powerhouse with specialized abilities

3. **Exploration**
   - Dig deeper to find more valuable resources
   - Look for special structures and unusual formations
   - Find the hidden ancient drilling machine to unlock the Machine path

4. **Survival**
   - Avoid hazards your current form can't handle
   - Upgrade your resistances to environmental dangers
   - Don't venture too far from a nest when hunger is low

## Development

EarthEater is built with HTML5, CSS, and JavaScript. It uses the following technologies:

- HTML5 Canvas for rendering
- JavaScript modules for code organization
- Howler.js for sound management
- TWEEN.js for smooth animations
- Custom procedural generation for world creation

### Project Structure

- `/assets`: Game assets including images and audio
- `/scripts`: Game code
  - `/engine`: Core game systems (rendering, input, camera, etc.)
  - `/entities`: Game entities (player, obstacles, etc.)
  - `/utils`: Utility functions and constants
- `/styles`: CSS styles for the game interface

### Libraries Used

- [Howler.js](https://howlerjs.com/) - Audio library
- [TWEEN.js](https://github.com/tweenjs/tween.js/) - Animation library

### Creating Custom Assets

The game currently uses procedurally generated placeholder assets, but you can easily replace them with your own:

1. **Tiles**: Create a tileset image with dimensions at least 128×192 pixels (4×6 tiles of 32×32 pixels each)
2. **Player**: Create a spritesheet with dimensions at least 128×512 pixels to cover all evolution forms
3. **UI**: Create UI elements with dimensions at least a 512×512 pixels texture atlas
4. **Audio**: Add sound effects in mp3 format to the assets/audio directory

Place custom assets in the corresponding folders under `/assets/`.

## Future Plans

- Multiplayer competitive mode
- Additional evolution paths
- Boss encounters
- Extended lore and story elements
- Advanced particle effects and visuals
- Save system to continue progress

## Credits

- Game concept and development: EarthEater Team
- Programming by Claude
- Procedurally generated assets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Enjoy your journey beneath the earth's surface and evolve into the ultimate Earth Eater!