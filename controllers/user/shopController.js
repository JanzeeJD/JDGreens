"use strict";

import express from 'express';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
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

  const product = await Product.findById(productId).populate('category');

  if (!product) {
    res.sendStatus(404);
    return;
  }
  res.render("user/shop-detail", { product })
}

export async function GetShopPage(req, res) {

  const { sort_by, category, min, max, search } = req.query;

  let query = { isListed: true, isDeleted: false };
  let sort = {};
  if (sort_by) {
    if (sort_by === 'lowToHigh') {
      sort.price = 1;
    } else {
      sort.price = -1;
    }
  } else {
    sort.name = 1;
  }

  if (search) {
    query.name = { $regex: new RegExp(`^${search}`, "i") }
  }

  if (category) { // && isValidObjectId
    query.category = new mongoose.Types.ObjectId(category);
  }

  if (min && max) {
    let minnyMol = Number(min) || 0;
    let maxyMon = Number(max) || 5000;
    query.price = { $gt: minnyMol, $lt: maxyMon }
  }

  console.log(query);

  try {
    const page = Number(req.query.page) || 1;
    const limit = 3;

    const paginatedProducts = await Product.paginate(query, {
      sort: sort,
      page,
      limit
    });

    const products = paginatedProducts.docs;
    const categories = await Category.find();
    res.render('user/shop', {
      products,
      categories,
      currentPage: paginatedProducts.page,
      totalPages: paginatedProducts.totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching products');
  }
}