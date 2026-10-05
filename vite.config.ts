import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs: the same build works at a domain root and under /blueprint-landing/ on GitHub Pages.
  base: './',
  plugins: [react()],
});
