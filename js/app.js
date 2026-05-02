/**
 * Stellarium Scripting API Reference - Main Application
 * 
 * This file initializes and orchestrates all components of the application.
 * It handles dynamic module loading, filtering, rendering, and user interactions.
 * 
 * Dependencies:
 * - FilterManager (filters.js)
 * - StorageManager (storage.js)
 * - Renderer (renderer.js)
 * - CategoryManager (category-manager.js)
 * - ExportUtils (export-utils.js)
 * - ModuleLoader (module-loader.js)
 * - CompatibilityUtils (compatibility.js)
 */

// Global state
let globalFunctions = [];           // Holds all loaded functions across all modules
let currentViewRefreshCallback = null;

/**
 * Copies text to clipboard
 * @param {string} text - The text to copy
 */
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text);
};

/**
 * Toggles favorite status of a function
 * @param {string} functionName - Name of the function
 */
window.toggleFavorite = function(functionName) {
    const isNowFavorite = StorageManager.toggleFavorite(functionName);
    if (currentViewRefreshCallback) {
        currentViewRefreshCallback();
    }
};

/**
 * Clears all favorite functions
 */
window.clearAllFavorites = function() {
    if (confirm('Clear all favorites?')) {
        StorageManager.clearFavorites();
        if (currentViewRefreshCallback) {
            currentViewRefreshCallback();
        }
    }
};

/**
 * Clears recent history
 */
window.clearAllRecent = function() {
    if (confirm('Clear recent history?')) {
        StorageManager.clearRecent();
        if (currentViewRefreshCallback) {
            currentViewRefreshCallback();
        }
    }
};

/**
 * Exports all functions to JSON file
 */
window.exportToJSON = function() {
    if (ExportUtils && globalFunctions.length > 0) {
        ExportUtils.exportToJSON(globalFunctions);
    }
};

/**
 * Exports all functions to CSV file
 */
window.exportToCSV = function() {
    if (ExportUtils && globalFunctions.length > 0) {
        ExportUtils.exportToCSV(globalFunctions);
    }
};

/**
 * Exports full statistics report
 */
window.exportFullStats = function() {
    if (ExportUtils && globalFunctions.length > 0) {
        ExportUtils.exportFullStats(globalFunctions, ModuleLoader.getModules());
    }
};

/**
 * Expands all example sections in the current view
 */
window.expandAll = function() {
    document.querySelectorAll('.example-section').forEach(el => {
        el.style.display = 'block';
    });
};

/**
 * Collapses all example sections
 */
window.collapseAll = function() {
    document.querySelectorAll('.example-section').forEach(el => {
        el.style.display = 'none';
    });
};

/**
 * Resets all filters and search input
 */
window.resetFilters = function() {
    if (FilterManager) {
        FilterManager.resetFilters();
        
        // Reset UI elements
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.value = '';
        
        const typeSelect = document.getElementById('typeFilter');
        if (typeSelect) typeSelect.value = 'all';
        
        const returnSelect = document.getElementById('returnFilter');
        if (returnSelect) returnSelect.value = 'all';
        
        const paramSelect = document.getElementById('paramCountFilter');
        if (paramSelect) paramSelect.value = 'all';
        
        const compatSelect = document.getElementById('compatFilter');
        if (compatSelect) compatSelect.value = 'all';
        
        // Clear active category tags
        document.querySelectorAll('.cat-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        
        if (CategoryManager) {
            CategoryManager.clearCurrentCategory();
        }
        
        refreshCurrentView();
    }
};

/**
 * Clears search text and refreshes view
 */
window.clearSearch = function() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.value = '';
        if (FilterManager) {
            FilterManager.setSearchText('');
            refreshCurrentView();
        }
    }
};

/**
 * Refreshes the currently active tab view
 */
