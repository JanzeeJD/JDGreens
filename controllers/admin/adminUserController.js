"use strict";

import User from "../../models/User.js";
import Order from "../../models/Order.js"
import mongoose from "mongoose";

export async function GetUserPage(req, res) {
  res.locals.activePanel = 'users';
  const allUsers = await User.find();
  res.render("admin/users", { users: allUsers });
}

export async function SetBlockStatus(req, res) {
  const userId = req.params.userId;
  const isBlocked = req.body.isBlocked;

  const user = await User.findById(userId);
  user.isBlocked = isBlocked;
  await user.save();
  
  res.sendStatus(201)
}

export async function GetAdminOrdersPage(req, res) {
  res.locals.activePanel = 'orders';
  const allOrders = await Order.find().sort({createdAt:-1});
  res.render("admin/order", { orders: allOrders });
}

export async function GetAdminOrderDetailPage(req, res) {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  res.render("admin/order-detail", { order });
}

export async function PatchAdminOrderDetailPage(req, res) {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.sendStatus(400);
    return;
  }

  const order = await Order.findById(orderId);
  const user = await User.findById(order.user);
  const { status } = req.body;
  const isCancelled = status === 'Cancelled' 

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
          type: `Refund (${status} by Store)`
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