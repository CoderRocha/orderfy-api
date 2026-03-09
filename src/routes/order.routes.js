const { Router } = require('express');
const { create, getById, list, update, remove } = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/list', list);

router.post('/', create);
router.get('/:orderId', getById);
router.put('/:orderId', update);
router.delete('/:orderId', remove);

module.exports = router;
