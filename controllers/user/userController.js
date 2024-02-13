"use strict";

import express from 'express';
import Cart from '../../models/Cart.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Coupon from '../../models/Coupon.js';
import { findTotalPrice } from './cartController.js';
import bcrypt from 'bcrypt';


export function GetShopPage(req, res) {
  res.render('user/shop')
}

export async function GetCheckoutPage(req, res) {
  const { userId } = req.session;

  const userAddress = await User.findOne({ _id: userId }, { address: 1 });
  const addresses = userAddress.address;

  // todo: only fetch coupons which didnt expire
  const coupons = await Coupon.find({ 
    usageLimit: { $gt: 0 },
    // usedBy: { $not: { $in: [userId] } }
  });

  const ourCart = await Cart.findOne({ user: userId });
  const totalPrice = findTotalPrice(ourCart);
  if (ourCart.products.length < 1) {
    res.redirect('/cart');
    return;
  }
  res.render('user/checkout', { cart: ourCart, coupons, addresses, totalPrice })
}


export async function PlaceOrderFromCheckoutPost(req, res) {
  const { userId } = req.session;
  const { addressOption, shippingOption, paymentOption, couponCode } = req.body;

  const user = await User.findOne({ _id: userId });
  const ourCart = await Cart.findOne({ user: userId });
  let totalPrice = findTotalPrice(ourCart);

  const newOrder = {};
  newOrder.user = userId;
  if (shippingOption === '0') {
    newOrder.shippingOption = 'Free';
  } else if (shippingOption === '50') {
    newOrder.shippingOption = 'Express';
    totalPrice += 50;
  } else if (shippingOption === '100') {
    newOrder.shippingOption = "Next";
    totalPrice += 100;
  }

  // todo: make it dynamic to support cards and UPI
  newOrder.paymentMethod = "COD";
  newOrder.status = "Confirmed";
  newOrder.total = totalPrice;

  /* Apply coupon, if any... */
  const coupon = await Coupon.findOne({ code: couponCode });
  if (coupon) {
    // todo: Check if cuopon is valid, not used before.
    if (coupon.discountType === 'FLAT') {
      newOrder.amountPayable = totalPrice - coupon.discountValue;
    } else if (coupon.discountType === 'PERCENTAGE') {
      newOrder.amountPayable = totalPrice - (totalPrice * coupon.discountValue) / 100;
    } else {
      newOrder.amountPayable = totalPrice;
    }
    
    coupon.usedBy.push(userId);
    coupon.usageLimit--;
    await coupon.save();
  } else {
    newOrder.amountPayable = totalPrice;
  }

  const existingAddressIndex = user.address.findIndex((address) => address._id.equals(addressOption));
  if (existingAddressIndex === -1) {
    res.sendStatus(400);
    return;
  }

  const existingAddress = user.address[existingAddressIndex];

  newOrder.address = {
    houseName: existingAddress.houseName,
    street: existingAddress.street,
    city: existingAddress.city,
    state: existingAddress.state,
    pin: existingAddress.pin,
    mobile: existingAddress.mobile
  };

  newOrder.items = [];
  for (let i = 0; i < ourCart.products.length; i++) {
    newOrder.items.push({
      productId: ourCart.products[i].productId,
      quantity: ourCart.products[i].productQty,
      price: ourCart.products[i].price,
    })
  }

  try {
    let order = await Order.create(newOrder);

    ourCart.products = [];
    await ourCart.save();
  
    res.redirect(`/user/orders/${order._id}`)
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}


export function GetAccountPage(req, res) {
  res.render('user/my-account')
}

export async function GetProfilePage(req, res) {
  const { userId } = req.session;
  const user = await User.findOne({ _id: userId });
  res.render("user/profile", { user })
}
export async function GetAddressPage(req, res) {
  const { userId } = req.session;
  const user = await User.findOne({ _id: userId });
  res.render("user/address", { user })
}

export async function GetAddAddressPage(req, res) {
  if (req.query.from === 'checkout') {
    req.session.addressFrom = '/user/checkout';
  } else {
    req.session.addressFrom = '/user/address';
  }
  res.render("user/add-address");
}

export async function AddAddressPost(req, res) {
  const { userId } = req.session;

  const { houseName, street, city, state, pin, mobile } = req.body;

  if (!houseName || houseName.length < 3) {
    res.render("user/add-address", { body: req.body, error: "Please provide a valid house name (at least 3 characters)." });
    return;
  }

  if (!street || street.length < 3) {
    res.render("user/add-address", { body: req.body, error: "Street must contain at least 3 characters." });
    return;
  }

  if (!city || !/^[a-zA-Z]{3,}$/.test(city)) {
    res.render("user/add-address", { body: req.body, error: "City must contain at least 3 letters and only alphabets." });
    return;
  }

  if (!state || !/^[a-zA-Z]{3,}$/.test(state)) {
    res.render("user/add-address", { body: req.body, error: "State must contain at least 3 letters and only alphabets." });
    return;
  }

  if (!pin || pin.length < 6) {
    res.render("user/add-address", { body: req.body, error: "Please enter a valid 6-digit PIN" });
    return;
  }

  if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
    res.render("user/add-address", { body: req.body, error: "Please enter a valid 10-digit mobile number." });
    return;
  }

  const user = await User.findOne({ _id: userId });

  const newAddress = {
    houseName, street, city, state, pin, mobile
  }

  user.address.push(newAddress);
  await user.save();

  res.redirect(req.session.addressFrom ?? '/user/address');
}


