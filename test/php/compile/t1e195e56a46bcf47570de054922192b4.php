<?php
$root=array (
  's' => 
  array (
    0 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'b',
        ),
      ),
      '_' => '7',
      'text' => '$a.b',
    ),
    1 => '
',
    2 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'b',
        ),
      ),
      '_' => '7',
      'text' => '${a.b}',
    ),
    3 => '
',
    4 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'b',
        ),
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!{a.b}',
    ),
    5 => '
',
    6 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 2,
          'value' => 
          array (
            'parts' => 
            array (
              0 => 'b',
            ),
            '_' => '22',
          ),
        ),
      ),
      '_' => '7',
      'text' => '$a["b"]',
    ),
    7 => '
',
    8 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 2,
          'value' => 
          array (
            'parts' => 
            array (
              0 => 'b',
            ),
            '_' => '22',
          ),
        ),
      ),
      '_' => '7',
      'text' => '${a["b"]}',
    ),
    9 => '
',
    10 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 2,
          'value' => 
          array (
            'parts' => 
            array (
              0 => 'b',
            ),
            '_' => '22',
          ),
        ),
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!{a["b"]}',
    ),
    11 => '
',
    12 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'get',
        ),
        2 => 
        array (
          'type' => 3,
          'value' => 
          array (
            0 => 
            array (
              'parts' => 
              array (
                0 => 'b',
              ),
              '_' => '22',
            ),
          ),
        ),
      ),
      '_' => '7',
      'text' => '$a.get("b")',
    ),
    13 => '
',
    14 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'get',
        ),
        2 => 
        array (
          'type' => 3,
          'value' => 
          array (
            0 => 
            array (
              'parts' => 
              array (
                0 => 'b',
              ),
              '_' => '22',
            ),
          ),
        ),
      ),
      '_' => '7',
      'text' => '${a.get("b")}',
    ),
    15 => '
',
    16 => 
    array (
      'body' => 
      array (
        0 => 'a',
        1 => 
        array (
          'type' => 1,
          'value' => 'get',
        ),
        2 => 
        array (
          'type' => 3,
          'value' => 
          array (
            0 => 
            array (
              'parts' => 
              array (
                0 => 'b',
              ),
              '_' => '22',
            ),
          ),
        ),
      ),
      '_' => '7',
      'bang' => true,
      'text' => '$!{a.get("b")}',
    ),
    17 => '
',
  ),
  '_' => '0',
);
?>