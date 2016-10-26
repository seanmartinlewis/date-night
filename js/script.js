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

    // Check that users have selected a genre and food type
    var emptySelection = $('#movieGenre option:selected').val() === 'default' || $('#foodType option:selected').val() === 'default';

    if (emptySelection) {
      // You must pick Genre and Type
      showModal('emptySelection');
    } else if (!emptySelection && !isLoggedIn()) {
      // You must be logged in to save a date
      $('#emptySelection').css('display', 'none');
      showModal('notLoggedIn');

      // If user chooses to continue anyway...
      $('#notLoggedIn .continue').on('click', function () {

        // Hide modal
        $('#notLoggedIn').css('display', 'none');
        $('.modal').css('display', 'none');

        // Reveal results page, load results
        $('#splashPage').addClass('hidden');
        $('#resultsPage').removeClass('hidden');

        getMovieResults(e);
        getRecipeResults(e);
      });

      $('#notLoggedIn .goBack').on('click', function () {
        $('.modal').css('display', 'none');
      });
    } else {
      // Reveal results page, load results
      $('#splashPage').addClass('hidden');
      $('#resultsPage').removeClass('hidden');

      getMovieResults(e);
      getRecipeResults(e);
      setNextDropdowns();
    }
  });

  // New API call on "Get Next" button click on results page
  $('#getRecipe').on('click', function(e) {
    getRecipeResults(e);
  });
  $('#getMovie').on('click', function(e){
    getMovieResults(e);
  });
  // save the date results to database
  $('#saveResults').on('click', function() {
    if(isLoggedIn()) {
      saveDateResults();
    } else {
      // showModal();
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

    loadDates();
  });

  // Filter feed results to display user's own dates
  $('#myDates').on("click", loadDates);
  $('#publicDates').on("click", loadDates);

  // Allow user to delete their dates
  $(document).on('click', 'a.delete', function (e) {
    e.preventDefault();
    var li = $(e.currentTarget).parent('li');

    showModal('deleteCheck');

    $('#deleteCheck .continue').on('click', function () {
      $('.modal').css('display', 'none');
      deleteDate(li);
    });

    $('#deleteCheck .goBack').on('click', function () {
      $('.modal').css('display', 'none');
      $('#deleteCheck').css('display', 'none');
    });
  });

  // Modal functionality

  // When the user clicks on <span> (x), close the modal
  $('span.close').on('click', function() {
      $('.modal').css('display', 'none');
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(e) {
    var modal = document.getElementById('myModal');

    if (e.target == modal) {
        $(modal).css('display', "none");
    }
  };

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
  $('.username').text(localStorage.getItem('username'));
  $('.profilePicture').attr('src', localStorage.getItem('profilePicture'));
  $('#userInfo').removeClass('hidden');
}

function getRecipeResults(e) {
  var clicked = $(e.currentTarget);
  var clickedId = clicked.attr("id");
  var userSelection;
  // Get user selected genre and associated genre code
  if(clickedId === "dateMaker"){
    userSelection = $('#foodType option:selected').val();
  } else if(clickedId === "getRecipe"){
    userSelection = $('#nextFoodType option:selected').val();
  }

  console.log(userSelection);

  $.ajax({
    url: "https://thawing-sea-85558.herokuapp.com/recipes/" + userSelection
    // jsonp: "callback",
    // dataType: "jsonp",
    // jsonpCallback: "logResults"
  }).done(function (response) {

    var randomIndex = (Math.round(Math.random()*10));
    var randomRecipe = response[randomIndex];

    showRecipe(randomRecipe);

    // Reset food type selector on splash page
    $('#foodType').selectpicker('val', 'default');
  })
}

function showRecipe(recipe) {
  var recipeTitle = recipe.title;
  var recipeDescription = recipe.description;
  var recipePic = recipe.recipePicture;
  var recipeLink = recipe.recipeURL;

  $('#recipeName').text(recipeTitle);
  $('#recipePic').attr('src',recipePic);
  $('#recipeIngredients').text(recipeDescription);
  $('#recipeURL').attr('href',recipeLink);
}
function getMovieResults(e) {
  var clicked = $(e.currentTarget);
  var clickedId = clicked.attr("id");
  var userSelection;
  // Get user selected genre and associated genre code
  if(clickedId === "dateMaker"){
    userSelection = $('#movieGenre option:selected').val();
  } else if(clickedId === "getMovie"){
    userSelection = $('#nextMovieGenre option:selected').val();
  }

  // Create object with "official genre codes"
  var genreObj = {
    'horror': '27',
    'comedy': '35',
    'drama': '18',
    'romance': '10749'
  };
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

    showMovie(randomMovie);

    // Reset movie genre selector on slpash page
    $('#movieGenre').selectpicker('val', 'default');
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
  var nightName = $('#nightName').val();
  var nightDescription = $('#nightDescription').val();

  var data = {
    username: username,
    date: date,
    moviePicture: moviePicture,
    recipePicture: recipePicture,
    profilePicture: profilePicture,
    userId: userId,
    nightName: nightName,
    nightDescription: nightDescription
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

    // Hide results page and take users to profile page
    $('#resultsPage').addClass('hidden');
    $('#profilePage').removeClass('hidden');

    // Reload list of dates to dispaly in profile feed
    loadDates();
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
  });
}

function loadDates(event) {
  if(event){
    event.preventDefault();
  }
  var activeTab = $(this);
  var link;
  var userId = localStorage.getItem('userId');
  if(activeTab.attr("id")=== "myDates"){
    link = "https://thawing-sea-85558.herokuapp.com/profile/" + userId;
  } else {
    link = "https://thawing-sea-85558.herokuapp.com/profile/";
  }
    $.ajax({
      url: link,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('idToken')
      }
    })
  .done(function(response){
    $('#dates').empty();
    response.forEach(function(date){
      loadDate(date);
    });
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
  });
}