export async function GetEditAddressPage(req, res) {
  const { userId } = req.session;
  const { addressId } = req.params;
  const user = await User.findOne({ _id: userId });

  const existingAddressIndex = user.address.findIndex((address) => address._id.equals(addressId));
  if (existingAddressIndex === -1) {
    res.sendStatus(400);
    return;
  }

  const existingAddress = user.address[existingAddressIndex];

  res.render("user/edit-address", { address: existingAddress });
}

export async function EditAddressPost(req, res) {
  const { userId } = req.session;
  const { addressId } = req.params;

  const { houseName, street, city, state, pin, mobile } = req.body;
  // req.body = Object.assign(req.body, { _id: addressId })
  req.body._id = addressId;

  if (!houseName || houseName.length < 3) {
    res.render("user/edit-address", { address: req.body, error: "Please provide a valid house name (at least 3 characters)." });
    return;
  }

  if (!street || street.length < 3) {
    res.render("user/edit-address", { address: req.body, error: "Street must contain at least 3 characters." });
    return;
  }

  if (!city || !/^[a-zA-Z]{3,}$/.test(city)) {
    res.render("user/edit-address", { address: req.body, error: "City must contain at least 3 letters and only alphabets." });
    return;
  }

  if (!state || !/^[a-zA-Z]{3,}$/.test(state)) {
    res.render("user/edit-address", { address: req.body, error: "State must contain at least 3 letters and only alphabets." });
    return;
  }

  if (!pin || pin.length < 6) {
    res.render("user/edit-address", { address: req.body, error: "Please enter a valid 6-digit PIN without repeating consecutive digits." });
    return;
  }

  if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
    res.render("user/edit-address", { address: req.body, error: "Please enter a valid 10-digit mobile number without repeating consecutive digits." });
    return;
  }

  const user = await User.findOne({ _id: userId });

  const existingAddressIndex = user.address.findIndex((address) => address._id.equals(addressId));
  if (existingAddressIndex === -1) {
    res.sendStatus(400);
    return;
  }

  user.address[existingAddressIndex].houseName = houseName;
  user.address[existingAddressIndex].street = street;
  user.address[existingAddressIndex].city = city;
  user.address[existingAddressIndex].state = state;
  user.address[existingAddressIndex].pin = pin;
  user.address[existingAddressIndex].mobile = mobile;

  await user.save();

  res.redirect(req.session.addressFrom ?? '/user/address');
}

export async function DeleteAddress(req, res) {
  const { userId } = req.session;
  const { addressId } = req.params;

  const user = await User.findOne({ _id: userId });

  const existingAddressIndex = user.address.findIndex(address => address._id.equals(addressId));
  if (existingAddressIndex === -1) {
    res.sendStatus(400);
    return;
  }

  user.address.splice(existingAddressIndex, 1);

  await user.save();

  res.status(200).send({ success: true });
}

// /user/order so that's part of /user, so that's userCOntroller

export async function GetOrdersPage(req, res) {
  const { userId } = req.session;

  const userOrders = await Order.find({ user: userId }).sort({createdAt:-1});

  res.render("user/orders", { userOrders });
}

export async function GetOrderDetailPage(req, res) {
  const { userId } = req.session;
  const { orderId } = req.params;

  const userOrder = await Order.findOne({ user: userId, _id: orderId });

  res.render("user/order-detail", { userOrder });
}

export async function PatchOrderDetailPage(req, res) {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  const { status, isCancelled } = req.body;

  try {
    order.isCancelled = isCancelled;
    order.status = status;
    await order.save();
  
    res.status(200).json({
      success: true
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

export async function PostChangePasswordLoggedIn(req, res) {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.session.userId);

  if (await bcrypt.compare(oldPassword, user.password)) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({ message: "Changed password. " });

  } else {

    res.status(400).send({ error: "Invalid password given." })
  }
}