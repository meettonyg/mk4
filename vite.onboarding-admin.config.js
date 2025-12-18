import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for Onboarding Admin
 *
 * Separate build for the Vue Onboarding admin rewards manager
 * Run with: npm run build:onboarding-admin
 */
export default defineConfig(({ mode }) => ({
    base: './',

    plugins: [vue()],

    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/onboarding/admin.js'),
            name: 'GMKBOnboardingAdmin',
            fileName: 'gmkb-onboarding-admin',
            formats: ['iife'],
        },
        outDir: 'dist/onboarding-admin',
        emptyOutDir: true,

        minify: mode === 'production' ? 'esbuild' : false,

        rollupOptions: {
            output: {
                assetFileNames: 'gmkb-onboarding-admin.[ext]',
                entryFileNames: 'gmkb-onboarding-admin.iife.js',
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
