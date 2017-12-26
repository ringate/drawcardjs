var debug_note = '';
var last_action = '';
var action_speed = 200;
var action_counter = 0;
var debug_time = 10;
var debug_counter = 0;

$(document).ready(function() {
  if (ROBOT_MODE) {
    $('#command-list2').append('<li id="robot-on">Robot On</li><li id="robot-off" class="selected">Robot Off</li>');
    $('body').append('<div class="column"><div id="debug-history"><div id="last-dayused" class="cols"><u>Days</u></div><div id="last-energy" class="cols"><u>Energy</u></div><div id="last-damage" class="cols"><u>Damage</u></div><div id="last-items-n" class="cols"><u>N</u></div><div id="last-items-r" class="cols"><u>R</u></div><div id="last-items-sr" class="cols"><u>SR</u></div><div id="last-items-ur" class="cols"><u>UR</u></div><div class="clear"></div></div></div><div class="clear"></div>');
  }
}());

$('#robot-on').on('click', function() {
  ROBOT_STATUS = 1;
  $('li[id^="robot-"]').removeClass('selected');
  $(this).addClass('selected');
  robotPlay();
});

$('#robot-off').on('click', function() {
  ROBOT_STATUS = 0;
  $('li[id^="robot-"]').removeClass('selected');
  $(this).addClass('selected');
});

function robotPlay() {
  if ( (ROBOT_STATUS) && (player.alive) ) {
    if (ps.energy <= 15) {
      debugLogger('sleep');
      $('#sleep').click();
      if (ps.dayused >= (rules.maxday + rules_addon.maxday)) {
        $('#robot-off').click();
        debugLogger('dead1');
      }
    } else {
      var nextDamage = ps.damage + damageRevise();
      var currentDur = (rules.maxdur + rules_addon.maxdur);
      if (ps.damage + damageRevise() >= (rules.maxdur + rules_addon.maxdur)) {
        console.log('predict damage['+currentDur+']: '+ps.damage+' => '+nextDamage);
      }
      if (ps.damage + damageRevise() >= (rules.maxdur + rules_addon.maxdur)) {
        if (items.r >= rules.healcard2) {
          debugLogger('recover');
          $('#recover').click();
        }
      }
      if (ps.damage + damageRevise() >= (rules.maxdur + rules_addon.maxdur)) {
        if (items.n >= rules.healcard1) {
          debugLogger('heal');
          $('#heal').click();
        }
      }
      if (ps.damage + damageRevise() * 2 >= (rules.maxdur + rules_addon.maxdur)) {
        if (ps.damage + damageRevise() >= (rules.maxdur + rules_addon.maxdur)) {
          debugLogger('draw!!!');
          $('#draw').click();
        } else {
          debugLogger('draw');
          $('#draw').click();
        }
      } else {
        if (ps.energy > (rules.drawcard * 10)) {
          debugLogger('draw10');
          $('#draw10').click();
        } else {
          debugLogger('draw');
          $('#draw').click();
        }
      }
    }
    if (!player.alive) {
      $('#robot-off').click();
      debugLogger('dead2');
    }
    setTimeout(function() {
      robotPlay();
    }, action_speed);
  }
}

function debugLogger(action) {
  if (last_action != action) {
    last_action = action;
    if (debug_note == '') {
      debug_note += action;
    } else {
      debug_note += ' x'+action_counter;
      debug_note += ', ' + action;
    }
    action_counter = 1;
  } else {
    action_counter++;
  }
  if (action == 'sleep') {
    console.log('Day '+ps.dayused+': '+debug_note);
    debug_note = '';
  } else if (action.indexOf('dead') > -1) {
    console.log('Day '+ps.dayused+': '+debug_note);
    debugTableUpdate();
    debug_note = '';
  }
}

function debugTableUpdate() {
  debug_counter++;
  Object.keys(ps).forEach(function(elem) {
    let tempdata = $('#last-'+elem).html();
    $('#last-'+elem).html(tempdata+'<br />'+ps[elem]);
  });
  Object.keys(items).forEach(function(elem) {
    let tempdata = $('#last-items-'+elem).html();
    $('#last-items-'+elem).html(tempdata+'<br />'+items[elem]);
  });
  if (debug_counter < debug_time) {
    $('#reset').click();
    $('#robot-on').click();
  }
}