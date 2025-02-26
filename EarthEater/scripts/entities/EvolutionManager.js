import { EVOLUTION_BRANCHES } from '../utils/constants.js';

export class EvolutionManager {
    constructor(player) {
        this.player = player;
        
        // Evolution state
        this.currentEvolution = {
            type: 'larva',
            stage: 1,
            branch: null
        };
        
        this.currentBranch = null;
        
        // Available branches (some need to be unlocked)
        this.availableBranches = {
            [EVOLUTION_BRANCHES.WORM]: true,      // Worm path is available by default
            [EVOLUTION_BRANCHES.BROOD]: true,     // Brood path is available by default
            [EVOLUTION_BRANCHES.MACHINE]: false   // Machine path requires finding the driller
        };
        
        // Evolution tiers
        this.evolutionPaths = {
            // Worm path - The Tunneler
            [EVOLUTION_BRANCHES.WORM]: [
                { type: 'larva', stage: 1, cost: 0, requirements: {} },
                { type: 'worm', stage: 2, cost: 100, requirements: { depth: 50 } },
                { type: 'giantWorm', stage: 3, cost: 300, requirements: { depth: 150 } },
                { type: 'behemothWorm', stage: 4, cost: 700, requirements: { depth: 250 } },
                { type: 'elderWorm', stage: 5, cost: 1500, requirements: { depth: 350 } },
                { type: 'wormGod', stage: 6, cost: 3000, requirements: { depth: 450 } }
            ],
            
            // Brood path - The Swarm Queen
            [EVOLUTION_BRANCHES.BROOD]: [
                { type: 'larva', stage: 1, cost: 0, requirements: {} },
                { type: 'broodMother', stage: 2, cost: 100, requirements: { depth: 50 } },
                { type: 'hiveMind', stage: 3, cost: 300, requirements: { depth: 150 } },
                { type: 'swarmQueen', stage: 4, cost: 700, requirements: { depth: 250 } },
                { type: 'broodEmpress', stage: 5, cost: 2000, requirements: { depth: 350 } }
            ],
            
            // Machine path - The Technological Terror
            [EVOLUTION_BRANCHES.MACHINE]: [
                { type: 'larva', stage: 1, cost: 0, requirements: {} },
                { type: 'drillerFused', stage: 2, cost: 0, requirements: { specialEvent: 'fuseDriller' } },
                { type: 'mechAlien', stage: 3, cost: 300, requirements: { depth: 200 } },
                { type: 'harvestMech', stage: 4, cost: 800, requirements: { depth: 300 } },
                { type: 'worldEater', stage: 5, cost: 2000, requirements: { depth: 400 } }
            ]
        };
    }
    
    // Evolve the player to next stage if requirements are met
    evolve(targetType) {
        // If no specific target, evolve to next stage in current branch
        if (!targetType && this.currentBranch) {
            const currentIndex = this.evolutionPaths[this.currentBranch].findIndex(
                e => e.type === this.currentEvolution.type
            );
            
            if (currentIndex >= 0 && currentIndex < this.evolutionPaths[this.currentBranch].length - 1) {
                const nextEvolution = this.evolutionPaths[this.currentBranch][currentIndex + 1];
                return this.evolveTo(nextEvolution);
            }
            return false;
        }
        
        // Find the specific evolution target across all branches
        for (const branch in this.evolutionPaths) {
            const evolution = this.evolutionPaths[branch].find(e => e.type === targetType);
            if (evolution) {
                return this.evolveTo(evolution, branch);
            }
        }
        
        return false;
    }
    
    // Evolve to a specific evolution if requirements are met
    evolveTo(evolution, branch) {
        // Check if we can afford it
        if (this.player.money < evolution.cost) {
            console.log(`Not enough resources to evolve! Need ${evolution.cost}`);
            return false;
        }
        
        // Check depth requirement
        if (evolution.requirements.depth && 
            this.player.y / 32 < evolution.requirements.depth) {
            console.log(`Need to reach depth ${evolution.requirements.depth}m to evolve!`);
            return false;
        }
        
        // Check special event requirements
        if (evolution.requirements.specialEvent) {
            // These are handled elsewhere and would have already triggered this evolution
            if (evolution.requirements.specialEvent === 'fuseDriller' && 
                !this.player.hasFusedWithDriller) {
                console.log('Need to fuse with the ancient driller first!');
                return false;
            }
        }
        
        // If this is first evolution in a branch, set the branch
        if (evolution.stage === 2) {
            this.currentBranch = branch;
        }
        
        // Apply the evolution
        this.currentEvolution = { ...evolution };
        
        // Deduct cost
        this.player.money -= evolution.cost;
        
        // Update player capabilities based on new evolution
        return true;
    }
    
    // Unlock a specific evolution branch
    unlockBranch(branch) {
        if (this.availableBranches[branch] !== undefined) {
            this.availableBranches[branch] = true;
            return true;
        }
        return false;
    }
    
