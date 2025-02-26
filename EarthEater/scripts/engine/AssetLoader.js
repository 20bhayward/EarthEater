/**
 * Asset loader for the game
 * Handles loading and managing game assets (images, audio)
 */

// Asset registry to hold all loaded assets
export const assets = {
    images: {},
    audio: {},
    sprites: {}
};

// List of assets to load
const assetManifest = {
    images: [
        { name: 'tiles', path: 'assets/images/tiles.png' },
        { name: 'player', path: 'assets/images/player.png' },
        { name: 'ores', path: 'assets/images/ores.png' },
        { name: 'ui', path: 'assets/images/ui.png' }
    ],
    audio: [
        { name: 'dig', path: 'assets/audio/dig.mp3' },
        { name: 'collect', path: 'assets/audio/collect.mp3' },
        { name: 'hurt', path: 'assets/audio/hurt.mp3' },
        { name: 'upgrade', path: 'assets/audio/upgrade.mp3' },
        { name: 'evolve', path: 'assets/audio/evolve.mp3' },
        { name: 'menu', path: 'assets/audio/menu.mp3' },
        { name: 'error', path: 'assets/audio/error.mp3' },
        { name: 'background', path: 'assets/audio/background.mp3' }
    ]
};

/**
 * Load an image asset
 * @param {string} name - Name of the image
 * @param {string} path - Path to the image file
 * @returns {Promise<HTMLImageElement>} Promise that resolves when the image is loaded
 */
function loadImage(name, path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            assets.images[name] = img;
            resolve(img);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
}

/**
 * Load an audio asset
 * @param {string} name - Name of the audio
 * @param {string} path - Path to the audio file
 * @returns {Promise<HTMLAudioElement>} Promise that resolves when the audio is loaded
 */
function loadAudio(name, path) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            assets.audio[name] = audio;
            resolve(audio);
        };
        audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
        audio.src = path;
    });
}

/**
 * Load all assets defined in the asset manifest
 * @returns {Promise<void>} Promise that resolves when all assets are loaded
 */
export async function loadAssets() {
    const promises = [];
    
    // Copy any placeholder assets first as a fallback
    if (window.gameAssets) {
        // Copy placeholder images
        for (const name in window.gameAssets.images) {
            assets.images[name] = window.gameAssets.images[name];
        }
    }
    
    // Load external images if available
    for (const image of assetManifest.images) {
        promises.push(
            loadImage(image.name, image.path)
            .catch(error => {
                console.warn(`Failed to load ${image.name}, using placeholder:`, error);
                // The placeholder is already in assets.images from above
            })
        );
    }
    
    // Load audio files if available
    for (const audio of assetManifest.audio) {
        promises.push(
            loadAudio(audio.name, audio.path)
            .catch(error => {
                console.warn(`Failed to load ${audio.name} audio:`, error);
                // Create fake audio for placeholder
                assets.audio[audio.name] = {
                    cloneNode: () => ({ 
                        play: () => Promise.resolve(),
                        volume: 1.0
                    })
                };
            })
        );
    }
    
    // Wait for all assets to load
    await Promise.all(promises);
    console.log('Asset loading completed');
}

/**
 * Create a sprite sheet from an image
 * @param {string} imageName - Name of the image to use
 * @param {string} spriteName - Name for the sprite sheet
 * @param {number} frameWidth - Width of each frame
 * @param {number} frameHeight - Height of each frame
 * @param {number} numFrames - Number of frames in the sprite sheet
 * @param {number} numRows - Number of rows in the sprite sheet
 */
export function createSpriteSheet(imageName, spriteName, frameWidth, frameHeight, numFrames, numRows = 1) {
    const image = assets.images[imageName];
    if (!image) {
        console.warn(`Cannot create sprite sheet: image "${imageName}" not found`);
        return;
    }
    
    const framesPerRow = Math.ceil(numFrames / numRows);
    
    assets.sprites[spriteName] = {
        image: image,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        numFrames: numFrames,
        numRows: numRows,
        framesPerRow: framesPerRow,
        
        // Method to draw a specific frame
        drawFrame: function(ctx, frameIndex, x, y, width = frameWidth, height = frameHeight) {
            const row = Math.floor(frameIndex / framesPerRow);
            const col = frameIndex % framesPerRow;
            
            ctx.drawImage(
                image,
                col * frameWidth, row * frameHeight, frameWidth, frameHeight,
                x, y, width, height
            );
        }
    };
}