// run: pm2 start ecosystem.config.js --env production|development --watch
module.exports = {
  apps: [
    {
      name: "data_table_api",
      // instances: "max",
      instances: 1,
      // exec_mode: "cluster",
      script: "./src/index.js",
      // node_args: '-r dotenv/config',
      watch: ["src/api", "src/services"],
      // watch_delay: 1000,
      ignore_watch: ["node_modules", "src/public"],
      watch_options: {
        followSymlinks: false
      },
      env: {
          NODE_ENV: "development",
      },
      env_production: {
          NODE_ENV: "production",
      }
  },
  ]
};
