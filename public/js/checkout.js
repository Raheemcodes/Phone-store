var stripe = Stripe('pk_test_51IwvJoJe2ZuBrbA8cGNV9yvaDcTgQUDGW8RJF5m1IlaHAHnnNUfX2GslRbysl0eCCrFg34bCYoSdpYklrJE9gf6R00a5Hxx4D6');
var orderBtn = document.querySelector('.order-btn');
orderBtn.addEventListener('click', function() {
    stripe.redirectToCheckout({
        sessionId: '<%= sessionId %>'
    });
});