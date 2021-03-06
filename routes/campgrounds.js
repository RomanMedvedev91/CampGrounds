var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var User = require('../models/user');
var Notification = require('../models/notification');
var middleware = require ("../middleware");
var NodeGeocoder = require('node-geocoder');
// ==== cloudinary ========
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'romanmedvedev', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ====cloudinary end=================

// =====google map=========
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
//====== Fuzzy search
	
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
	  Campground.find({name: regex}, function (err, allCampgrounds){
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length === 0) {
                    req.flash('error', 'Sorry, no campgrounds match your query. Please try again');
                    return res.redirect('back');
                }
                res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds' });
            }
        });	
// ==========		
		
	} else {
		
   // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });		
	}
});


// CREATE - add new campgrounds to DB

/*
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err, result){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
	geocoder.geocode(req.body.location, function (err, data) {
		if(err || !data.length){
			console.log(err);
			req.flash("error", "Invalid adress");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude;
   		req.body.campground.lng = data[0].longitude;
    	req.body.campground.location = data[0].formattedAddress;	
		
// 		add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
// 	add image's public_id to campground object
		req.body.campground.imageId = result.public_id;
// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		
		// Create a new campground and save to DB
	Campground.create(req.body.campground, function(err, newlyCreated){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		} 
		res.redirect("/campgrounds/" + newlyCreated.id);
	});
	});
});
});

*/
router.post("/", middleware.isLoggedIn, upload.single("image"), async function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, async function(err, result){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
	geocoder.geocode(req.body.location, async function (err, data) {
		if(err || !data.length){
			console.log(err);
			req.flash("error", "Invalid adress");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude;
   		req.body.campground.lng = data[0].longitude;
    	req.body.campground.location = data[0].formattedAddress;	
		
// 		add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
// 	add image's public_id to campground object
		req.body.campground.imageId = result.public_id;
// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		var newlyCreated = req.body.campground;
		// Create a new campground and save to DB
	try {
		let campground = await Campground.create(newlyCreated);
		let user = await User.findById(req.user._id).populate('followers').exec();
		let newNotification = {
			username: req.user.username,
			campgroundId: campground.id
     	 }
		for(const follower of user.followers) {
		let notification = await Notification.create(newNotification);
		follower.notifications.push(notification);
		follower.save();
		}
		//redirect back to campground page	
		res.redirect(`/campgrounds/${campground.id}`);
	} catch(err) {
			req.flash("error", err.message);
			return res.redirect("back");
			} 
	});

	});
});
	

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
// 	find the campground with the provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			console.log(err);
			req.flash('error', 'Sorry, that campground does not exist!');
            res.redirect("back");
		} else{
			console.log(foundCampground);
// 			render show template with campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
	
});


// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
		Campground.findById(req.params.id, function(err, foundCampground){
				if(err){
				req.flash("error", "Campground not found");
				}
				res.render("campgrounds/edit", {campground: foundCampground});
		});
});


// UPDATE ROUTE
/*
router.put("/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
*/

router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
			Campground.findById(req.params.id, async function(err, campground){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			 } else {
		//======CLOUDINARY SETTING======== 	 
				 if(req.file){
					try {
						await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
						
					} catch(err){
						req.flash("error", err.message);
						return res.redirect("back");
					}				
					}
				
				 if(req.body.location !== campground.location){
					 try{
						 var updatedLocation = await geocoder.geocode(req.body.location);
						 campground.lat = updatedLocation[0].latitude;
						 campground.lng = updatedLocation[0].longitude;
						 campground.location = updatedLocation[0].formattedAddress;
					 } catch(err){
						req.flash("error", err.message);
						return res.redirect("back");
					 }
				 }
				 campground.name = req.body.name;
				 campground.price = req.body.price;
				 campground.description = req.body.description;
				 campground.save();
				 
				 req.flash("success", "Successfully Updated!");
				 // res.redirect("/campgrounds/"+ req.params.id); THIS WAS BEFORE 
				 	res.redirect("/campgrounds/" + campground._id);
				}	
		});
	});



// DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, async function(err, campground){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		} try {
			await cloudinary.v2.uploader.destroy(campground.imageId);
			campground.remove();
			req.flash("success", "Campground deleted successfully!");
			res.redirect("/campgrounds");
		} catch(err) {
			if(err){
			req.flash("error", err.message);
			return res.redirect("back");
			}
		}
	});
});


// Fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;