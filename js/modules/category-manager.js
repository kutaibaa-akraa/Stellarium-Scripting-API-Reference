/**
 * Category Manager - Handles dynamic category tags and filtering
 */

const CategoryManager = (function() {
    'use strict';
    
    let categories = [];
    let currentCategory = null;
    let categoryChangeCallbacks = [];
    
    /**
     * Update categories from loaded functions
     */
    function updateCategories(functions) {
        const categorySet = new Set();
        functions.forEach(f => {
            if (f.category) categorySet.add(f.category);
        });
        categories = Array.from(categorySet).sort();
    }
    
    /**
     * Get all categories
     */
    function getCategories() {
        return [...categories];
    }
    
    /**
     * Set current category filter
     */
    function setCurrentCategory(category) {
        currentCategory = category;
        notifyChange();
    }
    
    /**
     * Get current category
     */
    function getCurrentCategory() {
        return currentCategory;
    }
    
    /**
     * Clear current category
     */
    function clearCurrentCategory() {
        currentCategory = null;
        notifyChange();
    }
    
    /**
     * Register callback for category changes
     */
    function onCategoryChange(callback) {
        categoryChangeCallbacks.push(callback);
    }
    
    /**
     * Notify all callbacks
     */
    function notifyChange() {
        categoryChangeCallbacks.forEach(cb => cb(currentCategory));
    }
    
    /**
     * Render category tags HTML
     */
    function renderCategoryTags(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-tag';
            btn.textContent = cat;
            btn.onclick = () => {
                if (currentCategory === cat) {
                    clearCurrentCategory();
                    btn.classList.remove('active');
                } else {
                    setCurrentCategory(cat);
                    document.querySelectorAll('.cat-tag').forEach(t => t.classList.remove('active'));
                    btn.classList.add('active');
                }
            };
            container.appendChild(btn);
        });
    }
    
    return {
        updateCategories,
        getCategories,
        setCurrentCategory,
        getCurrentCategory,
        clearCurrentCategory,
        onCategoryChange,
        renderCategoryTags
    };
})();

window.CategoryManager = CategoryManager;