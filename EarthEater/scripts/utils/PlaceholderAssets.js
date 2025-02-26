/**
 * Generates placeholder images for the game using canvas
 */
export function generatePlaceholderImages() {
    return new Promise((resolve) => {
        // Create placeholder tilesets
        createTilesPlaceholder();
        createPlayerPlaceholder();
        createOresPlaceholder();
        createUIPlaceholder();
        
        // Wait a short time to ensure browser rendering
        setTimeout(() => {
            console.log('Placeholder assets created');
            resolve();
        }, 100);
    });
}

// Create a placeholder tileset for terrain
function createTilesPlaceholder() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    const tilesWide = 4;
    const tilesHigh = 8; // Expanded for more tile types
    
    canvas.width = tileSize * tilesWide;
    canvas.height = tileSize * tilesHigh;
    
    // Fill with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Terrain tiles (top row)
    // Dirt
    drawTile(ctx, 0, 0, tileSize, '#8B4513', '#6B3300');
    // Stone
    drawTile(ctx, 1, 0, tileSize, '#808080', '#606060');
    // Hard Stone
    drawTile(ctx, 2, 0, tileSize, '#505050', '#404040');
    // Dark Stone
    drawTile(ctx, 3, 0, tileSize, '#303030', '#202020');
    
    // Ore tiles (second row)
    // Coal
    drawTile(ctx, 0, 1, tileSize, '#2F4F4F', '#6B3300', true);
    // Copper
    drawTile(ctx, 1, 1, tileSize, '#B87333', '#6B3300', true);
    // Iron
    drawTile(ctx, 2, 1, tileSize, '#A19D94', '#606060', true);
    // Silver
    drawTile(ctx, 3, 1, tileSize, '#C0C0C0', '#404040', true);
    
    // More resources (third row)
    // Gold
    drawTile(ctx, 0, 2, tileSize, '#FFD700', '#8B4513', true);
    // Gem
    drawTile(ctx, 1, 2, tileSize, '#4169E1', '#8B4513', true);
    // Uranium
    drawTile(ctx, 2, 2, tileSize, '#3CB371', '#006400', true);
    // Alien ore
    drawTile(ctx, 3, 2, tileSize, '#7CFC00', '#006400', true);
    
    // Special materials (fourth row)
    // Crystal
    drawSpecialTile(ctx, 0, 3, tileSize, '#9370DB', '#483D8B', 'crystal');
    // Void Crystal
    drawSpecialTile(ctx, 1, 3, tileSize, '#483D8B', '#191970', 'crystal');
    // Alien Crystal
    drawSpecialTile(ctx, 2, 3, tileSize, '#00FF7F', '#006400', 'crystal');
    // Obsidian
    drawTile(ctx, 3, 3, tileSize, '#0D0D0D', '#000000');
    
    // Obstacles and hazards (fifth row)
    // Rock
    drawTile(ctx, 0, 4, tileSize, '#A0A0A0', '#808080', false, true);
    // Lava
    drawAnimatedTile(ctx, 1, 4, tileSize, '#FF4500', '#8B0000', 'lava');
    // Gas
    drawAnimatedTile(ctx, 2, 4, tileSize, '#7FFF00', '#006400', 'gas');
    // Water
    drawAnimatedTile(ctx, 3, 4, tileSize, '#0000FF', '#00008B', 'water');
    
    // Alien structures (sixth row)
    // Alien Rock
    drawTile(ctx, 0, 5, tileSize, '#4B0082', '#000000');
    // Alien Nest
    drawSpecialTile(ctx, 1, 5, tileSize, '#7CFC00', '#006400', 'nest');
    // Alien Artifact
    drawSpecialTile(ctx, 2, 5, tileSize, '#FF00FF', '#8B008B', 'artifact');
    // Clay
    drawTile(ctx, 3, 5, tileSize, '#CD853F', '#8B4513');
    
    // Special objects (seventh row)
    // Driller Part
    drawSpecialTile(ctx, 0, 6, tileSize, '#C0C0C0', '#606060', 'machine');
    // Alien Egg
    drawSpecialTile(ctx, 1, 6, tileSize, '#7CFC00', '#006400', 'egg');
    // Crystal Formation
    drawSpecialTile(ctx, 2, 6, tileSize, '#9370DB', '#483D8B', 'formation');
    // Boundary (special)
    drawTile(ctx, 3, 6, tileSize, '#FF0000', '#8B0000');
    
    // Empty row for future additions (eighth row)
    // ...empty...
    
    // Save the canvas as an image
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    
    // Add to assets
    window.gameAssets = window.gameAssets || {};
    window.gameAssets.images = window.gameAssets.images || {};
    window.gameAssets.images.tiles = img;
    
    // Add to DOM for debugging
    //document.body.appendChild(canvas);
    //canvas.style.position = 'absolute';
    //canvas.style.top = '10px';
    //canvas.style.left = '10px';
    //canvas.style.zIndex = '9999';
    //canvas.style.border = '1px solid white';
}

