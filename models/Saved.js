var mongoose = require("mongoose");


var Schema = mongoose.Schema;

//setting up db for Articles
var SavedSchema = new Schema({
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
    required: false
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});


var Saved = mongoose.model("Saved", SavedSchema);

module.exports = Saved;