function refreshCurrentView() {
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab) return;
    
    const tabId = activeTab.dataset.tab;
    
    // Apply filters to global functions
    const filteredFunctions = FilterManager ? FilterManager.applyFilters(globalFunctions) : globalFunctions;
    
    // Render based on active tab
    if (tabId === 'functions-tab') {
        const functionsContainer = document.getElementById('functionsContainer');
        const functionsCountDiv = document.getElementById('functionsCount');
        
        if (functionsContainer) {
            const groupedHtml = Renderer.renderFunctionsGrouped(filteredFunctions);
            functionsContainer.innerHTML = groupedHtml;
        }
        
        if (functionsCountDiv) {
            functionsCountDiv.innerHTML = `Displaying ${filteredFunctions.length} of ${globalFunctions.length} functions`;
        }
        
        // Update search results info
        const searchInfo = document.getElementById('searchResultsInfo');
        const currentFilters = FilterManager ? FilterManager.getCurrentFilters() : { searchText: '' };
        
        if (searchInfo) {
            if (currentFilters.searchText) {
                searchInfo.style.display = 'flex';
                const resultCountSpan = document.getElementById('searchResultCount');
                if (resultCountSpan) resultCountSpan.textContent = filteredFunctions.length;
            } else {
                searchInfo.style.display = 'none';
            }
        }
    } 
    else if (tabId === 'favorites-tab') {
        const favoritesContainer = document.getElementById('favoritesContainer');
        if (favoritesContainer) {
            favoritesContainer.innerHTML = Renderer.renderFavorites(globalFunctions);
        }
    } 
    else if (tabId === 'recent-tab') {
        const recentContainer = document.getElementById('recentContainer');
        if (recentContainer) {
            recentContainer.innerHTML = Renderer.renderRecent(globalFunctions);
        }
    } 
    else if (tabId === 'stats-tab') {
        const statsContainer = document.getElementById('statsContainer');
        if (statsContainer) {
            statsContainer.innerHTML = Renderer.renderStatistics(globalFunctions, ModuleLoader.getModules());
        }
    } 
    else if (tabId === 'help-tab') {
        const helpContainer = document.getElementById('helpContainer');
        if (helpContainer) {
            helpContainer.innerHTML = Renderer.renderHelp();
        }
    }
    
    // Update global stats bar
    updateStatsBar();
    
    // Update tab counts
    updateTabCounts();
}

/**
 * Updates the statistics bar at the top of the page
 */
