const  Campground = require ("../models/campground");
const Comment = require ("../models/comment");


const middlewareObj = {};

// copied from Ian tutorial ES6
// middlewareObj.asyncMiddleware = fn =>
// (req, res, next) =>{
// 	Promise.resolve(fn(req, res, next))
// 	.catch(next)
// }


middlewareObj.checkCampgroundOwnership = (req, res, next) => {
// 	is user loged in?
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground) => {
			if(err || !foundCampground){
				console.log(err);
				req.flash("error", "Campground not found");
				res.redirect("back");
			} else {					
	//	does user own the campground?
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
				 next();
				} else {
				req.flash("error", "You do not have permision to do that");
				res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
},

middlewareObj.checkCommentOwnership = (req, res, next) => {
// 	is user loged in?
	if(req.isAuthenticated()){
	 Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err || !foundComment){
			req.flash("error", "Comment not found");
			res.redirect("back");
		} else {
// 	does user own the campground?
			if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
			next();
			} else {
				req.flash("error", "You do not have permision to do that");
				res.redirect("back");
			}
		}
	});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
		}
}

middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
	return next();
	}
	req.flash("error", "Please Login First!");
	res.redirect("/login");
	}


module.exports = middlewareObj;