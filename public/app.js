// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < 20; i++) {
    // Display the apropos information on the page
    $("#articles").append("<div class='panel panel-primary'>" + '<div class="panel-heading"><button id="savebtn" class="btn btn-success" data-id='+ data[i]._id + '>Save Article</button><h3 class="panel-title"><a href="' + data[i].link + '">' + data[i].title + '</a></h3></div>' + "<div class='panel-body'>" + data[i].summary + "</div></div>");
  }
});

$.getJSON("/savedarticle", function(data) {
  // For each one
  for (var i = 0; i < 20; i++) {
    // Display the apropos information on the page
    $("#savedArticles").append("<div class='panel panel-info'>" + '<div class="panel-heading"><button id="deleteArt" class="btn btn-danger" data-id='+ data[i]._id + '>DELETE</button><button id="note" data-toggle="modal" data-target="#myModal" class="btn btn-success" data-id='+ data[i]._id + '>Notes!</button><h3 class="panel-title"><a href="' + data[i].link + '">' + data[i].title + '</a></h3></div>' + "<div class='panel-body'>" + data[i].summary + "</div></div>");
  }
});

$("#scrape").on("click", function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
})

$("#modal-btn").on("click", function(){
    location.reload();
})


$(document).on("click", "#note", function() {
  // Empty the notes from the note section
  $("#note-title").empty();
  $("#note-body").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/savedarticle/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#note-title").append("<h3>" + data.title + "</h3>");
      // An input to enter a new title
      $("#note-title").append("<input id='titleinput' name='title' placeholder='Title goes here'>");
      // A textarea to add a new note body
      $("#note-body").append("<textarea id='bodyinput' name='body' placeholder='Comment?'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#note-body").append("<button class='btn btn-success' data-id='" + data._id + "' id='savenote'>Save Note</button><button class='btn btn-danger' data-id='" + data._id + "' id='deletenote'>DELETE</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/savedarticle/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
//add articles to saved database and removes it from articles database
$(document).on("click", "#savebtn", function() {
  var thisId = $(this).attr("data-id");
  $.getJSON("/articles/" + thisId, function(data){
    $.ajax({
      method: "POST",
      url: "/saved/" + thisId,
      data: {
        summary: data.summary,
        title: data.title,
        link: data.link
      }
    })
  })
    .done(function(data) {
      console.log(data);
    $.ajax({
      type: "DELETE",
      url: "/articles/delete/" + thisId
    });
        alert("Article saved!");
        location.reload();


    });
});

$(document).on("click", "#deleteArt", function(){
  var thisId = $(this).attr("data-id");
  console.log(thisId)
  $.ajax({
    type: "DELETE",
    url: "/saved/delete/" + thisId
  });
    alert("Article Deleted!");
    location.reload();
})

$(document).on("click", "#deletenote", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/savedarticle/" + thisId
  })
    .done(function(data) {
      $.ajax({
        type: "DELETE",
        url: "/note/delete/" + data.note._id
      });
        alert("Note deleted!");
        location.reload();
    })
})