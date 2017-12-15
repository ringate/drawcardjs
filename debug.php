<?php
include('validation.php');
include('random.php');
$jsonpath = 'json/';
$jsonfile = 'percent10.json';
$rawdata = file_get_contents($jsonpath . $jsonfile);
$json = json_decode($rawdata, true);

if ($json['status']) {
  $result = '';
  $time = (isset($json['time'])) ? $json['time'] : 1;
  $time = time_validate($time);
  switch ($json['type']) {
    case "percent": $result = rand_percent($json['pool'], $time); break;
    default: $result = '';
  }
}

echo $result;
?>