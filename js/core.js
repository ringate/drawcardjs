/*****  Frontend Update  *****/
/*****  Frontend Game Data Update  *****/
function itemUpdate() {
  for (var label in items) {
    $('#card' + label + ' span').html(items[label]);
  }
}

function statusUpdate() {
  $('#dayused .level').html(ps.dayused);
  $('#dayused .bar').width(ps.dayused+'%');
  $('#energy .level').html(ps.energy);
  $('#energy .bar').width(ps.energy+'%');
  $('#damage .level').html(ps.damage);
  $('#damage .bar').width(ps.damage+'%');
}

function awardsUpdate() {
  for (var i = 0; i < awardinfo.awards.length; i++) {
    if (awards[awardinfo.awards[i].name] && !$('#' + awardinfo.awards[i].name).hasClass('showup')) {
      $('#' + awardinfo.awards[i].name).addClass('showup');
    }
  }
}
/*****  Frontend Game Data Update  *****/

/*****  Frontend Message Handling  *****/
function messageUpdate(msg, color = '#000', bgcolor = '#FFF') {
  $('#lastmsg').html("<span>" + msg + "</span>").css({'color':color,'background-color':bgcolor});
}

function badgeInfo(msg, color = '#000', bgcolor = '#FFF') {
  $('#badge-info').html("<span>" + msg + "</span>").css({'color':color,'background-color':bgcolor});
}

function cardLog(card) {
  $('#log').append("<div>#" + c++ + ": " + card + "</div>");
}

function logClear() {
  $('#log').empty();
}
/*****  Frontend Message Handling  *****/
/*****  Frontend Update  *****/

/*****  Game Logic  *****/
/*****  Core Game Function  *****/
function cardDraw(type, hash) {
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash },
  }).done(function(card) {
    if (card.indexOf(',') != -1) {
      var cards = card.split(',');
      lifetime.draw += cards.length;
      messageUpdate('10 Draw! ' + card + ' Cards.');
    } else {
      lifetime.draw += 1;
      messageUpdate('Draw! ' + card + ' Card.');
    }
    energyUse(card);
    itemAdd(card);
    limitCheck();
    awardsCheck();
    itemUpdate();
    statusUpdate();
    cardLog(card);
  });
}

function energyUse(card) {
  if (card.indexOf(',') != -1) {
    var cards = card.split(',');
    ps.energy -= cards.length * rules.drawcard;
  } else {
    ps.energy -= rules.drawcard;
  }
}

function sleepRestore() {
  ps.dayused += 1;
  lifetime.day += 1;
  if (!awards.sleepaweek) {
    if (ps.energy == rules.maxenergy) {
      counter.sleep += 1;
    } else {
      counter.sleep = 1;
    }
    awardsCheck();
  }
  ps.energy += rules.sleeprecover;
  messageUpdate('Restored some energy.');
  limitCheck();
  statusUpdate();
}

function healRestore() {
  if (items.n >= rules.healcard1) {
    items.n -= rules.healcard1;
    ps.damage -= rules.heal1;
    limitCheck();
    itemUpdate();
    statusUpdate();
    messageUpdate('Reduced ' + rules.heal1 + ' damage.','green');
  } else {
    messageUpdate('At least ' + rules.healcard1 + ' N card for heal.');
  }
}

function recoverRestore() {
  if (items.r >= rules.healcard2) {
    items.r -= rules.healcard2;
    ps.damage -= rules.heal2;
    limitCheck();
    itemUpdate();
    statusUpdate();
    messageUpdate('Reduced ' + rules.heal2 + ' damage.','purple');
  } else {
    messageUpdate('At least ' + rules.healcard2 + ' R card for recover.');
  }
}

function worldReset() {
  $('#badge-list li.showup').removeClass('showup');
  badgeInfo('');
  lifetime = $.extend(true, {}, originaldata.lifetime);
  awards = $.extend(true, {}, originaldata.awards);
  roundReset();
  eraseCookie('playerstatus');
}
/*****  Core Game Function  *****/

/*****  Data Logic Checking  *****/
function limitCheck() {
  if (ps.energy > rules.maxenergy) ps.energy = rules.maxenergy;
  if (ps.damage < 0) ps.damage = 0;
  if (ps.damage > rules.maxdur) {
    ps.damage = rules.maxdur;
    player.alive = 0;
    lifetime.dead += 1;
    dataAwardsSave();
    messageUpdate('Die by overtaken damages.','#F66');
  }
  if (ps.energy < 0) {
    ps.energy = 0;
    player.alive = 0;
    lifetime.dead += 1;
    lifetime.outofenergy += 1;
    dataAwardsSave();
    messageUpdate('Die by out of energy.','#0F0');
  }
  if (ps.dayused >= rules.maxday) {
    player.alive = 0;
    lifetime.dead += 1;
    lifetime.timeup += 1;
    dataAwardsSave();
    messageUpdate('Die by time was up.','#9EF');
  }
  if (items.ur >= rules.wincardneed) {
    player.alive = 0;
    lifetime.won += 1;
    dataAwardsSave();
    messageUpdate('You Won!','white','blue');
  }
  if (!player.alive) {
    $('.mode').hide();
  }
}

