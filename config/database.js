const knex = require('knex');

const db = knex({
    client: process.env.DB_CONNECTION,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        charset: 'utf8',
    }
});

module.exports = {
    knex: db,
};