import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  outDir: './dist/public',
  site: 'https://vgconsultoriamkt.com.br',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss({ optimize: false })],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@assets': new URL('../../attached_assets', import.meta.url).pathname,
      },
    },
    server: {
      allowedHosts: ['.replit.dev', '.replit.app', '.picard.replit.dev'],
    },
    preview: {
      allowedHosts: ['.replit.dev', '.replit.app', '.picard.replit.dev'],
    },
  },
});