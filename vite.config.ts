import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'date-fns',
        'date-fns/locale/ar-SA',
        'lucide-react'
      ]
    }
  },
  optimizeDeps: {
    include: [
      'date-fns/format',
      'date-fns/locale/ar-SA',
      'lucide-react'
    ],
    exclude: ['lucide-react'] // Keep this if you specifically need to exclude it
  }
});