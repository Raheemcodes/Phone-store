const backdrop = document.querySelector('.backdrop');
const bagBtn = document.querySelectorAll('.bag-btn');
const quantityBox = document.querySelectorAll('.bag-quantity__btn');
const quantityBoxBtn = document.querySelectorAll('.bag-quantity__btn button');
const cartBtnNum = document.querySelector('.num_of__items');
const csrf = document.querySelector('[name=_csrf]').value;
const isLoggedIn = document.querySelector('header').id;

const close = (idx) => {
  setTimeout(() => {
    quantityBox[idx].firstElementChild.nextElementSibling.value = '1';
    quantityBox[idx].style.display = 'none';
    backdrop.style.display = 'none';
  }, 300);
}


// Add to bag controller
Array.from(bagBtn).forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    // e.stopPropagation();
    e.preventDefault();
    backdrop.style.display = 'flex';
    quantityBox[idx].style.display = 'flex';

    backdrop.addEventListener('click', () => {
      close(idx);
    });
  });
});

Array.from(quantityBox).forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    // e.stopPropagation();
    e.preventDefault();
  });
});

Array.from(quantityBoxBtn).forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    // e.stopPropagation();
    e.preventDefault();
    const data = e.currentTarget.previousElementSibling.value;
    if (isLoggedIn) {
      console.log(`${document.location.origin}/bag/${e.target.id}`)
      fetch(`${document.location.origin}/bag/${e.target.id}`, {
      method: 'PUT',
      headers: {
        'csrf-token': csrf,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: data }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
        const cartQuantity = +cartBtnNum.textContent + +data;
        cartBtnNum.textContent = cartQuantity.toString();
        close(idx);
      });
    } else {
      document.location.href = `${document.location.origin}/login`;
    }
  });
});

// Navigate to product page 
