$(document).ready(function() {
  if (typeof window.orientation !== 'undefined') {
    $('body').append('<ul id="tab-list"><li>Draw</li><li>Upgrade</li><li>Badge</li><li>History</li></ul>')
    if (ROBOT_MODE) {
      var elem = $('<li></li>').text('Robot');
      $('#tab-list').append(elem);
    }
    $('.column').hide();
    $('.column').eq(0).show();
  }
}());

$('#tab-list li').on('click', function() {
  $('.column').hide();
  $('.column').eq($(this).index()).show();
});