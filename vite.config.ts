// vite.config.ts
import { defineConfig, loadEnv } from 'vite'; // Import loadEnv
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => { // Add ({ mode })
  // Load .env files based on the mode (development, production, etc.)
  // This makes process.env.VITE_TOKEN_URL available *during the Vite build process itself*
  const env = loadEnv(mode, process.cwd(), ''); 

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    base: './',
    // This 'define' block directly replaces import.meta.env.VITE_XXX in your client code
    define: {
      'import.meta.env.VITE_TOKEN_URL': JSON.stringify(env.VITE_TOKEN_URL),
      'import.meta.env.VITE_TWILIO_VOICE_NUMBER': JSON.stringify(env.VITE_TWILIO_VOICE_NUMBER),
      'import.meta.env.VITE_NGROK_SMS_URL': JSON.stringify(env.VITE_NGROK_SMS_URL),
      'import.meta.env.VITE_NGROK_VOICE_URL': JSON.stringify(env.VITE_NGROK_VOICE_URL),
      // You can add other import.meta.env variables here if needed
      // 'import.meta.env.BASE_URL': JSON.stringify(env.BASE_URL),
      // 'import.meta.env.MODE': JSON.stringify(env.MODE),
      // etc.
    }
  };
});

