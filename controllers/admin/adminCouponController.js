"use strict";

import Coupon from "../../models/Coupon.js";

export async function GetCouponPage(req, res) {
  res.locals.activePanel = 'coupons';
  const coupons = await Coupon.find();
  res.render("admin/coupon",  { coupons })
}

export function GetAddCouponPage(req, res) {
  res.render("admin/add-coupon");
}

export async function GetEditCouponPage(req, res) {
  const couponId = req.params.id;
  const targetCoupon = await Coupon.findOne({ _id: couponId });
  res.render("admin/edit-coupon", { coupon: targetCoupon });
}

export async function PostEditCoupon(req, res) {
  const couponId = req.params.id;
  const existingCoupon = await Coupon.findById(couponId);

  const name = req.body.couponName?.trim();
  const code = req.body.couponCode?.trim();
  const discountType = req.body.discountType?.trim();
  const discountValue = Number(req.body.discountValue?.trim());
  const maxDiscount = Number(req.body.maxDiscount?.trim());
  const usageLimit = Number(req.body.usageLimit?.trim());

  if (!name) {
    res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Enter a coupon name." });
    return;
  }

  if (!code) {
    res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Enter a code." });
    return;
  }

  if (discountType !== 'FLAT' && discountType !== 'PERCENTAGE') {
    res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Discount type must be 'FLAT' or 'PERCENTAGE'." });
    return;
  }

  if (!discountValue || isNaN(discountValue)) {
    res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Discount value must be provided." });
    return;
  }

  if (!maxDiscount || isNaN(maxDiscount)) {
    res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Max discount must be provided." });
    return;
  }

  if (code != existingCoupon.code) {
    const lowerCaseCode = code.toLowerCase();
    const duplicateCoupon = await Coupon.findOne({ code: {$regex : lowerCaseCode, '$options' : 'i'} });
    if (duplicateCoupon) {
      // If a coupon with the same name exists, render the edit-coupon view with an error message
      res.render("admin/edit-coupon", { coupon: existingCoupon, error: "Coupon code already exists." });
      return;
    }
  }

  existingCoupon.name = name;
  existingCoupon.code = code;
  existingCoupon.discountType = discountType;
  existingCoupon.discountValue = discountValue;
  existingCoupon.maxDiscount = maxDiscount;
  await existingCoupon.save();

  res.redirect('/admin/coupon');
}

export async function PostAddCoupon(req, res) {
  const name = req.body.couponName?.trim();
  const code = req.body.couponCode?.trim();
  const discountType = req.body.discountType?.trim();
  const discountValue = Number(req.body.discountValue?.trim());
  const maxDiscount = Number(req.body.maxDiscount?.trim());
  const usageLimit = Number(req.body.usageLimit?.trim());

  if (!name) {
    res.render("admin/add-coupon", { error: "Enter a coupon name." });
    return;
  }

  if (!code) {
    res.render("admin/add-coupon", { error: "Enter a code." });
    return;
  }

  if (discountType !== 'FLAT' && discountType !== 'PERCENTAGE') {
    res.render("admin/add-coupon", { error: "Discount type must be 'FLAT' or 'PERCENTAGE'." });
    return;
  }

  if (!discountValue || isNaN(discountValue)) {
    res.render("admin/add-coupon", { error: "Discount value must be provided." });
    return;
  }

  if (!maxDiscount || isNaN(maxDiscount)) {
    res.render("admin/add-coupon", { error: "Maximum discount must be provided." });
    return;
  }

  // if (isNaN(discountValue)) {
  //   res.render("admin/add-category", { error: "Discount value must be provided." });
  //   return;
  // }


  // Convert the code to lowercase
  const lowerCaseCode = code.toLowerCase();

  // Check if a coupon with the same code already exists
  const existingCoupon = await Coupon.findOne({ code: {$regex : lowerCaseCode, '$options' : 'i'} });

  if (existingCoupon) {
    // If a coupon with the same name exists, render the add-coupon view with an error message
    res.render("admin/add-coupon", { error: "Coupon already exists." });
    return;
  }

  const couponObject = { name, code, discountType, discountValue, maxDiscount };
  if (usageLimit && !isNaN(usageLimit) && usageLimit > 0) {
      couponObject.usageLimit = usageLimit;
  }

  // If no coupon with the same name exists, create a new coupon
  const coupon = await Coupon.create(couponObject);

  res.redirect('/admin/coupon');
}

export async function DeleteCoupon(req, res) {
  const couponId = req.params.id;
  try {
    const deleted = await Coupon.findByIdAndDelete(couponId);
    if (!deleted) {
      res.status(404).send({ success: false, error: "Coupon not found" })
      return;
    }
    res.status(201).send({ success: true })
  } catch (err) {
    res.status(500).send({ success: false, error: err })
  }
}