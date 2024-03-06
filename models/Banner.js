import mongoose, { Schema } from 'mongoose';

const bannerSchema = new Schema({
  firstLine: {
    type: String,
    required: true
  },
  secondLine: {
    type: String
  },
  description: {
    type: String
  },
  imageURL: {
    type: String,
    required: true
  },
  href: {
    type: String,
    default: "/shop"
  },
  buttonText: {
    type: String,
    default: "Shop Now"
  }
});

const BannerModel = mongoose.model("Banner", bannerSchema);

export default BannerModel;

