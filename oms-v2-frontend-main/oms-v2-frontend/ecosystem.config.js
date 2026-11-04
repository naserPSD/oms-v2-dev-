// ecosystem.config.js
module.exports = {
    apps: [{
        name: "erp-frontend",
        cwd: __dirname,
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3000",
        instances: 1,
        autorestart: true,
        env: {
            NODE_ENV: "production",
            PORT: 3000,
        },
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        log_file: "./logs/combined.log",
        time: true,
    }]
}
