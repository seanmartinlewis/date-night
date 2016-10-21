

$(document).ready(function () {

  console.log('date night');


  $('#dateMaker').on('click', function () {
    getMovieResults()
    getRecipeResults()
    $('#splashPage').hide()
    $('#resultsPage').show()
  })

  $('#getRecipe').on('click', getRecipeResults)
  $('#getMovie').on('click', getMovieResults)
  $('#logo').on('click', function () {
      $('#resultsPage').hide()
      $('#splashPage').show()
  })

  if (isLoggedIn()) {
    showProfile()
  }

  $(document).on('click','#logout', logOut)

});


function showProfile() {
  console.log('show profile');
  $('#login').hide()
  $('#user-info').show()
  $('#username').text(profile.nickname)
  $('profilePicture').attr('src', profile.picture)

}

function getRecipeResults() {
  console.log('recipes');
  var food = "tacos"
  var url = "http://www.recipepuppy.com/api/?q=" + food

  $.ajax({
    type: "GET",
    url: url
  }).done(function () {
    console.log(data);
    showRecipe()
  })
}

function showRecipe() {
  console.log('recipe');
  var recipeTitle = data.title
  var recipeIngredients = data.ingredients
  var recipePic = data.thumbnail

  $('#recipeName').text(recipeTitle);
  $('#recipePic').attr('src',recipePic);
  $('#recipeIngredients').text(recipeIngredients);
}

function getMovieResults() {
  console.log('movies');

  var url = "#"

  $.ajax({
    type: "GET",
    url: url
  }).done(function () {
    console.log(data);
    showMovie()
  })
}

function showMovie() {
  console.log('movie');
  // var movieTitle =
  // var movieSummary =
  // var moviePic =
  //
  // $('#movieTitle').text(movieTitle);
  // $('#moviePic').attr('src',moviePic);
  // $('#movieSummary').text(movieSummary);
}
