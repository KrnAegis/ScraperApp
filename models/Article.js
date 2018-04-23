var mongoose = require("mongoose");


var Schema = mongoose.Schema;

//setting up db for Articles
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});


var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
