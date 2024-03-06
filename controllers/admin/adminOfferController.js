"use strict";

import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import Offer from "../../models/Offer.js";

export async function GetOfferPage(req, res) {
    res.locals.activePanel = 'offers';
    const offers = await Offer.find().populate('offerProductId').populate('offerCategoryId');
    res.render("admin/offer", { offers })
}

export async function GetAddOfferPage(req, res) {
    const products = await Product.find();
    const categories = await Category.find();
    res.render("admin/add-offer", { products, categories });
}

export async function GetEditOfferPage(req, res) {
    const {offerId} = req.params;
    const products = await Product.find();
    const categories = await Category.find();
    const existingOffer = await Offer.findById(offerId);
    res.render("admin/edit-offer", { offer: existingOffer, categories, products });
}

export async function PostAddOffer(req, res) {
    const offerFor = 'PRODUCT'; // todo: req.body.offerFor?.trim();
    const offerProductId = req.body.offerProductId?.trim();
    const offerCategoryId = req.body.offerCategoryId?.trim();
    const offerType = req.body.offerType?.trim();
    const offerValue = Number(req.body.offerValue?.trim());
    const maxDiscount = Number(req.body.maxDiscount?.trim());

    const products = await Product.find();
    const categories = await Category.find();

    if (offerFor !== 'PRODUCT' && offerFor !== 'CATEGORY') {
        res.render("admin/add-offer", { products, categories, error: "Offer for must be 'PRODUCT' or 'CATEGORY'." });
    }

    if (offerType !== 'FLAT' && offerType !== 'PERCENTAGE') {
        res.render("admin/add-offer", { products, categories, error: "Offer type must be 'FLAT' or 'PERCENTAGE'." });
        return;
    }

    if (!offerValue || isNaN(offerValue) || offerValue <= 0 || (offerType === 'PERCENTAGE' && offerValue > 100)) {
        res.render("admin/add-offer", { products, categories, error: "Offer value must be valid." });
        return;
    }

    if (!maxDiscount || isNaN(maxDiscount)) {
        res.render("admin/add-offer", { products, categories, error: "Maximum discount must be provided." });
        return;
    }

    if (offerFor === 'PRODUCT') {
        if (!offerProductId || !mongoose.Types.ObjectId.isValid(offerProductId)) {
            res.render("admin/add-offer", { products, categories, error: "Invalid product provided." });
            return;
        }

        const existingProduct = await Offer.findOne({ offerProductId: offerProductId });
        if (existingProduct) {
            res.render("admin/add-offer", { products, categories, error: "This product is already under offer." });
            return;
        }

        const product = await Product.findOne({ _id: offerProductId });
        if (!product) {
            res.render("admin/add-offer", { products, categories, error: "Product not found." });
            return;
        }

        if (offerType === 'FLAT') {
            if (offerValue >= product.price) return res.render("admin/add-offer", { products, categories, error: "Offer value cannot be less than product price." });
            product.discount = offerValue;
        } else {
            const amountToDiscount = (product.price * offerValue) / 100;
            const allowedDiscount = Math.min(amountToDiscount, maxDiscount);
            product.discount = allowedDiscount;
        }

        await Offer.create({ name: "", offerFor: "PRODUCT", offerType: offerType, offerValue: offerValue, offerProductId: offerProductId, maxDiscount: maxDiscount })
        await product.save();

    } else {
        if (!offerCategoryId || !mongoose.Types.ObjectId.isValid(offerCategoryId)) {
            res.render("admin/add-offer", { products, categories, error: "Invalid category provided." });
            return;
        }

        const existingCategory = await Offer.findOne({ offerCategoryId: offerCategoryId })
        if (existingCategory) {
            res.render("admin/add-offer", { products, categories, error: "This category is already under offer." });
            return;
        }

        const category = await Product.findOne({ _id: offerCategoryId });
        if (!category) {
            res.render("admin/add-offer", { products, categories, error: "Category not found." });
            return;
        }

        res.render("admin/add-offer", { products, categories, error: "Category offer awaits implementation." });
        return;
    }

    res.redirect('/admin/offer');
}

