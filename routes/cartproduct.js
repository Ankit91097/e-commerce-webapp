const mongoose=require('mongoose')
const product = require('./product')

const cartproductSchema=mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    quantity:{
        type:Number,
    }
})

module.exports=mongoose.model("cartproduct",cartproductSchema)