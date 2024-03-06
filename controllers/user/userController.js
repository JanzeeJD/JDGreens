"use strict";

import express from 'express';
import Cart from '../../models/Cart.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Coupon from '../../models/Coupon.js';
import { findTotalPrice } from './cartController.js';
import PDFDocument from 'pdfkit-table';
import bcrypt from 'bcrypt';
import Razorpay from "razorpay";
import { config } from 'dotenv';
import { markSale } from '../../utils/analytics.js';
config();

/**
 * 
 * @param {express.Response} res 
 * @param {Order} order
 */
async function generateInvoice(res, order, cart) {
  const doc = new PDFDocument();
  const filename = "Order Invoice.pdf";

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  // Add company name, logo, place, pincode, etc.
  doc.font("Helvetica-Bold").text("JD Greens", { font: 36, align: "center", margin: 10 });

  // Add logo to the left side
  //   doc.image('public/img/somePlant.jpeg', {
  //     width: 100,
  //     x: 410, // Adjust for desired left margin
  //     y: 80 // Adjust for vertical position
  // });
  
  doc.moveDown();

  // Add other invoice details
  doc.text(`Address:  ${order.address?.houseName}`, { font: 10 });
  doc.text(`Pincode: ${order.address?.pin}`, { font: 10 });
  doc.text(`Phone: ${order.address?.mobile}`, { font: 10 });

  // Move to the next line after the details
  doc.moveDown();

  doc.moveDown(); // Move down after the title
  doc.font("Helvetica-Bold").text(`Invoice`, { font: 14, align: "center", margin: 10 });
  doc.font("Helvetica-Bold").text(`${order.createdAt}`, { font: 8, align: "center", margin: 10 });

  doc.moveDown(); // Move down after the title
  const tableData = {
    headers: [
      "Product",
      "Price",
      "Quantity",
      "Subtotal"
    ],

    rows: order.items.map((productDetail) => [
      productDetail?.productName,
      'INR  ' + productDetail?.price,
      productDetail?.quantity,
      'INR  ' + (productDetail.price * productDetail.quantity)
    ])
  };

  // Customize the appearance of the table
  await doc.table(tableData, {
    prepareHeader: () => doc.font("Helvetica-Bold"),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(12),
    hLineColor: '#b2b2b2', // Horizontal line color
    vLineColor: '#b2b2b2', // Vertical line color
    textMargin: 5, // Margin between text and cell border
  });

  
  let shippingPrice = "INR  0 (Free)";
  console.log(order.shippingOption);
  if (order.shippingOption === 'Express') {
    shippingPrice = "INR  50 (Express)";
  } else if (order.shippingOption === 'Next') {
    shippingPrice = "INR 100 (Next Day)";
  }

  const totalPrice = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  doc.text(`Product Total: INR ${totalPrice}`, { font: 10 });
  doc.text(`- Discount: INR ${order.discountAmount}`, { font: 10 });
  doc.text(`Total Price: INR ${totalPrice - order.discountAmount}`, { font: 10 });
  doc.text(`+ Shipping Charges: INR ${shippingPrice}`, { font: 10 });
  doc.text(`Amount Payable: INR ${order.amountPayable}`, { font: 10 });
  // Finalize the PDF document
  doc.end();
}

export async function GenerateOrderInvoiceAsPDF(req, res) {
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });

  generateInvoice(res, order);
}

function calculateDiscount(coupon, totalPrice) {
  const data = { eligible: false, discount: 0 };

  if (coupon.discountType === 'FLAT') {
    //* Eligibility Criteria:
    // A FLAT coupon maybe applied only if the total price >= discount value x 5
    // eg: For a flat discount of $100, the user has to shop for minimum ($100 x 5 = $500)
    if (totalPrice >= (coupon.discountValue * 5)) {
      data.eligible = true;
      data.discount = coupon.discountValue;
    }
  } else if (coupon.discountType === 'PERCENTAGE') {
    //* Elgibility Criteria:
    // None
    //* Note:
    // Allowed Discount = min(maxDiscount, discountAmount)
    const amountToDiscount = (totalPrice * coupon.discountValue) / 100;
    const allowedDiscount = Math.min(amountToDiscount, coupon.maxDiscount); 
    data.eligible = true;
    data.discount = allowedDiscount;
  }

  return data;
}

