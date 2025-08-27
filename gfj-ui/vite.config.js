import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get API URL from environment variable or use default
  const API_URL = 'http://localhost:8081'
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false, // Set to false to handle self-signed certificates
          // Don't rewrite the path since backend expects /api prefix
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[${new Date().toISOString()}] Proxying ${req.method} ${req.url} to ${API_URL}${req.url}`);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log(`[${new Date().toISOString()}] Received ${proxyRes.statusCode} for ${req.url}`);
            });
          },
        }
      }
    }
  }
})

