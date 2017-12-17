$('#draw').on('click', function() {
  cardDraw('normal','697df868b85bd393d902eb493f3308f5b9942ede19be2eed5934f27bb73e07e5');
});
$('#draw10').on('click', function() {
  cardDraw('normal','55e32a48ffa3bd05583081747a843fee8972c02458099dc81ad1101daf87424f');
});
$('#sleep').on('click', function() {
  sleepRestore();
});
$('#heal').on('click', function() {
  healRestore();
});
$('#recover').on('click', function() {
  recoverRestore();
});
$('#save').on('click', function() {
  dataSave();
});
$('#load').on('click', function() {
  roundReset();
  dataLoad();
});
$('#clearlogs').on('click', function() {
  logClear();
});
$('#reset').on('click', function() {
  roundReset();
});
$('#hard-reset').on('click', function() {
  worldReset();
});
$('#upgrade-list .button').on('click', function() {
  var toggle = worldUpgrade($(this).parent().attr('id'));
  if (toggle) {
    $(this).css({'background-color': '#1BD', 'color': '#FFF'});
  }
});
