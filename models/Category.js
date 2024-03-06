// @ts-check

import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  offerPercentage: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;