import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for Media Kit List
 *
 * Separate build for the Vue Media Kit List app
 * Run with: npm run build:media-kit-list
 */
export default defineConfig(({ mode }) => ({
    base: './',

    plugins: [vue()],

    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/media-kit-list/main.js'),
            name: 'GMKBMediaKitList',
            fileName: 'gmkb-media-kit-list',
            formats: ['iife'],
        },
        outDir: 'dist/media-kit-list',
        emptyOutDir: true,

        minify: mode === 'production' ? 'esbuild' : false,

        rollupOptions: {
            output: {
                assetFileNames: 'gmkb-media-kit-list.[ext]',
                entryFileNames: 'gmkb-media-kit-list.iife.js',
            },

            external: ['jquery', 'wp', 'lodash'],

            treeshake: {
                preset: 'recommended',
            },
        },

        sourcemap: mode === 'development' ? 'inline' : false,
        cssCodeSplit: false,
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'vue': 'vue/dist/vue.esm-bundler.js',
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: mode === 'development',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        'process.env': {},
        'process.env.NODE_ENV': JSON.stringify(mode || 'production'),
    },

    optimizeDeps: {
        include: ['vue', 'pinia'],
    },

    esbuild: {
        target: 'es2015',
        drop: mode === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'none',
    },
}));
