"use strict";

import Banner from "../../models/Banner.js";

export async function GetBannerPage(req, res) {
    const banners = await Banner.find();
    res.render("admin/banner", { banners });
}

export async function GetAddBannerPage(req, res) {
    res.render("admin/add-banner");
}

export async function PostAddBanner(req, res) {
    if (req.imageError) {
        res.render("admin/add-banner", { error: "Image is invalid." });
        return;
    }

    console.log(req.file);
    const fileName = req.file?.filename;
    if (!fileName) {
        res.render("admin/add-banner", { error: "Add valid banner image." });
        return;
    }

    const { firstLine, secondLine, description, href, buttonText } = req.body;
    if (!firstLine) {
        res.render("admin/add-banner", { error: "Missing first line." });
        return;
    }

    try {
        // Create a new banner instance
        const newBanner = new Banner({
            firstLine,
            secondLine,
            description,
            imageURL: fileName,
            href: href || "/shop",
            buttonText: buttonText || "Shop Now"
        });

        // Save the new banner to the database
        const savedBanner = await newBanner.save();

        res.redirect("/admin/banner");
    } catch (error) {
        res.render("admin/add-banner", { error: error.message });
    }
}

export async function DeleteBanner(req, res) {
    const { id } = req.params; // Assuming the banner ID is passed as a route parameter

    try {
        // Find the banner by ID and delete it
        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        res.status(200).json({ message: "Banner deleted successfully", deletedBanner });
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handle errors
    }
}