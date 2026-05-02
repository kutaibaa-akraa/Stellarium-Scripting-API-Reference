# Stellarium Scripting API Reference

A complete web application for browsing, searching, and filtering the Stellarium Scripting API. This tool is designed for script authors who create presentations, automated tours, or custom configurations for the Stellarium planetarium software.

The reference contains every public slot from StelModule classes and StelSkyDrawer that are directly accessible within the Stellarium scripting engine, as documented on the official Stellarium website.

## Purpose

Writing scripts for Stellarium requires knowing exactly which methods are available on objects like `core`, `ConstellationMgr`, `LabelMgr`, or `SolarSystem`. The official API is large and distributed across many source files. This application provides:

- A single, unified, searchable interface for all scripting functions.
- Clear documentation extracted directly from Stellarium's C++ source code.
- Practical, runnable code examples for every function.
- Metadata such as Qt5/Qt6 compatibility, parameter details, and return types.
- Tools to bookmark frequently used functions and export API data.

## How to Use

### Quick Start

1. Clone or download this repository.
2. Because the application loads JSON data files dynamically via `fetch()`, it must be served from a local web server. Opening `index.html` directly as a file will not work due to browser security policies.
3. Start any lightweight HTTP server in the project's root directory. For example:
   ```bash
   # Python 3
   python -m http.server 8000
   # or on Windows
   py -m http.server 8000
   ```
   You can use any other server, such as Node.js `http-server`, PHP `php -S`, or a VS Code Live Server extension.
4. Open your browser and navigate to `http://localhost:8000`.
5. The application will load all API data and be ready to use.

### Main Features

**Browse by Category**
Functions are automatically grouped into logical categories (e.g., "Constellations - Display Control", "Solar System - Search"). This makes it easy to discover related functions.

**Search**
Use the search box at the top to find functions by:
- Function name
- Description text
- C++ signature
- Parameter names
- Example code content

**Filtering**
Refine the list using the dropdown filters:
- **Function Type:** View only static methods or instance methods.
- **Return Type:** Filter for void functions or those that return a value.
- **Parameter Count:** Filter by functions with 0, 1, 2, or 3+ parameters.
- **Qt Compatibility:** Find functions that work on Qt5, Qt6, or both.

**Category Tags**
Clickable tags appear below the filters. Selecting a tag immediately filters the view to show only functions within that category. Clicking the same tag again clears the filter.

**Module Selector**
The dropdown menu on the right side of the controls lets you view functions from a single Stellarium module (for example, `ConstellationMgr` or `SolarSystem`) or all modules at once.

**Favorites**
Click the star icon next to any function name to add it to your favorites. Favorites are saved in your browser's local storage and are available in the dedicated "Favorites" tab. Click the star again to remove it.

**Recent History**
Every function card you interact with is automatically saved to your recent history. The "Recent" tab displays these functions for quick access. You can clear the history at any time.

**Statistics**
The "Statistics" tab provides an overview of the entire API:
- Total number of functions.
- Number of modules loaded.
- Distribution by category (with bar charts).
- Qt compatibility breakdown (Qt5, Qt6, both).

**Exporting Data**
Use the buttons in the controls bar or the Statistics tab to export data:
- **Export JSON:** Downloads the complete function database as a JSON file.
- **Export CSV:** Downloads function data in CSV format for spreadsheet analysis.
- **Export Full Statistics:** Downloads a JSON file containing aggregate statistics by category, module, and compatibility.

**Copying Function Names**
Click on any function name (displayed in monospace font) to copy it to your clipboard.

## Project Structure

```
stellarium-api-reference/
    index.html              # Main application HTML
    README.md               # This file
    css/
        style.css             # Complete stylesheet (Stellarium silver theme)
    js/
        app.js                # Application initialization and event handling
        compatibility.js      # Qt compatibility badge generation
        filters.js            # Search and filter logic
        renderer.js           # HTML generation for function cards, stats, etc.
        storage.js            # localStorage management for favorites and recents
        module-loader.js      # Asynchronous JSON module loader
        category-manager.js   # Dynamic category tag generation
        export-utils.js       # JSON and CSV export functions
    data/
        modules-index.json     # Registry of all available API module files
        StelMainScriptAPI.json # Core API functions (core.*)
        ConstellationMgr.json  # Constellation management functions
        SolarSystem-Core.json  # Solar system functions
        ...                    # Additional module JSON files
```

## Technical Notes

**Data Source**
All function data is extracted from Stellarium's C++ header and source files. Each JSON file contains an array of function objects with structured metadata including signatures, descriptions, parameters, return types, compatibility information, and practical code examples.

**Browser Compatibility**
The application uses modern vanilla JavaScript (ES6+) and works in all current browsers: Chrome, Firefox, Safari, and Edge. No polyfills are required.

**Server Requirement**
This application loads JSON data files at runtime using the `fetch` API. For security reasons, browsers block `fetch` requests on `file://` URLs. Therefore, the project must be accessed through a local HTTP server. Any server capable of serving static files is sufficient (Python, Node.js, PHP, etc.).

**No Dependencies**
The application has zero JavaScript runtime dependencies. Font Awesome 6 is loaded from CDN for icons but is not required for core functionality.

**Persistence**
User data (favorites and recent history) is stored using the Web Storage API (localStorage). This data never leaves the user's browser.

## Contributing

To add or update API documentation:

1. Locate the relevant JSON file in the `data/` directory.
2. Each function object follows this schema:
   - `name`: The exact function name as used in scripts.
   - `category`: A human-readable grouping (e.g., "Solar System - Search").
   - `signature`: The full C++ method signature.
   - `description`: What the function does.
   - `parameters`: Array of parameter objects (name, type, description, required, default).
   - `returnType`: The return type or "void".
   - `type`: "method", "slot", or "static".
   - `compatibility`: Object with `qt5`, `qt6`, `minVersion`, and `notes` fields.
   - `example`: A practical, working Stellarium script example.
3. Add or update the module entry in `modules-index.json`.
4. Test the changes by starting your local server and opening the application in your browser.

## License

This reference is provided for the Stellarium community under the same terms as the Stellarium project itself (GNU General Public License v2).#  Stellarium Scripting API Reference 

