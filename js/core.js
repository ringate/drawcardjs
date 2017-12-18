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
  $('#energy .bar').width((ps.energy/rules.maxenergy*100)+'%');
  $('#damage .level').html(ps.damage);
  $('#damage .bar').width((ps.damage/rules.maxdur*100)+'%');
}

function awardsUpdate() {
  for (var i = 0; i < awardinfo.awards.length; i++) {
    if (awards[awardinfo.awards[i].name] && !$('#' + awardinfo.awards[i].name).hasClass('showup')) {
      $('#' + awardinfo.awards[i].name).attr('title',awardinfo.awards[i].desc.long).addClass('showup');
    }
  }
}

function upgradeUpdate() {
  Object.keys(upgrade).forEach(function(factor) {
    if (upgrade[factor]) {
      $('#' + factor).addClass('selected');
    }
  });
}

function talentUpdate() {
  $('#talent-list').empty();
  Object.keys(talent).forEach(function(role) {
    if (talent[role]) {
      var talentData = findTalent(role)[0];
      var elem = $('<li></li>').text(talentData.desc.short).attr('id',talentData.name).attr('title',talentData.desc.long).css({'color':talentData.color.text,'background-color':talentData.color.background});
      $('#talent-list').append(elem);
    }
  });
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
/*****  Core Game Functions  *****/
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cardDraw(type, hash) {
  var level = 0;
  if (upgrade.redrawn) level++;
  if (upgrade.redrawnr) level++;
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash, level: level },
  }).done(function(card) {
    if (card == 'error') return false;
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

function worldReset() {
  $('#badge-list li.showup').removeClass('showup');
  $('#upgrade-list > div.selected').removeClass('selected');
  badgeInfo('');
  lifetime = $.extend(true, {}, originaldata.lifetime);
  upgrade = $.extend(true, {}, originaldata.upgrade);
  awards = $.extend(true, {}, originaldata.awards);
  roundReset();
  eraseCookie('playerstatus');
}
/*****  Core Game Functions  *****/

/*****  Energy Using Logic  *****/
function energyUse(card) {
  var drawEnergy = energyRevise();
  if (card.indexOf(',') != -1) {
    var cards = card.split(',');
    ps.energy -= cards.length * drawEnergy;
  } else {
    ps.energy -= drawEnergy;
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
  ps.energy += rules.sleeprecover + getRandom(-10,10);
  messageUpdate('Restored some energy.');
  limitCheck();
  statusUpdate();
}

function healRestore() {
  if (items.n >= rules.healcard1) {
    items.n -= rules.healcard1;
    var healValue = rules.heal1 + getRandom(0,5);
    ps.damage -= healValue;
    limitCheck();
    itemUpdate();
    statusUpdate();
    messageUpdate('Reduced ' + healValue + ' damages.','green');
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
    messageUpdate('Reduced ' + rules.heal2 + ' damages.','purple');
  } else {
    messageUpdate('At least ' + rules.healcard2 + ' R card for recover.');
  }
}
/*****  Energy Using Logic  *****/

/*****  Upgrade Handler Logic  *****/
function findUpgrade(factor) {
    return $.grep(upgradeinfo.upgrades, function(upgradeobj, i) {
      return upgradeobj.name == factor;
    });
}

function worldUpgrade(factor) {
  if (!upgrade[factor]) {
    var requirements = findUpgrade(factor)[0];
    if (typeof requirements.require == 'object') {
      var enabled = requirements.require.enabled;
      if (enabled.indexOf(',') == -1) {
        if (!upgrade[enabled]) {
          messageUpdate('Need upgrade first: ' + requirements.desc.long);
          return false;
        }
      } else {
        var enabledlist = enabled.split(',');
        for (var i = 0; i < enabledlist.length; i++) {
          if (!upgrade[enabledlist[i]]) {
            messageUpdate('Need upgrade first: ' + findUpgrade(enabledlist[i])[0].desc.long);
            return false;
          }
        }
      }
    }
    var factorUpdated = 0;
    if (requirements.condition.operator == '>=') {
      if (this[requirements.condition.type][requirements.condition.field] >= requirements.condition.target) {
      	this[requirements.condition.type][requirements.condition.field] -= requirements.condition.target;
        factorUpdated = 1;
      } else {
        factorUpdated = -1;
      }
    } else if (requirements.condition.operator == '<=') {
      if (this[requirements.condition.type][requirements.condition.field] <= requirements.condition.target) {
      	this[requirements.condition.type][requirements.condition.field] += requirements.condition.target;
        factorUpdated = 1;
      } else {
        factorUpdated = -1;
      }
    }
    if (factorUpdated == 1) {
      upgrade[requirements.name] = 1;
      if (requirements.name.indexOf('talentunlock') != -1) randomTalent();
      dataSave();
      dataLifeTimeSave();
      dataLoad();
      messageUpdate(requirements.desc.long,requirements.color.text,requirements.color.background);
      return true;
    } else if (factorUpdated == -1) {
      messageUpdate('Need ' + requirements.condition.target + ' ' + requirements.condition.field.toUpperCase() + ' Cards.');
    }
  } else {
    return false;
  }
}
/*****  Upgrade Handler Logic  *****/

/*****  Talent Role Influence Logic  *****/
function findTalent(role) {
  return $.grep(talentinfo.talents, function(talentobj, i) {
    return talentobj.name == role;
  });
}

function findTalentByLevel(unlock) {
  return $.grep(talentinfo.talents, function(talentobj, i) {
    return talentobj.require.enabled == unlock;
  });
}

function randomTalent() {
  if ( (upgrade.talentunlock1) && (!rolelock.unlock1) ) {
    rolelock.unlock1 = 1;
    let talentlist = findTalentByLevel('talentunlock1');
    talent[talentlist[getRandom(0,talentlist.length - 1)].name] = 1;
  }
  if ( (upgrade.talentunlock2) && (!rolelock.unlock2) ) {
    rolelock.unlock2 = 1;
    let talentlist = findTalentByLevel('talentunlock2');
    talent[talentlist[getRandom(0,talentlist.length - 1)].name] = 1;
  }
  if ( (upgrade.talentunlock3) && (!rolelock.unlock3) ) {
    rolelock.unlock3 = 1;
    let talentlist = findTalentByLevel('talentunlock3');
    talent[talentlist[getRandom(0,talentlist.length - 1)].name] = 1;
  }
}

function insertTalent() {
  Object.keys(talent).forEach(function(role) {
    if (talent[role]) {
      let talentData = findTalent(role)[0];
      for (var i = 0; i < talentData.addons.length; i++) {
        if (talentData.addons[i].operator == '+') {
          this[talentData.addons[i].type][talentData.addons[i].field] += talentData.addons[i].target;
        } else if (talentData.addons[i].operator == '-') {
          this[talentData.addons[i].type][talentData.addons[i].field] -= talentData.addons[i].target;
        }
      }
    }
  });
}
/*****  Talent Role Influence Logic  *****/

/*****  Upgrade Revise Logic  *****/
function damageRevise() {
  var nDamage = rules.damage;
  if (upgrade.reducedamage1) nDamage -= DAMAGE_LV_UP1;
  if (upgrade.reducedamage2) nDamage -= DAMAGE_LV_UP2;
  if (upgrade.reducedamage3) nDamage -= DAMAGE_LV_UP3;
  return nDamage;
}

function energyRevise() {
  var nEnergy = rules.drawcard;
  if (upgrade.reduceenergy1) nEnergy -= ENERGY_LV_UP1;
  if (upgrade.reduceenergy2) nEnergy -= ENERGY_LV_UP2;
  if (upgrade.reduceenergy3) nEnergy -= ENERGY_LV_UP3;
  return nEnergy;
}
/*****  Upgrade Revise Logic  *****/

/*****  Data Logic Checking  *****/
function limitCheck() {
  if (ps.energy > rules.maxenergy) ps.energy = rules.maxenergy;
  if (ps.damage < 0) ps.damage = 0;

  if (ps.damage >= rules.maxdur) {
    ps.damage = rules.maxdur;
    player.alive = 0;
    lifetime.dead += 1;
    dataLifeTimeSave();
    messageUpdate('Die by overtaken damages.','#F66');
  }
  if (ps.energy <= 0) {
    ps.energy = 0;
    player.alive = 0;
    lifetime.dead += 1;
    lifetime.outofenergy += 1;
    dataLifeTimeSave();
    messageUpdate('Die by out of energy.','#0F0');
  }
  if (ps.dayused >= rules.maxday) {
    player.alive = 0;
    lifetime.dead += 1;
    lifetime.timeup += 1;
    dataLifeTimeSave();
    messageUpdate('Die by time was up.','#9EF');
  }
  if (items.ur >= rules.wincardneed) {
    player.alive = 0;
    lifetime.won += 1;
    dataLifeTimeSave();
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
          dataLifeTimeSave();
          badgeInfo(awardinfo.awards[i].badge.message,awardinfo.awards[i].badge.textcolor,awardinfo.awards[i].badge.bgcolor);
        }
      } else if (awardinfo.awards[i].condition.operator == '<=') {
        if (this[awardinfo.awards[i].condition.type][awardinfo.awards[i].condition.field] <= awardinfo.awards[i].condition.target) {
          awards[awardinfo.awards[i].name] = 1;
          dataLifeTimeSave();
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
  var depressionLevel = rules.depression + getRandom(0,2);
  if (counter.attack >= depressionLevel) {
    var attackDamage = damageRevise();
    counter.attack = 0;
    ps.damage += attackDamage;
    lifetime.damage += attackDamage;
  }
}
/*****  Item Update  *****/
/*****  Game Logic  *****/

/*****  Data Save/Load Handling  *****/
function dataSave() {
  var playdata = {
    player: player,
    items: items,
    ps: ps,
    talent: talent,
    rolelock: rolelock
  }
  var enc = btoa(JSON.stringify(playdata));
  createCookie("playerstatus",enc);
  dataLifeTimeSave();
  messageUpdate('Data was saved.');
}

function dataLifeTimeSave() {
  var statisticdata = {
    lifetime: lifetime,
    upgrade: upgrade,
    awards: awards
  }
  var enc = btoa(JSON.stringify(statisticdata));
  createCookie("playerawards",enc);
}

function dataLoad() {
  var enc = readCookie("playerstatus");
  if (enc != null) {
    var dnc = $.parseJSON(atob(enc));
    rules = $.extend(true, {}, originaldata.rules);
    player = dnc.player;
    items = dnc.items;
    ps = dnc.ps;
    talent = dnc.talent;
    rolelock = dnc.rolelock;
    counter = $.extend(true, {}, originaldata.counter);
    var enc2 = readCookie("playerawards");
    if (enc2 != null) {
      var dnc2 = $.parseJSON(atob(enc2));
      lifetime = dnc2.lifetime;
      upgrade = dnc2.upgrade;
      awards = dnc2.awards;
      limitCheck();
      insertTalent();
      itemUpdate();
      statusUpdate();
      talentUpdate();
      awardsUpdate();
      upgradeUpdate();
      messageUpdate('Data was loaded.');
    }
  }
}
/*****  Data Save/Load handling  *****/

/*****  Start Game Init  *****/
function initOriginal() {
  originaldata.rules = $.extend(true, {}, rules);
  originaldata.player = $.extend(true, {}, player);
  originaldata.items = $.extend(true, {}, items);
  originaldata.ps = $.extend(true, {}, ps);
  originaldata.talent = $.extend(true, {}, talent);
  originaldata.rolelock = $.extend(true, {}, rolelock);
  originaldata.counter = $.extend(true, {}, counter);
  originaldata.lifetime = $.extend(true, {}, lifetime);
  originaldata.upgrade = $.extend(true, {}, upgrade);
  originaldata.awards = $.extend(true, {}, awards);
}

function initItems() {
  for (var label in items) {
    var elem = $('<li></li>').html('<label>' + label.toUpperCase() + '</label><br /><span></span>').attr('id','card' + label);
    $('#item-list').append(elem);
  }
}

function initAwards(type, hash) {
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash },
  }).done(function(data) {
    if (data == 'error') return false;
    awardinfo = $.parseJSON(data);
    for (var i = 0; i < awardinfo.awards.length; i++) {
      var elem = $('<li></li>').text(awardinfo.awards[i].desc.short).attr('id',awardinfo.awards[i].name).css({'color':awardinfo.awards[i].badge.textcolor,'background-color':awardinfo.awards[i].badge.bgcolor});
      $('#badge-list').append(elem);
    }
  });
}

function initUpgrades(type, hash) {
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash },
  }).done(function(data) {
    if (data == 'error') return false;
    upgradeinfo = $.parseJSON(data);
    for (var i = 0; i < upgradeinfo.upgrades.length; i++) {
      var elem = $('<div></div>').attr('id',upgradeinfo.upgrades[i].name);
      $('#upgrade-list').append(elem);
      $('<div class="button">' + upgradeinfo.upgrades[i].desc.short + '</div>').css({'color':upgradeinfo.upgrades[i].color.text,'background-color':upgradeinfo.upgrades[i].color.background}).appendTo('#' + upgradeinfo.upgrades[i].name);
      $('<div class="desc">' + upgradeinfo.upgrades[i].desc.long + '</div>').appendTo('#' + upgradeinfo.upgrades[i].name);
      $('#' + upgradeinfo.upgrades[i].name).append('<div class="clear"></div>');
    }
  });
}

