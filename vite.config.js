import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
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
    emptyOutDir: true, // Clean dist folder on each build
    
    // Use esbuild for minification (faster, no extra dependency)
    minify: mode === 'production' ? 'esbuild' : false,
    
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // SIMPLIFIED: Single file naming - no hash, no subdirectories
        assetFileNames: 'gmkb.[ext]',
        entryFileNames: 'gmkb.iife.js'
      },
      
      // External dependencies
      external: ['jquery', 'wp', 'lodash'],
      
      // Tree shaking
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      }
    },
    
    // Source maps only in development
    sourcemap: mode === 'development' ? 'inline' : false,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // CRITICAL: Disable CSS code splitting - single CSS file
    cssCodeSplit: false,
    
    // Asset inlining threshold (4kb)
    assetsInlineLimit: 4096
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@themes': path.resolve(__dirname, './themes'),
      '@renderers': path.resolve(__dirname, './src/vue/components/renderers'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@composables': path.resolve(__dirname, './src/vue/composables'),
      '@utils': path.resolve(__dirname, './src/utils'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: mode === 'development',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(mode || 'production')
  },
  
  optimizeDeps: {
    include: ['vue', 'pinia'],
    exclude: ['@vue/devtools-api'],
    entries: ['src/main.js', 'components/**/*.vue']
  },
  
  // Server configuration for development
  server: {
    watch: {
      ignored: ['!**/components/**/*.vue']
    },
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  preview: {
    cors: true
  },
  
  // Performance optimizations with esbuild
  esbuild: {
    target: 'es2015',
    drop: [], // TEMPORARILY DISABLED for debugging component editor
    // drop: mode === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
    minify: mode === 'production',
    minifyIdentifiers: mode === 'production',
    minifySyntax: mode === 'production',
    minifyWhitespace: mode === 'production'
  },
  
  json: {
    namedExports: true,
    stringify: false
  }
}));
