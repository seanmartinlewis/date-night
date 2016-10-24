$(document).ready(function(){
  $('#myDates').on("click", loadDates);
})
function loadDates(event) {
  event.preventDefault();
  $.ajax(){
  url: "http://localhost:3000/profile",
  headers: {
    'Authorization': 'Bearer' + localStorage.getItem('idToken')
  }
  }.done(function(data){
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
