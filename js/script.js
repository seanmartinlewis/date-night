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
    localStorage.setItem('userId', profile.user_id);

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

    $('#splashPage').addClass('hidden');
    $('#resultsPage').removeClass('hidden');

    getMovieResults();
    getRecipeResults();
  });

  // Load dates from database
  $('#myDates').on("click", loadDates);

  // New API call on "Get Next" button click on results page
  $('#getRecipe').on('click', getRecipeResults);
  $('#getMovie').on('click', getMovieResults);

  // save the date results to database
  $('#saveResults').on('click', function() {
    if(isLoggedIn()) {
      saveDateResults();
    } else {
      alert('You have to be logged in to save your date!');
    }
  });

  // Return users to splash page when they click on the logo
  $('#logo').on('click', function () {
    $('#splashPage').removeClass('hidden');
    $('#resultsPage').addClass('hidden');
    $('#profilePage').addClass('hidden');
  });

  // Users can see profile from navigation bar
  $('#showProfile').on('click', function () {
    $('#profilePage').removeClass('hidden');
    $('#resultsPage').addClass('hidden');
    $('#splashPage').addClass('hidden');
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
  localStorage.removeItem('userId');
  window.location.href='/';
}

function showProfile() {

  // Hide login button
  $('#login').addClass('hidden');

  // Inject user info into page and show it
  $('#username').text(localStorage.getItem('username'));
  $('#profilePicture').attr('src', localStorage.getItem('profilePicture'));
  $('#userInfo').removeClass('hidden');
}

function getRecipeResults(json) {
  console.log(json);
  var userSelection = $('#foodType option:selected').val();
  var pageNum = Math.round((Math.random()*4)+1)
  var food = userSelection;
  $.ajax({
    url: "http://www.recipepuppy.com/api/?q=" + food + "&p=" + pageNum,
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

function saveDateResults() {
  var username = localStorage.getItem('username');
  var date = new Date();
  var moviePicture = $('#moviePic').attr('src');
  var recipePicture = $('#recipePic').attr('src');
  var profilePicture = localStorage.getItem('profilePicture');
  var userId = localStorage.getItem('userId');

  var data = {
    username: username,
    date: date,
    moviePicture: moviePicture,
    recipePicture: recipePicture,
    profilePicture: profilePicture,
    userId: userId
  };

  $.ajax({
    url: 'https://thawing-sea-85558.herokuapp.com/profile',
    data: data,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
  })
  .done(function (response) {
    console.log('response', response);
    $('#resultsPage').addClass('hidden');
    $('#profilePage').removeClass('hidden');
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
  });
}

function loadDates(event) {
    event.preventDefault();
    $.ajax({
      url: "https://thawing-sea-85558.herokuapp.com/profile",
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
      }
    })
  .done(function(data){
      data.forEach(function(datum){
        loadDate(datum)
      })
    })
  }

function loadDate(data) {
    console.log(data);
    var li = $('<li />')
    li.text(data)
    $('#dates').append(li);
  }
