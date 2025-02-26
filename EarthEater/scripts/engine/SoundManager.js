/**
 * Sound manager for the game
 * Handles playing sound effects and background music with support for howler.js
 * Falls back to Web Audio API if howler.js is not available
 */

import { assets } from './AssetLoader.js';

// Sound configuration
let soundEnabled = true;
let musicEnabled = true;
let masterVolume = 0.7;
let musicVolume = 0.5;
let sfxVolume = 0.8;

// Sound effect instances
const soundEffects = {};
let backgroundMusic = null;

// Web Audio Context for fallback
let audioContext = null;

/**
 * Initialize sound effects and prepare audio system
 */
export function initSoundEffects() {
    // Check if Web Audio API is available for fallbacks
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioContext = new AudioContext();
        }
    } catch (error) {
        console.warn('Web Audio API not available:', error);
    }
    
    // Initialize sound system based on available libraries
    if (window.Howl) {
        setupHowlerSounds();
    } else {
        setupFallbackSounds();
    }
    
    // Try to load background music
    loadBackgroundMusic();
    
    console.log('Sound system initialized');
}

/**
 * Set up sounds using Howler.js
 */
function setupHowlerSounds() {
    // Setup common sound effects with Howler.js
    const effects = {
        dig: {
            src: ['assets/audio/dig.mp3', 'assets/audio/dig.ogg'],
            fallback: createOscillator(200, 0.1),
            volume: 0.4,
            pool: 4 // Allow multiple instances of this sound
        },
        collect: {
            src: ['assets/audio/collect.mp3', 'assets/audio/collect.ogg'],
            fallback: createOscillator(600, 0.1),
            volume: 0.6,
            pool: 4
        },
        hurt: {
            src: ['assets/audio/hurt.mp3', 'assets/audio/hurt.ogg'],
            fallback: createOscillator(150, 0.2),
            volume: 0.5,
            pool: 2
        },
        upgrade: {
            src: ['assets/audio/upgrade.mp3', 'assets/audio/upgrade.ogg'],
            fallback: createOscillator(800, 0.3),
            volume: 0.7,
            pool: 1
        },
        evolve: {
            src: ['assets/audio/evolve.mp3', 'assets/audio/evolve.ogg'],
            fallback: createOscillator(1000, 0.5),
            volume: 0.8,
            pool: 1
        },
        menu: {
            src: ['assets/audio/menu.mp3', 'assets/audio/menu.ogg'],
            fallback: createOscillator(400, 0.05),
            volume: 0.3,
            pool: 1
        },
        error: {
            src: ['assets/audio/error.mp3', 'assets/audio/error.ogg'],
            fallback: createOscillator(200, 0.1, 'sawtooth'),
            volume: 0.5,
            pool: 1
        }
    };
    
    // Create Howl instances for each effect
    for (const [name, config] of Object.entries(effects)) {
        try {
            soundEffects[name] = new Howl({
                src: config.src,
                volume: config.volume * sfxVolume * masterVolume,
                pool: config.pool,
                preload: true,
                onloaderror: function() {
                    console.warn(`Error loading sound: ${name}`);
                    soundEffects[name] = config.fallback;
                }
            });
        } catch (error) {
            console.warn(`Error creating Howl for ${name}:`, error);
            soundEffects[name] = config.fallback;
        }
    }
    
    console.log('Initialized sound effects with Howler.js');
}

/**
 * Set up fallback sounds using Web Audio API
 */
function setupFallbackSounds() {
    // Fallback to Web Audio API
    console.warn('Howler.js not available, using fallback sounds');
    
    soundEffects.dig = createOscillator(200, 0.1);
    soundEffects.collect = createOscillator(600, 0.1);
    soundEffects.hurt = createOscillator(150, 0.2);
    soundEffects.upgrade = createOscillator(800, 0.3);
    soundEffects.evolve = createOscillator(1000, 0.5);
    soundEffects.menu = createOscillator(400, 0.05);
    soundEffects.error = createOscillator(200, 0.1, 'sawtooth');
}

/**
 * Creates a function that generates a tone using Web Audio API
 * @param {number} frequency - Frequency of the tone in Hz
 * @param {number} duration - Duration of the tone in seconds
 * @param {string} type - Type of oscillator (sine, square, sawtooth, triangle)
 * @returns {Object} Object with play function
 */
