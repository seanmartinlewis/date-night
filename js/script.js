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
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('username', profile.nickname)
    localStorage.setItem('profilePicture', profile.picture)

    showProfile();
  });
});
//decready start
$(document).ready(function () {
  $('#login').show()
  console.log('date night');

  $('#login').on('click', function() {
  lock.show();

  })

  $('#dateMaker').on('click', function (e) {
    e.preventDefault();

    console.log('working');
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
    console.log('loggedin')
    showProfile()
  }

  $(document).on('click','#logout', logOut)

});
//doc ready end

function isLoggedIn() {
  console.log('logged');
  if (localStorage.getItem('idToken')) {
  return isJwtValid();
  } else {
  return false;
  }
}

function isJwtValid() {
  var token = localStorage.getItem('idToken')
  if (!token) {
    return false;
  }
  var encodedPayload = token.split('.')[1]
  console.log('encodedPayload', encodedPayload);
  var decodedPayload = JSON.parse(atob(encodedPayload))
  console.log('decodedPayload', decodedPayload);
  var exp = decodedPayload.exp;
  console.log('exp', exp);
  var expirationDate = new Date(exp * 1000);
  console.log('expirationDate', expirationDate);
  return new Date() <= expirationDate
}

function logOut() {
  localStorage.removeItem('idToken')
  localStorage.removeItem('username')
  localStorage.removeItem('profilePicture')
  window.location.href='/';
}

function showProfile() {


  console.log('show profile');
  $('#login').hide()
  $('#userInfo').show()
  $('#logout').show()

  $('#username').text(username)
  $('#profilePicture').attr('src', profilePicture)

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
