/**
 * Filter Manager for functions
 */

const FilterManager = (function() {
    'use strict';
    
    let currentFilters = {
        searchText: '',
        categoryFilter: null,
        typeFilter: 'all',
        returnFilter: 'all',
        paramFilter: 'all',
        compatFilter: 'all'
    };
    
    let filterCallbacks = [];
    
    // Register callback for filter changes
    function onFilterChange(callback) {
        filterCallbacks.push(callback);
    }
    
    // Notify all callbacks
    function notifyChange() {
        filterCallbacks.forEach(cb => cb(currentFilters));
    }
    
    // Set search text
    function setSearchText(text) {
        currentFilters.searchText = text.toLowerCase();
        notifyChange();
    }
    
    // Set category filter
    function setCategoryFilter(category) {
        currentFilters.categoryFilter = category;
        notifyChange();
    }
    
    // Set type filter
    function setTypeFilter(type) {
        currentFilters.typeFilter = type;
        notifyChange();
    }
    
    // Set return filter
    function setReturnFilter(returnType) {
        currentFilters.returnFilter = returnType;
        notifyChange();
    }
    
    // Set param count filter
    function setParamFilter(paramCount) {
        currentFilters.paramFilter = paramCount;
        notifyChange();
    }
    
    // Set compatibility filter
    function setCompatFilter(compat) {
        currentFilters.compatFilter = compat;
        notifyChange();
    }
    
    // Reset all filters
    function resetFilters() {
        currentFilters = {
            searchText: '',
            categoryFilter: null,
            typeFilter: 'all',
            returnFilter: 'all',
            paramFilter: 'all',
            compatFilter: 'all'
        };
        notifyChange();
    }
    
    // Apply filters to functions array
    function applyFilters(functions) {
        let filtered = [...functions];
        
        // Search text filter
        if (currentFilters.searchText) {
            const search = currentFilters.searchText;
            filtered = filtered.filter(f => 
                f.name.toLowerCase().includes(search) ||
                f.description.toLowerCase().includes(search) ||
                f.signature.toLowerCase().includes(search) ||
                (f.example && f.example.toLowerCase().includes(search)) ||
                f.parameters.some(p => p.name.toLowerCase().includes(search))
            );
        }
        
        // Category filter
        if (currentFilters.categoryFilter) {
            filtered = filtered.filter(f => f.category === currentFilters.categoryFilter);
        }
        
        // Type filter (static/method)
        if (currentFilters.typeFilter !== 'all') {
            filtered = filtered.filter(f => f.type === currentFilters.typeFilter);
        }
        
        // Return type filter
        if (currentFilters.returnFilter !== 'all') {
            if (currentFilters.returnFilter === 'void') {
                filtered = filtered.filter(f => f.returnType === 'void');
            } else {
                filtered = filtered.filter(f => f.returnType !== 'void');
            }
        }
        
        // Parameter count filter
        if (currentFilters.paramFilter !== 'all') {
            if (currentFilters.paramFilter === '0') {
                filtered = filtered.filter(f => f.parameters.length === 0);
            } else if (currentFilters.paramFilter === '1') {
                filtered = filtered.filter(f => f.parameters.length === 1);
            } else if (currentFilters.paramFilter === '2') {
                filtered = filtered.filter(f => f.parameters.length === 2);
            } else if (currentFilters.paramFilter === '3+') {
                filtered = filtered.filter(f => f.parameters.length >= 3);
            }
        }
        
        // Compatibility filter
        if (currentFilters.compatFilter !== 'all') {
            filtered = filtered.filter(f => {
                const compat = f.compatibility;
                if (!compat) return currentFilters.compatFilter === 'unknown';
                if (currentFilters.compatFilter === 'qt5') return compat.qt5 === true;
                if (currentFilters.compatFilter === 'qt6') return compat.qt6 === true;
                if (currentFilters.compatFilter === 'both') return compat.qt5 && compat.qt6;
                if (currentFilters.compatFilter === 'unknown') return !compat;
                return true;
            });
        }
        
        return filtered;
    }
    
    // Get current filters
    function getCurrentFilters() {
        return { ...currentFilters };
    }
    
    return {
        onFilterChange,
        setSearchText,
        setCategoryFilter,
        setTypeFilter,
        setReturnFilter,
        setParamFilter,
        setCompatFilter,
        resetFilters,
        applyFilters,
        getCurrentFilters
    };
})();

window.FilterManager = FilterManager;