"use strict";

import User from "../../models/User.js";
import Category from "../../models/Category.js";
import express from 'express';
import { generateStatistics } from "./adminSalesController.js";
import { getTopSellingCategories, getTopSellingProducts } from "../../utils/analytics.js";
import Order from "../../models/Order.js";

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
  res.locals.activePanel = 'dashboard';
  const stats = await generateStatistics();

  const weeklyData = await calculateWeeklyOrderAggregates();
  const monthlyData = await calculateMonthlyOrderAggregates();
  const yearlyData = await calculateYearlyOrderAggregates();

  const bestSellingProducts = await getTopSellingProducts();
  const bestSellingCategories = await getTopSellingCategories();

  res.render("admin/dashboard", { stats, weeklyData, monthlyData, yearlyData, bestSellingProducts, bestSellingCategories });
}

/**
 * **Route:** GET /admin/users
 * 
 * Renders the user management page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetUserPage(req, res) {
  res.locals.activePanel = 'users';
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
  res.locals.activePanel = 'categories';
  const categories = await Category.find();
  res.render("admin/category", { categories })
}




async function calculateWeeklyOrderAggregates() {
  const currentDate = new Date();
  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(currentDate.getDate() - 7);
  currentDate.setDate(currentDate.getDate() + 1);
  const weeklyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo, $lte: currentDate } // Filter orders within the last 7 days
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" }, // Group by day of the week
        count: { $sum: 1 } // Count the number of orders for each day
      }
    },
    {
      $sort: {
        _id: 1
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        dayOfWeek: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "Sun" },
              { case: { $eq: ["$_id", 2] }, then: "Mon" },
              { case: { $eq: ["$_id", 3] }, then: "Tue" },
              { case: { $eq: ["$_id", 4] }, then: "Wed" },
              { case: { $eq: ["$_id", 5] }, then: "Thu" },
              { case: { $eq: ["$_id", 6] }, then: "Fri" },
              { case: { $eq: ["$_id", 7] }, then: "Sat" }
            ],
            default: "Unknown" // Handle unknown day of the week
          }
        },
        count: 1 // Include count field
      }
    },
  ]);
  
  return weeklyData;
}

async function calculateMonthlyOrderAggregates() {
  const currentDate = new Date();
  const tenMonthsAgo = new Date(currentDate);
  tenMonthsAgo.setMonth(currentDate.getMonth() - 10);
  currentDate.setDate(currentDate.getDate() + 1);
  const monthlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: tenMonthsAgo, $lte: currentDate } // Filter orders within the last 10 months
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, // Group by month
        count: { $sum: 1 } // Count the number of orders for each month
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        month: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "Jan" },
              { case: { $eq: ["$_id", 2] }, then: "Feb" },
              { case: { $eq: ["$_id", 3] }, then: "Mar" },
              { case: { $eq: ["$_id", 4] }, then: "Apr" },
              { case: { $eq: ["$_id", 5] }, then: "May" },
              { case: { $eq: ["$_id", 6] }, then: "Jun" },
              { case: { $eq: ["$_id", 7] }, then: "Jul" },
              { case: { $eq: ["$_id", 8] }, then: "Aug" },
              { case: { $eq: ["$_id", 9] }, then: "Sep" },
              { case: { $eq: ["$_id", 10] }, then: "Oct" },
              { case: { $eq: ["$_id", 11] }, then: "Nov" },
              { case: { $eq: ["$_id", 12] }, then: "Dec" }
            ],
            default: "Unknown" // Handle unknown month
          }
        },
        count: 1 // Include count field
      }
    }
  ]);

  return monthlyData;
}

async function calculateYearlyOrderAggregates() {
  const currentDate = new Date();
  const threeYearsAgo = new Date(currentDate);
  threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);
  currentDate.setDate(currentDate.getDate() + 1);
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: threeYearsAgo, $lte: currentDate } // Filter orders within the last 3 years
      }
    },
    {
      $group: {
        _id: { $year: "$createdAt" }, // Group by year
        count: { $sum: 1 } // Count the number of orders for each year
      }
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        year: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 2022] }, then: "2022" },
              { case: { $eq: ["$_id", 2023] }, then: "2023" },
              { case: { $eq: ["$_id", 2024] }, then: "2024" }
            ],
            default: "Unknown" // Handle unknown year
          }
        },
        count: 1 // Include count field
      }
    }
  ]);
  return data;
}