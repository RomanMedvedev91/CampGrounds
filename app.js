	require("dotenv").config();

const express 	= require("express"),
	app 		= express(),
	request 	= require("request"),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose"),
	flash 		= require("connect-flash"),
	Campground = require("./models/campground"),
	Comment 	= require("./models/comment"),
	passport 	= require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	User 		= require("./models/user"),
passportLocalMongoose = require("passport-local-mongoose"),
	seedDB 		= require("./seeds");
	
// requring routes
const commentRoutes 		= require("./routes/comments"),
	  campgroundsRoutes 	= require("./routes/campgrounds"),
	  indexRoutes	 		= require("./routes/index");


mongoose.connect('mongodb://localhost:27017/yelp_camp_v12', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

app.locals.moment = require("moment");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // seed the database

// ============PASSPORT CONFIGURATION============
app.use(require("express-session")({
	secret: "secret sentence",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ================================================

// ============notification============
app.use(async (req, res, next) => {
	res.locals.currentUser = req.user;
	if(req.user) {
		try {
			let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
     		res.locals.notifications = user.notifications.reverse();
		} catch(err) {
			console.log(err.message);
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
// ================================================


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

const port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Server Has Started!");
});