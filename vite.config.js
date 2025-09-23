import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    // Custom plugin to handle component Vue files
    {
      name: 'component-vue-handler',
      configureServer(server) {
        // Watch component directories for Vue file changes
        server.watcher.add(path.resolve(__dirname, 'components/**/*.vue'));
      }
    }
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'GMKB',
      fileName: 'gmkb',
      formats: ['iife']
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        // Ensure all dynamic imports are bundled
        manualChunks: undefined
      }
    },
    // Increase chunk size warning limit for component bundles
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@themes': path.resolve(__dirname, './themes'),
      '@renderers': path.resolve(__dirname, './src/vue/components/renderers'), // Temporary for migration
      'vue': 'vue/dist/vue.esm-bundler.js' // Use the ESM bundler build for runtime compilation
    },
    // Ensure Vite can resolve Vue files in component directories
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    // Fix for process is not defined error
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'pinia'],
    // Allow component Vue files to be optimized
    entries: [
      'src/main.js',
      'components/**/*.vue'
    ]
  },
  // Server configuration for development
  server: {
    watch: {
      // Watch component directories
      ignored: ['!**/components/**/*.vue']
    }
  }
});