function initTalent(type, hash) {
  $.get({
    url: 'ajax.php',
    data: { type: type, hash: hash },
  }).done(function(data) {
    if (data == 'error') return false;
    talentinfo = $.parseJSON(data);
  });
}

function roundReset() {
  player = $.extend(true, {}, originaldata.player);
  items = $.extend(true, {}, originaldata.items);
  ps = $.extend(true, {}, originaldata.ps);
  talent = $.extend(true, {}, originaldata.talent);
  rolelock = $.extend(true, {}, originaldata.rolelock);
  counter = $.extend(true, {}, originaldata.counter);
  $('.mode').show();
  messageUpdate('Welcome!');
  randomTalent();
  insertTalent();
  itemUpdate();
  statusUpdate();
  talentUpdate();
  upgradeUpdate();
  logClear();
}

function runOnce() {
  $.ajaxSetup({async:false});
  initOriginal();
  initItems();
  initAwards('custom','95e777b1daaacd8870c480bb35293b53754e5e832896260b863f41e52ac05edf');
  initUpgrades('custom','ee943dc49fcbfff114b8e5772951cddb2f5204a5d5c6379d3f609261c6db34b9');
  initTalent('custom','aa71c311a2c73de593a95fb2fed2d3e1289deac3bc3f73b56ef7c38e0642a4b0');
  roundReset();
  dataLoad();
}
/*****  Start Game Init  *****/
