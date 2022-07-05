const deleteBtn = document.querySelectorAll('.del-btn');
const csrf = document.querySelector('[name=_csrf]').value

Array.from(deleteBtn).forEach((btn) => {
  btn.addEventListener('click', (e) => {
    console.log(e.target.id);
    fetch(`${document.location.origin}/admin/delete/${e.target.id}`, {
      method: 'POST',
      headers: {
        'csrf-token': csrf,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
        e.target.closest('article').remove();
      });
  });
});
