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
      alert("added to cart")
    } else {
      alert("cannot add to cart")
    }
  })
  .catch((err)=>{
    console.error(err)
    alert("an error occured")
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
      alert("added to wishlist")
    } else {
      alert("cannot add to wishlist")
    }
  })
  .catch((err)=>{
    console.error(err)
    alert("an error occured")
  })
}