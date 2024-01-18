"use strict";

import express, { request } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';

/**
 * **Route:** GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */


export function GetLoginPage(req, res) {
  if (req.query.new === 'true') {
    res.render('user/auth', { welcomeMessage: "You have registered a new account." });
  } else {
    res.render('user/auth');
  }
}

export async function PostLogin(req, res) {
  const { email, password } = req.body;
  if (!email) {
    res.render("user/auth", { loginError: "Enter an email address" });
    return;
  }
  if (!password || password.length < 8) {
    res.render("user/auth", { loginError: "password must contain atleast 8 characters" })
    return;
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    res.render("user/auth", { loginError: "Invalid credentials" })
    return;
  }

  if (user.isBlocked) {
    res.render("user/auth", { loginError: "You are Blocked! ⚠️" })
    return;
  }

  if (await bcrypt.compare(password, user.password)) {
    req.session.loggedIn = true;
    req.session.email = req.body.email;
    res.redirect('/');

  } else {

    res.render("user/auth", { error: "Invalid credentials" })
  }
}



/**
 * GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */


export function GetSignupPage(req, res) {
  res.render('user/auth', { override: true });
}

export async function PostSignup(req, res) {
  const { name, email, password } = req.body;
  if (!name) {
    res.render("user/auth", { override: true, signupError: "Enter a valid name" });
    return
  }
  if (!email) {
    res.render("user/auth", { override: true, signupError: "Enter an email address" });
    return
  }
  if (!password || password.length < 8) {
    res.render("user/auth", { override: true, signupError: "password must contain atleast 8 characters" })
    return
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    res.render("user/auth", { override: true, signupError: "user already exists" })
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashedPassword });
    req.session.loggedIn = false;
    req.session.newlyRegistered = true;
    req.session.email = email;
    req.session.otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otpExpiry = Date.now() + (3 * 60000);
    console.log(`[otp] ⚡ OTP for ${user.email} is ${req.session.otp} `);
    res.redirect('/signup-otp');
  } catch (err) {
    console.error(err);
    res.send(err);
  }
}

export function GetLogout(req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).send('Unable to log out');
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.end();
  }
 }
 

export function GetOTPPage(req, res) {
  if (!req.session.newlyRegistered) {
    res.redirect('/login');
  } else {
    res.render("user/otp");
  }
}

export function PostOTPPage(req, res) {
  const otp = req.body.otp;
  if (!otp) {
    res.status(403).send({ success: false, error: "An invalid OTP was entered." });
    return;
  }

  if (Date.now() <= req.session.otpExpiry) {
    res.status(403).send({ success: false, error: "The timer has run out." });
    return;
  }

  if (otp.toString() === req.session.otp.toString()) {
    req.session.otp = null;
    req.session.otpExpiry = 0;
    req.session.newlyRegistered = false;
    res.status(200).send({ success: true })
  } else {
    res.status(403).send({ success: false, error: "An invalid OTP was entered." });
  }
}

export async function PostResendOTP(req, res) {
  if (req.session.newlyRegistered) {
    req.session.otp = Math.floor(1000 + Math.random() * 9000);
    req.session.otpExpiry = Date.now() + (3 * 60000);
    const user = await User.findOne({ email: req.session.email });
    // todo: await sendOTPEmail(user.email, otp);
    console.log(`[otp] ⚡ OTP resend for ${user.email} is ${req.session.otp}`);
    res.status(200).send({ success: true });
  } else {
    res.status(403).send({ success: false, error: "Could not resend OTP." });
  }
}


/**
 * GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export async function GetHomePage(req, res) {
  const products = await Product.find().limit(4);
  res.render('user/index', { products });
 }
 

/**
 * GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export function GetAboutPage(req, res) {
  res.render('user/about');
}

/**
 * GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export function GetGalleryPage(req, res) {
  res.render('user/gallery');
}

/**
 * GET /
 * 
 * Renders the home page.
 * @param {express.Request} req 
 * @param {express.Response} res
 */
export function GetContactPage(req, res) {
  res.render('user/contact-us')
}

