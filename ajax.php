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
      case codegen('upgrades'): $poolname .= 'upgrades'; break;
      case codegen('talents'): $poolname .= 'talents'; break;
    }
  }
  if (empty($poolname)) {
    echo 'error';
    exit;
  }

  $jsonpath = 'json/';
  $jsonfile = $poolname . '.json';
  if (!file_exists($jsonpath . $jsonfile)) {
    echo 'error';
    exit;
  }
  $rawdata = file_get_contents($jsonpath . $jsonfile);

  if ($drawtype == 'custom') {
    echo $rawdata;
    exit;
  }

  $drawlevel = 0;
  if ( (isset($_GET['level'])) && (!empty($_GET['level'])) ) {
    $drawlevel = int_filter($_GET['level']);
  }

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
}
?>