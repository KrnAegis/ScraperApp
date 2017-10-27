var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var app = express();
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// // Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//using handlebar
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;

if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI);
} else {
        mongoose.connect("mongodb://localhost/week18Populater", {
          useMongoClient: true
       }
});

// Routes

// A GET route
app.get("/", function(req, res){
    res.render("index")
})
app.get("/saved", function(req, res){
    res.render("saved")
})

//scraping nytimes
app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/section/world/middleeast?module=SectionsNav&action=click&version=BrowseTree&region=TopBar&contentCollection=World%2FMiddle%20East&contentPlacement=2&pgtype=Homepage").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    $(".story-body").each(function(i, element) {
      // Save an empty result object
      var result = {};
      result.summary = $(this)
        .children()
        .children()
        .children("p.summary")
        .text();
      result.title = $(this)
        .children()
        .children()
        .children("h2")
        .text();
      result.link = $(this)
        .children()
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
        })
        .catch(function(err) {
          res.json(err);
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//get saved articles
app.get("/savedarticle", function(req, res) {
  // Grab every document in the Articles collection
  db.Saved
    .find({})
    .then(function(dbSarticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbSarticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//get saved articles by id and populating with note
app.get("/savedarticle/:id", function(req, res) {
  db.Saved
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbSarticle) {
      res.json(dbSarticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//delete article with specific id
app.delete("/articles/delete/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .deleteOne({ _id: req.params.id })
    .catch(function(err) {
      res.json(err);
    });
});

//deleted saved article with specific id
app.delete("/saved/delete/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Saved
    .deleteOne({ _id: req.params.id })
    .then(function(){
      res.render("saved")
    })
    .catch(function(err) {
      res.json(err);
    });
});

//delete note attached to saved article
app.delete("/note/delete/:id", function(req, res) {
  db.Note
    .deleteOne({ _id: req.params.id })
    .catch(function(err) {
      res.json(err);
    });
});

//creating note content to saved article by id
app.post("/savedarticle/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Saved.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbSarticle) {
      res.json(dbSarticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//post saved articles by id
app.post("/saved/:id", function(req, res) {
  db.Saved
    .create(req.body)
    .then(function(dbSaved) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: dbSaved._id }, { new: true });
    })
    .then(function(dbSarticle) {
      res.json(dbSarticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
