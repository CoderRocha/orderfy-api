const pool = require('../db');

/**
 * Creates a new order and its associated items.
 * @param {Object} order
 * @returns {Object}
 */
async function createOrder(order) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders ("orderId", "value", "creationDate")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [order.orderId, order.value, order.creationDate]
    );

    const insertedItems = [];

    for (const item of order.items) {
      const itemResult = await client.query(
        `INSERT INTO items ("orderId", "productId", "quantity", "price")
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [order.orderId, item.productId, item.quantity, item.price]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return { ...orderResult.rows[0], items: insertedItems };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Finds a single order by its orderId (including all associated items).
 *
 * @param {string} orderId
 * @returns {Object|null}
 */
async function findOrderById(orderId) {
  const orderResult = await pool.query(
    `SELECT * FROM orders WHERE "orderId" = $1`,
    [orderId]
  );

  if (orderResult.rows.length === 0) return null;

  const itemsResult = await pool.query(
    `SELECT * FROM items WHERE "orderId" = $1`,
    [orderId]
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

/**
 * Returns all orders with their associated items.
 *
 * @returns {Array}
 */
async function findAllOrders() {
  const ordersResult = await pool.query(`SELECT * FROM orders ORDER BY "creationDate" DESC`);
  const itemsResult = await pool.query(`SELECT * FROM items`);

  // group by orderId
  const itemsByOrder = itemsResult.rows.reduce((acc, item) => {
    if (!acc[item.orderId]) acc[item.orderId] = [];
    acc[item.orderId].push(item);
    return acc;
  }, {});

  return ordersResult.rows.map((order) => ({
    ...order,
    items: itemsByOrder[order.orderId] || [],
  }));
}

/**
 * Updates an existing order and replaces all its items.
 *
 * @param {string} orderId
 * @param {Object} order
 * @returns {Object|null}
 */
async function updateOrder(orderId, order) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `UPDATE orders SET "value" = $1, "creationDate" = $2
       WHERE "orderId" = $3
       RETURNING *`,
      [order.value, order.creationDate, orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // remove existing items and re-insert updated ones
    await client.query(`DELETE FROM items WHERE "orderId" = $1`, [orderId]);

    const updatedItems = [];

    for (const item of order.items) {
      const itemResult = await client.query(
        `INSERT INTO items ("orderId", "productId", "quantity", "price")
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [orderId, item.productId, item.quantity, item.price]
      );
      updatedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return { ...orderResult.rows[0], items: updatedItems };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Deletes an order by its orderId.
 * Items are removed automatically ON DELETE CASCADE.
 *
 * @param {string} orderId
 * @returns {boolean}
 */
async function deleteOrder(orderId) {
  const result = await pool.query(
    `DELETE FROM orders WHERE "orderId" = $1 RETURNING "orderId"`,
    [orderId]
  );

  return result.rows.length > 0;
}

module.exports = { createOrder, findOrderById, findAllOrders, updateOrder, deleteOrder };
