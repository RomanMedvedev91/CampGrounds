var mongoose = require("mongoose"),
	Campground = require("./models/campground"),
	Comment = require("./models/comment");

var data = [
	{
		name: "Sleep",
		image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Spicy jalapeno bacon ipsum dolor amet dolore fugiat nulla proident turducken. Pig biltong short ribs ad, sunt hamburger dolor shoulder picanha. Magna elit pancetta rump landjaeger, do non tail fugiat. Biltong tongue aliquip pastrami chislic aliqua chuck chicken dolore. Dolore shank magna ex brisket commodo incididunt bacon ullamco beef ribs pork belly sausage enim andouille"
	},
	{
		name: "Nature",
		image: "https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Ham strip steak shankle filet mignon pork chop shank officia meatloaf. Leberkas nostrud elit qui t-bone andouille tenderloin porchetta bresaola quis pork belly short loin. Short loin voluptate strip steak leberkas in rump chuck. "
	},
	{
		name: "Cooking",
		image: "https://images.unsplash.com/photo-1528892677828-8862216f3665?ixlib=rb-1.2.1&		ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Spicy jalapeno bacon ipsum dolor amet dolore fugiat nulla proident turducken. Pig biltong short ribs ad, sunt hamburger dolor shoulder picanha. Magna elit pancetta rump landjaeger, do non tail fugiat. Biltong tongue aliquip pastrami chislic aliqua chuck chicken dolore. Dolore shank magna ex "
	}
];

function seedDB(){
// 	remove campgrounds
	Campground.remove({}, function(err){
		if(err){
			console.log(err);
		}
		console.log("removed campground!");
		// Comment.remove({}, function(err){
		// if(err){
		// 	console.log(err);
		// }
		// console.log("removed comments!");
			// 	add a new campgrounds
			// data.forEach(function(seed){
			// 	Campground.create(seed, function(err, campground){
			// 		if(err){
			// 		console.log(err);
			// 		} else {
			// 		console.log("Added campground");
			// 		// 	create a comment
			// 		Comment.create(
			// 			{
			// 			text: "This place is outstanding, but I wish there was internet",
			// 			author: "Homer"
			// 			}, function(err, comment){
			// 				if(err){
			// 				console.log(err);
			// 				} else{
			// 				campground.comments.push(comment);
			// 				campground.save();
			// 				console.log("Created new comment");
			// 				}
			// 				});
			// 		}
			// 	});
			// });

		// });
	
	});

// 	add a few comments
}

module.exports = seedDB;