import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
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
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@themes': path.resolve(__dirname, './themes'),
      'vue': 'vue/dist/vue.esm-bundler.js' // Use the ESM bundler build for runtime compilation
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    // Fix for process is not defined error
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
