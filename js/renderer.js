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
 * Render help tab with comprehensive module documentation
 */
function renderHelp() {
    return `
        <div class="help-panel">
            <h3><i class="fas fa-book"></i> Stellarium Scripting API - Complete Reference</h3>
            
            <!-- Introduction Section -->
            <div class="help-section">
                <h4><i class="fas fa-info-circle"></i> Introduction</h4>
                <p>Since version 0.10.1, Stellarium includes a scripting feature based on the Qt Scripting Engine. This makes it possible to write small programs within Stellarium to produce presentations, set up custom configurations, and to automate repetitive tasks.</p>
                <p>The core scripting language is ECMAScript, giving users access to all basic ECMAScript language features such as flow control, variables, string manipulation, and more. Interaction with Stellarium-specific features is done via a collection of objects which represent components of Stellarium itself.</p>
            </div>
            
            <!-- Core API Access -->
            <div class="help-section">
                <h4><i class="fas fa-cube"></i> Core API (StelMainScriptAPI)</h4>
                <p>The public slots in the class <strong>StelMainScriptAPI</strong> are available via an object named <code>core</code>. This gives access to fundamental Stellarium operations.</p>
                <div class="example-box">
                    <strong>Example:</strong>
                    <pre>core.wait(3);           // Wait for 3 seconds
core.debug("message");   // Print debug message
core.clear("natural");   // Clear display</pre>
                </div>
            </div>
            
            <!-- How to Use This Reference -->
            <div class="help-section">
                <h4><i class="fas fa-search"></i> Search & Filter</h4>
                <ul>
                    <li>Use the search box to find specific functions by <strong>name, description, parameters, or examples</strong></li>
                    <li>Filter by function type (<strong>static/method</strong>), return type (<strong>void/has return</strong>), or parameter count</li>
                    <li>Filter by <strong>Qt compatibility</strong> (Qt5, Qt6, or both)</li>
                    <li>Click on <strong>category tags</strong> to view only functions from a specific section</li>
                    <li>Use the <strong>Module dropdown</strong> to filter functions by their source module</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4><i class="fas fa-star"></i> Favorites & Recent</h4>
                <ul>
                    <li>Click the <i class="fas fa-star" style="color: #D4AF37;"></i> star icon next to any function name to add it to your <strong>favorites</strong></li>
                    <li>Functions you view are automatically saved to the <strong>Recent tab</strong></li>
                    <li>Favorites and recent history are stored in your browser's <strong>local storage</strong></li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4><i class="fas fa-download"></i> Export & Copy</h4>
                <ul>
                    <li>Use <strong>Export JSON</strong> to download the entire database as a JSON file</li>
                    <li>Use <strong>Export CSV</strong> to download function data in CSV format (compatible with Excel)</li>
                    <li>Click on any <strong>function name</strong> to copy it to clipboard</li>
                    <li>Use <strong>Export Full Statistics</strong> from the Statistics tab for detailed analysis</li>
                </ul>
            </div>
            
            <!-- Script Console -->
            <div class="help-section">
                <h4><i class="fas fa-terminal"></i> Script Console</h4>
                <p>It is possible to open, edit, run, and save scripts using the script console window. To toggle the script console, <strong>press F12</strong>. The script console also provides an output window in which script debugging output is visible.</p>
                <p><em>Note: The Script Console is a build-time option. It has been enabled by default since version 0.10.5.</em></p>
            </div>
            
            <!-- Includes Mechanism -->
            <div class="help-section">
                <h4><i class="fas fa-file-import"></i> Includes</h4>
                <p>Stellarium provides a mechanism for splitting scripts into different files. Typical functions or lists of variables can be stored in separate <code>.inc</code> files and used within scripts through the <code>include()</code> command:</p>
                <div class="example-box">
                    <pre>include("common_objects.inc");</pre>
                </div>
                <p><em>Detailed examples can be found in the Constellations Tour script.</em></p>
            </div>
            
            <!-- Core StelModule Classes -->
            <div class="help-section">
                <h4><i class="fas fa-puzzle-piece"></i> Core StelModule Classes</h4>
                <p>The public slots for each of the following classes are available in the scripting engine via <strong>an object with the same name as the class</strong>. All of these (except StelSkyDrawer) are StelModule classes:</p>
                
                <div class="modules-grid">
                    <div class="module-card">
                        <strong><i class="fas fa-star"></i> AsterismMgr</strong>
                        <p>Manages asterisms (star patterns) display and configuration</p>
                        <pre>AsterismMgr.setFlagLines(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-shapes"></i> ConstellationMgr</strong>
                        <p>Controls constellation display, boundaries, and artistic representations</p>
                        <pre>ConstellationMgr.setFlagLines(true);
ConstellationMgr.setFlagBoundaries(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-map-marker-alt"></i> CustomObjectMgr</strong>
                        <p>Manages user-defined custom sky objects/markers</p>
                        <pre>CustomObjectMgr.addCustomObject(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-highlighter"></i> HighlightMgr</strong>
                        <p>Controls highlighting of specific sky objects</p>
                        <pre>HighlightMgr.highlightObject(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-border-all"></i> GridLinesMgr</strong>
                        <p>Manages celestial grid lines (equatorial, azimuthal, etc.)</p>
                        <pre>GridLinesMgr.setFlagEquatorGrid(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-tags"></i> LabelMgr</strong>
                        <p>Controls text labels displayed on screen</p>
                        <pre>LabelMgr.labelScreen("Hello", 200, 200,
    true, 20, "#ff0000");
LabelMgr.deleteAllLabels();</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-thumbtack"></i> MarkerMgr</strong>
                        <p>Manages markers placed on celestial objects</p>
                        <pre>MarkerMgr.addMarker(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-mountain"></i> LandscapeMgr</strong>
                        <p>Controls landscape, atmosphere, and ground rendering</p>
                        <pre>LandscapeMgr.setFlagAtmosphere(true);
LandscapeMgr.setFlagGround(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-meteor"></i> SporadicMeteorMgr</strong>
                        <p>Controls sporadic meteor display and frequency</p>
                        <pre>SporadicMeteorMgr.setZHR(10);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-cloud"></i> NebulaMgr</strong>
                        <p>Manages nebula and deep-sky object display</p>
                        <pre>NebulaMgr.setFlagHints(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-image"></i> ScreenImageMgr</strong>
                        <p>Controls images displayed on the screen overlay</p>
                        <pre>ScreenImageMgr.insertImage(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-sun"></i> SolarSystem</strong>
                        <p>Manages solar system objects (planets, moons, etc.)</p>
                        <pre>SolarSystem.setFlagPlanets(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-star-of-life"></i> StarMgr</strong>
                        <p>Controls star display, magnitude limits, and colors</p>
                        <pre>StarMgr.setFlagStars(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-bolt"></i> StelActionMgr</strong>
                        <p>Executes Stellarium actions programmatically</p>
                        <pre>StelActionMgr.pushAction(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-volume-up"></i> StelAudioMgr</strong>
                        <p>Controls audio playback within Stellarium</p>
                        <pre>StelAudioMgr.playSound(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-video"></i> StelVideoMgr</strong>
                        <p>Manages video playback and display</p>
                        <pre>StelVideoMgr.playVideo(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-arrows-alt"></i> StelMovementMgr</strong>
                        <p>Controls view movement, zoom, and orientation</p>
                        <pre>StelMovementMgr.zoomTo(120, 1);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-paint-brush"></i> StelSkyDrawer</strong>
                        <p>Manages sky rendering parameters (not a StelModule)</p>
                        <pre>StelSkyDrawer.setMaxLuminance(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-layer-group"></i> StelSkyLayerMgr</strong>
                        <p>Controls sky background layers and images</p>
                        <pre>StelSkyLayerMgr.insertLayer(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-map-pin"></i> SpecialMarkersMgr</strong>
                        <p>Manages special marker display on the sky</p>
                        <pre>SpecialMarkersMgr.setFlagMarkers(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-water"></i> MilkyWay</strong>
                        <p>Controls Milky Way rendering and intensity</p>
                        <pre>MilkyWay.setIntensity(2.0);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-moon"></i> ZodiacalLight</strong>
                        <p>Controls zodiacal light rendering</p>
                        <pre>ZodiacalLight.setFlag(true);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-globe"></i> HipsMgr</strong>
                        <p>Manages HiPS (Hierarchical Progressive Survey) sky surveys</p>
                        <pre>HipsMgr.loadSurvey(...);</pre>
                    </div>
                    
                    <div class="module-card">
                        <strong><i class="fas fa-font"></i> NomenclatureMgr</strong>
                        <p>Controls display of planetary nomenclature labels</p>
                        <pre>NomenclatureMgr.setFlagNomenclature(true);</pre>
                    </div>
                </div>
            </div>
            
            <!-- Plugin Classes -->
            <div class="help-section">
                <h4><i class="fas fa-plug"></i> Plugin Classes</h4>
                <p>The public slots for the following plugin classes are also available in the scripting engine:</p>
                
                <div class="modules-grid plugins-grid">
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-eye"></i> Oculars</strong>
                        <p>Simulates telescope/binocular eyepiece views</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-satellite"></i> Satellites</strong>
                        <p>Displays and tracks artificial satellites</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-dot-circle"></i> Quasars</strong>
                        <p>Displays quasar catalog objects</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-circle"></i> Pulsars</strong>
                        <p>Displays pulsar catalog objects</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-globe-americas"></i> Exoplanets</strong>
                        <p>Displays known exoplanet systems</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-chart-line"></i> Observability</strong>
                        <p>Analyzes object observability conditions</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-clock"></i> EquationOfTime</strong>
                        <p>Displays equation of time data</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-anchor"></i> NavStars</strong>
                        <p>Displays navigational stars catalog</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-meteor"></i> MeteorShowers</strong>
                        <p>Displays meteor shower radiants (via MeteorShowersMgr)</p>
                        <pre>MeteorShowers.setZHR(100);</pre>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-monument"></i> ArchaeoLines</strong>
                        <p>Displays archaeoastronomical alignment lines</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-calendar-alt"></i> Calendars</strong>
                        <p>Displays various calendar system overlays</p>
                    </div>
                    
                    <div class="module-card plugin-card">
                        <strong><i class="fas fa-telescope"></i> TelescopeControl</strong>
                        <p>Controls connected telescopes</p>
                    </div>
                </div>
            </div>
            
            <!-- Minimal Script Example -->
            <div class="help-section">
                <h4><i class="fas fa-code"></i> Minimal Script Example</h4>
                <p>This script prints "Hello Universe" in the Script Console output window:</p>
                <div class="example-box">
                    <pre>core.debug("Hello Universe");</pre>
                </div>
            </div>
            
            <!-- Using a StelModule Example -->
            <div class="help-section">
                <h4><i class="fas fa-cogs"></i> Using a StelModule Example</h4>
                <p>This script uses the LabelMgr module to display "Hello Universe" in white on the screen for 3 seconds, then clears all labels:</p>
                <div class="example-box">
                    <pre>LabelMgr.labelScreen("Hello Universe", 200, 200, true, 20, "#ff0000");
core.wait(3);
LabelMgr.deleteAllLabels();</pre>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="help-footer">
                <p><i class="fas fa-copyright"></i> Stellarium Scripting API Reference | Extracted from Stellarium source files</p>
                <p><a href="https://stellarium.org/" target="_blank"><i class="fas fa-external-link-alt"></i> stellarium.org</a> | Complete documentation for script developers</p>
                <p style="margin-top: 10px;"><small>Generated based on Stellarium official documentation. Best source of examples: <code>scripts</code> sub-directory of the main Stellarium source tree. Script files end in <code>.ssc</code> and <code>.inc</code>.</small></p>
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