function addToCart(productId) {
  fetch('/cart',{
    method:'POST',
    headers: {
      'content-type':'application/json'
    },
    body: JSON.stringify({
      productId
    })
  })
  .then((res)=>{
    if (res.ok) {
      alertOk("added to cart")
    } else {
      alertNotOk("cannot add to cart")
    }
  })
  .catch((err)=>{
    console.error(err)
    alertNotOk("an error occured")
  })
}

function addToWishlist(productId) {
  fetch('/wishlist',{
    method:'POST',
    headers: {
      'content-type':'application/json'
    },
    body: JSON.stringify({
      productId
    })
  })
  .then((res)=>{
    if (res.ok) {
      alertOk("added to wishlist")
    } else {
      alertNotOk("cannot add to wishlist")
    }
  })
  .catch((err)=>{
    console.error(err)
    alertNotOk("an error occured")
  })
}