var razorPayInstance = new Razorpay({ key_id: process.env.RAZORPAY_ID_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY });

export function GetShopPage(req, res) {
  res.render('user/shop')
}

export async function GetCheckoutPage(req, res) {
  const { userId } = req.session;

  const user = await User.findById(userId);
  const addresses = user.address;
  const wallet = user.wallet;

  const ourCart = await Cart.findOne({ user: userId });
  const totalPrice = findTotalPrice(ourCart);

  // todo: only fetch coupons which didnt expire
  
  // totalPrice coupon.discountValue 
  let coupons = await Coupon.find({
    $or: [
      { usageLimit: { $exists: false } },
      { usageLimit: { $gt: 0 } }
    ]
  }).lean();

  coupons = coupons.filter(coupon => {
    if (coupon.discountType === 'FLAT' && totalPrice < (coupon.discountValue * 5)) {
      return false;
    }
    return true;
  });

  if (ourCart.products.length < 1) {
    res.redirect('/cart');
    return;
  }
  res.render('user/checkout', { cart: ourCart, coupons, addresses, wallet, totalPrice })
}

export async function PlaceOrderForPayment(req, res) {
  const { userId } = req.session;
  const { addressOption, shippingOption, paymentOption, couponCode } = req.body;
  
  const user = await User.findOne({ _id: userId });
  const ourCart = await Cart.findOne({ user: userId });

  /** The summation of all products in the cart.  */
  const totalPrice = findTotalPrice(ourCart);
  
  const coupon = await Coupon.findOne({ code: couponCode });
  let discountAmount = 0;
  if (coupon) {
    const { eligible, discount } = calculateDiscount(coupon, totalPrice);
    if (eligible) {
      discountAmount = discount;
    }
  }
  const shippingCost = (shippingOption === '50' || shippingOption === '100') ? Number(shippingOption) : 0;
  const totalPriceAfterDiscountAndShipping = (totalPrice - discountAmount) + shippingCost;

  try {
    var options = {
      amount: totalPriceAfterDiscountAndShipping * 100, // Convert amount to the smallest currency unit (e.g., paise in INR)
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    // Creating the order
    console.log("[razorpay] creating order for Rs. " + options.amount.toString());
    razorPayInstance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }
      // console.log("order is",order);``
      // Add orderprice to the response object
      console.log("[razorpay] order created");
      req.session.awaitingPayment = true;
      req.session.orderId = order.id;
      const _user = {
        name: user.name,
        email: user.email
      }
      res.status(201).send({ orderId: order.id, user: _user, amount: options.amount });
      // Replace razorpayOrderId and razorpayPaymentId with actual values
      // Redirect to /orderdata on successful payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

}

export async function PlaceOrderFromCheckoutPost(req, res) {
  const { userId } = req.session;
  const { addressOption, shippingOption, paymentOption, couponCode } = req.body;

  const user = await User.findOne({ _id: userId });
  const ourCart = await Cart.findOne({ user: userId });

  const newOrder = {};
  newOrder.user = userId;

  /** The summation of all products in the cart.  */
  const totalPrice = findTotalPrice(ourCart);
  
  // Apply coupon.
  const coupon = await Coupon.findOne({ code: couponCode });
  let discountAmount = 0;
  if (coupon) {
    // todo: Check if cuopon is valid, not used before.
    const { eligible, discount } = calculateDiscount(coupon, totalPrice);
    if (eligible) {
      discountAmount = discount;
      coupon.usedBy.push(userId);
      coupon.usageLimit && coupon.usageLimit--;
    }
  }
  const totalPriceAfterDiscount = totalPrice - discountAmount;
  
  // Calculate shipping cost.
  let shippingCost = 0;
  if (shippingOption === '0') {
    newOrder.shippingOption = 'Free';
  } else if (shippingOption === '50') {
    newOrder.shippingOption = 'Express';
    shippingCost = 50;
  } else if (shippingOption === '100') {
    newOrder.shippingOption = "Next";
    shippingCost = 100;
  }
  
  const amountPayableAfterDiscountAndShipping = totalPriceAfterDiscount + shippingCost;
  
  newOrder.total = totalPrice;
  newOrder.discountAmount = discountAmount;
  newOrder.amountPayable = amountPayableAfterDiscountAndShipping;

  newOrder.status = "Confirmed";

  newOrder.paymentMethod = paymentOption.toLowerCase();
  if (newOrder.paymentMethod === 'upi') {
    if (req.session.awaitingPayment) {
      const orderId = req.session.orderId;
      if (!orderId) {
        return res.status(500).send({ error: "orderId not found" });
      }

      try {
        const order = await razorPayInstance.orders.fetch(orderId);
        if (order.amount_paid >= order.amount) {
          newOrder.paymentId = orderId;
        } else {
          newOrder.status = "Payment Issue";
        }
        req.session.awaitingPayment = false;

      } catch (err) {
        return res.status(500).send({ error: "order not found. "});
      }
    } else {
      return res.status(500).send({ error: "not awaiting payment" });
    }
  } else if (newOrder.paymentMethod === 'wallet') {
    if (user.wallet < amountPayableAfterDiscountAndShipping) {
      return res.status(400).send({ error: "insufficient fund" });
    }

    user.wallet -= amountPayableAfterDiscountAndShipping;
    user.walletTransactions.push({
      createdAt: new Date(),
      amount: -amountPayableAfterDiscountAndShipping,
      type: "order"
    });
  } else if (newOrder.paymentMethod === 'cod') {
    if (totalPriceAfterDiscount > 2000) {
      return res.status(400).send({ error: "COD not allowed for above Rs. 2000" });
    }
  }

  const existingAddressIndex = user.address.findIndex((address) => address._id.equals(addressOption));
  if (existingAddressIndex === -1) {
    return res.status(400).send({ error: "Invalid address" });
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
      productName: ourCart.products[i].name,
      quantity: ourCart.products[i].productQty,
      price: ourCart.products[i].price - (ourCart.products[i].discount ?? 0),
    })

    // Sales Analytics
    await markSale(new Date(), ourCart.products[i].productId, ourCart.products[i].productQty);
  }

  // todo: optimize
  // await markSales(new Date(), ourCart);

  try {
    let order = await Order.create(newOrder);

    ourCart.products = [];

    await ourCart.save();
    await user.save();
    coupon && await coupon.save();

    res.redirect(`/user/orders/${order._id}`)
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}