    // Trigger a special evolution based on game events
    triggerSpecialEvolution(eventType) {
        if (eventType === 'fuseDriller') {
            // Find the drillerFused evolution
            const drillerEvolution = this.evolutionPaths[EVOLUTION_BRANCHES.MACHINE].find(
                e => e.type === 'drillerFused'
            );
            
            if (drillerEvolution) {
                this.evolveTo(drillerEvolution, EVOLUTION_BRANCHES.MACHINE);
                return true;
            }
        }
        return false;
    }
    
    // Get available evolutions for the current stage
    getAvailableEvolutions() {
        const available = [];
        
        // If we haven't chosen a branch yet, show first evolution of each available branch
        if (!this.currentBranch) {
            for (const branch in this.availableBranches) {
                if (this.availableBranches[branch]) {
                    // Get the first evolution (stage 2) for this branch
                    const firstEvolution = this.evolutionPaths[branch].find(e => e.stage === 2);
                    if (firstEvolution) {
                        available.push({
                            ...firstEvolution,
                            branch
                        });
                    }
                }
            }
        } else {
            // We're already on a branch, get the next evolution if available
            const currentIndex = this.evolutionPaths[this.currentBranch].findIndex(
                e => e.type === this.currentEvolution.type
            );
            
            if (currentIndex >= 0 && currentIndex < this.evolutionPaths[this.currentBranch].length - 1) {
                const nextEvolution = this.evolutionPaths[this.currentBranch][currentIndex + 1];
                available.push({
                    ...nextEvolution,
                    branch: this.currentBranch
                });
            }
        }
        
        return available;
    }
    
    // Get the capabilities of the current evolution
    getCurrentCapabilities() {
        const capabilities = {
            // Mining capabilities
            digPower: 1.0,
            specialMining: [],
            
            // Movement capabilities
            canMoveThrough: (tile) => !tile.solid,  // Default: can't move through solid blocks
            maxSpeed: 1.0,
            
            // Resistances and vulnerabilities
            resistances: [],
            vulnerabilities: [],
            
            // Special abilities
            specialAbilities: [],
            
            // Description for UI
            description: "A small alien larva. Basic digging and movement abilities."
        };
        
        // Apply evolution-specific capabilities
        switch (this.currentEvolution.type) {
            // WORM PATH
            case 'worm':
                capabilities.digPower = 1.5;
                capabilities.description = "A burrowing worm. Improved digging capabilities, can burrow through soft terrain faster.";
                break;
                
            case 'giantWorm':
                capabilities.digPower = 2.0;
                capabilities.specialMining.push('rock');
                capabilities.resistances.push('water');
                capabilities.description = "A massive worm. Can now break through rocks and resist water damage.";
                break;
                
            case 'behemothWorm':
                capabilities.digPower = 2.5;
                capabilities.specialMining.push('rock', 'hardStone');
                capabilities.resistances.push('water');
                capabilities.specialAbilities.push('earthShake');
                capabilities.description = "A behemoth of the underground. Can break hard stone and cause earth-shaking tremors.";
                break;
                
            case 'elderWorm':
                capabilities.digPower = 3.0;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian');
                capabilities.resistances.push('water', 'gas');
                capabilities.specialAbilities.push('earthShake', 'burrowCharge');
                capabilities.description = "An ancient worm with incredible power. Can drill through even obsidian and is resistant to gas.";
                break;
                
            case 'wormGod':
                capabilities.digPower = 4.0;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian', 'alienRock');
                capabilities.resistances.push('water', 'gas', 'lava');
                capabilities.specialAbilities.push('earthShake', 'burrowCharge', 'devourTerrain');
                capabilities.canMoveThrough = (tile) => tile.type !== 'boundary'; // Can move through almost anything
                capabilities.description = "The God of Worms. Nearly unstoppable, can devour almost any terrain and resists all environmental hazards.";
                break;
                
            // BROOD PATH
            case 'broodMother':
                capabilities.digPower = 1.2;
                capabilities.specialAbilities.push('spawnFollowers');
                capabilities.description = "A reproductive alien that can spawn small worker drones to assist in mining.";
                break;
                
            case 'hiveMind':
                capabilities.digPower = 1.3;
                capabilities.specialAbilities.push('spawnFollowers', 'commandFollowers');
                capabilities.description = "Can mentally control numerous worker drones to mine and collect resources efficiently.";
                break;
                
            case 'swarmQueen':
                capabilities.digPower = 1.4;
                capabilities.specialMining.push('rock');
                capabilities.specialAbilities.push('spawnFollowers', 'commandFollowers', 'upgradeFollowers');
                capabilities.description = "Commands a large swarm of specialized drones that can tackle even harder materials.";
                break;
                
            case 'broodEmpress':
                capabilities.digPower = 1.5;
                capabilities.specialMining.push('rock', 'hardStone');
                capabilities.resistances.push('gas');
                capabilities.specialAbilities.push('spawnFollowers', 'commandFollowers', 'upgradeFollowers', 'collectiveIntelligence');
                capabilities.description = "An empress of the hive with enhanced mental powers. The brood can now work in perfect harmony.";
                break;
                
            case 'broodQueen':
                capabilities.digPower = 1.7;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian');
                capabilities.resistances.push('gas', 'water');
                capabilities.specialAbilities.push('spawnFollowers', 'commandFollowers', 'upgradeFollowers', 'collectiveIntelligence', 'hiveDominance');
                capabilities.description = "The ultimate hive queen. Commands a vast army of specialized drones that can conquer any challenge.";
                break;
                
            // MACHINE PATH
            case 'drillerFused':
                capabilities.digPower = 1.8;
                capabilities.specialMining.push('rock');
                capabilities.vulnerabilities.push('water');
                capabilities.description = "Fused with ancient drilling technology. Enhanced mining ability but vulnerable to water damage.";
                break;
                
            case 'mechAlien':
                capabilities.digPower = 2.2;
                capabilities.specialMining.push('rock', 'hardStone');
                capabilities.vulnerabilities.push('water');
                capabilities.resistances.push('gas');
                capabilities.specialAbilities.push('powerDrill');
                capabilities.description = "Half alien, half machine. Powerful drilling capabilities but still vulnerable to water.";
                break;
                
            case 'harvestMech':
                capabilities.digPower = 2.6;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian');
                capabilities.vulnerabilities.push('water');
                capabilities.resistances.push('gas', 'lava');
                capabilities.specialAbilities.push('powerDrill', 'overcharge');
                capabilities.description = "A harvesting machine with advanced tech. Nearly immune to heat but water can still short-circuit systems.";
                break;
                
            case 'worldEater':
                capabilities.digPower = 3.2;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian', 'alienRock');
                capabilities.resistances.push('gas', 'lava');
                capabilities.specialAbilities.push('powerDrill', 'overcharge', 'beamDrill');
                capabilities.description = "A terrifying machine that can consume entire landscapes. Water resistant seals have been installed.";
                break;
                
            case 'machineGod':
                capabilities.digPower = 4.0;
                capabilities.specialMining.push('rock', 'hardStone', 'obsidian', 'alienRock');
                capabilities.resistances.push('gas', 'lava', 'water');
                capabilities.specialAbilities.push('powerDrill', 'overcharge', 'beamDrill', 'matterDisintegration');
                capabilities.description = "The perfect union of biology and technology. Can disintegrate matter at the atomic level.";
                break;
                
            // BASE FORM
            default: // larva
                capabilities.digPower = 1.0;
                capabilities.vulnerabilities.push('water');
                capabilities.description = "A small alien larva. Basic digging and movement abilities.";
                break;
        }
        
        return capabilities;
    }
    
