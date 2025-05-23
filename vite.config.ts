import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Remove -swc

export default defineConfig({
  plugins: [react()], // Use regular React plugin instead of SWC
  build: {
    outDir: 'dist'
  }
})

