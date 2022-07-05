const Product = require('../models/product');
const ITEMS_PER_PAGE = 6;
const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.getIndex = (req, res, next) => {
  try {
    let totalQuantity = 0;
    let isAdmin = false;

    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }
    res.render('shop/index', {
      pageTitle: 'Shop',
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    let isAdmin = false;

    const numProducts = await Product.countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    let totalQuantity = 0;

    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }
    res.render('shop/products', {
      prods: products,
      pageTitle: 'All Products',
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < numProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      nextTwoPage: page + 2,
      prevTwoPage: page - 2,
      hasNextTwoPage: ITEMS_PER_PAGE * (page + 1) < numProducts,
      hasPrevTwoPage: page > 2,
      lastPage: Math.ceil(numProducts / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async function (req, res, next) {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    let isAdmin = false;

    let totalQuantity = 0;

    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          name: product.title,
          description: product.description,
          amount: product.price * 100,
          currency: 'usd',
          quantity: 1,
        },
      ],
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });

    res.render('shop/product', {
      prod: product,
      pageTitle: 'Product',
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
      sessionId: session.id,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getBag = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;
    let isAdmin = false;

    const totalPrice = products.reduce(
      (prevVal, curVal) => prevVal + curVal.productId.price * curVal.quantity,
      0,
    );

    let totalQuantity = 0;

    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/bag', {
      pageTitle: 'Bag',
      prods: products,
      cartQuantity: totalQuantity,
      totalPrice,
      searchInfo: '',
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSearchPage = async (req, res, next) => {
  try {
    const searchInput = req.params.page;
    let isAdmin = false;

    const products = await Product.find({
      title: new RegExp(`${searchInput}`, 'i'),
    });

    let totalQuantity = 0;

    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/search', {
      pageTitle: 'Search',
      prods: products,
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    // const products = req.user.order;

    let totalQuantity = 0;
    let isAdmin = false;
    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/profile', {
      pageTitle: 'My Profile',
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const products = req.user.order;

    let totalQuantity = 0;
    let isAdmin = false;
    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/order', {
      pageTitle: 'Orders',
      orders: products,
      cartQuantity: totalQuantity,
      searchInfo: '',
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;

    const totalPrice = products.reduce(
      (prevVal, curVal) => prevVal + curVal.productId.price * curVal.quantity,
      0,
    );

    let totalQuantity = 0;
    let isAdmin = false;
    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map((p) => {
        return {
          name: p.productId.title,
          description: p.productId.description,
          amount: p.productId.price * 100,
          currency: 'usd',
          quantity: p.quantity,
        };
      }),
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
    });

    res.render('shop/checkout', {
      pageTitle: 'checkout',
      prods: products,
      cartQuantity: totalQuantity,
      totalPrice,
      searchInfo: '',
      isAdmin,
      sessionId: session.id,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSearch = async (req, res, next) => {
  try {
    const searchInput = req.body.search;

    const products = await Product.find({
      title: new RegExp(`${searchInput}`, 'i'),
    });

    let totalQuantity = 0;
    let isAdmin = false;
    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/search', {
      pageTitle: 'Search',
      prods: products,
      cartQuantity: totalQuantity,
      searchInfo: searchInput,
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getcheckOutSuccess = async (req, res, next) => {
  try {
    await req.user.addToOrder();

    res.redirect('/orders');
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSearch = async (req, res, next) => {
  try {
    const searchInput = req.body.search;

    const products = await Product.find({
      title: new RegExp(`${searchInput}`, 'i'),
    });

    let totalQuantity = 0;
    let isAdmin = false;
    if (req.session.isLoggedIn) {
      isAdmin = req.user.isAdmin;
      totalQuantity = req.user.cart.items.reduce(
        (prevVal, curVal) => prevVal + curVal.quantity,
        0,
      );
    }

    res.render('shop/search', {
      pageTitle: 'Search',
      prods: products,
      cartQuantity: totalQuantity,
      searchInfo: searchInput,
      isAdmin,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postBag = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    const quantity = +req.body.quantity;
    await req.user.addToCart(prodId, quantity);
    res.status(200).json({ message: 'Added to cart' });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteBag = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    await req.user.deleteProduct(prodId);

    const user = await req.user.populate('cart.items.productId').execPopulate();
    const products = user.cart.items;

    const totalPrice = products.reduce(
      (prevVal, curVal) => prevVal + curVal.productId.price * curVal.quantity,
      0,
    );

    res.status(200).json({ message: 'Deleted from cart', totalPrice });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
