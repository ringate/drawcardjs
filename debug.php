<?php
include('validation.php');
include('random.php');
$jsonpath = 'json/';
//$jsonfile = 'percent10.json';
$jsonfile = 'sum.json';
// if (file_exists($jsonpath . $jsonfile)) {
//   echo 'yes';
// } else {
//   echo 'no';
// }
// exit;

// $drawlevel = 'xyz';
// $output = int_filter($drawlevel);
// echo var_dump($output);
// exit;
$drawlevel = 1;

$rawdata = file_get_contents($jsonpath . $jsonfile);
$json = json_decode($rawdata, true);

if ($json['status']) {
  $result = '';
  $time = (isset($json['time'])) ? $json['time'] : 1;
  $time = time_validate($time);
  switch ($json['type']) {
    case "sum": $result = rand_sum($json['pool'], $time, $drawlevel); break;
    case "percent": $result = rand_percent($json['pool'], $time, $drawlevel); break;
    default: $result = '';
  }
}

echo $result;
?>