/*****  Frontend Update  *****/
/*****  Frontend Game Data Update  *****/
function itemUpdate() {
  for (let label in items) {
    $('#card' + label + ' span').html(items[label]);
  }
}

function statusUpdate() {
  let nMaxEnergy = rules.maxenergy + rules_addon.maxenergy;
  let nMaxDurability = rules.maxdur + rules_addon.maxdur;
  $('#dayused .level').html(ps.dayused);
  $('#dayused .bar').width(ps.dayused + '%');
  $('#energy .level').html(ps.energy);
  $('#energy .bar').width((ps.energy / nMaxEnergy * 100) + '%');
  $('#damage .level').html(ps.damage);
  $('#damage .bar').width((ps.damage / nMaxDurability * 100) + '%');
}

function awardsUpdate() {
  for (let i = 0; i < awardinfo.awards.length; i++) {
    if (awards[awardinfo.awards[i].name] && $('#' + awardinfo.awards[i].name).hasClass('inactive')) {
      $('#' + awardinfo.awards[i].name).attr('title',awardinfo.awards[i].desc.long).removeClass('inactive');
    }
  }
}

function upgradeUpdate() {
  Object.keys(upgrade).forEach(function(factor) {
    if (upgrade[factor]) {
      $('#' + factor).removeClass('inactive').addClass('selected');
    }
  });
}

function talentUpdate() {
  $('#talent-list').empty();
  Object.keys(talent).forEach(function(role) {
    if (talent[role]) {
      let talentData = findTalent(role)[0];
      let elem = $('<li></li>').text(talentData.desc.short).attr('id',talentData.name).attr('title',talentData.desc.long).css({'color':talentData.color.text,'background-color':talentData.color.background});
      $('#talent-list').append(elem);
    }
  });
}
/*****  Frontend Game Data Update  *****/

/*****  Frontend Message Handling  *****/
function messageUpdate(msg, color = '#000', bgcolor = '#FFF') {
  $('.lastmsg').html("<span>" + msg + "</span>").css({'color':color,'background-color':bgcolor});
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
/*****  Card Draw Logic  *****/
function cardDraw(hash) {
  let drawrule = getJSONData(hash);
  if (typeof drawrule.pool == 'object') {
    card = rand_sum(drawrule.pool, drawrule.time);
    if (card.indexOf(',') != -1) {
      let cards = card.split(',');
      lifetime.draw += cards.length;
      messageUpdate('10 Draw! ' + card + ' Cards.');
    } else {
      lifetime.draw += 1;
      messageUpdate('Draw! ' + card + ' Card.');
    }
    energyUse(card);
    itemAdd(card);
    dataSave('mute');
    limitCheck();
    upgradeCheck();
    awardsCheck();
    itemUpdate();
    statusUpdate();
    cardLog(card);
  }
}

function rand_sum(pool, time = 1) {
  let result = [];
  let level = 0;
  if (upgrade.redrawn) level++;
  if (upgrade.redrawnr) level++;
  if (typeof pool != 'object') return result.join();
  if (Object.keys(pool).length == 0) return result.join();

  let box = [];
  Object.keys(pool).forEach(function(card) {
    for (let i = 0; i < pool[card]; i++) {
      box.push(card);
    }
  });
  shuffle(box);

  let j = 0;
  let k = 0;
  let l = 0;
  let rand = 0;
  for (let i = 0; i < box.length; i++) {
    if (j < time) {
      if ( (level >= 1) && (!k) && (box[i] == 'N') ) {
        rand = getRandom(1, 10);
        if (rand == 1) {
          console.log('trigger: redraw N');
          k = 1;
          continue;
        }
      }
      if ( (level >= 2) && (!l) && ( (box[i] == 'N') || (box[i] == 'R') ) ) {
        rand = getRandom(1, 10);
        if (rand == 1) {
          console.log('trigger: redraw R');
          k = 1;
          l = 1;
          continue;
        }
      }
      result.push(box[i]);
      k = 0;
      l = 0;
      j++;
    } else {
      break;
    }
  }
  return result.join();
}

function rand_percent(pool, time = 1) {
  let result = [];
  let level = 0;
  if (upgrade.redrawn) level++;
  if (upgrade.redrawnr) level++;
  if (typeof pool != 'object') return result.join();
  if (Object.keys(pool).length == 0) return result.join();

  let box = {};
  let min = 0;
  let max = 0;
  Object.keys(pool).forEach(function(card) {
    min = max + 1;
    max = min + (pool[card] * 1000) - 1;
    box[card] = [min,max];
  });
  let j = 0;
  for (let i = 0; i < time; i++) {
    rand = getRandom(1, max);
    j = 0;
    Object.keys(box).forEach(function(card) {
      if ( (box[card][0] <= rand) && (box[card][1] >= rand) && (!j) ) {
        result.push(card);
        j = 1;
      }
    });
  }
  return result.join();
}
/*****  Card Draw Logic  *****/

/*****  Core Game Functions  *****/
function getJSONData(hash) {
  let jsonobj = null;
  switch (hash) {
    case codeGen(1): jsonfile = 'sum'; break;
    case codeGen(10): jsonfile = 'sum10'; break;
    case codeGen('awards'): jsonfile = 'awards'; break;
    case codeGen('upgrades'): jsonfile = 'upgrades'; break;
    case codeGen('talents'): jsonfile = 'talents'; break;
  }
  if (jsonfile != '') {
    $.getJSON('json/' + jsonfile + '.json', function(data) {
      jsonobj = data;
    });
  }
  return jsonobj;
}

function worldReset() {
  $('#badge-list li').addClass('inactive');
  $('#upgrade-list .button').addClass('inactive');
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
  let drawEnergy = energyRevise();
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
    let nMaxEnergy = rules.maxenergy + rules_addon.maxenergy;
    if (ps.energy == nMaxEnergy) {
      counter.sleep += 1;
    } else {
      counter.sleep = 1;
    }
    awardsCheck();
  }
  let nSleepRecover = rules.sleeprecover + rules_addon.sleeprecover;
  ps.energy += nSleepRecover + getRandom(rules_random.sleeprecover_min,rules_random.sleeprecover_max);
  messageUpdate('Restored some energy.');
  limitCheck();
  statusUpdate();
  dataSave('mute');
}

