
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orderlybite.app',
  appName: 'OrderlyBite',
  webDir: 'dist',
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https',
    hostname: 'localhost',
    allowNavigation: ['api.orderlybite.com','*.twilio.com']
  },
  ios: {
    scheme: 'App',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    webContentsDebuggingEnabled: true,
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsInlineMediaPlayback: true,
    // Add better handling for local file navigation
    handleApplicationURL: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    // Add App plugin configuration for better URL handling
    App: {
      launchUrl: "capacitor://localhost"
    }
  }
};

export default config;
