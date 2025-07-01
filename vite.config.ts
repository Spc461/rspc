// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'date-fns/format',
      'date-fns/locale/ar-SA',
      'lucide-react'
    ],
    exclude: [] // Remove all excludes
  },
  build: {
    rollupOptions: {
      external: [] // Remove all externals
    }
  }
});