// Update with your config settings.
const dontenv = require('dotenv');
dontenv.config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      charset: 'utf8'
    },
    pool: {
      min: 1,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations'  
    },
    seeds: {
      directory: './database/seeds'  
    }
  },

};