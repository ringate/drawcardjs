<?php
if ( (isset($_GET['type'])) && (!empty($_GET['type'])) ) {
  include('includes.php');
  $poolname = '';
  $drawtype = text_filter($_GET['type']);
  switch ($drawtype) {
    case "normal": $poolname = 'sum'; break;
    case "custom": $poolname = ''; break;
    default: $poolname = 'sum';
  }
  if ( (isset($_GET['hash'])) && (!empty($_GET['hash'])) ) {
    $drawtime = text_filter($_GET['hash']);
    switch ($drawtime) {
      case codegen(1): $poolname .= ''; break;
      case codegen(10): $poolname .= '10'; break;
      case codegen('awards'): $poolname .= 'awards'; break;
    }
  }

  $jsonpath = 'json/';
  $jsonfile = $poolname . '.json';
  $rawdata = file_get_contents($jsonpath . $jsonfile);

  if ($drawtype == 'custom') {
    echo $rawdata;
    exit;
  }

  $json = json_decode($rawdata, true);
  if ($json['status']) {
    $result = '';
    $time = (isset($json['time'])) ? $json['time'] : 1;
    $time = time_validate($time);
    switch ($json['type']) {
      case "sum": $result = rand_sum($json['pool'], $time); break;
      case "percent": $result = rand_percent($json['pool'], $time); break;
      default: $result = '';
    }
  }

  echo $result;
}
?>