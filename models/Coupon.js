import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['FLAT', 'PERCENTAGE']
  },
  discountValue: {
    type: Number,
    required: true
  },
  maxDiscount:{
    type: Number
  },
  code: {
    type: String,
    required: true
  },
  usageLimit: {
    type: Number
  },
  expiryDate: {
    type: Date
  },
  usedBy: [{
    type: Schema.Types.ObjectId,
    required: true
  }]
});

const CouponModel = mongoose.model("Coupon", couponSchema);

export default CouponModel;

