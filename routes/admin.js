// const path = require('path');
const express = require('express');

const {body} = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

router.get('/add-products', isAuth, isAdmin, adminController.getAddProducts);

router.get('/products', isAuth, isAdmin, adminController.getProducts);

router.get('/add-products/:productId', isAuth, isAdmin, adminController.getEditProducts);

router.post('/add-products', [
  body('title').isString().isLength(
    {min: 3}
  ).trim(),
  body('price').isFloat(),
  body('description').isLength(
    {min: 5, max: 400}
  ).trim()
], isAuth, isAdmin, adminController.postAddProducts);

router.post('/edit-products', [
  body('title').isString().isLength(
    {min: 3}
  ).trim(),
  body('price').isFloat(),
  body('description').isLength(
    {min: 5, max: 400}
  ).trim()
], isAuth, isAdmin, adminController.postEditProducts);

router.post('/delete/:productId', isAuth, isAdmin, adminController.deleteProduct);

module.exports = router;