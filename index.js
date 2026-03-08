require('dotenv').config();
const express = require('express');
const { runMigrations } = require('./src/database/migrations');
const orderRoutes = require('./src/routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.get('/', (_req, res) => res.json({ message: 'Orderfy API is running.' }));
app.use('/order', orderRoutes);

// Start server after migrations
runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  });
