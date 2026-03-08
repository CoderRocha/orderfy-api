const { createOrder, findOrderById, findAllOrders, updateOrder, deleteOrder } = require('../models/order.model');

/**
 *
 * @param {Object} body - Raw request body
 * @returns {Object} Mapped order object ready for persistence
 */
function mapRequestToOrder(body) {
  return {
    orderId: body.numeroPedido,
    value: body.valorTotal,
    creationDate: body.dataCriacao,
    items: (body.items || []).map((item) => ({
      productId: parseInt(item.idItem, 10),
      quantity: item.quantidadeItem,
      price: item.valorItem,
    })),
  };
}

/**
 * POST /order
 * Creates a new order with items.
 */
async function create(req, res) {
  try {
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

    if (!numeroPedido || valorTotal === undefined || !dataCriacao || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request. Required fields: numeroPedido, valorTotal, dataCriacao, items (non-empty array).',
      });
    }

    const mappedOrder = mapRequestToOrder(req.body);
    const createdOrder = await createOrder(mappedOrder);

    return res.status(201).json(createdOrder);
  } catch (error) {
    // order already exists
    if (error.code === '23505') {
      return res.status(409).json({ error: `Order '${req.body.numeroPedido}' already exists.` });
    }

    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * GET /order/:orderId
 * Returns a single order by its ID (including items).
 */
async function getById(req, res) {
  try {
    const { orderId } = req.params;
    const order = await findOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: `Order '${orderId}' not found.` });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * GET /order/list
 * Returns all orders with their items.
 */
async function list(req, res) {
  try {
    const orders = await findAllOrders();
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error listing orders:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * PUT /order/:orderId
 * Updates an existing order and replaces its items.
 */
async function update(req, res) {
  try {
    const { orderId } = req.params;
    const { valorTotal, dataCriacao, items } = req.body;

    if (valorTotal === undefined || !dataCriacao || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request. Required fields: valorTotal, dataCriacao, items (non-empty array).',
      });
    }

    const mappedOrder = mapRequestToOrder({ numeroPedido: orderId, ...req.body });
    const updatedOrder = await updateOrder(orderId, mappedOrder);

    if (!updatedOrder) {
      return res.status(404).json({ error: `Order '${orderId}' not found.` });
    }

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * DELETE /order/:orderId
 * Deletes an order and all its associated items.
 */
async function remove(req, res) {
  try {
    const { orderId } = req.params;
    const deleted = await deleteOrder(orderId);

    if (!deleted) {
      return res.status(404).json({ error: `Order '${orderId}' not found.` });
    }

    return res.status(200).json({ message: `Order '${orderId}' deleted successfully.` });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { create, getById, list, update, remove };
