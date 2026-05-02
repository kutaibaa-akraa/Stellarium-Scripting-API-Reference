/**
 * Stellarium API Compatibility Utilities
 * Handles Qt5/Qt6 detection and compatibility badges
 */

const CompatibilityUtils = (function() {
    'use strict';
    
		/**
		 * Get compatibility badge HTML based on compatibility object
		 * @param {Object} compat - Compatibility object {qt5, qt6, minVersion, notes}
		 * @returns {string} HTML badge string
		 */
		function getCompatibilityBadge(compat) {
				if (!compat) {
						return '<span class="badge compat-unknown" title="Unknown compatibility - testing recommended">⚪ Unknown</span>';
				}
				
				if (compat.qt5 && compat.qt6) {
						let versionText = compat.minVersion ? ` ≥ ${compat.minVersion}` : '';
						let titleText = compat.notes || 'Works on all Stellarium versions';
						return `<span class="badge compat-both" title="${escapeHtml(titleText)}">🟢 Compatible with Qt5 + Qt6${versionText}</span>`;
				} else if (compat.qt6 && !compat.qt5) {
						let versionText = compat.minVersion ? ` ≥ ${compat.minVersion}` : '';
						let titleText = compat.notes || 'Requires Qt6';
						return `<span class="badge compat-qt6" title="${escapeHtml(titleText)}">🟠 Qt6 Only${versionText}</span>`;
				} else if (compat.qt5 && !compat.qt6) {
						return '<span class="badge compat-qt5" title="Works only on Qt5 (older versions)">🔵 Qt5 Only</span>';
				} else {
						return '<span class="badge compat-unknown" title="Unknown compatibility">⚪ Unknown</span>';
				}
		}
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    /**
     * Detect Stellarium and Qt version at runtime
     * @returns {Object} Version information
     */
    async function detectRuntimeVersion() {
        const info = {
            isQt6: false,
            hasTTS: false,
            hasColorObject: false,
            version: "unknown",
            stellariumVersion: "unknown"
        };
        
        // This will be called from within Stellarium context
        if (typeof core !== 'undefined') {
            try {
                info.stellariumVersion = core.getStelProperty("StelCore.stellariumVersion") || "unknown";
            } catch(e) {}
            
            info.hasColorObject = typeof core.color !== 'undefined';
            info.hasTTS = typeof core.say === 'function';
            info.isQt6 = info.hasColorObject || info.hasTTS || info.stellariumVersion.includes("Qt6");
        }
        
        return info;
    }
    
    return {
        getCompatibilityBadge: getCompatibilityBadge,
        escapeHtml: escapeHtml,
        detectRuntimeVersion: detectRuntimeVersion
    };
})();

// Make available globally
window.CompatibilityUtils = CompatibilityUtils;