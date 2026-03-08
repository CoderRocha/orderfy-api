const pool = require('../db');

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        "orderId"      VARCHAR(255)   PRIMARY KEY,
        "value"        NUMERIC(10, 2) NOT NULL,
        "creationDate" TIMESTAMPTZ    NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id           SERIAL         PRIMARY KEY,
        "orderId"    VARCHAR(255)   NOT NULL REFERENCES orders("orderId") ON DELETE CASCADE,
        "productId"  INTEGER        NOT NULL,
        "quantity"   INTEGER        NOT NULL,
        "price"      NUMERIC(10, 2) NOT NULL
      );
    `);

    console.log('Migrations ran successfully.');
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
