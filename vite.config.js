import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/data': 'http://localhost:3000',
      '/gender-ratio': 'http://localhost:3000',
    },
  },
});
