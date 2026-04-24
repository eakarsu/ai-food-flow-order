

// vite.config.ts
import { defineConfig, loadEnv } from 'vite'; // Import loadEnv
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => { // Add ({ mode })
  // Load .env files based on the mode (development, production, etc.)
  // This makes process.env.VITE_TOKEN_URL available *during the Vite build process itself*
  const env = loadEnv(mode, process.cwd(), ''); 

  return {
    plugins: [
      react(),
    ],
    server: {
      host: "::",
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Only externalize for mobile builds, not web builds
      rollupOptions: {
        external: mode === 'mobile' ? [
          '@capacitor/filesystem',
          '@capacitor/core',
          '@capacitor/app',
          '@capacitor/haptics',
          '@capacitor/keyboard',
          '@capacitor/status-bar',
          'capacitor-voice-recorder'
        ] : []
      }
    },
    base: '/'
    // Removed custom define block - Vite automatically exposes VITE_* env variables
  };
});

