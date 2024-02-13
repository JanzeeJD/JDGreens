import mongoose, { Schema } from 'mongoose';

const CartSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    productQty: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }]
});

const CartModel = mongoose.model("Cart", CartSchema);

export default CartModel;