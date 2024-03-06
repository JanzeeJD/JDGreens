import mongoose, { Schema } from 'mongoose';

const SaleSchema = new mongoose.Schema({
    dated: {
        type: Date,
        required: true
    },
    sales: [{
        productId: { type: Schema.Types.ObjectId },
        productName: String,
        productCategory: { type: Schema.Types.ObjectId },
        productCategoryName: String,
        productQty: Number
    }]
}, {
    timestamps: true
});


const SaleModel = mongoose.model("Sale", SaleSchema);

export default SaleModel;