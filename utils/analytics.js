import Product from '../models/Product.js';
import Sale from '../models/Sales.js';

export async function markSales(date, cart) {
    try {
        const productsData = [];
        
        // Iterate through the products in the cart to gather sales data
        for (const product of cart.products) {
            const productDoc = await Product.findById(product.productId).populate('category');
            
            productsData.push({
                productId: product.productId,
                productName: productDoc.name,
                productCategory: productDoc.category._id,
                productCategoryName: productDoc.category.name,
                productQty: product.productQty
            });
        }
        
        // Update sales data in a single query
        await Sale.updateOne(
            { dated: date },
            {
                $addToSet: { sales: { $each: productsData } }, // Add new products or update existing ones
            },
            { upsert: true } // Create a new document if it doesn't exist
        );

        console.log("Sales updated successfully!");
    } catch (error) {
        console.error("Error occurred while adding/updating sales:", error);
    }
}


export async function markSale(date, productId, qty) {
    try {
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Check if a document already exists for the given date
        let sale = await Sale.findOne({ dated: day });

        const product = await Product.findById(productId).populate('category');
        product.stock -= qty;
        const productName = product.name;
        const productCategory = product.category._id;
        const productCategoryName = product.category.name;

        if (!sale) {
            // If no document exists for the date, create a new one
            sale = new Sale({ dated: day, sales: [] });
        }

        // Check if the product is already in sales
        const existingProductIndex = sale.sales.findIndex(item => item.productId.toString() === productId.toString());

        if (existingProductIndex !== -1) {
            // If the product is already in sales, increment its quantity
            sale.sales[existingProductIndex].productQty += qty;
        } else {
            // If the product is not in sales, add it to the sales array
            sale.sales.push({
                productId: productId,
                productName: productName,
                productCategory: productCategory,
                productCategoryName: productCategoryName,
                productQty: qty
            });
        }

        // Save the updated document
        await sale.save();
        await product.save();
        console.log("Sale updated successfully!");
    } catch (error) {
        console.error("Error occurred while adding/updating sale:", error);
    }
}

export async function getTopSellingProducts() {
    return Sale.aggregate([
        { $unwind: "$sales" }, // Unwind the sales array
        { 
            $group: {
                _id: "$sales.productId",
                productName: { $first: "$sales.productName" },
                totalQtySold: { $sum: "$sales.productQty" }
            }
        },
        { $sort: { totalQtySold: -1 } }, // Sort by total quantity sold in descending order
        { $limit: 10 } // Limit to top 10 products
    ]);
} 

export async function getTopSellingCategories() {
    return Sale.aggregate([
        { $unwind: "$sales" }, // Unwind the sales array
        { 
            $group: {
                _id: "$sales.productCategory",
                productCategoryName: { $first: "$sales.productCategoryName" },
                totalQtySold: { $sum: "$sales.productQty" }
            }
        },
        { $sort: { totalQtySold: -1 } }, // Sort by total quantity sold in descending order
        { $limit: 5 } // Limit to top 5 categories
    ]);
}