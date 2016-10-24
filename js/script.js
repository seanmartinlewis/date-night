// Auth0 authentication setup
var lock = new Auth0Lock('70MGYz88Zh03iWlMSdley6WPlkhSElYs', 'rattlesnakemilk.auth0.com', {
  auth: {
    params: {
      scope: 'openid email'
    }
  }
});

lock.on("authenticated", function(authResult) {
  lock.getProfile(authResult.idToken, function(error, profile) {
    if (error) {
      console.log('error',error);
    }
    localStorage.setItem('idToken', authResult.idToken);
    localStorage.setItem('username', profile.nickname);
    localStorage.setItem('profilePicture', profile.picture);

    showProfile();
  });
});

// doc ready start
$(document).ready(function () {

  // Check if user is still logged in from previous session
  if (isLoggedIn()) {
    showProfile();
  }

  // Trigger Auth0 lock when login button clicked
  $('#login').on('click', function() {
    lock.show();
  });

  // Call APIs when "datemaker" button clicked
  $('#dateMaker').on('click', function (e) {
    e.preventDefault();

    getMovieResults();
    getRecipeResults();
    $('#splashPage').hide();
    $('#resultsPage').show();
  });

  // New API call on "Get Next" button click on results page
  $('#getRecipe').on('click', getRecipeResults);
  $('#getMovie').on('click', getMovieResults);

  // Return users to splash page when they click on the logo
  $('#logo').on('click', function () {
      $('#resultsPage').hide();
      $('#splashPage').show();
  });

  // Log out via Auth0 when logout button clicked
  $('#logout').on('click', logOut);
});
//doc ready end

function isLoggedIn() {
  var token = localStorage.getItem('idToken')

  // Check for valid user token in localStorage
  if (!token) {
    return false;
  }

  // Extract jwt expiration from token; check validity
  var encodedPayload = token.split('.')[1];
  var decodedPayload = JSON.parse(atob(encodedPayload));
  var exp = decodedPayload.exp;
  var expirationDate = new Date(exp * 1000);

  return new Date() <= expirationDate;
}

function logOut() {
  localStorage.removeItem('idToken');
  localStorage.removeItem('username');
  localStorage.removeItem('profilePicture');
  window.location.href='/';
}

function showProfile() {

  // Hide login button
  $('#login').hide();

  // Inject user info into page and show it
  $('#username').text(localStorage.getItem('username'));
  $('#profilePicture').attr('src', localStorage.getItem('profilePicture'));
  $('#userInfo').show();
}

function getRecipeResults() {
  console.log('recipes');
  var food = "tacos";
  var url = "http://www.recipepuppy.com/api/?q=" + food;

  $.ajax({
    url: url
  }).done(function () {
    console.log(data);
    showRecipe();
  })
}

function showRecipe() {
  console.log('recipe');
  var recipeTitle = data.title;
  var recipeIngredients = data.ingredients;
  var recipePic = data.thumbnail;

  $('#recipeName').text(recipeTitle);
  $('#recipePic').attr('src',recipePic);
  $('#recipeIngredients').text(recipeIngredients);
}

function getMovieResults() {
  console.log('movies');

  // var url = "#"
  //
  // $.ajax({
  //   type: "GET",
  //   url: url
  // }).done(function () {
  //   console.log(data);
  //   showMovie()
  // })
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
