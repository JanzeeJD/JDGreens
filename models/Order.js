import mongoose, { Schema } from 'mongoose';

const OrderSchema = new mongoose.Schema({
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        status: {
            type: String,
            required: true,
            enum: ['Confirmed', 'Pending', 'Delivered', 'Returned', 'Cancelled']
        },
        discountAmount: {
            type: Number,
            required: true,
            default: 0
        },
        address: {
            houseName: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pin: {
                type: Number,
                required: true
            },
            mobile: {
                type: Number,
                required: true
            }
        },
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                required: true
            },
            productName:{
                type : String,
                required:true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            // rating: {
            //     type: Number,
            //     required: true
            // }
        }],
        total: {
            type: Number,
            required: true
        },
        // coupon: {
        //     type: Schema.Types.ObjectId,
        //     required: true
        // },
        amountPayable: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['upi', 'cod', 'wallet']
        },
        shippingOption: {
            type: String,
            required: false,
            enum: ['Free', 'Express', 'Next']
        },
        // paymentVerified: {
        //     type: Boolean,
        //     required: true
        // },
        confirmDate: {
            type: Date,
            required: true,
            default: Date.now // todo: Remove if needed to be manually confirmed by admin
        },
        isCancelled: {
            type: Boolean,
            required: true,
            default: false
        },
        paymentId: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);
const OrderModel = mongoose.model("Order", OrderSchema);

export default OrderModel;