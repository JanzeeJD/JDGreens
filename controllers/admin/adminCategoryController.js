"use strict";

import Category from "../../models/Category.js";

export function GetAddCategoryPage(req, res) {
  res.render("admin/add-category");
}

export async function GetEditCategoryPage(req, res) {
  const categoryId = req.params.id;
  const targetCategory = await Category.findOne({ _id: categoryId });
  console.log(targetCategory)
  res.render("admin/edit-category", { category: targetCategory });
}

export async function PostEditCategory(req, res) {
  const categoryId = req.params.id;
  const existingCategory = await Category.findById(categoryId);

  const name = req.body.categoryName?.trim();
  const description = req.body.categoryDescription?.trim();

  if (!name) {
    res.render("admin/edit-category", { error: "Enter a category." });
    return;
  }

  if (!description) {
    res.render("admin/edit-category", { error: "Enter a description." });
    return;
  }

  if (name != existingCategory.name) {
    const lowerCaseName = name.toLowerCase();
    const duplicateCategory = await Category.findOne({ name: {$regex : lowerCaseName, '$options' : 'i'} });
    if (duplicateCategory) {
      // If a category with the same name exists, render the add-category view with an error message
      res.render("admin/add-category", { error: "Category already exists." });
      return;
    }
  }

  existingCategory.name = name;
  existingCategory.description = description;
  await existingCategory.save();

  res.redirect('/admin/category');
}

export async function PostAddCategory(req, res) {
  const name = req.body.categoryName?.trim();
  const description = req.body.categoryDescription?.trim();

  if (!name) {
    res.render("admin/add-category", { error: "Enter a category." });
    return;
  }

  if (!description) {
    res.render("admin/add-category", { error: "Enter a description." });
    return;
  }

  // Convert the name to lowercase
  const lowerCaseName = name.toLowerCase();

  // Check if a category with the same name already exists
  const existingCategory = await Category.findOne({ name: {$regex : lowerCaseName, '$options' : 'i'} });

  if (existingCategory) {
    // If a category with the same name exists, render the add-category view with an error message
    res.render("admin/add-category", { error: "Category already exists." });
    return;
  }

  console.log('printing category name',name)

  // If no category with the same name exists, create a new category
  const category = await Category.create({ name, description });

  res.redirect('/admin/category');
}

export async function DeleteCategory(req, res) {
  const categoryId = req.params.id;
  try {
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) {
      res.status(404).send({ success: false, error: "Category not found" })
      return;
    }
    res.status(201).send({ success: true })
  } catch (err) {
    res.status(500).send({ success: false, error: err })
  }
}