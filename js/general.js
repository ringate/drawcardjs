let APP_SECRET = 'applepen';
let MAX_TIME = 10;

function codeGen(val) {
  return sha256(APP_SECRET + val + reverse(APP_SECRET));
}

function timeValidate(time) {
  if (time > MAX_TIME) {
    return MAX_TIME;
  } else {
    return time;
  }
}

function codeFilter(text) {
   return text.replace(/[^a-z0-9]/gi,'');
}

function numberFilter(text) {
  return text.replace(/[^0-9]/gi,'');
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function reverse(s){
  return s.split("").reverse().join("");
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}
