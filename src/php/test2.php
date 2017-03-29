<?php

$a = array('A'=>1);
echo var_dump($a)."\n";
$b = &$a['A'];
$b = 2;
echo var_dump($a)."\n";