function healRestore() {
  let nHealCard1 = healNCardRevise();
  if (items.n >= nHealCard1) {
    items.n -= nHealCard1;
    let nHealPoint1 = rules.heal1 + rules_addon.heal1 + getRandom(rules_random.heal1_min,rules_random.heal1_max);
    ps.damage -= nHealPoint1;
    limitCheck();
    itemUpdate();
    statusUpdate();
    dataSave('mute');
    messageUpdate('Reduced ' + nHealPoint1 + ' damages.','green');
  } else {
    messageUpdate('At least ' + nHealCard1 + ' N card for heal.');
  }
}

function recoverRestore() {
  let nHealCard2 = rules.healcard2 + rules_addon.healcard2;
  if (items.r >= nHealCard2) {
    items.r -= nHealCard2;
    let nHealPoint2 = rules.heal2 + rules_addon.heal2 + getRandom(rules_random.heal2_min,rules_random.heal2_max);
    ps.damage -= nHealPoint2;
    limitCheck();
    itemUpdate();
    statusUpdate();
    dataSave('mute');
    messageUpdate('Reduced ' + nHealPoint2 + ' damages.','purple');
  } else {
    messageUpdate('At least ' + nHealCard2 + ' R card for recover.');
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
    let requirements = findUpgrade(factor)[0];
    if (typeof requirements.require == 'object') {
      let enabled = requirements.require.enabled;
      if (enabled.indexOf(',') == -1) {
        if (!upgrade[enabled]) {
          messageUpdate('Need upgrade first: ' + requirements.desc.long);
          return false;
        }
      } else {
        let enabledlist = enabled.split(',');
        for (let i = 0; i < enabledlist.length; i++) {
          if (!upgrade[enabledlist[i]]) {
            messageUpdate('Need upgrade first: ' + findUpgrade(enabledlist[i])[0].desc.long);
            return false;
          }
        }
      }
    }
    let factorUpdated = 0;
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
      upgradeCheck();
      dataSave('mute');
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
      for (let i = 0; i < talentData.addons.length; i++) {
        if (talentData.addons[i].operator == '+') {
          if (talentData.addons[i].type == 'rules') {
            rules_addon[talentData.addons[i].field] = talentData.addons[i].target;
          } else {
            this[talentData.addons[i].type][talentData.addons[i].field] += talentData.addons[i].target;
          }
        } else if (talentData.addons[i].operator == '-') {
          if (talentData.addons[i].type == 'rules') {
            rules_addon[talentData.addons[i].field] = talentData.addons[i].target * -1;
          } else {
            this[talentData.addons[i].type][talentData.addons[i].field] -= talentData.addons[i].target;
          }
        }
      }
    }
  });
}
/*****  Talent Role Influence Logic  *****/

