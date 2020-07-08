var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require ("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});


// CREATE - add new campgrounds to DB
router.post("/", middleware.isLoggedIn, function(req, res){
// 	get data form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, function (err, data) {
		if(err || !data.length){
			console.log(err);
			req.flash("error", "Invalid adress");
			return res.redirect("back");
		}
		var lat = data[0].latitude;
   		 var lng = data[0].longitude;
    	var location = data[0].formattedAddress;
		
		var newCampground = {name: name, price: price, image: image, description: description, author: author, location: location, lat: lat, lng: lng};
	// Create a new campgraund and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			console.log(newlyCreated);
//redirect back to campgrounds page	
			res.redirect("/campgrounds");
		}
	});
	});
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


// SHOW - shows more info about one campgraund
router.get("/:id", function(req, res){
// 	find the campgraund with the provided ID
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
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function(err, data){
		if(err || !data.length){
			console.log(err.message);
			req.flash("error", "Invalid address");
			return res.redirect("back");
		}
	req.body.campground.lat = data[0].latitude;
	req.body.campground.lng = data[0].longitude;
	req.body.campground.location = data[0].formattedAddress;
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
				// The string bellow was before
				// res.redirect("/campgrounds");
			 } else {
				 req.flash("success", "Successfully Updated!");
				 // res.redirect("/campgrounds/"+ req.params.id); THIS WAS BEFORE 
				 	res.redirect("/campgrounds/" + updatedCampground._id);
				}	
		});
	});
});

// DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});



//middleware

module.exports = router;