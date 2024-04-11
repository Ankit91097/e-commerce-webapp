const mongoose=require('mongoose')

const cartSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    product:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"cartproduct"
    }],
    price: {
        type: Number,
        default: 0
    }
})

module.exports=mongoose.model("cart",cartSchema)