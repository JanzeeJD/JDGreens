// @ts-check

import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';


const ProductSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },  
  category:{
    type:Schema.Types.ObjectId,
    ref: "Category",
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  images:[{
    type:String,
    required:true
  }],
  rating:[{
    userId:{
    type:Schema.Types.ObjectId,
    required:true
    },
    value:{
      type:Number,
      required:true
    }
  }],
  isListed:{
    type:Boolean,
    required:true,
    default: true
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  } 
}, { 
  timestamps: true
});

ProductSchema.plugin(paginate);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;