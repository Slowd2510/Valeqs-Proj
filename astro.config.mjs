// @ts-check
import { defineConfig } from 'astro/config';

// Import your chosen adapter
import node from '@astrojs/node';
// OR import vercel from '@astrojs/vercel/serverless';
// OR import netlify from '@astrojs/netlify';
// OR import cloudflare from '@astrojs/cloudflare';
// OR import deno from '@astrojs/deno';

// https://astro.build/config
export default defineConfig({
  output: "server", // Make all pages server-rendered
  adapter: node({
    mode: 'standalone' // 'standalone' for production or 'middleware' if used with another server
  }),
  
  // OR use a different adapter based on your deployment target:
  // adapter: vercel(),
  // adapter: netlify(),
  // adapter: cloudflare(),
  // adapter: deno()
});
