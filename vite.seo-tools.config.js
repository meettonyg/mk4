import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for Standalone SEO Tools
 *
 * Builds a lightweight, self-contained bundle for public-facing AI generators.
 * These tools are embedded on public pages via shortcode for lead generation.
 *
 * Key features:
 * - Minimal bundle size (~50KB target) through aggressive tree-shaking
 * - Self-contained Pinia store (no external Vue app dependency)
 * - CSS isolation with scoped reset wrapper
 * - IP-based rate limiting (no WordPress auth required)
 *
 * Run with: npm run build:seo-tools
 */
export default defineConfig(({ mode }) => ({
    base: './',

    plugins: [vue()],

    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/seo-tools-entry.js'),
            name: 'GMKBSeoTools',
            fileName: 'seo-tools',
            formats: ['iife'],
        },
        outDir: 'dist/seo-tools',
        emptyOutDir: true,

        // Aggressive minification for smallest bundle
        minify: mode === 'production' ? 'esbuild' : false,

        // Target ~50KB bundle
        chunkSizeWarningLimit: 80,

        rollupOptions: {
            output: {
                assetFileNames: 'seo-tools.[ext]',
                entryFileNames: 'seo-tools.iife.js',
                // Compact output for smaller bundle
                compact: true,
            },

            // No external deps - fully self-contained bundle
            external: [],

            // Aggressive tree shaking
            treeshake: {
                preset: 'smallest',
                propertyReadSideEffects: false,
                moduleSideEffects: false,
            },
        },

        sourcemap: mode === 'development' ? 'inline' : false,
        cssCodeSplit: false,

        // Inline small assets
        assetsInlineLimit: 8192,

        // Report compressed size
        reportCompressedSize: true,
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@tools': path.resolve(__dirname, './tools'),
            '@ai': path.resolve(__dirname, './src/vue/components/ai'),
            '@components': path.resolve(__dirname, './components'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@services': path.resolve(__dirname, './src/services'),
            '@composables': path.resolve(__dirname, './src/composables'),
            '@utils': path.resolve(__dirname, './src/utils'),
            'vue': 'vue/dist/vue.esm-bundler.js',
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false, // Always disabled for public tools
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        'process.env': {},
        'process.env.NODE_ENV': JSON.stringify(mode || 'production'),
    },

    optimizeDeps: {
        include: ['vue', 'pinia'],
    },

    esbuild: {
        target: 'es2015',
        // Always drop console/debugger in production for public-facing code
        drop: mode === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'none',
        minify: mode === 'production',
        minifyIdentifiers: mode === 'production',
        minifySyntax: mode === 'production',
        minifyWhitespace: mode === 'production',
    },
}));