export async function PostEditOffer(req, res) {
    const {offerId} = req.params;
    const existingOffer = await Offer.findById(offerId);

    // const offerFor = req.body.offerFor?.trim();
    const offerProductId = req.body.offerProductId?.trim();
    const offerCategoryId = req.body.offerCategoryId?.trim();
    const offerType = req.body.offerType?.trim();
    const offerValue = Number(req.body.offerValue?.trim());
    const maxDiscount = Number(req.body.maxDiscount?.trim());

    const products = await Product.find();
    const categories = await Category.find();

    // if (offerFor !== 'PRODUCT' && offerFor !== 'CATEGORY') {
    //     res.render("admin/edit-offer", { products, categories, error: "Offer for must be 'PRODUCT' or 'CATEGORY'." });
    // }
    const offerFor = existingOffer.offerFor;

    if (offerType !== 'FLAT' && offerType !== 'PERCENTAGE') {
        res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Offer type must be 'FLAT' or 'PERCENTAGE'." });
        return;
    }

    if (!offerValue || isNaN(offerValue) || offerValue <= 0 || (offerType === 'PERCENTAGE' && offerValue > 100)) {
        res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Offer value must be valid." });
        return;
    }

    if (!maxDiscount || isNaN(maxDiscount)) {
        res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Maximum discount must be provided." });
        return;
    }

    if (offerFor === 'PRODUCT') {
        if (!offerProductId || !mongoose.Types.ObjectId.isValid(offerProductId)) {
            res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Invalid product provided." });
            return;
        }

        if (offerProductId !== existingOffer.offerProductId.toString()) {
            const existingProduct = await Offer.findOne({ offerProductId: offerProductId });
            if (existingProduct) {
                res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "This product is already under offer." });
                return;
            }
        }

        const product = await Product.findOne({ _id: offerProductId });
        if (!product) {
            res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Product not found." });
            return;
        }

        if (offerType === 'FLAT') {
            if (offerValue >= product.price) return res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Offer value cannot be less than product price." });
            product.discount = offerValue;
        } else {
            const amountToDiscount = (product.price * offerValue) / 100;
            const allowedDiscount = Math.min(amountToDiscount, maxDiscount);
            product.discount = allowedDiscount;
        }

        existingOffer.offerType = offerType;
        existingOffer.offerValue = offerValue;
        existingOffer.offerProductId = offerProductId;
        existingOffer.maxDiscount = maxDiscount;
        await product.save();
        await existingOffer.save();

    } else {
        if (!offerCategoryId || !mongoose.Types.ObjectId.isValid(offerCategoryId)) {
            res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Invalid category provided." });
            return;
        }

        if (offerCategoryId !== existingOffer.offerCategoryId.toString()) {
            const existingCategory = await Offer.findOne({ offerCategoryId: offerCategoryId })
            if (existingCategory) {
                res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "This category is already under offer." });
                return;
            }
        }

        const category = await Product.findOne({ _id: offerCategoryId });
        if (!category) {
            res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Category not found." });
            return;
        }

        res.render("admin/edit-offer", { offer: existingOffer, products, categories, error: "Category offer awaits implementation." });
        return;
    }

    res.redirect('/admin/offer');
}

export async function DeleteOffer(req, res) {
    const {offerId} = req.params;
    try {
        const deleted = await Offer.findByIdAndDelete(offerId);
        if (!deleted) {
            res.status(404).send({ success: false, error: "Offer not found" })
            return;
        }
        if (deleted.offerFor === 'PRODUCT') {
            const product = await Product.findOne({ _id: deleted.offerProductId });
            product.discount = 0;
            await product.save();
        } else {
            const category = await Category.findOne({ _id: deleted.offerCategoryId });
            // product.discount = 0;
            await category.save();
        }
        res.status(201).send({ success: true })
    } catch (err) {
        res.status(500).send({ success: false, error: err })
    }
}