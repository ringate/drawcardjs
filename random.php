<?php
function rand_sum($pool, $time = 1) {
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
  for ($i = 0; $i < $time; $i++) {
    $result .= $box[$i] . ',';
  }
  $result = substr($result, 0, -1);
  return $result;
}

function rand_percent($pool, $time = 1) {
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