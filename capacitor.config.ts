// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

// If you use dotenv for other parts of your build, keep it.
// For this specific config, if environment variables are baked into the Vite build
// (import.meta.env), then dotenv isn't strictly needed here for this file's logic.
// However, if you were switching server.url based on NODE_ENV, you'd need it.

const config: CapacitorConfig = {
  appId: 'com.orderlybite.app', // Or your actual app ID
  appName: 'OrderlyBite',       // Or your actual app name
  webDir: 'dist',             // CRITICAL: Must match Vite's output directory
  // NO 'server.url' for production builds loading local files.
  // The 'server' object can be used for scheme configuration.
  server: {
    iosScheme: 'capacitor', // A common scheme for local iOS files
    androidScheme: 'https',   // A common scheme for local Android files
    allowNavigation: ['api.orderlybite.com'] // If your app navigates to external APIs
  },
  ios: {
    scheme: 'App', // This is your Xcode project scheme name
    contentInset: 'automatic',
    allowsLinkPreview: false, // Can sometimes help with webview issues
    // webContentsDebuggingEnabled: true // Enable for debugging, disable for release
  },
  android: {
    // Similar settings if you were targeting Android
  }
  // Optional: If issues persist after all other steps, try uncommenting this
  // bundledWebRuntime: false,
};

export default config;

