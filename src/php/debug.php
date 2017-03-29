<?php
include './velocity.php';
use PhpVelocity\Main as Velocity;

$ve = new Velocity('./compile', false);

$data = json_decode(file_get_contents("./test.json"), true);
//echo var_dump($data)."\n";

function getmicrotime () {
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}
$time_start = getmicrotime();
$times = 1000;
for ($i = 0; $i < $times; $i++) {
    $re = $ve->render("./test.vm", $data);
//    echo $i."\n";
//    echo $re."\n";
}
$time_end = getmicrotime();
printf ("render time: %.2fms\n\n", ($time_end - $time_start) * 1000);


$data = array("name" => "June", "gender" => "female");
echo $ve->render('test2.vm', $data);