// Create a placeholder player sprite
function createPlayerPlaceholder() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    const framesWide = 4; // Animation frames
    const evolution = 16;  // Evolution types (increased to cover all forms)
    
    canvas.width = tileSize * framesWide;
    canvas.height = tileSize * evolution * 4; // 4 directions for each evolution
    
    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw different evolutions with unique colors
    const evolutionColors = [
        // Basic form
        '#FF0000', // Larva (red)
        
        // Worm path
        '#00FF00', // Worm (green)
        '#00CC00', // Giant Worm (darker green)
        '#009900', // Behemoth Worm (even darker green)
        '#006600', // Elder Worm (very dark green)
        '#003300', // Worm God (deepest green)
        
        // Machine path
        '#C0C0C0', // Driller Fused (silver)
        '#A0A0A0', // Mech Alien (gray)
        '#808080', // Harvest Mech (darker gray)
        '#606060', // World Eater (dark gray)
        '#404040', // Machine God (darkest gray)
        
        // Brood path
        '#FF00FF', // Brood Mother (magenta)
        '#CC00CC', // Hive Mind (darker magenta)
        '#990099', // Swarm Queen (even darker magenta)
        '#660066', // Brood Empress (very dark magenta)
        '#330033'  // Brood Queen (deepest magenta)
    ];
    
    // For each evolution type
    for (let e = 0; e < evolution; e++) {
        const evolutionColor = evolutionColors[e] || '#FFFFFF';
        
        // Calculate size multiplier based on evolution stage
        let sizeMultiplier = 1.0;
        const evolutionStage = Math.floor(e / 3) + 1;
        if (evolutionStage >= 2) sizeMultiplier = 1.1;
        if (evolutionStage >= 3) sizeMultiplier = 1.2;
        if (evolutionStage >= 4) sizeMultiplier = 1.3;
        if (evolutionStage >= 5) sizeMultiplier = 1.5;
        
        // For each direction (up, right, down, left)
        for (let d = 0; d < 4; d++) {
            // For each animation frame
            for (let f = 0; f < framesWide; f++) {
                const x = f * tileSize;
                const y = (e * 4 + d) * tileSize;
                
                // Calculate adjusted size for larger evolutions
                const adjustedSize = Math.floor(tileSize * 0.8 * sizeMultiplier);
                const offset = Math.floor((tileSize - adjustedSize) / 2);
                
                // Draw the creature body
                ctx.fillStyle = evolutionColor;
                
                // Different shapes for different evolution paths
                if (e >= 1 && e <= 5) {
                    // Worm path - elongated shapes
                    ctx.beginPath();
                    ctx.ellipse(
                        x + tileSize/2, 
                        y + tileSize/2, 
                        adjustedSize/2, 
                        adjustedSize/4, 
                        d % 2 === 0 ? 0 : Math.PI/2, 
                        0, Math.PI * 2
                    );
                    ctx.fill();
                } else if (e >= 6 && e <= 10) {
                    // Machine path - angular shapes
                    ctx.beginPath();
                    ctx.rect(x + offset, y + offset, adjustedSize, adjustedSize);
                    ctx.fill();
                    
                    // Mechanical details
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x + offset, y + offset, adjustedSize, adjustedSize);
                    
                    // Drill bit for machine forms
                    const drillLength = adjustedSize / 3;
                    const drillWidth = adjustedSize / 6;
                    ctx.fillStyle = '#808080';
                    
                    // Direction-specific drill
                    switch(d) {
                        case 0: // Up
                            ctx.fillRect(x + tileSize/2 - drillWidth/2, y + offset - drillLength, drillWidth, drillLength);
                            break;
                        case 1: // Right
                            ctx.fillRect(x + offset + adjustedSize, y + tileSize/2 - drillWidth/2, drillLength, drillWidth);
                            break;
                        case 2: // Down
                            ctx.fillRect(x + tileSize/2 - drillWidth/2, y + offset + adjustedSize, drillWidth, drillLength);
                            break;
                        case 3: // Left
                            ctx.fillRect(x + offset - drillLength, y + tileSize/2 - drillWidth/2, drillLength, drillWidth);
                            break;
                    }
                } else if (e >= 11) {
                    // Brood path - cluster shapes
                    // Main body
                    ctx.beginPath();
                    ctx.arc(x + tileSize/2, y + tileSize/2, adjustedSize/3, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Smaller orbs around for brood forms to represent followers
                    const orbitRadius = adjustedSize/2;
                    const followerSize = adjustedSize/6;
                    const numFollowers = Math.min(8, Math.floor(e - 8)); // More followers with higher evolution
                    
                    for (let i = 0; i < numFollowers; i++) {
                        const angle = (i / numFollowers) * Math.PI * 2 + (f * 0.2);
                        const followerX = x + tileSize/2 + Math.cos(angle) * orbitRadius;
                        const followerY = y + tileSize/2 + Math.sin(angle) * orbitRadius;
                        
                        ctx.beginPath();
                        ctx.arc(followerX, followerY, followerSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Basic larva form - simple oval
                    ctx.beginPath();
                    ctx.arc(x + tileSize/2, y + tileSize/2, adjustedSize/3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Add details based on direction
                ctx.fillStyle = '#FFFFFF';
                
                // Direction-specific details (eyes)
                const eyeSize = Math.max(2, Math.floor(adjustedSize / 8));
                const eyeDistance = Math.max(4, Math.floor(adjustedSize / 4));
                
                switch(d) {
                    case 0: // Up
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2 - eyeDistance, y + tileSize/2 - eyeDistance/2, eyeSize, 0, Math.PI * 2);
                        ctx.arc(x + tileSize/2 + eyeDistance, y + tileSize/2 - eyeDistance/2, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 1: // Right
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2 + eyeDistance/2, y + tileSize/2 - eyeDistance, eyeSize, 0, Math.PI * 2);
                        ctx.arc(x + tileSize/2 + eyeDistance/2, y + tileSize/2 + eyeDistance, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 2: // Down
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2 - eyeDistance, y + tileSize/2 + eyeDistance/2, eyeSize, 0, Math.PI * 2);
                        ctx.arc(x + tileSize/2 + eyeDistance, y + tileSize/2 + eyeDistance/2, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 3: // Left
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2 - eyeDistance/2, y + tileSize/2 - eyeDistance, eyeSize, 0, Math.PI * 2);
                        ctx.arc(x + tileSize/2 - eyeDistance/2, y + tileSize/2 + eyeDistance, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
                
                // Add animation
                const animationOffset = Math.sin(f * Math.PI / 2) * (adjustedSize / 8);
                
                // Animation details specific to evolution path
                if (e >= 1 && e <= 5) {
                    // Worm path - wiggle body segments
                    ctx.fillStyle = evolutionColor;
                    ctx.globalAlpha = 0.7;
                    
                    const segments = 3;
                    for (let s = 1; s <= segments; s++) {
                        const segmentOffset = animationOffset * (1 - s / (segments + 1));
                        const segmentX = d % 2 === 0 ? segmentOffset : 0;
                        const segmentY = d % 2 === 1 ? segmentOffset : 0;
                        const segmentSize = adjustedSize * (1 - s * 0.2);
                        
                        // Offset in the opposite direction of movement
                        const dirOffset = (d === 0 ? [0, 1] : 
                                          d === 1 ? [-1, 0] : 
                                          d === 2 ? [0, -1] : [1, 0]);
                        
                        ctx.beginPath();
                        ctx.arc(
                            x + tileSize/2 + segmentX + (dirOffset[0] * s * 4), 
                            y + tileSize/2 + segmentY + (dirOffset[1] * s * 4), 
                            segmentSize / 4, 
                            0, Math.PI * 2
                        );
                        ctx.fill();
                    }
                    
                    ctx.globalAlpha = 1.0;
                } else if (e >= 6 && e <= 10) {
                    // Machine path - mechanical movement
                    ctx.fillStyle = '#FFFF00';
                    
                    // Energy core
                    ctx.beginPath();
                    ctx.arc(x + tileSize/2, y + tileSize/2, adjustedSize/6, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Moving parts
                    ctx.fillStyle = '#404040';
                    ctx.fillRect(
                        x + tileSize/2 - adjustedSize/4, 
                        y + tileSize/2 - adjustedSize/4 + animationOffset, 
                        adjustedSize/2, 
                        adjustedSize/8
                    );
                } else if (e >= 11) {
                    // Brood path - swirling followers
                    // (Already animated in the main drawing)
                } else {
                    // Basic larva - simple pulsing
                    ctx.fillStyle = '#FFFF00';
                    ctx.globalAlpha = 0.3 + (Math.sin(f * Math.PI) * 0.2);
                    ctx.beginPath();
                    ctx.arc(x + tileSize/2, y + tileSize/2, adjustedSize/4 + animationOffset, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            }
        }
    }
    
    // Save the canvas as an image
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    
    // Add to assets
    window.gameAssets = window.gameAssets || {};
    window.gameAssets.images = window.gameAssets.images || {};
    window.gameAssets.images.player = img;
    
    // Add to DOM for debugging
    //document.body.appendChild(canvas);
    //canvas.style.position = 'absolute';
    //canvas.style.top = '10px';
    //canvas.style.left = '50px';
    //canvas.style.zIndex = '9999';
    //canvas.style.border = '1px solid white';
    //canvas.style.transform = 'scale(0.5)';
}

// Create ore placeholders
function createOresPlaceholder() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    const oresWide = 4;
    const oresHigh = 3; // Expanded for more ore types
    
    canvas.width = tileSize * oresWide;
    canvas.height = tileSize * oresHigh;
    
    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ore colors - expanded for more variety
    const oreColors = [
        // Basic ores
        '#2F4F4F', // Coal
        '#B87333', // Copper
        '#A19D94', // Iron
        '#C0C0C0', // Silver
        
        // Valuable ores
        '#FFD700', // Gold
        '#4169E1', // Gem
        '#3CB371', // Uranium
        '#7CFC00', // Alien
        
        // Special materials
        '#9370DB', // Crystal
        '#483D8B', // Void Crystal  
        '#00FF7F', // Alien Crystal
        '#FF00FF'  // Artifact
    ];
    
    // Draw ore items with different shapes and details
    for (let i = 0; i < oreColors.length; i++) {
        const x = (i % oresWide) * tileSize;
        const y = Math.floor(i / oresWide) * tileSize;
        const color = oreColors[i];
        
        // Draw based on type of ore
        if (i < 4) {
            // Basic ores - simple shapes
            drawOreItem(ctx, x, y, tileSize, color, 'basic');
        } else if (i < 8) {
            // Valuable ores - more complex shapes
            drawOreItem(ctx, x, y, tileSize, color, 'valuable');
        } else {
            // Special materials - elaborate designs
            drawOreItem(ctx, x, y, tileSize, color, 'special');
        }
    }
    
    // Save the canvas as an image
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    
    // Add to assets
    window.gameAssets = window.gameAssets || {};
    window.gameAssets.images = window.gameAssets.images || {};
    window.gameAssets.images.ores = img;
    
    // Add to DOM for debugging
    //document.body.appendChild(canvas);
    //canvas.style.position = 'absolute';
    //canvas.style.top = '10px';
    //canvas.style.left = '200px';
    //canvas.style.zIndex = '9999';
    //canvas.style.border = '1px solid white';
}

// Create UI placeholders
function createUIPlaceholder() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 512; // Increased size for more UI elements
    const height = 512;
    
    canvas.width = width;
    canvas.height = height;
    
    // Fill with transparent background
    ctx.clearRect(0, 0, width, height);
    
    // Draw UI elements
    
    // Buttons in different states
    drawUIButton(ctx, 0, 0, 100, 40, 'normal');
    drawUIButton(ctx, 110, 0, 100, 40, 'hover');
    drawUIButton(ctx, 220, 0, 100, 40, 'active');
    drawUIButton(ctx, 330, 0, 100, 40, 'disabled');
    
    // Icon buttons
    drawIconButton(ctx, 0, 50, 40, 'menu');
    drawIconButton(ctx, 50, 50, 40, 'evolution');
    drawIconButton(ctx, 100, 50, 40, 'inventory');
    drawIconButton(ctx, 150, 50, 40, 'settings');
    
    // Progress bars
    drawProgressBar(ctx, 0, 100, 200, 20, 0.75, '#ff4444', '#aa0000'); // Health
    drawProgressBar(ctx, 0, 130, 200, 20, 0.5, '#44ff44', '#00aa00');  // Hunger
    drawProgressBar(ctx, 0, 160, 200, 20, 0.25, '#4444ff', '#0000aa'); // Oxygen
    
    // Panel backgrounds
    drawPanel(ctx, 210, 100, 200, 150, 'dark');
    drawPanel(ctx, 420, 100, 80, 80, 'light');
    
    // Evolution icons
    const evolutionSize = 60;
    const evolutionStartY = 260;
    const evolutionTypes = [
        { name: 'larva', color: '#FF0000' },
        { name: 'worm', color: '#00FF00' },
        { name: 'drill', color: '#C0C0C0' },
        { name: 'brood', color: '#FF00FF' },
        { name: 'wormGod', color: '#003300' },
        { name: 'machineGod', color: '#404040' },
        { name: 'broodQueen', color: '#330033' }
    ];
    
    evolutionTypes.forEach((evo, i) => {
        const x = (i % 4) * (evolutionSize + 10);
        const y = evolutionStartY + Math.floor(i / 4) * (evolutionSize + 10);
        drawEvolutionIcon(ctx, x, y, evolutionSize, evo.color, evo.name === 'larva');
    });
    
    // Resource icons
    const resourceSize = 40;
    const resourceStartY = 400;
    const resources = [
        { color: '#2F4F4F', value: 5 },  // Coal
        { color: '#B87333', value: 10 }, // Copper
        { color: '#A19D94', value: 15 }, // Iron
        { color: '#C0C0C0', value: 25 }, // Silver
        { color: '#FFD700', value: 50 }, // Gold
        { color: '#4169E1', value: 75 }, // Gem
        { color: '#3CB371', value: 100 } // Uranium
    ];
    
    resources.forEach((res, i) => {
        const x = i * (resourceSize + 10);
        const y = resourceStartY;
        drawResourceIcon(ctx, x, y, resourceSize, res.color, res.value);
    });
    
    // Notification backgrounds
    drawNotification(ctx, 0, 450, 250, 50, 'info');
    drawNotification(ctx, 260, 450, 250, 50, 'warning');
    
    // Save the canvas as an image
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    
    // Add to assets
    window.gameAssets = window.gameAssets || {};
    window.gameAssets.images = window.gameAssets.images || {};
    window.gameAssets.images.ui = img;
    
    // Add to DOM for debugging
    //document.body.appendChild(canvas);
    //canvas.style.position = 'absolute';
    //canvas.style.top = '10px';
    //canvas.style.left = '350px';
    //canvas.style.zIndex = '9999';
    //canvas.style.border = '1px solid white';
    //canvas.style.transform = 'scale(0.5)';
    //canvas.style.transformOrigin = 'top left';
}

// Helper function to draw a tile with color
function drawTile(ctx, x, y, size, color, borderColor, isOre = false, isRock = false) {
    const xPos = x * size;
    const yPos = y * size;
    
    // Base tile
    ctx.fillStyle = borderColor;
    ctx.fillRect(xPos, yPos, size, size);
    
    if (isOre) {
        // Ore tiles have specks of the ore in them
        ctx.fillStyle = borderColor;
        ctx.fillRect(xPos + 2, yPos + 2, size - 4, size - 4);
        
        // Draw ore specks
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const speckX = xPos + 4 + Math.random() * (size - 8);
            const speckY = yPos + 4 + Math.random() * (size - 8);
            const speckSize = 2 + Math.random() * 6;
            
            ctx.beginPath();
            ctx.arc(speckX, speckY, speckSize, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (isRock) {
        // Rock obstacles have a more jagged appearance
        ctx.fillStyle = color;
        
        ctx.beginPath();
        ctx.moveTo(xPos + size * 0.2, yPos + size * 0.2);
        ctx.lineTo(xPos + size * 0.8, yPos + size * 0.3);
        ctx.lineTo(xPos + size * 0.9, yPos + size * 0.7);
        ctx.lineTo(xPos + size * 0.5, yPos + size * 0.9);
        ctx.lineTo(xPos + size * 0.1, yPos + size * 0.6);
        ctx.closePath();
        ctx.fill();
    } else {
        // Regular terrain
        ctx.fillStyle = color;
        ctx.fillRect(xPos + 2, yPos + 2, size - 4, size - 4);
        
        // Add some texture
        ctx.fillStyle = borderColor;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 8; i++) {
            const dotX = xPos + 4 + Math.random() * (size - 8);
            const dotY = yPos + 4 + Math.random() * (size - 8);
            const dotSize = 1 + Math.random() * 2;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// Helper for animated tiles like lava, water, gas
function drawAnimatedTile(ctx, x, y, size, color, darkColor, type) {
    const xPos = x * size;
    const yPos = y * size;
    
    // Base tile
    ctx.fillStyle = darkColor;
    ctx.fillRect(xPos, yPos, size, size);
    
    ctx.fillStyle = color;
    
    if (type === 'lava') {
        // Lava - bubbling hot surface
        for (let i = 0; i < size; i += 4) {
            const heightVar = Math.sin(i * 0.2) * 4 + 4;
            const widthVar = 2 + Math.random() * 2;
            ctx.fillRect(xPos + i, yPos + 5, widthVar, size - 10 - heightVar);
        }
        
        // Add some bubbles
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 5; i++) {
            const bubbleX = xPos + 4 + Math.random() * (size - 8);
            const bubbleY = yPos + 4 + Math.random() * (size - 8);
            const bubbleSize = 1 + Math.random() * 3;
            
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    } else if (type === 'water') {
        // Water - flowing surface
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < size; i += 4) {
            const heightVar = Math.sin(i * 0.3) * 2 + 2;
            ctx.fillRect(xPos + i, yPos + 5, 3, size - 10 - heightVar);
        }
        ctx.globalAlpha = 1.0;
    } else if (type === 'gas') {
        // Gas - swirling particles
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 10; i++) {
            const particleX = xPos + Math.random() * size;
            const particleY = yPos + Math.random() * size;
            const particleSize = 1 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}

// Helper function for special tile types
function drawSpecialTile(ctx, x, y, size, color, borderColor, type) {
    const xPos = x * size;
    const yPos = y * size;
    
    // Base tile
    ctx.fillStyle = borderColor;
    ctx.fillRect(xPos, yPos, size, size);
    
    // Inner background
    ctx.fillStyle = borderColor;
    ctx.fillRect(xPos + 2, yPos + 2, size - 4, size - 4);
    
    // Special tile contents
    ctx.fillStyle = color;
    
    if (type === 'crystal') {
        // Crystal shape
        ctx.beginPath();
        ctx.moveTo(xPos + size/2, yPos + 5);
        ctx.lineTo(xPos + size - 5, yPos + size/2);
        ctx.lineTo(xPos + size/2, yPos + size - 5);
        ctx.lineTo(xPos + 5, yPos + size/2);
        ctx.closePath();
        ctx.fill();
        
        // Crystal shine
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(xPos + size/2, yPos + 8);
        ctx.lineTo(xPos + size/2 + 5, yPos + size/2 - 5);
        ctx.lineTo(xPos + size/2, yPos + size/2);
        ctx.lineTo(xPos + size/2 - 5, yPos + size/2 - 5);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
    } else if (type === 'nest') {
        // Alien nest - organic structure
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Nest details
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        
        // Concentric circles
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/4, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Small eggs/structures around
        ctx.fillStyle = color;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const eggX = xPos + size/2 + Math.cos(angle) * (size/2.5);
            const eggY = yPos + size/2 + Math.sin(angle) * (size/2.5);
            
            ctx.beginPath();
            ctx.arc(eggX, eggY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'artifact') {
        // Alien artifact - strange geometric shape
        ctx.beginPath();
        ctx.moveTo(xPos + size/2, yPos + 5);
        ctx.lineTo(xPos + size - 8, yPos + size/3);
        ctx.lineTo(xPos + size - 8, yPos + size * 2/3);
        ctx.lineTo(xPos + size/2, yPos + size - 5);
        ctx.lineTo(xPos + 8, yPos + size * 2/3);
        ctx.lineTo(xPos + 8, yPos + size/3);
        ctx.closePath();
        ctx.fill();
        
        // Artifact glow
        const gradient = ctx.createRadialGradient(
            xPos + size/2, yPos + size/2, 0,
            xPos + size/2, yPos + size/2, size/2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    } else if (type === 'machine') {
        // Driller part - mechanical components
        ctx.fillStyle = '#404040';
        ctx.fillRect(xPos + 6, yPos + 6, size - 12, size - 12);
        
        // Gear shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Gear teeth
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            const outX = xPos + size/2 + Math.cos(angle) * (size/3);
            const outY = yPos + size/2 + Math.sin(angle) * (size/3);
            const inX = xPos + size/2 + Math.cos(angle) * (size/4);
            const inY = yPos + size/2 + Math.sin(angle) * (size/4);
            
            ctx.beginPath();
            ctx.moveTo(inX, inY);
            ctx.lineTo(outX, outY);
            ctx.lineWidth = 3;
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        
        // Center hole
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(xPos + size/2, yPos + size/2, size/8, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'egg') {
        // Alien egg - oval shape
        ctx.beginPath();
        ctx.ellipse(xPos + size/2, yPos + size/2 + 2, size/3, size/4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Egg texture
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        
        // Veiny texture
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(xPos + size/2, yPos + size/2 - size/4);
            ctx.bezierCurveTo(
                xPos + size/2 + 5 * i, yPos + size/2,
                xPos + size/2 - 5 * i, yPos + size/2 + 5,
                xPos + size/2 + 2 * i, yPos + size/2 + size/4
            );
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
    } else if (type === 'formation') {
        // Crystal formation - cluster of crystals
        for (let i = 0; i < 5; i++) {
            const crystalX = xPos + 5 + Math.random() * (size - 10);
            const crystalY = yPos + 5 + Math.random() * (size - 10);
            const crystalSize = 3 + Math.random() * 6;
            const rotation = Math.random() * Math.PI;
            
            ctx.save();
            ctx.translate(crystalX, crystalY);
            ctx.rotate(rotation);
            
            // Draw a small crystal
            ctx.beginPath();
            ctx.moveTo(0, -crystalSize);
            ctx.lineTo(crystalSize/2, 0);
            ctx.lineTo(0, crystalSize);
            ctx.lineTo(-crystalSize/2, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}

// Helper function to draw different ore items
function drawOreItem(ctx, x, y, size, color, type) {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y, size, size);
    
    // Draw ore based on type
    if (type === 'basic') {
        // Basic ores - simple chunks
        for (let i = 0; i < 3; i++) {
            const oreX = x + 5 + Math.random() * (size - 10);
            const oreY = y + 5 + Math.random() * (size - 10);
            const oreSize = 4 + Math.random() * 6;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(oreX, oreY, oreSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Highlight
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(oreX - oreSize/3, oreY - oreSize/3, oreSize/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    } else if (type === 'valuable') {
        // Valuable ores - gem-like shapes
        ctx.fillStyle = color;
        
        // Main gem shape
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + 5);
        ctx.lineTo(x + size - 5, y + size/2);
        ctx.lineTo(x + size/2, y + size - 5);
        ctx.lineTo(x + 5, y + size/2);
        ctx.closePath();
        ctx.fill();
        
        // Gem facets
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + 5);
        ctx.lineTo(x + size - 5, y + size/2);
        ctx.lineTo(x + size/2, y + size/2);
        ctx.closePath();
        ctx.fill();
        
        // Shine effect
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(x + size/3, y + size/3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    } else if (type === 'special') {
        // Special materials - exotic patterns
        // Base shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Intricate patterns
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        
        // Circular pattern
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
        ctx.stroke();
        
        // Emanating lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + size/2, y + size/2);
            ctx.lineTo(
                x + size/2 + Math.cos(angle) * (size/2 - 3),
                y + size/2 + Math.sin(angle) * (size/2 - 3)
            );
            ctx.stroke();
        }
        
        // Glowing center
        const gradient = ctx.createRadialGradient(
            x + size/2, y + size/2, 0,
            x + size/2, y + size/2, size/6
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Helper for UI buttons
function drawUIButton(ctx, x, y, width, height, state = 'normal') {
    // Button shadow
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2, y + 2, width, height);
    
    // Button background
    let bgColor, borderColor, textColor;
    
    switch(state) {
        case 'hover':
            bgColor = '#555555';
            borderColor = '#7cfc00';
            textColor = '#7cfc00';
            break;
        case 'active':
            bgColor = '#333333';
            borderColor = '#7cfc00';
            textColor = '#7cfc00';
            break;
        case 'disabled':
            bgColor = '#444444';
            borderColor = '#666666';
            textColor = '#666666';
            break;
        default: // normal
            bgColor = '#444444';
            borderColor = '#888888';
            textColor = '#ffffff';
    }
    
    // Button background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
    
    // Button border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Button text placeholder
    ctx.fillStyle = textColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Button', x + width/2, y + height/2);
}

// Helper for icon buttons
function drawIconButton(ctx, x, y, size, type) {
    // Button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, size, size);
    
    // Button border
    ctx.strokeStyle = '#7cfc00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
    
    // Button icon
    ctx.fillStyle = '#7cfc00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let icon = '?';
    
    switch(type) {
        case 'menu':
            // Draw hamburger menu icon
            ctx.fillRect(x + size/4, y + size/3, size/2, 2);
            ctx.fillRect(x + size/4, y + size/2, size/2, 2);
            ctx.fillRect(x + size/4, y + size*2/3, size/2, 2);
            return;
            
        case 'evolution':
            // Draw evolution icon (DNA-like)
            for (let i = 0; i < 4; i++) {
                const yPos = y + size/4 + (i * size/8);
                ctx.beginPath();
                ctx.arc(x + size/3, yPos, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x + size*2/3, y + size - yPos + size/4, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(x + size/3, yPos);
                ctx.lineTo(x + size*2/3, y + size - yPos + size/4);
                ctx.stroke();
            }
            return;
            
        case 'inventory':
            // Draw inventory icon (backpack-like)
            ctx.beginPath();
            ctx.moveTo(x + size/4, y + size/3);
            ctx.lineTo(x + size*3/4, y + size/3);
            ctx.lineTo(x + size*3/4, y + size*3/4);
            ctx.lineTo(x + size/4, y + size*3/4);
            ctx.closePath();
            ctx.stroke();
            
            // Backpack top
            ctx.beginPath();
            ctx.moveTo(x + size/3, y + size/3);
            ctx.lineTo(x + size/3, y + size/4);
            ctx.lineTo(x + size*2/3, y + size/4);
            ctx.lineTo(x + size*2/3, y + size/3);
            ctx.stroke();
            return;
            
        case 'settings':
            // Draw settings icon (gear)
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
            ctx.stroke();
            
            // Gear teeth
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(
                    x + size/2 + Math.cos(angle) * (size/4),
                    y + size/2 + Math.sin(angle) * (size/4)
                );
                ctx.lineTo(
                    x + size/2 + Math.cos(angle) * (size/2.5),
                    y + size/2 + Math.sin(angle) * (size/2.5)
                );
                ctx.stroke();
            }
            return;
    }
    
    // Fallback to text
    ctx.font = '20px Arial';
    ctx.fillText(icon, x + size/2, y + size/2);
}

// Helper for progress bars
function drawProgressBar(ctx, x, y, width, height, fillPercent, fillColor, borderColor) {
    // Bar border
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    
    // Background
    ctx.fillStyle = '#222222';
    ctx.fillRect(x, y, width, height);
    
    // Fill
    ctx.fillStyle = fillColor;
    const fillWidth = Math.max(0, Math.min(width * fillPercent, width));
    ctx.fillRect(x, y, fillWidth, height);
    
    // Add gradient overlay
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, fillWidth, height / 2);
    
    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

// Helper for panel backgrounds
function drawPanel(ctx, x, y, width, height, style = 'dark') {
    let bgColor, borderColor;
    
    if (style === 'dark') {
        bgColor = 'rgba(0, 0, 0, 0.8)';
        borderColor = '#444444';
    } else {
        bgColor = 'rgba(40, 40, 40, 0.8)';
        borderColor = '#666666';
    }
    
    // Panel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 3, y + 3, width, height);
    
    // Panel background
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);
    
    // Panel border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Panel inner highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 1);
    ctx.lineTo(x + width - 1, y + 1);
    ctx.lineTo(x + width - 1, y + height - 1);
    ctx.lineTo(x + 1, y + height - 1);
    ctx.closePath();
    ctx.stroke();
}

// Helper for evolution icons
function drawEvolutionIcon(ctx, x, y, size, color, isUnlocked = false) {
    // Icon background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Icon border
    ctx.strokeStyle = isUnlocked ? '#7cfc00' : '#666666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Icon image
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // Add highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x + size/2 - size/8, y + size/2 - size/8, size/8, 0, Math.PI * 2);
    ctx.fill();
    
    // Locked overlay
    if (!isUnlocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Lock icon
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        
        // Lock body
        ctx.beginPath();
        ctx.rect(x + size/2 - size/8, y + size/2 - size/8, size/4, size/4);
        ctx.stroke();
        
        // Lock shackle
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2 - size/6, size/8, Math.PI, 0);
        ctx.stroke();
    }
}

// Helper for resource icons
function drawResourceIcon(ctx, x, y, size, color, value) {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, size, size);
    
    // Resource shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + size/2, y + 5);
    ctx.lineTo(x + size - 5, y + size/2);
    ctx.lineTo(x + size/2, y + size - 5);
    ctx.lineTo(x + 5, y + size/2);
    ctx.closePath();
    ctx.fill();
    
    // Value text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), x + size/2, y + size/2);
}

// Helper for notification backgrounds
function drawNotification(ctx, x, y, width, height, type = 'info') {
    let borderColor, iconColor;
    
    if (type === 'info') {
        borderColor = '#4488ff';
        iconColor = '#4488ff';
    } else if (type === 'warning') {
        borderColor = '#ffcc00';
        iconColor = '#ffcc00';
    } else if (type === 'error') {
        borderColor = '#ff4444';
        iconColor = '#ff4444';
    } else {
        borderColor = '#7cfc00';
        iconColor = '#7cfc00';
    }
    
    // Notification background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, width, height);
    
    // Notification border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Icon area
    ctx.fillStyle = iconColor;
    ctx.fillRect(x, y, height, height);
    
    // Icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (type === 'info') {
        ctx.fillText('i', x + height/2, y + height/2);
    } else if (type === 'warning') {
        ctx.fillText('!', x + height/2, y + height/2);
    } else if (type === 'error') {
        ctx.fillText('×', x + height/2, y + height/2);
    } else {
        ctx.fillText('✓', x + height/2, y + height/2);
    }
    
    // Notification text placeholder
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Notification message', x + height + 10, y + height/2);
}