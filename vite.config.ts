import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@firebase': path.resolve(__dirname, './src/0-firebase')
    }
  },
  optimizeDeps: {
    include: [
      'date-fns/format',
      'date-fns/locale/ar-SA',
      'lucide-react'
    ]
  },
  build: {
    rollupOptions: {
      external: [
        'date-fns',
        'date-fns/locale/ar-SA'
      ]
    }
  }
});