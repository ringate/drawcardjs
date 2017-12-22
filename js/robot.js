$(document).ready(function() {
  if (ROBOT_MODE) {
    $('#command-list2').append('<li id="robot">Robot</li>');
  }
}());

$('#robot').on('click', function() {
  console.log('hihi');
});
