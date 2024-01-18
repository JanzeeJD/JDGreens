"use strict";

import User from "../../models/User.js";
import Category from "../../models/Category.js";
import express from 'express';

/**
 * **Route:** GET /admin
 * 
 * Renders the admin page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export function GetAdminLogin(req, res) {
  if (req.session.isAdmin) {
    res.redirect('/admin/dashboard');
  } else {
    res.render("admin/login");
  }
}

/**
 * **Route:** GET /admin/logout
 * 
 * Logs out the admin.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetAdminLogout(req, res) {
  req.session.isAdmin = false;
  res.redirect('/admin/');
}

/**
 * **Route:** POST /admin/login
 * 
 * Logs in the admin.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function PostAdminLogin(req, res) {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render("admin/login", { error: "Invalid credentials" });
  }
}

/**
 * **Route:** GET /admin/dashboard
 * 
 * Renders the admin dashboard.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetAdminDashboard(req, res) {
  res.render("admin/dashboard");
}

/**
 * **Route:** GET /admin/users
 * 
 * Renders the user management page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetUserPage(req, res) {
  const allUsers = await User.find();
  res.render("admin/users", { users: allUsers });
}

/**
 * **Route:** GET /admin/category
 * 
 * Renders the category management page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetCategoryPage(req, res) {
  const categories = await Category.find();
  res.render("admin/category",  { categories })
}