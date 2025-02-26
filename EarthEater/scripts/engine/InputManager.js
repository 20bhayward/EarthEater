import { GAME_STATE } from '../utils/constants.js';

export default class InputManager {
    constructor(canvas) {
        // Key states
        this.keys = {};
        this.touchState = {
            left: false,
            right: false,
            up: false,
            down: false,
            action: false,
            touchX: 0,
            touchY: 0,
            isTouching: false
        };
        
        // Menu key states for handling menu navigation
        this.menuKeyStates = {
            up: false,
            down: false,
            select: false,
            back: false
        };
        
        // Store canvas for touch controls
        this.canvas = canvas;
        
        // Add event listeners for keyboard
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Add event listeners for touch
        if (canvas) {
            canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
            canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
            canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        }
        
        // Add event listeners for gamepad
        this.hasGamepad = false;
        this.gamepad = null;
        this.setupGamepadSupport();
    }
    
    setupGamepadSupport() {
        // Listen for gamepad connections
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad);
            this.hasGamepad = true;
            this.gamepad = e.gamepad;
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected:', e.gamepad);
            this.hasGamepad = false;
            this.gamepad = null;
        });
    }
    
    handleKeyDown(event) {
        this.keys[event.code] = true;
        
        // Prevent default behavior for game control keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }
        
        // Update menu key states
        if (event.code === 'ArrowUp' || event.code === 'KeyW') {
            this.menuKeyStates.up = true;
        } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            this.menuKeyStates.down = true;
        } else if (event.code === 'Enter' || event.code === 'Space') {
            this.menuKeyStates.select = true;
        } else if (event.code === 'Escape' || event.code === 'Backspace') {
            this.menuKeyStates.back = true;
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.code] = false;
        
        // Update menu key states
        if (event.code === 'ArrowUp' || event.code === 'KeyW') {
            this.menuKeyStates.up = false;
        } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            this.menuKeyStates.down = false;
        } else if (event.code === 'Enter' || event.code === 'Space') {
            this.menuKeyStates.select = false;
        } else if (event.code === 'Escape' || event.code === 'Backspace') {
            this.menuKeyStates.back = false;
        }
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.touchState.isTouching = true;
        this.touchState.touchX = touch.clientX;
        this.touchState.touchY = touch.clientY;
        this.updateTouchControls(touch.clientX, touch.clientY);
    }
    
    handleTouchMove(event) {
        if (event.touches.length > 0) {
            event.preventDefault();
            const touch = event.touches[0];
            this.touchState.touchX = touch.clientX;
            this.touchState.touchY = touch.clientY;
            this.updateTouchControls(touch.clientX, touch.clientY);
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        this.touchState.isTouching = false;
        this.touchState.left = false;
        this.touchState.right = false;
        this.touchState.up = false;
        this.touchState.down = false;
        this.touchState.action = false;
    }
    
    updateTouchControls(x, y) {
        // For our dynamic UI, we'll use the UIManager to handle touch controls
        // This method only handles legacy/fallback touch controls
        
        // Implement virtual joystick behavior
        if (!this.canvas) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Reset state
        this.touchState.left = false;
        this.touchState.right = false;
        this.touchState.up = false;
        this.touchState.down = false;
        
        // Left/Right
        if (x < width / 3) {
            this.touchState.left = true;
        } else if (x > width * 2 / 3) {
            this.touchState.right = true;
        }
        
        // Up/Down
        if (y < height / 3) {
            this.touchState.up = true;
        } else if (y > height * 2 / 3) {
            this.touchState.down = true;
        }
        
        // Action button (center of screen)
        if (x > width / 3 && x < width * 2 / 3 && y > height / 3 && y < height * 2 / 3) {
            this.touchState.action = true;
        }
    }
    
    updateGamepadInput() {
        if (!this.hasGamepad) return;
        
        // Get the current gamepad state
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0]; // Use the first gamepad
        
        if (!gamepad) return;
        
        // D-pad
        this.gamepadDirection = {
            up: gamepad.buttons[12].pressed,
            down: gamepad.buttons[13].pressed,
            left: gamepad.buttons[14].pressed,
            right: gamepad.buttons[15].pressed
        };
        
        // Analog stick
        const deadzone = 0.2;
        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
        
        if (Math.abs(leftStickX) > deadzone) {
            this.gamepadDirection.left = leftStickX < -deadzone;
            this.gamepadDirection.right = leftStickX > deadzone;
        }
        
        if (Math.abs(leftStickY) > deadzone) {
            this.gamepadDirection.up = leftStickY < -deadzone;
            this.gamepadDirection.down = leftStickY > deadzone;
        }
        
        // Action button
        this.gamepadAction = gamepad.buttons[0].pressed;
    }
    
    update() {
        // Update gamepad input
        this.updateGamepadInput();
    }
    
    isKeyDown(code) {
        return this.keys[code] === true;
    }
    
    isLeft() {
        return this.isKeyDown('ArrowLeft') || 
               this.isKeyDown('KeyA') || 
               this.touchState.left ||
               (this.hasGamepad && this.gamepadDirection?.left);
    }
    
    isRight() {
        return this.isKeyDown('ArrowRight') || 
               this.isKeyDown('KeyD') || 
               this.touchState.right ||
               (this.hasGamepad && this.gamepadDirection?.right);
    }
    
    isUp() {
        return this.isKeyDown('ArrowUp') || 
               this.isKeyDown('KeyW') || 
               this.touchState.up ||
               (this.hasGamepad && this.gamepadDirection?.up);
    }
    
    isDown() {
        return this.isKeyDown('ArrowDown') || 
               this.isKeyDown('KeyS') || 
               this.touchState.down ||
               (this.hasGamepad && this.gamepadDirection?.down);
    }
    
    isAction() {
        return this.isKeyDown('Space') || 
               this.isKeyDown('KeyE') || 
               this.touchState.action ||
               (this.hasGamepad && this.gamepadAction);
    }
    
    isMenuUp() {
        return this.menuKeyStates.up;
    }
    
    isMenuDown() {
        return this.menuKeyStates.down;
    }
    
    isMenuSelect() {
        return this.menuKeyStates.select;
    }
    
    isMenuBack() {
        return this.menuKeyStates.back;
    }
    
    // Reset menu key states after handling them
    resetMenuKeys() {
        this.menuKeyStates.up = false;
        this.menuKeyStates.down = false;
        this.menuKeyStates.select = false;
        this.menuKeyStates.back = false;
    }
}