<?php
function rand_sum($pool, $time = 1, $level = 0) {
  $result = '';
  if (!is_array($pool)) return $result;
  if (count($pool) == 0) return $result;
  $box = [];
  foreach ($pool as $label => $value) {
    for ($i = 0; $i < $value; $i++) {
      $box[] = $label;
    }
  }
  shuffle($box);
  $j = 0;
  $k = 0;
  $l = 0;
  for ($i = 0; $i < count($box); $i++) {
    if ($j < $time) {
      if ( ($level >= 1) && (!$k) && ($box[$i] == 'N') ) {
        $rand = rand(1, 10);
        if ($rand == 1) {
          $k = 1;
          continue;
        }
      }
      if ( ($level >= 2) && (!$l) && ( ($box[$i] == 'N') || ($box[$i] == 'R') ) ) {
        $rand = rand(1, 10);
        if ($rand == 1) {
          $k = 1;
          $l = 1;
          continue;
        }
      }
      $result .= $box[$i] . ',';
      $k = 0;
      $l = 0;
      $j++;
    } else {
      break;
    }
  }
  $result = substr($result, 0, -1);
  return $result;
}

function rand_percent($pool, $time = 1, $level = 0) {
  $result = '';
  if (!is_array($pool)) return $result;
  if (count($pool) == 0) return $result;
  $box = [];
  $min = 0;
  $max = 0;
  foreach ($pool as $label => $value) {
    $min = $max + 1;
    $max = $min + ($value * 1000) - 1;
    $box[$label] = array(
      'min' => $min,
      'max' => $max
    );
  }
  for ($i = 0; $i < $time; $i++) {
    $rand = rand(1, $max);
    foreach ($box as $label => $range) {
      if ( ($range['min'] <= $rand) && ($range['max'] >= $rand) ) {
        $result .= $label . ',';
        break;
      }
    }
  }
  $result = substr($result, 0, -1);
  return $result;
}
?>