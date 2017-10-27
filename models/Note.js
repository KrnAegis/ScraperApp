var mongoose = require("mongoose");

var Schema = mongoose.Schema;

//setting up schema for notes
var NoteSchema = new Schema({
  title: String,
  body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
