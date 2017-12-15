<?php
const APP_SECRET = 'applepen';
const MAX_TIME = 10;

function codegen($value) {
  return hash('sha256', APP_SECRET . $value . strrev(APP_SECRET));
}

function time_validate($time) {
  return ($time > MAX_TIME) ? MAX_TIME : $time;
}

function text_filter($text) {
   return preg_replace('/[^A-Za-z0-9\-]/', '', $text);
}

function int_filter($text) {
   return intval(preg_replace('/[^0-9]/', '', $text));
}
?>