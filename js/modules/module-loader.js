/**
 * Dynamic Module Loader
 * Loads JSON files from data/ directory and manages all functions
 */

const ModuleLoader = (function() {
    'use strict';
    
    let modules = [];
    let allFunctions = [];
    let currentModuleId = 'all'; // 'all' or specific module name
    
    // Module index file path
    const MODULES_INDEX_URL = 'data/modules-index.json';
    
    /**
     * Load modules index file
     */
    async function loadModulesIndex() {
        try {
            const response = await fetch(MODULES_INDEX_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const index = await response.json();
            modules = index.modules || [];
            return modules;
        } catch (error) {
            console.warn('Could not load modules index, using default:', error);
            // Default modules if index not found
            modules = [
                { id: "StelMainScriptAPI", name: "Core API", file: "StelMainScriptAPI.json", category: "Core", order: 1 },
                { id: "AsterismMgr", name: "Asterism Manager", file: "AsterismMgr.json", category: "Modules", order: 2 }
            ];
            return modules;
        }
    }
    
    /**
     * Load a single module JSON file
     */
    async function loadModule(module) {
        try {
            const response = await fetch(`data/${module.file}`);
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${module.file}`);
            const functions = await response.json();
            
            // Add module metadata to each function
            const enhancedFunctions = functions.map(func => ({
                ...func,
                module: module.id,
                moduleName: module.name
            }));
            
            return enhancedFunctions;
        } catch (error) {
            console.error(`Failed to load module ${module.id}:`, error);
            return [];
        }
    }
    
    /**
     * Load all modules
     */
    async function loadAllModules(progressCallback) {
        await loadModulesIndex();
        
        allFunctions = [];
        let loaded = 0;
        
        for (const module of modules) {
            const functions = await loadModule(module);
            allFunctions.push(...functions);
            loaded++;
            if (progressCallback) {
                progressCallback(loaded, modules.length, module);
            }
        }
        
        return allFunctions;
    }
    
    /**
     * Get all functions (optionally filtered by module)
     */
    function getFunctions(moduleId = null) {
        if (!moduleId || moduleId === 'all') {
            return [...allFunctions];
        }
        return allFunctions.filter(f => f.module === moduleId);
    }
    
    /**
     * Get all modules list
     */
    function getModules() {
        return [...modules];
    }
    
    /**
     * Get unique categories from loaded functions
     */
    function getCategories() {
        const categories = new Set();
        allFunctions.forEach(f => {
            if (f.category) categories.add(f.category);
        });
        return Array.from(categories).sort();
    }
    
    /**
     * Get statistics by module
     */
    function getModuleStats() {
        const stats = {};
        modules.forEach(module => {
            const moduleFunctions = allFunctions.filter(f => f.module === module.id);
            stats[module.id] = {
                name: module.name,
                count: moduleFunctions.length,
                categories: new Set(moduleFunctions.map(f => f.category))
            };
        });
        return stats;
    }
    
    /**
     * Get total function count
     */
    function getTotalCount() {
        return allFunctions.length;
    }
    
    /**
     * Check if loading is complete
     */
    function isLoaded() {
        return allFunctions.length > 0;
    }
    
    return {
        loadAllModules,
        getFunctions,
        getModules,
        getCategories,
        getModuleStats,
        getTotalCount,
        isLoaded,
        modules
    };
})();

window.ModuleLoader = ModuleLoader;