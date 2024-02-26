
"use strict";
import express from 'express';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';

/**
 * **Route:** GET /admin/product
 * 
 * Renders the product management page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetProductListingPage(req, res) {
  res.locals.activePanel = 'products';
  const products = await Product.find({ isDeleted: false }).populate("category").exec();
  res.render("admin/product", { products })
}

/**
 * **Route:** GET /admin/product/add-product
 * 
 * Renders the add product page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetAddProductPage(req, res) {
  const categories = await Category.find();
  res.render("admin/add-product", { categories });
}

export async function GetEditProductPage(req,res){
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId });
  const categories = await Category.find();
  res.render("admin/edit-product", { categories, product });
}

export async function PostEditProductPage(req, res) {
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId });
  const categories = await Category.find();
  // @ts-ignore
  if (req.imageError) {
    res.render("admin/edit-product", { categories, product, error: "Images are invalid." });
    return;
  }

  const name = req.body.productName?.trim();
  const description = req.body.productDescription?.trim();
  const category = req.body.productCategory;
  const size = req.body.productSize;
  const stock = Number(req.body.productStock?.trim());
  const price = Number(req.body.productPrice?.trim());

  // todo: exception handling...
  const imagesToDelete = JSON.parse(req.body.imagesToDelete);
  console.log("imagesToDelete", imagesToDelete);

  // @ts-ignore
  const fileNames = req.files.map(file => file.filename);
  if (!fileNames) {
    res.render("admin/edit-product", { categories, product, error: "Add valid images." });
  }

  // if (!fileNames) {
  //   res.render("admin/edit-product", { product, categories, error: "Pick a file." });
  //   return;
  // }

  if (!name || name.length > 50) {
    res.render("admin/edit-product", { product, categories, error: "Enter a productName." });
    return;
  }


  if (!description || description.length > 1000) {
    res.render("admin/edit-product", { product, categories, error: "Enter a description." });
    return;
  }

  if (!category) {
    res.render("admin/edit-product", { product, categories, error: "⚠️Select a category" });
    return;
  }
  if (!size) {
    res.render("admin/edit-product", { product, categories, error: "⚠️Select a size" });
    return;
  }

  // Check if stock is a positive number and less than 8 digits
  if (!stock || stock < 0 || String(stock).length > 8) {
    res.render("admin/edit-product", { product, categories, error: "❌Invalid stock." });
    return;
  }

  // Check if price is a positive number and less than 8 digits
  if (!price || price < 0 || String(price).length > 8) {
    res.render("admin/add-product", { categories, error: "❌Invalid price." });
    return;
  }

  if (imagesToDelete.length > 0) {
    product.images = product.images.filter(e => !imagesToDelete.includes(e));
  }

  // const product = await Product.({ name, description, category, price, size, stock, images: fileNames });
  // Cif a different product name was given
  if (product.name !== name) {
    // Convert the name to lowercase
    const lowerCaseName = name
    // already undo enn nokkanam
    const existingProduct = await Product.findOne({ name: {$regex : lowerCaseName, '$options' : 'i'} });
    if (existingProduct) {
      // If a product with the same name exists, render the add-product view with an error message
      res.render("admin/edit-product", { product, categories, error: "Product already exists." });
      return;
    }
    product.name = name;
  }
  if (product.description !== description) {
    product.description = description;
  }
  if (product.category !== category) {
    product.category = category;
  }
  if (product.price !== price) {
    product.price = price;
  }
  if (product.size !== size) {
    product.size = size;
  }
  if (product.stock !== stock) {
    product.stock = stock;
  }
  if (fileNames.length > 0) {
    product.images.push(...fileNames);
  }
  await product.save();

  res.redirect('/admin/product');
}


/**
 * **Route:** POST /admin/product/add-product
 * 
 * Create a new product.
 * @param {express.Request} req 
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export async function PostAddProduct(req, res, next) {

  const categories = await Category.find();
  // @ts-ignore
  if (req.imageError) {
    res.render("admin/add-product", { categories, error: "Images are invalid." });
    return;
  }

  const name = req.body.productName?.trim();
  const description = req.body.productDescription?.trim();
  const category = req.body.productCategory;
  const size = req.body.productSize;
  const stock = Number(req.body.productStock?.trim());
  const price = Number(req.body.productPrice?.trim());


  // @ts-ignore
  const fileNames = req.files.map(file => file.filename);
  if (!fileNames) {
    res.render("admin/add-product", { categories, error: "Add valid images." });
  }

  // Convert the name to lowercase
  const lowerCaseName = name
  
  // Check if a product with the same name already exists
  const existingProduct = await Product.findOne({ name: {$regex : lowerCaseName, '$options' : 'i'} });
  console.log(existingProduct)

  if (existingProduct) {
    // If a product with the same name exists, render the add-product view with an error message
    res.render("admin/add-product", { categories, error: "Product already exists." });
    return;
  }


  if (!fileNames) {
    res.render("admin/add-product", { categories, error: "Pick a file." });
    return;
  }

  if (!name || name.length > 50) {
    res.render("admin/add-product", { categories, error: "Enter a productName." });
    return;
  }


  if (!description || description.length > 1000) {
    res.render("admin/add-product", { categories, error: "Enter a description." });
    return;
  }

  if (!category) {
    res.render("admin/add-product", { categories, error: "⚠️Select a category" });
    return;
  }
  if (!size) {
    res.render("admin/add-product", { categories, error: "⚠️Select a size" });
    return;
  }

  // Check if stock is a positive number and less than 8 digits
  if (!stock || stock < 0 || String(stock).length > 8) {
    res.render("admin/add-product", { categories, error: "❌Invalid stock." });
    return;
  }

  // Check if price is a positive number and less than 8 digits
  if (!price || price < 0 || String(price).length > 8) {
    res.render("admin/add-product", { categories, error: "❌Invalid price." });
    return;
  }

  const product = await Product.create({ name, description, category, price, size, stock, images: fileNames });

  res.redirect('/admin/product');
}

export async function SoftDeleteProduct(req, res) {
  const productId = req.params.id;
  try {
    const product = await Product.findByIdAndUpdate(productId, { isDeleted: true });
    if (!product) {
      res.status(404).send({ success: false, error: "Product not found." });
      return;
    }
    res.status(200).send({ uccess: true })
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
}

export async function SetProductListing(req, res) {
  const productId = req.params.id;
  const newListing = req.body.isListed;
  console.log(productId, newListing);
  try {
    const product = await Product.findByIdAndUpdate(productId, { isListed: newListing });
    if (!product) {
      res.status(404).send({ success: false, error: "Product not found." });
      return;
    }
    res.status(200).send({ success: true })
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
}