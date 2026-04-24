module.exports = {
  apps: [
    {
      name: 'soccer-jersey-store-api',
      script: './dist/index.js',
      interpreter: 'node',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      out_file: './logs/app.log',
      error_file: './logs/err.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
      max_memory_restart: '500M',
    },
  ],
};
