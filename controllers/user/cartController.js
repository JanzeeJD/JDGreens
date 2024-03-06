import { name } from 'ejs';
import Cart from '../../models/Cart.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';

export function findTotalPrice(cart) {
    let total = 0;
    for (let i = 0; i < cart.products.length; i++) {
        total += cart.products[i].productQty * (cart.products[i].price - (cart.products[i].discount ?? 0));
    }
    return total;
}

export async function GetCartPage(req, res) {
    const { userId } = req.session;
    const cart = await Cart.findOne({ user: userId });
    let total = findTotalPrice(cart);

    return res.render('user/cart', { cart, total });
}

export async function AddToCart(req, res) {
    const { productId } = req.body;
    const { userId } = req.session;

    // Declare `ourCart` as a variable (not constant)
    let ourCart = await Cart.findOne({ user: userId });

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).send({ success: false, message: "Product not found" });
    }

    const existingProductIndex = ourCart && ourCart.products
        ? ourCart.products.findIndex((e) => e.productId.equals(productId))
        : -1;

    // Create a new cart if it doesn't exist (already declared as a variable)
    if (!ourCart) {
        ourCart = new Cart({ user: userId });
        await ourCart.save();
    }
    if (existingProductIndex > -1) {
        const productQty = ourCart.products[existingProductIndex].productQty;
        if (productQty < product.stock && productQty < 5) {
            ourCart.products[existingProductIndex].productQty++;
        }
    } else {
        ourCart.products.push({
            productId,
            productQty: 1,
            discount: product.discount ?? 0,
            name: product.name,
            image: product.images[0],
            price: product.price,
        });
    }

    await ourCart.save();
    res.status(200).send({ success: true });
}

export async function UpdateProductQty(req, res) {
    const { userId } = req.session;
    const { productId } = req.params;
    const { qty } = req.body;

    const product = await Product.findById(productId);
    const ourCart = await Cart.findOne({ user: userId });

    if (!product) {
        res.status(404).send({ success: false, error: "Product not found." });
        return;
    }

    if (qty < 1) {
        res.status(400).send({ success: false, error: "Quantity is too low." });
        return;
    }
    if (qty > 5) {
        res.status(400).send({ success: false, error: "Only 5 quantity allowed for each order" })
        return;
    }

    if (qty > product.stock) {
        res.status(400).send({ success: false, error: "Out of stock", stock: product.stock })
        return;
    }

    const existingProductIndex = ourCart && ourCart.products
        ? ourCart.products.findIndex((e) => e.productId.equals(productId))
        : -1;

    if (existingProductIndex === -1) {
        res.status(400).send({ success: false, error: "Product not in cart" })
        return;
    }

    ourCart.products[existingProductIndex].productQty = qty;
    await ourCart.save();
    let newTotalPrice = findTotalPrice(ourCart);
    // todo: cart save()
    res.status(200).send({ success: true, stock: product.stock, newPrice: (product.price - (product.discount ?? 0)) * qty, newTotalPrice })

    // res.status(200).send({ success: true, newPrice: product.price * qty });
}

export async function DeleteProductFromCart(req, res) {
    const { userId } = req.session;
    const { productId } = req.params;

    const ourCart = await Cart.findOne({ user: userId });

    const existingProductIndex = ourCart && ourCart.products
        ? ourCart.products.findIndex((e) => e.productId.equals(productId))
        : -1;
    if (existingProductIndex === -1) {
        res.status(400).send({ success: false, error: "Product not in cart" })
        return;
    }
    ourCart.products.splice(existingProductIndex, 1);

    await ourCart.save();

    let newTotalPrice = findTotalPrice(ourCart);
    res.status(200).send({ success: true, newTotalPrice })

}

export async function GetWishlistPage(req, res) {
    const { userId } = req.session;
    const user = await User.findById(userId).populate('wishlist');
    console.log(user);

    return res.render('user/wishlist', { wishlist: user.wishlist });
}

export async function AddToWishlist(req, res) {
    const { productId } = req.body;
    const { userId } = req.session;

    const user = await User.findById(userId);

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).send({ success: false, message: "Product not found" });
    }

    const existingProductIndex = user.wishlist && user.wishlist
        ? user.wishlist.findIndex((wishId) => wishId.equals(productId))
        : -1;

    if (existingProductIndex === -1) {
        user.wishlist.push(productId);
    }

    await user.save();
    res.status(200).send({ success: true });
}

export async function RemoveFromWishlist(req, res) {
    const { userId } = req.session;
    const { productId } = req.params;

    const user = await User.findById(userId);

    const existingProductIndex = user.wishlist && user.wishlist
        ? user.wishlist.findIndex((wishId) => wishId.equals(productId))
        : -1;

    if (existingProductIndex === -1) {
        res.status(400).send({ success: false, error: "Product not in wishlist" })
        return;
    }
    user.wishlist.splice(existingProductIndex, 1);

    await user.save();

    res.status(200).send({ success: true })
}