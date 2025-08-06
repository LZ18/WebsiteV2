import { defineConfig } from 'vite';
import vitePluginString from 'vite-plugin-string';

export default defineConfig({
  base: '/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist',
  },
  plugins: [vitePluginString()], // Ensure vite-plugin-string is included
});
