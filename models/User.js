// @ts-check

import mongoose from 'mongoose';
import { generateRandomString } from '../utils/codeGenerator.js';

const UserSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
     type: String,
     required:true,
     unique: true
  },
  password:{
    type:String,
    required:true
  },
  isBlocked:{
    type:Boolean,
    required:true,
    default: false
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  referralCode: {
    type: String,
    required: true,
    default: () => generateRandomString(6)
  },
  wallet:{
    type:Number,
    default:0,
    required:true
  },
  walletTransactions: [{
    createdAt: { type: Date, default: Date.now },
    amount: { type: Number },
    type: { type: String }
  }],
  wishlist:[{
    type:mongoose.Schema.ObjectId,
    ref: "Product"
  }],
  address:[{
      houseName:{
        type:String,
        required:true
      },
      street:{
        type:String,
        required:true
      },
      city:{
        type:String,
        required:true
      },
      state:{
        type:String,
        required:true
      },
      pin:{
        type:Number,
        required:true
      },
      mobile:{
        type:Number,
        required:true
      }
  }]
}, { 
  timestamps: true
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;