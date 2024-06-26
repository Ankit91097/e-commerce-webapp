const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
    name:String,
    price:Number,
    description:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    image:[{
        type:String
    }],
})

module.exports=mongoose.model("product",productSchema)