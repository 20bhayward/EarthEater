/**
 * Library loader for EarthEater
 * Loads external libraries used by the game
 */

// List of external libraries to load
const EXTERNAL_LIBRARIES = [
    {
        name: 'Howler.js',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js',
        global: 'Howl'
    },
    {
        name: 'TWEEN.js',
        url: 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@20.0.0/dist/tween.umd.js',
        global: 'TWEEN',
        optional: true // Game can work without this
    }
];

/**
 * Preloads external libraries
 * @returns {Promise<void>} Promise that resolves when all libraries are loaded
 */
export async function preloadLibraries() {
    const promises = EXTERNAL_LIBRARIES.map(lib => loadLibrary(lib));
    try {
        await Promise.all(promises);
        console.log('All libraries loaded successfully');
        
        // Initialize TWEEN if available
        if (window.TWEEN) {
            // Setup animation loop for TWEEN
            const animate = function() {
                requestAnimationFrame(animate);
                TWEEN.update();
            };
            animate();
            console.log('TWEEN animation loop started');
        }
    } catch (error) {
        console.warn('Some libraries failed to load:', error);
        // Game will continue with fallbacks
    }
    
    return Promise.resolve();
}

/**
 * Loads a single library
 * @param {Object} library Library configuration
 * @returns {Promise<void>} Promise that resolves when the library is loaded
 */
function loadLibrary(library) {
    return new Promise((resolve, reject) => {
        // Check if library is already loaded
        if (window[library.global]) {
            console.log(`${library.name} already loaded`);
            resolve();
            return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = library.url;
        script.async = true;
        
        // Handle load events
        script.onload = () => {
            console.log(`${library.name} loaded successfully`);
            resolve();
        };
        
        script.onerror = () => {
            const error = new Error(`Failed to load ${library.name}`);
            console.warn(error.message);
            
            if (library.optional) {
                resolve(); // Continue anyway for optional libraries
            } else {
                reject(error);
            }
        };
        
        // Add script to document
        document.head.appendChild(script);
    });
}

/**
 * Creates and applies visual effects using available libraries
 * @param {HTMLElement} element DOM element to apply effect to
 * @param {string} effectType Type of effect to apply
 * @param {Object} options Effect options
 */
export function applyVisualEffect(element, effectType, options = {}) {
    if (!element) return;
    
    switch (effectType) {
        case 'shake':
            applyShakeEffect(element, options);
            break;
            
        case 'pulse':
            applyPulseEffect(element, options);
            break;
            
        case 'glow':
            applyGlowEffect(element, options);
            break;
            
        case 'fadeIn':
            applyFadeEffect(element, 'in', options);
            break;
            
        case 'fadeOut':
            applyFadeEffect(element, 'out', options);
            break;
    }
}

// Helper functions for effects

function applyShakeEffect(element, { intensity = 5, duration = 500 } = {}) {
    if (window.TWEEN) {
        // Use TWEEN for smoother animation
        const originalPosition = { x: 0, y: 0 };
        const elementTransform = element.style.transform;
        
        new TWEEN.Tween(originalPosition)
            .to({ x: 0, y: 0 }, duration)
            .onUpdate(() => {
                const shakeX = (Math.random() - 0.5) * 2 * intensity;
                const shakeY = (Math.random() - 0.5) * 2 * intensity;
                element.style.transform = `translate(${shakeX}px, ${shakeY}px) ${elementTransform}`;
            })
            .onComplete(() => {
                element.style.transform = elementTransform;
            })
            .start();
    } else {
        // Fallback to CSS animation
        element.classList.add('shake-effect');
        element.style.setProperty('--shake-intensity', `${intensity}px`);
        
        setTimeout(() => {
            element.classList.remove('shake-effect');
        }, duration);
    }
}

function applyPulseEffect(element, { scale = 1.1, duration = 300 } = {}) {
    if (window.TWEEN) {
        // Use TWEEN for smoother animation
        const elementScale = { value: 1 };
        const originalTransform = element.style.transform;
        
        new TWEEN.Tween(elementScale)
            .to({ value: scale }, duration / 2)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                element.style.transform = `${originalTransform} scale(${elementScale.value})`;
            })
            .chain(
                new TWEEN.Tween(elementScale)
                    .to({ value: 1 }, duration / 2)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(() => {
                        element.style.transform = `${originalTransform} scale(${elementScale.value})`;
                    })
                    .onComplete(() => {
                        element.style.transform = originalTransform;
                    })
            )
            .start();
    } else {
        // Fallback to CSS animation
        element.classList.add('pulse-effect');
        element.style.setProperty('--pulse-scale', scale);
        element.style.setProperty('--pulse-duration', `${duration}ms`);
        
        setTimeout(() => {
            element.classList.remove('pulse-effect');
        }, duration);
    }
}

function applyGlowEffect(element, { color = '#fff', intensity = '0 0 10px', duration = 1000 } = {}) {
    if (window.TWEEN) {
        // Use TWEEN for smoother animation
        const glowEffect = { opacity: 0 };
        const originalShadow = element.style.boxShadow;
        
        new TWEEN.Tween(glowEffect)
            .to({ opacity: 1 }, duration / 2)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                element.style.boxShadow = `${intensity} rgba(${hexToRgb(color)}, ${glowEffect.opacity})`;
            })
            .chain(
                new TWEEN.Tween(glowEffect)
                    .to({ opacity: 0 }, duration / 2)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onUpdate(() => {
                        element.style.boxShadow = `${intensity} rgba(${hexToRgb(color)}, ${glowEffect.opacity})`;
                    })
                    .onComplete(() => {
                        element.style.boxShadow = originalShadow;
                    })
            )
            .start();
    } else {
        // Fallback to CSS animation
        element.classList.add('glow-effect');
        element.style.setProperty('--glow-color', color);
        element.style.setProperty('--glow-intensity', intensity);
        element.style.setProperty('--glow-duration', `${duration}ms`);
        
        setTimeout(() => {
            element.classList.remove('glow-effect');
        }, duration);
    }
}

function applyFadeEffect(element, direction, { duration = 500 } = {}) {
    const startOpacity = direction === 'in' ? 0 : 1;
    const endOpacity = direction === 'in' ? 1 : 0;
    
    if (window.TWEEN) {
        // Use TWEEN for smoother animation
        const fadeEffect = { opacity: startOpacity };
        
        element.style.opacity = startOpacity;
        element.style.display = 'block';
        
        new TWEEN.Tween(fadeEffect)
            .to({ opacity: endOpacity }, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                element.style.opacity = fadeEffect.opacity;
            })
            .onComplete(() => {
                if (direction === 'out') {
                    element.style.display = 'none';
                }
            })
            .start();
    } else {
        // Fallback to CSS animation
        element.classList.add(`fade-${direction}`);
        element.style.setProperty('--fade-duration', `${duration}ms`);
        
        if (direction === 'in') {
            element.style.display = 'block';
        }
        
        setTimeout(() => {
            element.classList.remove(`fade-${direction}`);
            if (direction === 'out') {
                element.style.display = 'none';
            }
        }, duration);
    }
}

// Utility function to convert hex color to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    let r = 0, g = 0, b = 0;
    
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    }
    
    return `${r}, ${g}, ${b}`;
}