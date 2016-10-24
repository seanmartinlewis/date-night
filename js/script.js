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
    // getRecipeResults();
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

function getRecipeResults(json) {
  console.log(json);
  var pageNum = Math.round((Math.random()*4)+1)
  var food = 'chicken';
  $.ajax({
    url: "http://www.recipepuppy.com/api/?i=" + food + "&p=" + pageNum,
    jsonp: "callback",
    dataType: "jsonp",
    jsonpCallback: "logResults"
  }).done(function (response) {
    var randomIndex = (Math.round(Math.random()*10));
    var randomRecipe = response.results[randomIndex];
     console.log(response);
     showRecipe(randomRecipe);
  })
}

function showRecipe(recipe) {
  console.log('recipe');
  var recipeTitle = recipe.title;
  var recipeIngredients = recipe.ingredients;
  var recipePic = recipe.thumbnail;

  $('#recipeName').text(recipeTitle);
  $('#recipePic').attr('src',recipePic);
  $('#recipeIngredients').text(recipeIngredients);
}
function getMovieResults() {
  console.log('movies');

  // Create object with "official genre codes"
  var genreObj = {
    'horror': '27',
    'comedy': '35',
    'drama': '18',
    'romance': '10749'
  };

  // Get user selected genre and associated genre code
  var userSelection = $('#movieGenre option:selected').val();
  var genreCode = genreObj[userSelection];

  // Results are returned by page num; get results from a random page between 1 and 21
  var pageNum = Math.round((Math.random()*10) + 1);

  $.ajax({
    url: 'https://api.themoviedb.org/3/discover/movie?api_key=63efd94ec261de399db1622ddbc1ab22&language=en-US&sort_by=popularity.desc&include_adult=false&page=' + pageNum + '&with_genres=' + genreCode
  })
  .done(function(data) {

    // Of the 20 results, randomly select a movie
    var randomIndex = (Math.round(Math.random()*20));
    var randomMovie = data.results[randomIndex];

    console.log(randomMovie);
    showMovie(randomMovie);
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
  });
}

function showMovie(movie) {
  var movieTitle = movie.title;
  var movieSummary = movie.overview;
  var moviePic = 'http://image.tmdb.org/t/p/w185' + movie.poster_path;

  $('#movieTitle').text(movieTitle);
  $('#moviePic').attr('src',moviePic);
  $('#movieSummary').text(movieSummary);
}
