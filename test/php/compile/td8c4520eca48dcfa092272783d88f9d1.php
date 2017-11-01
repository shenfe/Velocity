<?php
$root=array (
  's' => 
  array (
    0 => 
    array (
      'body' => 
      array (
        0 => 'foo',
      ),
      'v' => 
      array (
        'parts' => 
        array (
          0 => 'b',
          1 => 'a',
          2 => 'r',
        ),
        '_' => '22',
      ),
      '_' => '5',
    ),
    1 => '
<div>',
    2 => '$',
    3 => '\\!foo</div>
<div>',
    4 => '$',
    5 => '\\!{foo}</div>
<div>',
    6 => '$',
    7 => '\\\\foo</div>
<div>',
    8 => '$',
    9 => '\\\\\\!foo</div>
<div>\\',
    10 => 
    array (
      'body' => 
      array (
        0 => 'foo',
      ),
      '_' => '7',
      'text' => '$foo',
    ),
    11 => '</div>
<div>\\',
    12 => 
    array (
      'body' => 
      array (
        0 => 'foo',
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!foo',
    ),
    13 => '</div>
<div>\\',
    14 => 
    array (
      'body' => 
      array (
        0 => 'foo',
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!{foo}',
    ),
    15 => '</div>
<div>\\\\',
    16 => 
    array (
      'body' => 
      array (
        0 => 'foo',
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!{foo}',
    ),
    17 => '</div>
',
    18 => '$',
    19 => '
\\\\

\\',
    20 => 
    array (
      'body' => 
      array (
        0 => 'abc',
      ),
      '_' => '7',
      'text' => '$abc',
    ),
    21 => '

\\
\\',
    22 => '$',
    23 => '
<p>',
    24 => '$',
    25 => '</p>',
  ),
  '_' => '0',
);
?>