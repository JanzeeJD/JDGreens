function alertOk(text) {
  Toastify({
      text,
      duration: 3000,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
  }).showToast();
}

function alertNotOk(text) {
  Toastify({
    text,
    duration: 3000,
    style: {
      background: "linear-gradient(to right, red, orange)",
    }
  }).showToast();
}