function awardsCheck() {
  for (var i = 0; i < awardinfo.awards.length; i++) {
    if (!awards[awardinfo.awards[i].name]) {
      if (awardinfo.awards[i].condition.operator == '>=') {
        if (this[awardinfo.awards[i].condition.type][awardinfo.awards[i].condition.field] >= awardinfo.awards[i].condition.target) {
          awards[awardinfo.awards[i].name] = 1;
          dataAwardsSave();
          badgeInfo(awardinfo.awards[i].badge.message,awardinfo.awards[i].badge.textcolor,awardinfo.awards[i].badge.bgcolor);
        }
      } else if (awardinfo.awards[i].condition.operator == '<=') {
        if (this[awardinfo.awards[i].condition.type][awardinfo.awards[i].condition.field] <= awardinfo.awards[i].condition.target) {
          awards[awardinfo.awards[i].name] = 1;
          dataAwardsSave();
          badgeInfo(awardinfo.awards[i].badge.message,awardinfo.awards[i].badge.textcolor,awardinfo.awards[i].badge.bgcolor);
        }
      }
    }
  }
  awardsUpdate();
}
/*****  Data Logic Checking  *****/

/*****  Item Update  *****/
function itemAdd(card) {
  if (card.indexOf(',') != -1) {
    var cards = card.split(',');
    for (var i = 0; i < cards.length; i++) {
      itemPush(cards[i]);
    }
  } else {
    itemPush(card);
  }
}

function itemPush(card) {
  switch (card) {
    case 'N': items.n += 1; counter.attack += 1; counter.luck = 0; break;
    case 'R': items.r += 1; counter.attack += 1; counter.luck = 0; break;
    case 'SR': items.sr += 1; counter.attack = 0; counter.luck += 1; break;
    case 'UR': items.ur += 1; counter.attack = 0; counter.luck += 1; break;
  }
  if (counter.attack >= rules.depression) {
    counter.attack = 0;
    ps.damage += rules.damage;
    lifetime.damage += rules.damage;
  }
}
/*****  Item Update  *****/
/*****  Game Logic  *****/

/*****  Data Save/Load Handling  *****/
function dataSave() {
  var playdata = {
    player: player,
    items: items,
    ps: ps
  }
  var enc = btoa(JSON.stringify(playdata));
  createCookie("playerstatus",enc);
  dataAwardsSave();
  messageUpdate('Data was saved.');
}

function dataAwardsSave() {
  var statisticdata = {
    lifetime: lifetime,
    awards: awards
  }
  var enc = btoa(JSON.stringify(statisticdata));
  createCookie("playerawards",enc);
}

function dataLoad() {
  var enc = readCookie("playerstatus");
  if (enc != null) {
    var dnc = $.parseJSON(atob(enc));
    console.log(dnc);
    player = dnc.player;
    items = dnc.items;
    ps = dnc.ps;
    counter = $.extend(true, {}, originaldata.counter);
    var enc2 = readCookie("playerawards");
    if (enc2 != null) {
      var dnc2 = $.parseJSON(atob(enc2));
      lifetime = dnc2.lifetime;
      awards = dnc2.awards;
      limitCheck();
      itemUpdate();
      statusUpdate();
      awardsUpdate();
      messageUpdate('Data was loaded.');
    }
  }
}
/*****  Data Save/Load handling  *****/

/*****  Start Game Init  *****/
function initOriginal() {
  originaldata.player = $.extend(true, {}, player);
  originaldata.items = $.extend(true, {}, items);
  originaldata.ps = $.extend(true, {}, ps);
  originaldata.counter = $.extend(true, {}, counter);
  originaldata.lifetime = $.extend(true, {}, lifetime);
  originaldata.awards = $.extend(true, {}, awards);
}

function roundReset() {
  player = $.extend(true, {}, originaldata.player);
  items = $.extend(true, {}, originaldata.items);
  ps = $.extend(true, {}, originaldata.ps);
  counter = $.extend(true, {}, originaldata.counter);
  $('.mode').show();
  messageUpdate('Welcome!');
  itemUpdate();
  statusUpdate();
  logClear();
}

function initAwards(type, hash) {
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash },
  }).done(function(data) {
    awardinfo = $.parseJSON(data);
    for (var i = 0; i < awardinfo.awards.length; i++) {
      var elem = $('<li></li>').text(awardinfo.awards[i].desc.short).attr('id',awardinfo.awards[i].name).css({'color':awardinfo.awards[i].badge.textcolor,'background-color':awardinfo.awards[i].badge.bgcolor});
      $('#badge-list').append(elem);
    }
  });
}

function initItems() {
  for (var label in items) {
    var elem = $('<li></li>').html('<label>' + label.toUpperCase() + '</label><br /><span></span>').attr('id','card' + label);
    $('#item-list').append(elem);
  }
}

function runOnce() {
  initOriginal();
  initItems();
  initAwards('custom','95e777b1daaacd8870c480bb35293b53754e5e832896260b863f41e52ac05edf');
  roundReset();
}
/*****  Start Game Init  *****/
