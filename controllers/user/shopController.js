"use strict";

import express from 'express';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import mongoose from 'mongoose';
// listing + pagination
// searching
// filtering
// product detail
export async function GetProductPage(req, res) {
  const productId = req.params.id;

  // If product id is not valid
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.sendStatus(400);
    return;
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.sendStatus(404);
    return;
  }
  res.render("user/shop-detail", { product })
}

export async function GetShopPage(req, res) {
  const products = await Product.find({ isListed: true, isDeleted: false }); 
  const categories = await Category.find(); 
  res.render('user/shop', { products, categories })
}