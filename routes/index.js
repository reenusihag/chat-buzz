var express = require('express');
var router = express.Router();
var Profile = require('../models/profile');
var Messages = require('../models/messages');
const translate = require('google-translate-api');

/* GET home page. */


router.get('/:id',function (req,res,next) {
    var Id = req.params.id;

    Profile.findOne({user:Id}, function (err, profile) {
        if(err){
            return res.redirect('/munny');
        }
        res.render('user/user_profile',{
            profile:profile,
            user_profile:0,
        });
    });

});

router.get('/all/messages/:id',function (req,res,next) {
    var Id = req.params.id;
   // res.render('user/message_list');

    Messages.findOne({user:Id}, function (err, messages) {

        if(err){
            res.render('user/message_list',{error:'Sorry sir, you have no messages please start a conversation.',messages:[]});
        }
        else{

            var data = [];

            for(let i=0;i<messages.data.length;i++){

                Profile.findOne({user:messages.data[i].friend_id}, function (err, profile) {

                    if(messages.data[i].messages.length > 4){
                        data.push({
                            profile:profile.user,
                            image:profile.imagePath,
                            name:profile.name,
                            message:messages.data[i].messages[messages.data[i].messages.length - 1].message
                        })
                    }
                });

            }

            res.render('user/message_list',{error:0,messages:data});
        }

    });
});

router.get('/new/messages/:id',function (req,res,next) {
    var Id = req.params.id;
    var friend_profile=[];

    Profile.findOne({user:Id}, function (err, profile) {
        if(err){
            return res.render('user/sorry',{messages:'DataBase problem Friend profile not found during start messaging'});
        }

        Messages.findOne({user:req.user._id}, function (err, messages) {

            if(!messages){

                var message = new Messages({
                    user:req.user._id,
                    data:[{
                        friend_id:Id,
                        messages:[]
                    }]
                });
                //  console.log("This user is new here and try to start a new convo.")
                message.save(function (err, result) {
                    //console.log('here we create a new database !');
                });
            }
                let i,count=0;
                for( i=0;i<messages.data.length;i++){
                    if(messages.data[i].friend_id == Id){
                       // console.log("you already talk with this friend");
                      //  console.log(messages.data[i])
                        count++;
                      return  res.render('user/all_messages',{messages:messages.data[i], profile:profile, id:req.user._id});

                    }
                }

                if(count==0){
                    var new_messages =[];
                    console.log("this is your first talk with this friend");
                   new_messages=messages.data.slice();
                    new_messages.unshift({
                        friend_id:Id,
                        messages:[{
                            user:0,
                            time:new Date().getHours()+'  ' + new Date().getMinutes(),
                            status:1,
                            message:'here you have a great chance to start the conversation'

                        },{
                            user:0,
                            time:new Date().getHours()+'  ' + new Date().getMinutes(),
                            status:1,
                            message:'All the best !'

                        }],
                    });
                    messages.data =new_messages.slice();
                    messages.save(function (err, update_messages) {
                        console.log('all good here');
                        res.render('user/all_messages',{messages:update_messages.data[0], profile:profile, id:req.user._id });
                    });
                }

        });

    });

});








/*/!*
router.get('/add-to-cart/:id', function (req, res, next) {
   var productId = req.params.id;
   var cart = new Cart(req.session.cart ? req.session.cart :{});

   Product.findById(productId, function (err, product) {
       if(err){
           return res.redirect('/');
       }

       cart.add(product, product.id);
       req.session.cart = cart;
       res.redirect('/');
   });

});

router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart :{});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});
*!/

router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart :{});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
    if(!req.session.cart){
        return res.render('shop/shopping-cart',{products:null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart',{products: cart.generateArray(), totalPrice: cart.totalPrice})
    
});

router.get('/checkout', isLoggedIn ,function (req, res, next) {
   if(!req.session.cart){
       return res.render('/shopping-cart');
   }
    var cart = new Cart(req.session.cart);
   res.render('shop/checkout',{total:cart.totalPrice})
});

router.post('/checkout', isLoggedIn, function (req, res, next) {
    if(!req.session.cart){
        return res.render('shop/shopping-cart',{products:null});
    }
    var cart = new Cart(req.session.cart);

    var order = new Order({
         user: req.user,
         cart:cart,
         name:req.body.name,
         number:req.body.number,
         alternate_number:req.body.number,
         address:req.body.address,
         paymentMode:req.body.method,
         paymentId:'12345678'
    });

    order.save( function (err, result) {
        req.flash('success','Successfully bought products !');
        req.session.cart= null;
        res.redirect('/');
    });
   // console.log('munny');


});

router.get('/add-item', isLoggedIn , function (req, res, next) {

    res.render('shop/add-item');

});

router.post('/add-item', isLoggedIn , function (req, res, next) {

    console.log(req.body);

    var product = new Product({

        imagePath:req.body.image,
        title:req.body.title,
        description:"Whenever you try that food you feel sexy then ever",
        vitamins:"under work",
        price:req.body.sellprice,
        weight:req.body.weight
        });

    product.save( function (err, result) {
        res.render('shop/add-item');
    });


});*/

module.exports = router;

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}