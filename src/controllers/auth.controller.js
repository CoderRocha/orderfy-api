const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByUsername, createUser } = require('../models/user.model');

/**
 * POST /auth/register
 * Creates a new user.
 */
async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Invalid request. Required fields: username, password.' });
    }

    const existing = await findByUsername(username);

    if (existing) {
      return res.status(409).json({ error: `User '${username}' already exists.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashedPassword);

    return res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Invalid request. Required fields: username, password.' });
    }

    const user = await findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { register, login };
