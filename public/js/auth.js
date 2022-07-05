const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('pass');
const confirmPassInput = document.getElementById('confirm-pass');

const emailRegex = /^\S+@\S+\.com+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
const emailMessage = document.querySelector('.email-message');
const PasswordMessage = document.querySelector('.password-message');
const confirmPassMessage = document.querySelector('.confirm-pass--message')

const emailValidator = () => {
  const emailValue = emailInput.value.trim();
  if (emailRegex.test(emailValue)) {
    emailMessage.style.display = 'none';
    emailInput.classList.remove('user-message--error');
    emailInput.classList.add('user-message');
  } else {
    emailMessage.style.display = 'block';
    emailInput.classList.remove('user-message');
    emailInput.classList.add('user-message--error');
    if (!emailValue.includes('@')) {
      emailMessage.textContent = '@ sign is missing';
    }
    if (!emailValue.includes('.')) {
      emailMessage.textContent = '. sign is missing';
    }
    if (!emailValue.includes('com')) {
      emailMessage.textContent = 'com is missing';
    }
    if (!emailValue.includes('@') && !emailValue.includes('.')) {
      emailMessage.textContent = '@ sign and . sign is missing';
    }
    if (!emailValue.includes('@') && !emailValue.includes('com')) {
      emailMessage.textContent = '@ sign and com is missing';
    }
    if (!emailValue.includes('.') && !emailValue.includes('com')) {
      emailMessage.textContent = '. sign and com is missing';
    }
    if (!emailValue.includes('@') && !emailValue.includes('.') && !emailValue.includes('com')) {
      emailMessage.textContent = '@ sign, . sign and com are missing';
    }
  }
}

const passwordValidator = () => {
  const passValue = passwordInput.value.trim();
  if (passwordRegex.test(passValue)) {
    passwordInput.classList.remove('user-message--error');
    passwordInput.classList.add('user-message');
    PasswordMessage.style.display = 'none';
  } else {
    PasswordMessage.style.display = 'block';
    passwordInput.classList.remove('user-message');
    passwordInput.classList.add('user-message--error');
    if (!(/^(?=.*[a-z])/.test(passValue))) {
      PasswordMessage.textContent = 'small letter(s) required';
    }
    if (!(/^(?=.*[A-Z])/.test(passValue))) {
      PasswordMessage.textContent = 'Capital letter(s) required';
    }
    if (!(/^(?=.*[0-9])/.test(passValue))) {
      PasswordMessage.textContent = 'Number(s) required';
    }
    if (!(/^(?=.*[!@#\$%\^&\*])/.test(passValue))) {
      PasswordMessage.textContent = 'Special character(s) required';
    }
    if (!(/^(?=.{8,})/.test(passValue))) {
      PasswordMessage.textContent = 'Password must be 8 or more characters long';
    }
  }
}

const confirmPassValidator = () => {
  const passValue = passwordInput.value.trim();
  const confirmPassValue = confirmPassInput.value.trim();
  if (confirmPassValue == passValue) {
    confirmPassInput.classList.remove('user-message--error');
    confirmPassInput.classList.add('user-message');
    confirmPassMessage.style.display = 'none';
  } else {
    confirmPassMessage.style.display = 'block';
    confirmPassInput.classList.remove('user-message');
    confirmPassInput.classList.add('user-message--error');
    confirmPassMessage.textContent = 'Must be same with password.';
  }
}

emailInput.addEventListener('input', emailValidator);
window.addEventListener('load', () => {
  if (emailInput.value.trim() == '' && passwordInput.value.trim() == '' && confirmPassInput.value.trim() == '') {
    return;
  }
  emailValidator();
  passwordValidator();
  confirmPassValidator();
});

passwordInput.addEventListener('input', passwordValidator);

confirmPassInput.addEventListener('input', confirmPassValidator);