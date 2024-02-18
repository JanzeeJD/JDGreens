import Razorpay from "razorpay"; 

// const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// const razorpayInstance = new Razorpay({
//     key_id: RAZORPAY_ID_KEY,
//     key_secret: RAZORPAY_SECRET_KEY
// });

const renderProductPage = async(req,res)=>{

    try {
        
        res.render('product');

    } catch (error) {
        console.log(error.message);
    }

}

export async function PostPaymentController(req,res) {
    // try {
        // const amount = req.body.amount*100
        // const options = {
        //     amount: amount,
        //     currency: 'INR',
        //     receipt: 'razorUser@gmail.com'
        // }

        // razorpayInstance.orders.create(options, 
        //     (err, order)=>{
        //         if(!err){
        //             res.status(200).send({
        //                 success:true,
        //                 msg:'Order Created',
        //                 order_id:order.id,
        //                 amount:amount,
        //                 key_id:RAZORPAY_ID_KEY,
        //                 product_name:req.body.name,
        //                 description:req.body.description,
        //                 contact:"8893639479",
        //                 name: "Jancy Daniel",
        //                 email: "mariamjancy17@gmail.com"
        //             });
        //         }
        //         else{
        //             res.status(400).send({success:false,msg:'Something went wrong!'});
        //         }
        //     }
        // );

    // } catch (error) {
    //     console.log(error.message);
    // }
    try {
        console.log('controler');
        const { amount } = req.body;
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_ID_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY });
        var options = {
            amount: amount * 100, // Convert amount to the smallest currency unit (e.g., paise in INR)
            currency: "INR",
            receipt: "order_rcptid_11",
        };
    
        // Creating the order
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.error(err);
            res.status(500).send("Error creating order");
            return;
          }
          // console.log("order is",order);``
          // Add orderprice to the response object
          res.send({ orderId: order.id });
          // Replace razorpayOrderId and razorpayPaymentId with actual values
          // Redirect to /orderdata on successful payment
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
}