export async function GetAccountPage(req, res) {
  const { userId } = req.session;
  const user = await User.findOne({ _id: userId });
  res.render('user/my-account', { user })
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

  const goto = req.session.addressFrom ?? '/user/address';
  req.session.addressFrom = null;

  res.redirect(goto);
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

  const goto = req.session.addressFrom ?? '/user/address';
  req.session.addressFrom = null;

  res.redirect(goto);
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

  const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  res.render("user/orders", { userOrders });
}

export async function GetWalletPage(req, res) {
  const { userId } = req.session;

  const user = await User.findById(userId);

  res.render("user/wallet", { user });
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
  const user = await User.findById(req.session.userId)

  try {
    order.isCancelled = isCancelled;
    order.status = status;
    await order.save();
    if (status === 'Cancelled' || status === 'Returned') {
      // if order cancelled amount added to wallet
      if (order.paymentMethod === 'upi' || order.paymentMethod === 'wallet') {
        user.wallet = user.wallet + order.amountPayable
        user.walletTransactions.push({
          createdAt: new Date(),
          amount: order.amountPayable,
          type: `Refund (${status})`
        });
      }
    }
    await user.save();
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
  if(!newPassword || newPassword.length<8){
    res.status(400).send({error: "password format is invalid"})
    return
  }


  if (await bcrypt.compare(oldPassword, user.password)) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({ message: "Changed password. " });

  } else {

    res.status(400).send({ error: "Invalid password given." })
  }
}