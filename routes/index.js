const express = require('express');
const router = express.Router();
const userModel = require('./users')
const localStrategy = require('passport-local');
const passport = require('passport');
const upload=require('./multer')
const productModel=require('./product')
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/',isLoggedIn,async function (req, res, next) {
  const allProduct=await productModel.find()
  res.render('index.ejs',{allProduct});
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
  console.log(req.body);
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
module.exports = router;
