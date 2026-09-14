module.exports = {
  apps: [
    {
      name: 'carnix-front',
      // The app uses output: 'standalone'; run the generated server directly.
      script: './.next/standalone/server.js',
      args: '',
      interpreter: 'node',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};
