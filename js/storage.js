/**
 * Local Storage Manager for Favorites and Recent
 */

const StorageManager = (function() {
    'use strict';
    
    let favorites = [];
    let recent = [];
    
    // Load from localStorage
    function load() {
        favorites = JSON.parse(localStorage.getItem('stellarium_api_favorites') || '[]');
        recent = JSON.parse(localStorage.getItem('stellarium_api_recent') || '[]');
    }
    
    // Save favorites
    function saveFavorites() {
        localStorage.setItem('stellarium_api_favorites', JSON.stringify(favorites));
    }
    
    // Save recent
    function saveRecent() {
        localStorage.setItem('stellarium_api_recent', JSON.stringify(recent.slice(0, 50)));
    }
    
    // Get favorites
    function getFavorites() {
        return [...favorites];
    }
    
    // Check if function is favorite
    function isFavorite(functionKey) {
        return favorites.includes(functionKey);
    }
    
    // Toggle favorite
    function toggleFavorite(functionKey) {
        if (favorites.includes(functionKey)) {
            favorites = favorites.filter(f => f !== functionKey);
        } else {
            favorites.push(functionKey);
        }
        saveFavorites();
        return isFavorite(functionKey);
    }
    
    // Clear all favorites
    function clearFavorites() {
        favorites = [];
        saveFavorites();
    }
    
    // Add to recent
    function addToRecent(functionKey) {
        recent = recent.filter(f => f !== functionKey);
        recent.unshift(functionKey);
        recent = recent.slice(0, 50);
        saveRecent();
    }
    
    // Get recent
    function getRecent() {
        return [...recent];
    }
    
    // Clear recent
    function clearRecent() {
        recent = [];
        saveRecent();
    }
    
    // Get counts
    function getCounts() {
        return {
            favorites: favorites.length,
            recent: recent.length
        };
    }
    
    // Initialize
    load();
    
    return {
        load,
        getFavorites,
        isFavorite,
        toggleFavorite,
        clearFavorites,
        addToRecent,
        getRecent,
        clearRecent,
        getCounts
    };
})();

window.StorageManager = StorageManager;