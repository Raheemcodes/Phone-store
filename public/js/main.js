{
  const header = document.querySelector('.main-header');
  const nav = document.querySelector('.nav');
  const mobileNav = document.querySelector('.mobile-nav');
  const searchForm = document.querySelector('#search-box');
  const searchPopBtn = document.querySelector('.search-popup');
  const cancel = document.querySelector('.close-btn');
  const toggleBtn = document.querySelector('.toggle-button');
  const backdrop = document.querySelector('.backdrop');
  const body = document.body;
  const accountBtn = document.querySelector('.account');
  const dropDownMenu = document.querySelector('.account-dropdown__menu');

  const openNav = () => {
    if (window.innerWidth >= 768 && window.innerHeight >= 768) {
      nav.style.transition = 'transform 0.5s linear';
      nav.style.display = 'block';
      setTimeout(() => {
        nav.style.transform = `translateY(${header.clientHeight}px)`;
      }, 500);
    }
  };

  const closeNav = () => {
    if (window.innerWidth >= 768 && window.innerHeight >= 768) {
      setTimeout(() => {
        nav.style.display = 'none';
      }, 500);
      nav.style.transform = `translateY(0)`;
    }

  };

  header.addEventListener('mouseenter', openNav);
  header.addEventListener('mouseleave', () => {
    if (dropDownMenu.style.opacity === '1') dropDownMenu.style.opacity = '0';
  });

  nav.addEventListener('mouseleave', closeNav);

  searchPopBtn.addEventListener('click', () => {
    Array.from(header.firstElementChild.children).forEach((el) => {
      el.style.display = 'none';
    });
    searchForm.style.display = 'flex';
    cancel.style.display = 'block';
  });

  cancel.addEventListener('click', () => {
    Array.from(header.firstElementChild.children).forEach((el) => {
      el.style.display = 'flex';
    });
    searchForm.style.display = 'none';
    cancel.style.display = 'none';
  });

  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth < 768 || window.innerHeight < 768) {
      mobileNav.style.display = 'block';
      backdrop.style.display = 'block';
      body.style.overflow = 'hidden';
      setTimeout(() => {
        mobileNav.style.left = '0vw';
      }, 300);
    }
  });

  backdrop.addEventListener('click', () => {
      mobileNav.style.left = '-55vw';
      setTimeout(() => {
        mobileNav.style.display = 'none';
        backdrop.style.display = 'none';
        body.style.overflow = 'scroll';
      }, 300);
  });

  accountBtn.addEventListener('click', () => {
    closeNav();
    if (dropDownMenu.style.display === 'flex') {
      dropDownMenu.style.display = 'none';
    } else {
      dropDownMenu.style.display = 'flex';
      dropDownMenu.style.opacity = '1';
    }
  });

  dropDownMenu.addEventListener('mouseleave', () => {
    dropDownMenu.style.opacity = '0';
    setTimeout(() => {
      dropDownMenu.style.display = 'none';
    }, 1000);
  });
}
