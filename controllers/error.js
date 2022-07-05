exports.get404 = (req, res, next) => {
  let totalQuantity = 0;
  let isAdmin = false;

  if (req.session.isLoggedIn) {
    isAdmin = req.user.isAdmin;
    totalQuantity = req.user.cart.items.reduce(
      (prevVal, curVal) => prevVal + curVal.quantity,
      0,
    );
  }

  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
    cartQuantity: totalQuantity || 0,
    searchInfo: '',
    isAdmin,
    isAuthenticated: req.session.isLoggedIn,
  });
};
