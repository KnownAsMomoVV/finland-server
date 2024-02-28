const { Pool } = require('pg');

const pool = new Pool({
    user: 'dollar',
    host: 'localhost',
    database: 'postgres',
    password: 'euro',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
