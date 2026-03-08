const { Router } = require('express');
const { create, getById, list, update, remove } = require('../controllers/order.controller');

const router = Router();

router.get('/list', list);

router.post('/', create);
router.get('/:orderId', getById);
router.put('/:orderId', update);
router.delete('/:orderId', remove);

module.exports = router;
