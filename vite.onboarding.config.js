import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for Onboarding Dashboard
 *
 * Separate build for the Vue Onboarding gamification app
 * Run with: npm run build:onboarding
 */
export default defineConfig(({ mode }) => ({
    base: './',

    plugins: [vue()],

    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/onboarding/main.js'),
            name: 'GMKBOnboarding',
            fileName: 'gmkb-onboarding',
            formats: ['iife'],
        },
        outDir: 'dist/onboarding',
        emptyOutDir: true,

        minify: mode === 'production' ? 'esbuild' : false,

        rollupOptions: {
            output: {
                assetFileNames: 'gmkb-onboarding.[ext]',
                entryFileNames: 'gmkb-onboarding.iife.js',
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
            '@tools': path.resolve(__dirname, './tools'),
            '@ai': path.resolve(__dirname, './src/vue/components/ai'),
            '@components': path.resolve(__dirname, './components'),
            '@renderers': path.resolve(__dirname, './src/vue/components/renderers'),
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
