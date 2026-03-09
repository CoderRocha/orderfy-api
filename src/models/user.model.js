const pool = require('../db');

/**
 * Finds a user by username.
 * @param {string} username
 * @returns {Object|null}
 */
async function findByUsername(username) {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  return result.rows[0] || null;
}

/**
 * Creates a new user.
 * @param {string} username
 * @param {string} hashedPassword
 * @returns {Object}
 */
async function createUser(username, hashedPassword) {
  const result = await pool.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username`,
    [username, hashedPassword]
  );

  return result.rows[0];
}

module.exports = { findByUsername, createUser };
