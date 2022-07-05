const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/search/:page', shopController.getSearchPage);

router.get('/bag/', isAuth, shopController.getBag);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getcheckOutSuccess);

router.get('/checkout/cancel', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/profile', isAuth, shopController.getProfile);

router.post('/search', shopController.postSearch);

router.put('/bag/:productId', shopController.postBag);

router.delete('/bag/:productId', isAuth, shopController.deleteBag);

module.exports = router;
