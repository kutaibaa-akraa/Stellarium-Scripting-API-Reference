/**
 * Export Utilities - JSON, CSV export functions
 */

const ExportUtils = (function() {
    'use strict';
    
    /**
     * Export functions to JSON file
     */
    function exportToJSON(functions, filename = 'stellarium_api_functions.json') {
        const data = JSON.stringify(functions, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Export functions to CSV file
     */
    function exportToCSV(functions, filename = 'stellarium_api_functions.csv') {
        let csv = 'Name,Category,Module,Signature,Return Type,Type,Parameter Count,Qt5 Compat,Qt6 Compat,Min Version,Description\n';
        
        functions.forEach(f => {
            const compat = f.compatibility || {};
            const row = [
                `"${String(f.name || '').replace(/"/g, '""')}"`,
                `"${String(f.category || '').replace(/"/g, '""')}"`,
                `"${String(f.module || '').replace(/"/g, '""')}"`,
                `"${String(f.signature || '').replace(/"/g, '""')}"`,
                String(f.returnType || ''),
                String(f.type || ''),
                f.parameters ? f.parameters.length : 0,
                compat.qt5 ? 'Yes' : 'No',
                compat.qt6 ? 'Yes' : 'No',
                String(compat.minVersion || ''),
                `"${String(f.description || '').replace(/"/g, '""')}"`
            ];
            csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Export full statistics
     */
    function exportFullStats(functions, modules) {
        const categories = {};
        const compatStats = { qt5: 0, qt6: 0, both: 0, unknown: 0 };
        const moduleStats = {};
        
        functions.forEach(f => {
            categories[f.category] = (categories[f.category] || 0) + 1;
            moduleStats[f.module] = (moduleStats[f.module] || 0) + 1;
            
            const compat = f.compatibility;
            if (!compat) compatStats.unknown++;
            else if (compat.qt5 && compat.qt6) compatStats.both++;
            else if (compat.qt6) compatStats.qt6++;
            else if (compat.qt5) compatStats.qt5++;
        });
        
        const stats = {
            generated: new Date().toISOString(),
            total_functions: functions.length,
            total_modules: modules.length,
            by_category: categories,
            by_module: moduleStats,
            compatibility: compatStats
        };
        
        exportToJSON(stats, 'stellarium_api_statistics.json');
    }
    
    return {
        exportToJSON,
        exportToCSV,
        exportFullStats
    };
})();

window.ExportUtils = ExportUtils;