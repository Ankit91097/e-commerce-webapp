const express = require('express');
const router = express.Router();
const userModel = require('./users')
const localStrategy = require('passport-local');
const passport = require('passport');
const upload=require('./multer')
const productModel=require('./product')
const cartModel=require('./cart')
const cartProductModel=require('./cartproduct')
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/',isLoggedIn,async function (req, res, next) {
  const allProducts=await productModel.find()
  res.render('index.ejs',{allProducts});
});
router.get('/register', function (req, res) {
  res.render('register', { title: 'Register' });
})

router.get('/login', function (req, res) {
  res.render('login', { title: 'Login' });
})


router.get('/createproduct',isLoggedIn,isSeller, function (req, res) {
  res.render('createProduct', { title: 'Create Product' });
})

router.post('/register', function (req, res, next) {
  var userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    accountType:req.body.isSeller == "on"?"seller":"buyer",
  });
  userModel.register(userData,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      if(registereduser.accountType==="seller"){
        res.redirect("/createproduct")
        return
      }
      else{
        res.redirect("/")

      }
    })
  })
});

router.post('/login',passport.authenticate("local",{
  failureRedirect:"/login"
}) ,function (req, res, next) {
  if(req.user.accountType=='seller'){
    res.redirect("/createproduct");
  }else{
    res.redirect("/")
  }
});

router.post('/createproduct',isLoggedIn,isSeller,upload.array("image"),async function (req, res) {
  const newproduct=await productModel.create({
    name:req.body.name,
    price:Number(req.body.price),
    description:req.body.description,
    user:req.user._id,
    image:req.files.map(function(file){
      return "/upload/"+file.filename
    })
  })
  res.redirect("/")
  
})

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login")
} 
function isSeller(req,res,next){
  if(req.user.accountType==="seller"){
    return next()
  }
  else{
    res.redirect("/")
  }
}

router.get('/cart', isLoggedIn,async function (req, res) {
  const userCart= await cartModel.findOne({
    user:req.user._id,
  }).populate('product').populate({
    path:"product",
    populate:"product"
  })
  let totalPrice=0

  userCart.product.forEach(function(cartproduct){
    totalPrice+=cartproduct.product.price*(cartproduct.quantity == 0 ? 1 : cartproduct.quantity)
  })
  console.log(totalPrice)

  res.render('cart',{ userCart,totalPrice });
})

router.get('/remove/:cartProductId',isLoggedIn,async function (req, res) {
  await cartProductModel.findOneAndDelete({_id:req.params.cartProductId})
  res.redirect('back')
})



router.get('/AddToCart/:productId',isLoggedIn,async function (req, res) {
  const productId=req.params.productId
  let userCart=await cartModel.findOne({
    user:req.user._id,
  })
  if(!userCart){
    let userCart=await cartModel.create({
      user:req.user._id
    })
  }

  let newcartproduct=await cartProductModel.findOne({
    product:productId,
    _id:{$in:userCart.product}
  })
  if(newcartproduct){
    newcartproduct.quantity=newcartproduct.quantity+1
    await newcartproduct.save()
  }
  else{
    newcartproduct=await cartProductModel.create({
      product:productId,
      quantity:1,
    })
    userCart.product.push(newcartproduct._id)
    await userCart.save()
  }
  res.redirect('back')
})

router.post('/updateQuantity',isLoggedIn,async function (req, res) {
  await cartProductModel.findOneAndUpdate({_id:req.body.cartProductId},{quantity:req.body.quantity})
  res.json({message:"quantity updated"})
})

module.exports = router;