function loadDate(date) {
  var li = $('<li />').attr({
    "data-userId": date.userId,
    "data-dateId": date._id
  })
  var profPic = $('<img />').attr('src', date.profilePicture).addClass('profilePicture');
  var timeAgo = timeCalculator(date);
  var time = $('<span />').text(timeAgo);
  var user = $('<p />').text(date.username).append(time);
  var moviePic = $('<img />').attr('src', date.moviePicture).addClass('moviePicture');
  var recipePic = $('<img />').attr('src', date.recipePicture).addClass('recipePicture');
  var deleteButton = $('<a />').attr('href', '#').text('Delete').addClass('delete');
  var nightTitle = $('<h3 />').text(date.nightName);
  var nightSummary = $('<p />').text(date.nightDescription);

  li.append(profPic, user, moviePic, recipePic, deleteButton, nightTitle, nightSummary);
  $('#dates').prepend(li);

var userId = localStorage.getItem('userId');
    if(userId !== date.userId) {
    $(deleteButton).addClass("hidden");
  }
}

function timeCalculator(date) {
  var date = new Date(date.date);
  var currentTime = new Date();
  var difference = (currentTime - date);
  var hour = Math.round(difference / (60*60*1000));
  var minute = Math.round(difference / (60*1000));
  var time = $('<span />');

  if (minute < 1) {
    return 'Just now';
  } else if (minute < 2) {
    return minute + ' minute ago';
  } else if (minute < 60) {
    return minute + ' minutes ago';
  } else {
    return hour + ' hours ago';
  }
}

function isUsersDate(e) {
  var li = $(e.currentTarget).parent('li');
  var liUser = li.attr('data-userId');
  var userId = localStorage.getItem('userId');

  return liUser === userId;
}

function deleteDate(target) {

  var dateId = target.attr('data-dateId');

  $.ajax({
    url: "https://thawing-sea-85558.herokuapp.com/profile/" + dateId,
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
  })
    .done(function (response) {
      loadDates();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    })
}

function showModal(id) {
  $('.modal').css('display', 'block');
  $('#' + id).css('display', 'block');
}

function setNextDropdowns() {
  var previousGenre = $('#movieGenre option:selected').val()
  var previousFood = $('#foodType option:selected').val()

  $('#nextMovieGenre').selectpicker('val', previousGenre);
  $('#nextFoodType').selectpicker('val', previousFood);
}
