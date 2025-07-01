import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'firebase/analytics',
      'firebase/storage'
    ]
  }
});