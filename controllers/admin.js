const Product = require('../models/product');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');

exports.getAddProducts = (req, res, next) => {
  try {
    let message = req.flash('error');

    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    let totalQuantity;
    let isAdmin = false;
    if (req.user) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('admin/add-products', {
      isAdmin,
      pageTitle: 'Add Products',
      editing: false,
      cartQuantity: totalQuantity || 0,
      searchInfo: '',
      errorMessage: message,
      oldInput: {
        title: '',
        price: '',
        description: '',
        imageUrl: '',
      },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async function (req, res, next) {
  try {
    const products = await Product.find();

    let totalQuantity;
    let isAdmin = false;
    if (req.user) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('admin/modify-products', {
      isAdmin,
      prods: products,
      pageTitle: 'All Products',
      cartQuantity: totalQuantity || 0,
      searchInfo: '',
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProducts = async function (req, res, next) {
  try {
    let message = req.flash('error');

    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    const editMode = req.query.edit;
    if (!editMode) {
      return res.redirect('/');
    }
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    let totalQuantity;
    let isAdmin = false;
    if (req.user) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('admin/add-products', {
      isAdmin,
      pageTitle: 'Edit Products',
      errorMessage: message,
      product: product,
      editing: editMode,
      cartQuantity: totalQuantity || 0,
      searchInfo: '',
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postAddProducts = async function (req, res, next) {
  try {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    let imageUrl = image.path;

    if (!errors.isEmpty()) {
      let totalQuantity;
      let isAdmin = false;
      if (req.user) {
        isAdmin = req.user.isAdmin;
        totalQuantity = req.user.cart.items.reduce(
          (prevVal, curVal) => prevVal + curVal.quantity,
          0,
        );
      }
      console.log(errors.array());
      return res.render('admin/add-products', {
        isAdmin,
        pageTitle: 'Add Products',
        editing: false,
        cartQuantity: totalQuantity || 0,
        searchInfo: '',
        errorMessage: errors.array()[0].msg,
        oldInput: {
          title: title,
          price: price,
          description: description,
          imageUrl: imageUrl,
        },
        validationErrors: errors.array(),
      });
    }

    if (!image) {
      console.log('No Image!');
      return res.redirect('/admin/add-products');
    }

    imageUrl.replace(/\//g, '/');

    console.log(imageUrl);

    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
    });
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProducts = async function (req, res, next) {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    const product = await Product.findById(prodId);
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    res.redirect('/admin/products');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteProduct = async function (req, res, next) {
  try {
    const prodId = req.params.productId;

    const product = await Product.findById(prodId);
    if (!product) {
      return next(new Error('Product not found.'));
    }
    fileHelper.deleteFile(product.imageUrl);
    await Product.findByIdAndDelete(prodId);
    res.status(200).json({ message: 'Deleted post.' });
    console.log('Product deleted');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
