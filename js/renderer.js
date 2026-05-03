/**
 * Renderer - HTML generation for functions display
 */

const Renderer = (function() {
    'use strict';
    
    let compatibilityUtils = window.CompatibilityUtils;
    let escapeHtml = compatibilityUtils ? compatibilityUtils.escapeHtml : (s) => s;
    let getCompatibilityBadge = compatibilityUtils ? compatibilityUtils.getCompatibilityBadge : () => '';
    
    /**
     * Generate HTML for a single function card
     */
    function renderFunctionCard(func, isFavorite) {
        const compatBadge = getCompatibilityBadge(func.compatibility);
        
        return `
            <div class="function-card" data-func-name="${escapeHtml(func.name)}" data-module="${escapeHtml(func.module || 'core')}">
                <div class="card-header">
                    <div class="function-name" onclick="copyToClipboard('${escapeHtml(func.name).replace(/'/g, "\\'")}')">${escapeHtml(func.name)}</div>
                    <div class="badges">
                        <span class="badge ${func.type === 'static' ? 'badge-static' : 'badge-method'}">${func.type === 'static' ? 'static' : 'method'}</span>
                        ${func.returnType === 'void' ? '<span class="badge badge-void">void</span>' : '<span class="badge badge-returns">returns</span>'}
                        ${compatBadge}
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleFavorite('${escapeHtml(func.name).replace(/'/g, "\\'")}')">${isFavorite ? '★' : '☆'}</button>
                    </div>
                </div>
                <div class="function-signature">${escapeHtml(func.signature)}</div>
                <div class="function-description">${escapeHtml(func.description)}</div>
                ${func.parameters && func.parameters.length > 0 ? `
                    <div class="parameters-section">
                        <strong>Parameters:</strong><br>
                        ${func.parameters.map(p => `<div class="param-item"><span class="param-name">${escapeHtml(p.name)}</span> (${escapeHtml(p.type)})${p.required ? '' : ' - optional'}${p.default ? ' = ' + escapeHtml(p.default) : ''}<br>${escapeHtml(p.description)}</div>`).join('')}
                    </div>
                ` : '<div class="parameters-section"><em>No parameters</em></div>'}
                <div class="example-section">
                    <strong>Example:</strong>
                    <pre>${escapeHtml(func.example)}</pre>
                </div>
                ${func.returnType !== 'void' ? `<div class="return-info">Returns: ${escapeHtml(func.returnDescription || func.returnType)}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * Render functions grouped by category
     */
    function renderFunctionsGrouped(functions) {
        const grouped = {};
        
        functions.forEach(f => {
            if (!grouped[f.category]) grouped[f.category] = [];
            grouped[f.category].push(f);
        });
        
        let html = '';
        const sortedCategories = Object.keys(grouped).sort();
        
        for (const cat of sortedCategories) {
            const catFunctions = grouped[cat];
            html += `
                <div class="category-section">
                    <div class="category-title">${escapeHtml(cat)} (${catFunctions.length})</div>
                    <div class="functions-grid">
                        ${catFunctions.map(f => renderFunctionCard(f, StorageManager.isFavorite(f.name))).join('')}
                    </div>
                </div>
            `;
        }
        
        return html || '<div class="loading">No functions match your criteria</div>';
    }
    
    /**
     * Render favorites tab
     */
    function renderFavorites(functions) {
        const favorites = StorageManager.getFavorites();
        const favFunctions = functions.filter(f => favorites.includes(f.name));
        
        if (favFunctions.length === 0) {
            return `
                <div class="empty-favorites">
                    <div class="empty-icon">★</div>
                    <p>No favorite functions yet</p>
                    <small>Click the star next to any function name to add it to favorites</small>
                </div>
            `;
        }
        
        return `
            <div class="quick-controls" style="margin-bottom: 20px; background: none; padding: 0;">
                <button class="quick-btn" onclick="window.clearAllFavorites()">Clear All Favorites</button>
            </div>
            <div class="functions-grid">
                ${favFunctions.map(f => renderFunctionCard(f, true)).join('')}
            </div>
        `;
    }
    
    /**
     * Render recent tab
     */
    function renderRecent(functions) {
        const recent = StorageManager.getRecent();
        const recentFunctions = functions.filter(f => recent.includes(f.name));
        
        if (recentFunctions.length === 0) {
            return `
                <div class="empty-recent">
                    <div class="empty-icon">⌛</div>
                    <p>No recently viewed functions</p>
                    <small>Functions you view will appear here automatically</small>
                </div>
            `;
        }
        
        return `
            <div class="quick-controls" style="margin-bottom: 20px; background: none; padding: 0;">
                <button class="quick-btn" onclick="window.clearAllRecent()">Clear Recent</button>
            </div>
            <div class="functions-grid">
                ${recentFunctions.map(f => renderFunctionCard(f, StorageManager.isFavorite(f.name))).join('')}
            </div>
        `;
    }
    
    /**
     * Render statistics tab
     */
    function renderStatistics(functions, modules) {
        const categories = {};
        const compatStats = { qt5: 0, qt6: 0, both: 0, unknown: 0 };
        
        functions.forEach(f => {
            categories[f.category] = (categories[f.category] || 0) + 1;
            
            const compat = f.compatibility;
            if (!compat) compatStats.unknown++;
            else if (compat.qt5 && compat.qt6) compatStats.both++;
            else if (compat.qt6) compatStats.qt6++;
            else if (compat.qt5) compatStats.qt5++;
        });
        
        let statsHtml = `
            <div class="stats-detailed-grid">
                <div class="stat-card-detailed">
                    <div class="stat-number">${functions.length}</div>
                    <div class="stat-label">Total Functions</div>
                </div>
                <div class="stat-card-detailed">
                    <div class="stat-number">${modules.length}</div>
                    <div class="stat-label">Modules Loaded</div>
                </div>
                <div class="stat-card-detailed">
                    <div class="stat-number">${Object.keys(categories).length}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-card-detailed">
                    <div class="stat-number">${compatStats.both}</div>
                    <div class="stat-label">Qt5 + Qt6</div>
                </div>
                <div class="stat-card-detailed">
                    <div class="stat-number">${compatStats.qt6}</div>
                    <div class="stat-label">Qt6 Only</div>
                </div>
            </div>
        `;
        
        // Category chart
        let chartHtml = '<h3>Distribution by Category</h3><div class="chart-bars">';
        const maxCount = Math.max(...Object.values(categories));
        for (const [cat, count] of Object.entries(categories)) {
            const percent = (count / functions.length * 100).toFixed(1);
            chartHtml += `
                <div class="chart-bar-item">
                    <div class="chart-bar-label">${escapeHtml(cat)}</div>
                    <div class="chart-bar-fill">
                        <span style="width: ${percent}%; background: #8A8C8E;">${count}</span>
                    </div>
                    <div>${percent}%</div>
                </div>
            `;
        }
        chartHtml += '</div>';
        
        return `
            <div class="stats-panel">
                <h3>Statistics</h3>
                ${statsHtml}
                ${chartHtml}
                <div class="quick-controls" style="margin-top: 20px;">
                    <button class="quick-btn" onclick="window.exportFullStats()">Export Full Statistics</button>
                    <button class="quick-btn" onclick="window.exportToCSV()">Export as CSV</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render help tab
     */
    function renderHelp() {
        return `
            <div class="help-panel">
                <h3>How to Use This Reference</h3>
                <div class="help-section">
                    <h4>Search & Filter</h4>
                    <ul>
                        <li>Use the search box to find specific functions by name, description, parameters, or examples</li>
                        <li>Filter by function type (static/method), return type (void/has return), or parameter count</li>
                        <li>Filter by Qt compatibility (Qt5, Qt6, or both)</li>
                        <li>Click on category tags to view only functions from a specific section</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Favorites & Recent</h4>
                    <ul>
                        <li>Click the star icon next to any function name to add it to your favorites</li>
                        <li>Functions you view are automatically saved to the Recent tab</li>
                        <li>Favorites and recent history are stored in your browser's local storage</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Export & Copy</h4>
                    <ul>
                        <li>Use Export JSON to download the entire database as a JSON file</li>
                        <li>Use Export CSV to download function data in CSV format</li>
                        <li>Click on any function name to copy it to clipboard</li>
                    </ul>
                </div>
                <div class="help-footer">
                    <p>Stellarium Scripting API Reference | Extracted from Stellarium source files</p>
                    <p><a href="https://stellarium.org/" target="_blank">stellarium.org</a> | Complete documentation for script developers</p>
                </div>
            </div>
        `;
    }
    
    return {
        renderFunctionCard,
        renderFunctionsGrouped,
        renderFavorites,
        renderRecent,
        renderStatistics,
        renderHelp
    };
})();

window.Renderer = Renderer;