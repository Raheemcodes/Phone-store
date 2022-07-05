const mongoose = require('mongoose');
const Product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: Boolean,
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  order: [
    {
      products: [
        {
          product: { type: Object, required: true },
          quantity: { type: Number, required: true },
        },
      ],
    }
  ],
});

userSchema.methods.addToCart = function (prodId, quantity) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === prodId.toString();
  });
  let newQuantity = quantity || 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + quantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: prodId,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteProduct = function (productId) {
  const updatedCartItems = this.cart.items.filter((cp) => {
    return cp._id.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
};

userSchema.methods.addToOrder = async function () {
  try {
    const cartProduct = await Promise.all(
      this.cart.items.map(async (prod) => {
        product = await Product.findById(prod.productId);

        return (updatedOrder = {
          product,
          quantity: prod.quantity,
        });
      }),
    );
    const prod = {
      products: cartProduct
    }

    if (this.order.length > 0) {
      this.order.push(prod);
    } else {
      this.order[0] = prod;
    }
    this.cart.items = [];
    return this.save();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

module.exports = mongoose.model('User', userSchema);
