const { resolve } = require('path')

export default {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chartjs: resolve(__dirname, 'chartjs.html')
      }
    }
  }
}
