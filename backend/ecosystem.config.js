module.exports = {
  apps: [
    {
      name: 'pms-backend',
      script: 'server.js',
      watch: false,
      instances: 1,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        HOST: process.env.HOST || '0.0.0.0'
      }
    }
  ]
};
