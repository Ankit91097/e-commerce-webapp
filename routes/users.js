const mongoose=require('mongoose')
const plm=require('passport-local-mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/e-commerce")

const userSchema=mongoose.Schema({
  username:String,
  email:String,
  password:String,
  wishlist:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"product"
  }],
  accountType:{
    type:String,
    enums:["buyer","seller"],
    default:"buyer"
  }
})

userSchema.plugin(plm);

module.exports=mongoose.model("user",userSchema);