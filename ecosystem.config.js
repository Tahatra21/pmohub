module.exports = {
  apps: [{
    name: 'pmo-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/pmohub',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}

