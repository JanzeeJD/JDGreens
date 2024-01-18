// @ts-check

import mongoose from 'mongoose';

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
  wishlist:[{
    type:mongoose.Schema.ObjectId
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