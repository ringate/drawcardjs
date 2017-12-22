let DEBUG_MODE = 0;
let ROBOT_MODE = 0;

let DAMAGE = 15;
let DRAWCARD = 6;
let SLEEP_RECOVER = 75;
let DEPRESSION = 5;
let MAX_ENDDAY = 100;
let MAX_ENERGY = 100;
let MAX_DURABILITY = 100;
let HEALCARD_LEVEL1 = 15;
let HEALCARD_LEVEL2 = 50;
let HEAL_LEVEL1 = 15;
let HEAL_LEVEL2 = 100;
let WIN_CARDNEED = 100;

let DAMAGE_LV_UP1 = 1;
let DAMAGE_LV_UP2 = 2;
let DAMAGE_LV_UP3 = 3;
let ENERGY_LV_UP1 = 1;
let ENERGY_LV_UP2 = 1;
let ENERGY_LV_UP3 = 1;
let FIRST_AID_LV_UP1 = 2;
let FIRST_AID_LV_UP2 = 2;

var c = 1;
var rules = {
  damage: DAMAGE,
  drawcard: DRAWCARD,
  sleeprecover: SLEEP_RECOVER,
  depression: DEPRESSION,
  maxday: MAX_ENDDAY,
  maxenergy: MAX_ENERGY,
  maxdur: MAX_DURABILITY,
  healcard1: HEALCARD_LEVEL1,
  healcard2: HEALCARD_LEVEL2,
  heal1: HEAL_LEVEL1,
  heal2: HEAL_LEVEL2,
  wincardneed: WIN_CARDNEED
};
var rules_addon = {
  damage: 0,
  drawcard: 0,
  sleeprecover: 0,
  depression: 0,
  maxday: 0,
  maxenergy: 0,
  maxdur: 0,
  healcard1: 0,
  healcard2: 0,
  heal1: 0,
  heal2: 0,
  wincardneed: 0
};
var player = {
  alive: 1
};
var items = {
  n: 0,
  r: 0,
  sr: 0,
  ur: 0
};
var ps = {
  dayused: 1,
  energy: rules.maxenergy,
  damage: 0
};
var counter = {
  sleep: 0,
  attack: 0,
  luck: 0
};
var lifetime = {
  draw: 0,
  outofenergy: 0,
  timeup: 0,
  damage: 0,
  dead: 0,
  won: 0,
  day: 0
};
var awards = {
  draw100: 0,
  draw500: 0,
  draw1000: 0,
  damage100: 0,
  damage500: 0,
  damage1000: 0,
  outofenergy1: 0,
  outofenergy10: 0,
  outofenergy50: 0,
  dead1: 0,
  dead10: 0,
  dead50: 0,
  dead100: 0,
  day10: 0,
  day50: 0,
  day100: 0,
  day200: 0,
  day365: 0,
  won1: 0,
  won3: 0,
  won10: 0,
  sleepaweek: 0,
  endofsleep: 0,
  doubleattacks: 0,
  tripleattacks: 0,
  quadattacks: 0,
  lucky: 0,
  superluck: 0,
  impossibleluck: 0
};
var upgrade = {
  reducehealncard1: 0,
  reducehealncard2: 0,
  reducedamage1: 0,
  reducedamage2: 0,
  reducedamage3: 0,
  reduceenergy1: 0,
  reduceenergy2: 0,
  reduceenergy3: 0,
  talentunlock1: 0,
  talentunlock2: 0,
  talentunlock3: 0,
  redrawn: 0,
  redrawnr: 0
};
var talent = {
  athlete: 0,
  gymgoer: 0,
  ambulanceman: 0,
  coach: 0,
  soldier: 0,
  landlord: 0,
  boss: 0,
  commander: 0,
  capitalist: 0
};
var rolelock = {
  unlock1: 0,
  unlock2: 0,
  unlock3: 0
};
var originaldata = {};
var awardinfo = {};
var upgradeinfo = {};
var talentinfo = {};
