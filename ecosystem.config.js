module.exports = {
    apps: [
        {
            name: 'tech-turf-backend',
            script: 'server.js',
            cwd: './backend',
            env: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
        },
    ],
};
