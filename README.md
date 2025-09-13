# Media Kit Builder Plugin

A WordPress plugin for creating drag-and-drop media kits with customizable components.

## Structure

- `/admin` - WordPress admin functionality
- `/components` - Self-contained component modules
- `/css` - Stylesheets
- `/dist` - Built/compiled files
- `/docs` - Documentation
- `/includes` - PHP includes and WordPress hooks
- `/js` - JavaScript modules
- `/src` - Source files for bundling
- `/system` - Core system modules
- `/templates` - PHP templates
- `/themes` - Visual themes

## Development

### Prerequisites
- Node.js 16+
- npm or yarn
- WordPress 5.0+
- PHP 7.4+

### Setup
```bash
npm install
npm run build
```

### Build Commands
- `npm run build` - Build production bundle
- `npm run dev` - Start development server
- `npm run watch` - Watch for changes

## Architecture

The plugin follows a self-contained component architecture where each component
has its own template, styles, scripts, and configuration in `/components/[name]/`.

### Core Principles
- Self-contained components
- Event-driven communication
- WordPress-native integration
- No polling or timeouts
- Clean separation of concerns

## Version

Current Version: 4.0.0

## License

GPL v2 or later