function createOscillator(frequency, duration, type = 'sine') {
    return {
        play: function(volume = 1.0) {
            if (!soundEnabled || !audioContext) return;
            
            try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = type;
                oscillator.frequency.value = frequency;
                gainNode.gain.value = volume * 0.2 * sfxVolume * masterVolume;
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Apply quick fade out
                gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                }, duration * 1000);
            } catch (error) {
                console.warn('Failed to play fallback sound:', error);
            }
        }
    };
}

/**
 * Load background music
 */
function loadBackgroundMusic() {
    if (!window.Howl || !musicEnabled) return;
    
    try {
        backgroundMusic = new Howl({
            src: ['assets/audio/background.mp3', 'assets/audio/background.ogg'],
            loop: true,
            volume: 0.3 * musicVolume * masterVolume,
            preload: true,
            onload: function() {
                console.log('Background music loaded');
            },
            onloaderror: function() {
                console.warn('Error loading background music');
                backgroundMusic = null;
            }
        });
    } catch (error) {
        console.warn('Error creating background music:', error);
    }
}

/**
 * Play a sound effect by name
 * @param {string} name - Name of the sound effect to play
 * @param {number} volume - Volume of the sound effect (0.0 to 1.0)
 */
export function playSound(name, volume = 1.0) {
    if (!soundEnabled) return;
    
    const sound = soundEffects[name];
    if (!sound) {
        console.warn(`Sound "${name}" not found`);
        return;
    }
    
    try {
        // If it's a Howl instance
        if (sound.play && typeof sound.play === 'function' && sound.volume) {
            const adjustedVolume = Math.min(1.0, Math.max(0.1, volume));
            sound.volume(adjustedVolume * sfxVolume * masterVolume);
            sound.play();
        } else {
            // It's our fallback oscillator
            sound.play(volume);
        }
    } catch (error) {
        console.warn(`Error playing sound "${name}":`, error);
    }
}

/**
 * Start playing background music
 */
export function playBackgroundMusic() {
    if (!musicEnabled || !backgroundMusic) return;
    
    try {
        backgroundMusic.fade(0, 0.3 * musicVolume * masterVolume, 2000);
        backgroundMusic.play();
    } catch (error) {
        console.warn('Error playing background music:', error);
    }
}

/**
 * Stop background music with fade out
 */
export function stopBackgroundMusic() {
    if (!backgroundMusic) return;
    
    try {
        backgroundMusic.fade(backgroundMusic.volume(), 0, 2000);
        setTimeout(() => {
            backgroundMusic.stop();
        }, 2000);
    } catch (error) {
        console.warn('Error stopping background music:', error);
    }
}

/**
 * Toggle sound effects on/off
 * @returns {boolean} New sound state
 */
export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

/**
 * Toggle background music on/off
 * @returns {boolean} New music state
 */
export function toggleMusic() {
    musicEnabled = !musicEnabled;
    
    if (musicEnabled) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
    
    return musicEnabled;
}

/**
 * Set master volume level
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {number} New master volume level
 */
export function setMasterVolume(volume) {
    masterVolume = Math.min(1.0, Math.max(0, volume));
    
    // Update all sound volumes
    for (const sound of Object.values(soundEffects)) {
        if (sound.volume && typeof sound.volume === 'function') {
            sound.volume(sound._volume * masterVolume);
        }
    }
    
    // Update background music volume
    if (backgroundMusic) {
        backgroundMusic.volume(0.3 * musicVolume * masterVolume);
    }
    
    return masterVolume;
}

/**
 * Set sound effect volume level
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {number} New SFX volume level
 */
export function setSFXVolume(volume) {
    sfxVolume = Math.min(1.0, Math.max(0, volume));
    
    // Update all sound effect volumes
    for (const sound of Object.values(soundEffects)) {
        if (sound.volume && typeof sound.volume === 'function') {
            sound.volume(sound._volume * sfxVolume * masterVolume);
        }
    }
    
    return sfxVolume;
}

/**
 * Set music volume level
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {number} New music volume level
 */
export function setMusicVolume(volume) {
    musicVolume = Math.min(1.0, Math.max(0, volume));
    
    // Update background music volume
    if (backgroundMusic) {
        backgroundMusic.volume(0.3 * musicVolume * masterVolume);
    }
    
    return musicVolume;
}