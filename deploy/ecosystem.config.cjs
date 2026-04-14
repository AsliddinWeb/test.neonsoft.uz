// PM2 konfiguratsiyasi
// Ishga tushirish: pm2 start deploy/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'ilhom-api',
      script: 'server/index.js',
      cwd: '/home/projects/test.neonsoft.uz',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/ilhom-api.error.log',
      out_file: '/var/log/pm2/ilhom-api.out.log',
      time: true,
      max_memory_restart: '300M'
    }
  ]
}
