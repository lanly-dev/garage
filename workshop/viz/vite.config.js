import { resolve } from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        d3: resolve(__dirname, 'd3.html'),
        chartjs: resolve(__dirname, 'chartjs.html')
      }
    }
  },
  resolve: {
    alias: {
      '@bootstrap-css': resolve(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.min.css'),
      '@bootstrap-js': resolve(__dirname, 'node_modules/bootstrap/dist/js/bootstrap.min.js')
    }
  }
})
