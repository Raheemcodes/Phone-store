const backdrop = document.querySelector('.backdrop');
const delBtn = document.querySelectorAll('.del-bag');
const quantityBox = document.querySelectorAll('.bag-quantity__btn');
const quantityBoxBtn = document.querySelectorAll('.bag-quantity__btn button');
const prodQuantity = document.querySelectorAll('.bag-quant');
const cartBtnNum = document.querySelector('.num_of__items');
const csrf = document.querySelector('[name=_csrf]').value;
const main = document.querySelector('main');
const editBagProd = document.querySelectorAll('.bag-product__menu');
const editBagMenu = document.querySelectorAll('.bag-product__options');
const subTotalPrice = document.getElementById('cart-overview');
// const prodPrice = document.querySelectorAll('.product .price');

// Bag options controller
Array.from(editBagProd).forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    backdrop.style.display = 'block';
    editBagMenu[idx].style.display = 'flex';
    setTimeout(() => {
      editBagMenu[idx].style.transform = 'translateY(0)';
    }, 300);
  });
  backdrop.addEventListener('click', () => {
    editBagMenu[idx].style.transform = 'translateY(100%)';
    setTimeout(() => {
      editBagMenu[idx].style.display = 'none';
    }, 300);
  });
});

Array.from(delBtn).forEach((btn, idx) => {
  const data = prodQuantity[idx].textContent[11];

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    fetch(`${document.location.origin}/bag/${e.target.id}`, {
      method: 'DELETE',
      headers: {
        'csrf-token': csrf,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
        const cartQuantity = +cartBtnNum.textContent - +data;
        cartBtnNum.textContent = cartQuantity.toString();
        subTotalPrice.textContent = `Sub-Total Price: $${result.totalPrice}`;
        editBagMenu[idx].style.transform = 'translateY(100%)';
        setTimeout(() => {
          backdrop.style.display = 'none';
          editBagMenu[idx].style.display = 'none';
          btn.parentElement.parentElement.parentElement.parentElement.remove();
        }, 300);

        if (cartQuantity === 0) {
          main.innerHTML = '<h1>No Product Found!</h1>';
        }
      });
  });
});