/*****  Upgrade Revise Logic  *****/
function damageRevise() {
  let nDamage = rules.damage + rules_addon.damage;
  if (upgrade.reducedamage1) nDamage -= DAMAGE_LV_UP1;
  if (upgrade.reducedamage2) nDamage -= DAMAGE_LV_UP2;
  if (upgrade.reducedamage3) nDamage -= DAMAGE_LV_UP3;
  return nDamage;
}

function energyRevise() {
  let nEnergy = rules.drawcard + rules_addon.drawcard;
  if (upgrade.reduceenergy1) nEnergy -= ENERGY_LV_UP1;
  if (upgrade.reduceenergy2) nEnergy -= ENERGY_LV_UP2;
  if (upgrade.reduceenergy3) nEnergy -= ENERGY_LV_UP3;
  return nEnergy;
}

function healNCardRevise() {
  let nHealCard1 = rules.healcard1 + rules_addon.healcard1;
  if (upgrade.reducehealncard1) nHealCard1 -= FIRST_AID_LV_UP1;
  if (upgrade.reducehealncard2) nHealCard1 -= FIRST_AID_LV_UP2;
  return nHealCard1;
}
/*****  Upgrade Revise Logic  *****/

/*****  Data Logic Checking  *****/
function limitCheck() {
  let nMaxEnergy = rules.maxenergy + rules_addon.maxenergy;
  let nMaxDurability = rules.maxdur + rules_addon.maxdur;
  let nMaxDay = rules.maxday + rules_addon.maxday;
  let nWinCardNeed = rules.wincardneed + rules_addon.wincardneed;

  if (ps.energy > nMaxEnergy) ps.energy = nMaxEnergy;
  if (ps.damage < 0) ps.damage = 0;

  if (ps.damage >= nMaxDurability) {
    ps.damage = nMaxDurability;
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
  if (ps.dayused >= nMaxDay) {
    player.alive = 0;
    lifetime.dead += 1;
    lifetime.timeup += 1;
    dataLifeTimeSave();
    messageUpdate('Die by time was up.','#9EF');
  }
  if (items.ur >= nWinCardNeed) {
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
  for (let i = 0; i < awardinfo.awards.length; i++) {
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

function upgradeCheck() {
  for (let i = 0; i < upgradeinfo.upgrades.length; i++) {
    if (!upgrade[upgradeinfo.upgrades[i].name]) {
      if (typeof upgradeinfo.upgrades[i].require != 'undefined') {
        let enabled = upgradeinfo.upgrades[i].require.enabled;
        if (enabled.indexOf(',') == -1) {
          if (!upgrade[enabled]) {
            continue;
          }
        } else {
          let enabledlist = enabled.split(',');
          let skip = 0;
          for (let i = 0; i < enabledlist.length; i++) {
            if (!upgrade[enabledlist[i]]) {
              skip = 1;
              continue;
            }
          }
          if (skip) {
            continue;
          }
        }
      }
      if (upgradeinfo.upgrades[i].condition.operator == '>=') {
        if (this[upgradeinfo.upgrades[i].condition.type][upgradeinfo.upgrades[i].condition.field] >= upgradeinfo.upgrades[i].condition.target) {
          $('#' + upgradeinfo.upgrades[i].name + ' .button.inactive').removeClass('inactive');
        } else {
          $('#' + upgradeinfo.upgrades[i].name + ' .button').addClass('inactive');
        }
      } else if (upgradeinfo.upgrades[i].condition.operator == '<=') {
        if (this[upgradeinfo.upgrades[i].condition.type][upgradeinfo.upgrades[i].condition.field] <= upgradeinfo.upgrades[i].condition.target) {
          $('#' + upgradeinfo.upgrades[i].name + ' .button.inactive').removeClass('inactive');
        } else {
          $('#' + upgradeinfo.upgrades[i].name + ' .button').addClass('inactive');
        }
      }
    }
  }
}
/*****  Data Logic Checking  *****/

/*****  Item Update  *****/
function itemAdd(card) {
  if (card.indexOf(',') != -1) {
    let cards = card.split(',');
    for (let i = 0; i < cards.length; i++) {
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
  let nDepressionLevel = rules.depression + rules_addon.depression + getRandom(rules_random.depression_min,rules_random.depression_max);
  if (counter.attack >= nDepressionLevel) {
    let attackDamage = damageRevise();
    counter.attack = 0;
    ps.damage += attackDamage;
    lifetime.damage += attackDamage;
  }
}
/*****  Item Update  *****/
/*****  Game Logic  *****/

/*****  Data Save/Load Handling  *****/
function dataSave(options) {
  let playdata = {
    player: player,
    items: items,
    ps: ps,
    talent: talent,
    rolelock: rolelock
  }
  let enc = btoa(JSON.stringify(playdata));
  createCookie("playerstatus",enc);
  dataLifeTimeSave();
  // if (options != 'mute') {
  //   messageUpdate('Data was saved.');
  // }
}

function dataLifeTimeSave() {
  let statisticdata = {
    lifetime: lifetime,
    upgrade: upgrade,
    awards: awards
  }
  let enc = btoa(JSON.stringify(statisticdata));
  createCookie("playerawards",enc);
}

function dataLoad() {
  let enc = readCookie("playerstatus");
  if (enc != null) {
    let dnc = $.parseJSON(atob(enc));
    rules = $.extend(true, {}, originaldata.rules);
    rules_addon = $.extend(true, {}, originaldata.rules_addon);
    player = dnc.player;
    items = dnc.items;
    ps = dnc.ps;
    talent = dnc.talent;
    rolelock = dnc.rolelock;
    counter = $.extend(true, {}, originaldata.counter);
    let enc2 = readCookie("playerawards");
    if (enc2 != null) {
      let dnc2 = $.parseJSON(atob(enc2));
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
      // messageUpdate('Data was loaded.');
    }
  }
}
/*****  Data Save/Load handling  *****/

/*****  Start Game Init  *****/
function initOriginal() {
  originaldata.rules = $.extend(true, {}, rules);
  originaldata.rules_addon = $.extend(true, {}, rules_addon);
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
  for (let label in items) {
    let elem = $('<li></li>').html('<label>' + label.toUpperCase() + '</label><br /><span></span>').attr('id','card' + label);
    $('#item-list').append(elem);
  }
}

function initAwards(hash) {
  awardinfo = getJSONData(hash);
  if (typeof awardinfo.awards != 'undefined') {
    for (let i = 0; i < awardinfo.awards.length; i++) {
      let elem = $('<li></li>').text(awardinfo.awards[i].desc.short).attr('id',awardinfo.awards[i].name).css({'color':awardinfo.awards[i].badge.textcolor,'background-color':awardinfo.awards[i].badge.bgcolor}).addClass('inactive');
      $('#badge-list').append(elem);
    }
  }
}

function initUpgrades(hash) {
  upgradeinfo = getJSONData(hash);
  if (typeof upgradeinfo.upgrades != 'undefined') {
    for (let i = 0; i < upgradeinfo.upgrades.length; i++) {
      let elem = $('<div></div>').attr('id',upgradeinfo.upgrades[i].name);
      $('#upgrade-list').append(elem);
      $('<div class="button">' + upgradeinfo.upgrades[i].desc.short + '</div>').css({'color':upgradeinfo.upgrades[i].color.text,'background-color':upgradeinfo.upgrades[i].color.background}).addClass('inactive').appendTo('#' + upgradeinfo.upgrades[i].name);
      $('<div class="desc">' + upgradeinfo.upgrades[i].desc.long + '</div>').appendTo('#' + upgradeinfo.upgrades[i].name);
      $('#' + upgradeinfo.upgrades[i].name).append('<div class="clear"></div>');
    }
  }
}

function initTalent(hash) {
  talentinfo = getJSONData(hash);
}

function roundReset() {
  rules_addon = $.extend(true, {}, originaldata.rules_addon);
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
  upgradeCheck();
  upgradeUpdate();
  logClear();
  dataSave('mute');
}

function runOnce() {
  $.ajaxSetup({async:false});
  initOriginal();
  initItems();
  initAwards('95e777b1daaacd8870c480bb35293b53754e5e832896260b863f41e52ac05edf');
  initUpgrades('ee943dc49fcbfff114b8e5772951cddb2f5204a5d5c6379d3f609261c6db34b9');
  initTalent('aa71c311a2c73de593a95fb2fed2d3e1289deac3bc3f73b56ef7c38e0642a4b0');
  roundReset();
  dataLoad();
  if (DEBUG_MODE) {
    $('.debug').attr('style', 'display: inline-block !important');
  }
}
/*****  Start Game Init  *****/
