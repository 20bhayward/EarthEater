import { assets } from './AssetLoader.js';
import { GAME_STATE, EVOLUTION_BRANCHES } from '../utils/constants.js';

export default class UIManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // UI state
        this.currentMenu = null;
        this.menuOptions = [];
        this.selectedOption = 0;
        this.showEvolutionTree = false;
        this.showInventory = false;
        
        // UI transition and animation
        this.fadeAlpha = 0;
        this.fadeDirection = 0; // 1: fade in, -1: fade out
        this.notifications = [];
        
        // Touch controls (for mobile)
        this.touchControlsVisible = false;
        this.touchButtons = {
            up: { x: 100, y: 400, width: 60, height: 60, pressed: false },
            down: { x: 100, y: 520, width: 60, height: 60, pressed: false },
            left: { x: 40, y: 460, width: 60, height: 60, pressed: false },
            right: { x: 160, y: 460, width: 60, height: 60, pressed: false },
            action: { x: 700, y: 460, width: 80, height: 80, pressed: false }
        };
        
        // Tooltip
        this.tooltip = null;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add mouse event listener for menu interaction
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    handleClick(e) {
        // Convert click position to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Check for menu button clicks
        if (this.isPointInRect(x, y, 10, 50, 40, 40)) {
            // Menu button clicked
            this.toggleMenu();
            return;
        }
        
        // Check for evolution button clicks
        if (this.isPointInRect(x, y, 60, 50, 40, 40)) {
            // Evolution button clicked
            this.toggleEvolutionTree();
            return;
        }
        
        // Check for inventory button clicks
        if (this.isPointInRect(x, y, 110, 50, 40, 40)) {
            // Inventory button clicked
            this.toggleInventory();
            return;
        }
        
        // Handle menu option clicks
        if (this.currentMenu) {
            // Menu is open, check for option clicks
            const menuWidth = 300;
            const menuHeight = 400;
            const menuX = (this.canvas.width - menuWidth) / 2;
            const menuY = (this.canvas.height - menuHeight) / 2;
            
            // Check if click is within menu
            if (this.isPointInRect(x, y, menuX, menuY, menuWidth, menuHeight)) {
                // Check each option
                for (let i = 0; i < this.menuOptions.length; i++) {
                    const optionY = menuY + 80 + i * 40;
                    
                    if (this.isPointInRect(x, y, menuX + 20, optionY - 20, menuWidth - 40, 40)) {
                        // Option clicked
                        this.selectOption(i);
                        return;
                    }
                }
            } else {
                // Clicked outside the menu, close it
                this.closeMenu();
            }
        }
        
        // Handle evolution tree clicks
        if (this.showEvolutionTree) {
            // Evolution tree is open, check for branch clicks
            const treeWidth = 700;
            const treeHeight = 500;
            const treeX = (this.canvas.width - treeWidth) / 2;
            const treeY = (this.canvas.height - treeHeight) / 2;
            
            // Check if click is within the tree
            if (this.isPointInRect(x, y, treeX, treeY, treeWidth, treeHeight)) {
                // Check each branch and evolution node
                this.handleEvolutionTreeClick(x, y, treeX, treeY);
            } else {
                // Clicked outside the tree, close it
                this.showEvolutionTree = false;
                this.game.resumeGame();
            }
        }
        
        // Handle inventory clicks
        if (this.showInventory) {
            // Inventory is open, check for item clicks
            const invWidth = 500;
            const invHeight = 400;
            const invX = (this.canvas.width - invWidth) / 2;
            const invY = (this.canvas.height - invHeight) / 2;
            
            // Check if click is within inventory
            if (!this.isPointInRect(x, y, invX, invY, invWidth, invHeight)) {
                // Clicked outside inventory, close it
                this.showInventory = false;
                this.game.resumeGame();
            }
        }
    }
    
    handleMouseMove(e) {
        // Convert mouse position to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Reset tooltip
        this.tooltip = null;
        
        // Check for buttons hover
        if (this.isPointInRect(x, y, 10, 50, 40, 40)) {
            this.tooltip = { text: "Main Menu", x, y };
            this.canvas.style.cursor = 'pointer';
            return;
        }
        
        if (this.isPointInRect(x, y, 60, 50, 40, 40)) {
            this.tooltip = { text: "Evolution Tree", x, y };
            this.canvas.style.cursor = 'pointer';
            return;
        }
        
        if (this.isPointInRect(x, y, 110, 50, 40, 40)) {
            this.tooltip = { text: "Inventory", x, y };
            this.canvas.style.cursor = 'pointer';
            return;
        }
        
        // Check for evolution tree hover
        if (this.showEvolutionTree) {
            // Create tooltips for evolution nodes
            const tooltipInfo = this.getEvolutionNodeUnderCursor(x, y);
            if (tooltipInfo) {
                this.tooltip = tooltipInfo;
                this.canvas.style.cursor = 'pointer';
                return;
            }
        }
        
        // Default cursor
        this.canvas.style.cursor = 'default';
    }
    
    handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        
        // Make touch controls visible on first touch
        this.touchControlsVisible = true;
        
        // Process touch as click for UI elements
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Check for touch control buttons
            for (const [key, button] of Object.entries(this.touchButtons)) {
                if (this.isPointInRect(x, y, button.x, button.y, button.width, button.height)) {
                    button.pressed = true;
                    return;
                }
            }
            
            // If no touch controls were pressed, treat as a regular click
            this.handleClick({clientX: touch.clientX, clientY: touch.clientY});
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling
        
        // Reset all buttons
        for (const button of Object.values(this.touchButtons)) {
            button.pressed = false;
        }
        
        // Check which buttons are being touched
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
            
            for (const [key, button] of Object.entries(this.touchButtons)) {
                if (this.isPointInRect(x, y, button.x, button.y, button.width, button.height)) {
                    button.pressed = true;
                }
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault(); // Prevent scrolling
        
        // Reset all buttons when touch ends
        for (const button of Object.values(this.touchButtons)) {
            button.pressed = false;
        }
    }
    
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth &&
               y >= rectY && y <= rectY + rectHeight;
    }
    
    update(deltaTime) {
        // Update fadeIn/fadeOut transitions
        if (this.fadeDirection !== 0) {
            this.fadeAlpha += this.fadeDirection * deltaTime * 2;
            
            if (this.fadeAlpha <= 0) {
                this.fadeAlpha = 0;
                this.fadeDirection = 0;
            } else if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                this.fadeDirection = 0;
            }
        }
        
        // Update notifications
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.timeRemaining -= deltaTime;
            
            if (notification.timeRemaining <= 0) {
                this.notifications.splice(i, 1);
            }
        }
        
        // Update touch button states to input manager if visible
        if (this.touchControlsVisible && this.game.inputManager) {
            this.game.inputManager.touchState.left = this.touchButtons.left.pressed;
            this.game.inputManager.touchState.right = this.touchButtons.right.pressed;
            this.game.inputManager.touchState.up = this.touchButtons.up.pressed;
            this.game.inputManager.touchState.down = this.touchButtons.down.pressed;
            this.game.inputManager.touchState.action = this.touchButtons.action.pressed;
        }
    }
    
    render(ctx) {
        if (!ctx) return;
        
        // Render HUD
        this.renderHUD(ctx);
        
        // Render notifications
        this.renderNotifications(ctx);
        
        // Render touch controls if visible
        if (this.touchControlsVisible) {
            this.renderTouchControls(ctx);
        }
        
        // Render current menu if open
        if (this.currentMenu) {
            this.renderMenu(ctx);
        }
        
        // Render evolution tree if open
        if (this.showEvolutionTree) {
            this.renderEvolutionTree(ctx);
        }
        
        // Render inventory if open
        if (this.showInventory) {
            this.renderInventory(ctx);
        }
        
        // Render tooltip if active
        if (this.tooltip) {
            this.renderTooltip(ctx);
        }
        
        // Render fade overlay
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    renderHUD(ctx) {
        // Top HUD panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 40);
        
        // Get player stats
        const player = this.game.player;
        if (!player) return;
        
        // Health bar
        this.renderBar(ctx, 160, 10, 150, 20, player.health / player.maxHealth, '#ff4444', '#aa0000', 'Health');
        
        // Hunger bar
        this.renderBar(ctx, 320, 10, 150, 20, player.hunger / player.maxHunger, '#44ff44', '#00aa00', 'Hunger');
        
        // Depth display
        const depthInMeters = Math.floor(player.y / 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Depth: ${depthInMeters}m`, 10, 25);
        
        // Money/resources display
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(`$${player.money}`, this.canvas.width - 10, 25);
        
        // Evolution info
        const evolution = player.evolutionManager.currentEvolution;
        ctx.textAlign = 'center';
        ctx.fillText(`${this.capitalizeFirstLetter(evolution.type)} (Stage ${evolution.stage})`, this.canvas.width / 2, 25);
        
        // Button icons
        this.renderButton(ctx, 10, 50, 40, 40, '≡'); // Menu
        this.renderButton(ctx, 60, 50, 40, 40, '⋇'); // Evolution
        this.renderButton(ctx, 110, 50, 40, 40, '⨧'); // Inventory
    }
    
    renderBar(ctx, x, y, width, height, fillPercent, fillColor, borderColor, label) {
        // Bar border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);
        
        // Fill
        ctx.fillStyle = fillColor;
        const fillWidth = Math.max(0, Math.min(width * fillPercent, width));
        ctx.fillRect(x, y, fillWidth, height);
        
        // Border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Label
        if (label) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + width / 2, y + height / 2 + 4);
        }
    }
    
    renderButton(ctx, x, y, width, height, icon) {
        // Button background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Button border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x + width / 2, y + height / 2);
    }
    
    renderNotifications(ctx) {
        const startY = 100;
        const padding = 10;
        
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        
        // Render each notification
        this.notifications.forEach((notification, index) => {
            // Calculate fade alpha based on remaining time
            const alpha = Math.min(1, notification.timeRemaining);
            
            // Background
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
            const textWidth = ctx.measureText(notification.text).width;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 30;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = startY + index * 40;
            
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
            
            // Text
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(notification.text, this.canvas.width / 2, boxY + boxHeight / 2 + 5);
        });
    }
    
    renderTouchControls(ctx) {
        // Render direction pad
        this.renderTouchButton(ctx, this.touchButtons.up, '↑');
        this.renderTouchButton(ctx, this.touchButtons.down, '↓');
        this.renderTouchButton(ctx, this.touchButtons.left, '←');
        this.renderTouchButton(ctx, this.touchButtons.right, '→');
        
        // Render action button
        this.renderTouchButton(ctx, this.touchButtons.action, 'Mine');
    }
    
    renderTouchButton(ctx, button, label) {
        // Button background
        ctx.fillStyle = button.pressed ? 'rgba(0, 100, 200, 0.6)' : 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Button border
        ctx.strokeStyle = button.pressed ? '#4499ff' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);
        
        // Button label
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, button.x + button.width / 2, button.y + button.height / 2);
    }
    
    renderMenu(ctx) {
        const menuWidth = 300;
        const menuHeight = 400;
        const menuX = (this.canvas.width - menuWidth) / 2;
        const menuY = (this.canvas.height - menuHeight) / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Menu background
        ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        // Menu border
        ctx.strokeStyle = '#6666aa';
        ctx.lineWidth = 3;
        ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
        
        // Menu title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentMenu, menuX + menuWidth / 2, menuY + 40);
        
        // Menu options
        ctx.font = '18px Arial';
        for (let i = 0; i < this.menuOptions.length; i++) {
            const option = this.menuOptions[i];
            const isSelected = i === this.selectedOption;
            const optionY = menuY + 80 + i * 40;
            
            // Option background if selected
            if (isSelected) {
                ctx.fillStyle = 'rgba(100, 100, 200, 0.5)';
                ctx.fillRect(menuX + 20, optionY - 20, menuWidth - 40, 40);
            }
            
            // Option text
            ctx.fillStyle = isSelected ? '#ffffff' : '#aaaaaa';
            ctx.textAlign = 'left';
            ctx.fillText(option.text, menuX + 30, optionY);
            
            // Option cost if applicable
            if (option.cost !== undefined) {
                ctx.textAlign = 'right';
                ctx.fillText(`$${option.cost}`, menuX + menuWidth - 30, optionY);
            }
        }
    }
    
    renderEvolutionTree(ctx) {
        // Get tree data
        const treeInfo = this.game.player.evolutionManager.getEvolutionTreeInfo();
        
        const treeWidth = 700;
        const treeHeight = 500;
        const treeX = (this.canvas.width - treeWidth) / 2;
        const treeY = (this.canvas.height - treeHeight) / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Tree background
        ctx.fillStyle = 'rgba(20, 40, 60, 0.9)';
        ctx.fillRect(treeX, treeY, treeWidth, treeHeight);
        
        // Tree border
        ctx.strokeStyle = '#4488aa';
        ctx.lineWidth = 3;
        ctx.strokeRect(treeX, treeY, treeWidth, treeHeight);
        
        // Tree title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Evolution Paths', treeX + treeWidth / 2, treeY + 30);
        
        // Current evolution info
        ctx.font = '18px Arial';
        ctx.fillText(
            `Current Form: ${this.capitalizeFirstLetter(treeInfo.currentEvolution.type)} (Stage ${treeInfo.currentEvolution.stage})`, 
            treeX + treeWidth / 2, 
            treeY + 60
        );
        
        // Render branches
        this.renderEvolutionBranches(ctx, treeInfo, treeX, treeY, treeWidth, treeHeight);
        
        // Close button
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✖', treeX + treeWidth - 20, treeY + 20);
    }
    
    renderEvolutionBranches(ctx, treeInfo, treeX, treeY, treeWidth, treeHeight) {
        const branchStartX = treeX + 50;
        const branchWidth = treeWidth - 100;
        const branchHeight = 100;
        const branchSpacing = 30;
        
        let currentY = treeY + 90;
        
        // Render each available branch
        for (const branchKey in treeInfo.paths) {
            // Skip unavailable branches
            if (!treeInfo.availableBranches[branchKey] && 
                branchKey !== treeInfo.currentBranch) {
                continue;
            }
            
            const branch = treeInfo.paths[branchKey];
            
            // Branch header
            const isCurrentBranch = branchKey === treeInfo.currentBranch;
            ctx.fillStyle = isCurrentBranch ? '#88ff88' : '#ffffff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(branch.name, branchStartX, currentY);
            
            currentY += 25;
            
            // Render path line
            ctx.strokeStyle = isCurrentBranch ? '#88ff88' : '#666666';
            ctx.lineWidth = isCurrentBranch ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(branchStartX, currentY);
            ctx.lineTo(branchStartX + branchWidth, currentY);
            ctx.stroke();
            
            // Render evolutions on the path
            const nodeSpacing = branchWidth / (branch.evolutions.length - 1);
            
            for (let i = 0; i < branch.evolutions.length; i++) {
                const evolution = branch.evolutions[i];
                const nodeX = branchStartX + i * nodeSpacing;
                
                // Node color based on status
                let nodeColor;
                if (evolution.current) {
                    nodeColor = '#ffff00'; // Current evolution
                } else if (evolution.unlocked) {
                    nodeColor = '#88ff88'; // Unlocked
                } else {
                    nodeColor = '#666666'; // Locked
                }
                
                // Draw node
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(nodeX, currentY, 10, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Evolution name
                ctx.fillStyle = evolution.current ? '#ffff00' : '#ffffff';
                ctx.font = evolution.current ? 'bold 14px Arial' : '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    this.capitalizeFirstLetter(evolution.type), 
                    nodeX, 
                    currentY + 25
                );
                
                // Evolution cost
                if (evolution.cost > 0) {
                    ctx.fillStyle = '#aaaaaa';
                    ctx.font = '12px Arial';
                    ctx.fillText(`$${evolution.cost}`, nodeX, currentY + 40);
                }
                
                // Store node info for hover interactions
                evolution.renderInfo = {
                    x: nodeX,
                    y: currentY,
                    radius: 10,
                    branch: branchKey
                };
            }
            
            currentY += branchHeight;
        }
        
        // Render hidden/locked branches
        let lockedBranchCount = 0;
        for (const branchKey in treeInfo.availableBranches) {
            if (!treeInfo.availableBranches[branchKey] && 
                branchKey !== treeInfo.currentBranch) {
                lockedBranchCount++;
                
                // Locked branch indication
                ctx.fillStyle = '#666666';
                ctx.font = 'italic 16px Arial';
                ctx.textAlign = 'left';
                
                if (branchKey === EVOLUTION_BRANCHES.MACHINE) {
                    ctx.fillText('??? (Find the ancient technology)', branchStartX, currentY);
                } else {
                    ctx.fillText('??? (Unknown evolution path)', branchStartX, currentY);
                }
                
                currentY += 30;
            }
        }
    }
    
    renderInventory(ctx) {
        const invWidth = 500;
        const invHeight = 400;
        const invX = (this.canvas.width - invWidth) / 2;
        const invY = (this.canvas.height - invHeight) / 2;
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Inventory background
        ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
        ctx.fillRect(invX, invY, invWidth, invHeight);
        
        // Inventory border
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 3;
        ctx.strokeRect(invX, invY, invWidth, invHeight);
        
        // Inventory title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', invX + invWidth / 2, invY + 30);
        
        // Current money
        ctx.font = '18px Arial';
        ctx.fillText(
            `Money: $${this.game.player.money}`, 
            invX + invWidth / 2, 
            invY + 60
        );
        
        // Render resources
        const resources = this.game.player.resources;
        const itemsPerRow = 5;
        const itemSize = 60;
        const itemSpacing = 20;
        const startX = invX + 50;
        const startY = invY + 100;
        
        let index = 0;
        for (const resourceType in resources) {
            const count = resources[resourceType];
            if (count <= 0) continue;
            
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const x = startX + col * (itemSize + itemSpacing);
            const y = startY + row * (itemSize + itemSpacing);
            
            // Resource background
            ctx.fillStyle = this.getResourceColor(resourceType);
            ctx.fillRect(x, y, itemSize, itemSize);
            
            // Resource border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, itemSize, itemSize);
            
            // Resource name
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.formatResourceName(resourceType), 
                x + itemSize / 2, 
                y + itemSize + 15
            );
            
            // Resource count
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(
                count.toString(), 
                x + itemSize / 2, 
                y + itemSize / 2
            );
            
            index++;
        }
        
        // Close button
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✖', invX + invWidth - 20, invY + 20);
    }
    
    renderTooltip(ctx) {
        const padding = 10;
        
        // Calculate tooltip dimensions
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(this.tooltip.text).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = 30;
        
        // Position tooltip near the mouse/touch position, but ensure it's fully on screen
        let tooltipX = this.tooltip.x + 15;
        let tooltipY = this.tooltip.y - tooltipHeight - 5;
        
        // Adjust if off screen
        if (tooltipX + tooltipWidth > this.canvas.width) {
            tooltipX = this.canvas.width - tooltipWidth - 5;
        }
        
        if (tooltipY < 0) {
            tooltipY = this.tooltip.y + 15;
        }
        
        // Tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        
        // Tooltip border
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
        
        // Tooltip text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.tooltip.text, tooltipX + padding, tooltipY + tooltipHeight / 2);
    }
    
    handleEvolutionTreeClick(x, y, treeX, treeY) {
        // Get the evolution tree data
        const treeInfo = this.game.player.evolutionManager.getEvolutionTreeInfo();
        
        // Check if clicked on a node
        for (const branchKey in treeInfo.paths) {
            const branch = treeInfo.paths[branchKey];
            
            for (const evolution of branch.evolutions) {
                // Skip if node info isn't available
                if (!evolution.renderInfo) continue;
                
                const nodeX = evolution.renderInfo.x;
                const nodeY = evolution.renderInfo.y;
                const radius = evolution.renderInfo.radius;
                
                // Check if click is within node
                const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));
                if (distance <= radius) {
                    // Node clicked - attempt to evolve if unlocked
                    if (evolution.unlocked && !evolution.current) {
                        const success = this.game.player.evolve(evolution.type);
                        
                        if (success) {
                            this.showNotification(`Evolved to ${this.capitalizeFirstLetter(evolution.type)}!`);
                            // Close the tree after evolving
                            this.showEvolutionTree = false;
                            this.game.resumeGame();
                        } else {
                            // Show error message
                            this.showNotification('Cannot evolve yet. Check requirements.');
                        }
                    }
                    return;
                }
            }
        }
        
        // Check if clicked on close button
        const closeX = treeX + 700 - 20;
        const closeY = treeY + 20;
        
        if (Math.sqrt(Math.pow(x - closeX, 2) + Math.pow(y - closeY, 2)) <= 15) {
            this.showEvolutionTree = false;
            this.game.resumeGame();
        }
    }
    
    getEvolutionNodeUnderCursor(x, y) {
        // Get the evolution tree data
        const treeInfo = this.game.player.evolutionManager.getEvolutionTreeInfo();
        
        // Check all nodes
        for (const branchKey in treeInfo.paths) {
            const branch = treeInfo.paths[branchKey];
            
            for (const evolution of branch.evolutions) {
                // Skip if node info isn't available
                if (!evolution.renderInfo) continue;
                
                const nodeX = evolution.renderInfo.x;
                const nodeY = evolution.renderInfo.y;
                const radius = evolution.renderInfo.radius;
                
                // Check if mouse is over node
                const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));
                if (distance <= radius) {
                    // Create tooltip with evolution info
                    let tooltipText = this.capitalizeFirstLetter(evolution.type);
                    
                    // Add requirements if not unlocked
                    if (!evolution.unlocked) {
                        if (evolution.requirements.depth) {
                            tooltipText += ` (Requires depth ${evolution.requirements.depth}m)`;
                        }
                        if (evolution.requirements.specialEvent === 'fuseDriller') {
                            tooltipText += ` (Requires ancient driller fusion)`;
                        }
                    }
                    
                    // Add cost
                    if (evolution.cost > 0) {
                        tooltipText += ` - Cost: $${evolution.cost}`;
                    }
                    
                    return {
                        text: tooltipText,
                        x,
                        y
                    };
                }
            }
        }
        
        return null;
    }
    
    getResourceColor(resourceType) {
        switch (resourceType) {
            case 'dirt': return '#8B4513';
            case 'clay': return '#CD853F';
            case 'coal': return '#2F4F4F';
            case 'copperOre': return '#B87333';
            case 'ironOre': return '#A19D94';
            case 'silverOre': return '#C0C0C0';
            case 'goldOre': return '#FFD700';
            case 'gemOre': return '#4169E1';
            case 'uraniumOre': return '#3CB371';
            case 'alienOre': return '#7CFC00';
            case 'crystal': return '#9370DB';
            case 'voidCrystal': return '#483D8B';
            case 'alienCrystal': return '#00FF7F';
            case 'alienArtifact': return '#FF00FF';
            default: return '#808080';
        }
    }
    
    toggleMenu() {
        if (this.currentMenu === null) {
            this.openMainMenu();
        } else {
            this.closeMenu();
        }
    }
    
    toggleEvolutionTree() {
        this.showEvolutionTree = !this.showEvolutionTree;
        
        if (this.showEvolutionTree) {
            // Close other menus
            this.currentMenu = null;
            this.showInventory = false;
            this.game.pauseGame();
        } else {
            this.game.resumeGame();
        }
    }
    
    toggleInventory() {
        this.showInventory = !this.showInventory;
        
        if (this.showInventory) {
            // Close other menus
            this.currentMenu = null;
            this.showEvolutionTree = false;
            this.game.pauseGame();
        } else {
            this.game.resumeGame();
        }
    }
    
    openMainMenu() {
        this.currentMenu = 'Main Menu';
        this.menuOptions = [
            { text: 'Resume Game', action: () => this.closeMenu() },
            { text: 'Evolution Tree', action: () => this.openEvolutionTree() },
            { text: 'Upgrade Shop', action: () => this.openUpgradeMenu() },
            { text: 'Options', action: () => this.openOptionsMenu() },
            { text: 'Help', action: () => this.openHelpMenu() }
        ];
        this.selectedOption = 0;
        this.game.pauseGame();
    }
    
    openEvolutionMenu() {
        // Get available evolutions from the evolution manager
        const availableEvolutions = this.game.player.evolutionManager.getAvailableEvolutions();
        
        if (availableEvolutions.length === 0) {
            this.showNotification('No evolutions available at this time.');
            return;
        }
        
        this.currentMenu = 'Evolution';
        this.menuOptions = availableEvolutions.map(evolution => ({
            text: this.capitalizeFirstLetter(evolution.type),
            cost: evolution.cost,
            action: () => {
                const success = this.game.player.evolve(evolution.type);
                if (success) {
                    this.showNotification(`Evolved to ${this.capitalizeFirstLetter(evolution.type)}!`);
                    this.closeMenu();
                } else {
                    this.showNotification('Cannot evolve yet. Check requirements.');
                }
            }
        }));
        
        // Add cancel option
        this.menuOptions.push({
            text: 'Cancel',
            action: () => this.openMainMenu()
        });
        
        this.selectedOption = 0;
    }
    
    openEvolutionTree() {
        this.showEvolutionTree = true;
        this.closeMenu();
    }
    
    openUpgradeMenu() {
        // TODO: Implement upgrade shop
        this.currentMenu = 'Upgrade Shop';
        this.menuOptions = [
            { text: 'Coming Soon...', action: () => {} },
            { text: 'Back', action: () => this.openMainMenu() }
        ];
        this.selectedOption = 0;
    }
    
    openOptionsMenu() {
        this.currentMenu = 'Options';
        this.menuOptions = [
            { text: 'Show Touch Controls', action: () => this.toggleTouchControls() },
            { text: 'Back', action: () => this.openMainMenu() }
        ];
        this.selectedOption = 0;
    }
    
    openHelpMenu() {
        this.currentMenu = 'Help';
        this.menuOptions = [
            { text: 'How to Play', action: () => this.showGameHelp() },
            { text: 'Controls', action: () => this.showControlsHelp() },
            { text: 'Evolution Paths', action: () => this.showEvolutionHelp() },
            { text: 'Back', action: () => this.openMainMenu() }
        ];
        this.selectedOption = 0;
    }
    
    closeMenu() {
        this.currentMenu = null;
        this.menuOptions = [];
        this.game.resumeGame();
    }
    
    selectOption(index) {
        if (index >= 0 && index < this.menuOptions.length) {
            this.selectedOption = index;
            const option = this.menuOptions[index];
            
            if (option.action) {
                option.action();
            }
        }
    }
    
    showNotification(text, duration = 3) {
        this.notifications.push({
            text,
            timeRemaining: duration
        });
    }
    
    toggleTouchControls() {
        this.touchControlsVisible = !this.touchControlsVisible;
        this.showNotification(`Touch controls ${this.touchControlsVisible ? 'enabled' : 'disabled'}`);
    }
    
    showGameHelp() {
        // TODO: Implement game help screen
        this.showNotification('Help coming soon...');
    }
    
    showControlsHelp() {
        // TODO: Implement controls help screen
        this.showNotification('Controls help coming soon...');
    }
    
    showEvolutionHelp() {
        // TODO: Implement evolution paths help screen
        this.showEvolutionTree = true;
        this.closeMenu();
    }
    
    // Helper methods
    capitalizeFirstLetter(string) {
        if (!string) return '';
        // Handle camelCase (e.g., "giantWorm" -> "Giant Worm")
        const result = string.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    formatResourceName(resourceType) {
        const name = resourceType.replace(/([A-Z])/g, ' $1');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
}