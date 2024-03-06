import mongoose, { Schema } from 'mongoose';

const offerSchema = new Schema({
  offerFor: {
    type: String,
    required: true,
    enum: ["PRODUCT", "CATEGORY"]
  },
  offerType: {
    type: String,
    required: true,
    enum: ['FLAT', 'PERCENTAGE']
  },
  offerCategoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: false
  },
  offerProductId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: false
  },
  offerValue: {
    type: Number,
    required: true
  },
  maxDiscount:{
    type: Number
  },
  expiryDate: {
    type: Date
  }
});

const OfferModel = mongoose.model("Offer", offerSchema);

export default OfferModel;