    // Get information about evolution paths for UI display
    getEvolutionTreeInfo() {
        const treeInfo = {
            currentEvolution: this.currentEvolution,
            currentBranch: this.currentBranch,
            availableBranches: { ...this.availableBranches },
            paths: {}
        };
        
        // Add paths info
        for (const branch in this.evolutionPaths) {
            treeInfo.paths[branch] = {
                name: this.getBranchName(branch),
                evolutions: this.evolutionPaths[branch].map(evo => ({
                    type: evo.type,
                    stage: evo.stage,
                    cost: evo.cost,
                    requirements: { ...evo.requirements },
                    current: evo.type === this.currentEvolution.type,
                    unlocked: this.isEvolutionUnlocked(evo, branch)
                }))
            };
        }
        
        return treeInfo;
    }
    
    // Helper function to get branch display name
    getBranchName(branch) {
        switch(branch) {
            case EVOLUTION_BRANCHES.WORM: return "Worm God Path";
            case EVOLUTION_BRANCHES.BROOD: return "Brood Queen Path";
            case EVOLUTION_BRANCHES.MACHINE: return "Machine God Path";
            default: return "Unknown Path";
        }
    }
    
    // Check if an evolution is unlocked
    isEvolutionUnlocked(evolution, branch) {
        // First, check if the branch is available
        if (!this.availableBranches[branch]) {
            return false;
        }
        
        // If we're already on this branch or haven't selected a branch
        if (this.currentBranch === branch || !this.currentBranch) {
            // Check stage progression
            if (evolution.stage === 1) return true; // Larva is always unlocked
            
            // If it's the first evolution in a branch
            if (evolution.stage === 2) {
                // Check depth requirement
                return !evolution.requirements.depth || 
                       (this.player.y / 32 >= evolution.requirements.depth);
            }
            
            // For higher evolutions, must have previous stage
            const prevEvolution = this.evolutionPaths[branch].find(e => e.stage === evolution.stage - 1);
            if (!prevEvolution) return false;
            
            return this.currentEvolution.type === prevEvolution.type &&
                   (!evolution.requirements.depth || this.player.y / 32 >= evolution.requirements.depth);
        }
        
        return false;
    }
}