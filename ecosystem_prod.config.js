// run: pm2 start ecosystem.config.js --env production|development --watch
module.exports = {
  apps: [
    {
      name: "data_table_api",
      instances: 1,
      script: "./src/index.js",
      env: {
        NODE_ENV: "beta",
      },
      env_production: {
        NODE_ENV: "beta",
      }
    },
  ]
};