function updateStatsBar() {
    const total = globalFunctions.length;
    const staticCount = globalFunctions.filter(f => f.type === 'static').length;
    const categories = CategoryManager ? CategoryManager.getCategories().length : 0;
    
    const statsBar = document.getElementById('statsBar');
    if (statsBar) {
        statsBar.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${total}</span>
                <span class="stat-label">Total Functions</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${staticCount}</span>
                <span class="stat-label">Static Functions</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${total - staticCount}</span>
                <span class="stat-label">Methods</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${categories}</span>
                <span class="stat-label">Categories</span>
            </div>
        `;
    }
    
    const footerTotal = document.getElementById('totalCountFooter');
    if (footerTotal) footerTotal.textContent = total;
    
    const tabFunctionsCount = document.getElementById('tab-functions-count');
    if (tabFunctionsCount) tabFunctionsCount.textContent = total;
}

/**
 * Updates favorite and recent counts in tab headers
 */
function updateTabCounts() {
    const favCount = StorageManager.getCounts().favorites;
    const recentCount = StorageManager.getCounts().recent;
    
    const favTabCount = document.getElementById('tab-favorites-count');
    if (favTabCount) favTabCount.textContent = favCount;
    
    const recentTabCount = document.getElementById('tab-recent-count');
    if (recentTabCount) recentTabCount.textContent = recentCount;
}

/**
 * Builds the module selector dropdown
 */
function buildModuleSelector() {
    const modules = ModuleLoader.getModules();
    const container = document.getElementById('moduleSelector');
    if (!container) return;
    
    let html = '<label>Module:</label><select id="moduleSelect">';
    html += '<option value="all">All Modules</option>';
    
    modules.forEach(mod => {
        html += `<option value="${mod.id}">${mod.name}</option>`;
    });
    
    html += '</select>';
    container.innerHTML = html;
    
    const moduleSelect = document.getElementById('moduleSelect');
    if (moduleSelect) {
        moduleSelect.addEventListener('change', (e) => {
            const moduleId = e.target.value;
            if (moduleId === 'all') {
                globalFunctions = window.rawFunctionsAll || [];
            } else {
                globalFunctions = (window.rawFunctionsAll || []).filter(f => f.module === moduleId);
            }
            
            if (CategoryManager) {
                CategoryManager.updateCategories(globalFunctions);
                CategoryManager.renderCategoryTags('categoryTags');
            }
            
            refreshCurrentView();
        });
    }
}

/**
 * Sets up all event listeners for UI controls
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (FilterManager) {
                FilterManager.setSearchText(e.target.value);
                refreshCurrentView();
            }
        });
    }
    
    // Type filter
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            if (FilterManager) {
                FilterManager.setTypeFilter(e.target.value);
                refreshCurrentView();
            }
        });
    }
    
    // Return type filter
    const returnFilter = document.getElementById('returnFilter');
    if (returnFilter) {
        returnFilter.addEventListener('change', (e) => {
            if (FilterManager) {
                FilterManager.setReturnFilter(e.target.value);
                refreshCurrentView();
            }
        });
    }
    
    // Parameter count filter
    const paramFilter = document.getElementById('paramCountFilter');
    if (paramFilter) {
        paramFilter.addEventListener('change', (e) => {
            if (FilterManager) {
                FilterManager.setParamFilter(e.target.value);
                refreshCurrentView();
            }
        });
    }
    
    // Compatibility filter
    const compatFilter = document.getElementById('compatFilter');
    if (compatFilter) {
        compatFilter.addEventListener('change', (e) => {
            if (FilterManager) {
                FilterManager.setCompatFilter(e.target.value);
                refreshCurrentView();
            }
        });
    }
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active-panel');
            });
            
            // Show selected tab panel
            const activePanel = document.getElementById(tabId);
            if (activePanel) activePanel.classList.add('active-panel');
            
            // Update active button state
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            refreshCurrentView();
        });
    });
    
    // Scroll to top button visibility
    window.addEventListener('scroll', () => {
        const scrollTopBtn = document.getElementById('scrollTop');
        if (scrollTopBtn) {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    });
    
    // Track recent views when clicking on function cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.function-card');
        if (card && card.dataset.funcName) {
            StorageManager.addToRecent(card.dataset.funcName);
            updateTabCounts();
        }
    });
    
    // Category filter change
    if (CategoryManager) {
        CategoryManager.onCategoryChange((category) => {
            if (FilterManager) {
                FilterManager.setCategoryFilter(category);
                refreshCurrentView();
            }
        });
    }
}

/**
 * Initializes the entire application
 */
async function init() {
    // Show loading indicator
    const functionsContainer = document.getElementById('functionsContainer');
    if (functionsContainer) {
        functionsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading modules...</p>
            </div>
        `;
    }
    
    // Load all modules dynamically
    const allFunctions = await ModuleLoader.loadAllModules((loaded, total, module) => {
        if (functionsContainer) {
            functionsContainer.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Loading ${module.name} (${loaded}/${total})...</p>
                </div>
            `;
        }
    });
    
    // Store raw data globally
    window.rawFunctionsAll = allFunctions;
    globalFunctions = allFunctions;
    
    // Update category manager with loaded functions
    if (CategoryManager) {
        CategoryManager.updateCategories(globalFunctions);
        CategoryManager.renderCategoryTags('categoryTags');
    }
    
    // Build module selector dropdown
    buildModuleSelector();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Register refresh callback for external calls
    currentViewRefreshCallback = refreshCurrentView;
    
    // Initial render
    refreshCurrentView();
    
    // Update favorite and recent counts
    updateTabCounts();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);