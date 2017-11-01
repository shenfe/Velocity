<?php
$root=array (
  's' => 
  array (
    0 => '<div>循环计数
',
    1 => 
    array (
      'it' => 
      array (
        'id' => 'customer',
        'data' => 
        array (
          'body' => 
          array (
            0 => 'customerList',
          ),
          '_' => '8',
        ),
        '_' => '2',
      ),
      's' => 
      array (
        0 => 
        array (
          'body' => 
          array (
            0 => 'foreach',
            1 => 
            array (
              'type' => 1,
              'value' => 'count',
            ),
          ),
          '_' => '7',
          'text' => '$foreach.count',
        ),
        1 => '
',
      ),
      '_' => '3',
    ),
    2 => '
</div>
<div>
keySet
',
    3 => 
    array (
      'it' => 
      array (
        'id' => 'key',
        'data' => 
        array (
          'body' => 
          array (
            0 => 'allProducts',
            1 => 
            array (
              'type' => 1,
              'value' => 'keySet',
            ),
            2 => 
            array (
              'type' => 3,
              'value' => 
              array (
              ),
            ),
          ),
          '_' => '8',
        ),
        '_' => '2',
      ),
      's' => 
      array (
        0 => '<li>',
        1 => 
        array (
          'body' => 
          array (
            0 => 'foreach',
            1 => 
            array (
              'type' => 1,
              'value' => 'count',
            ),
          ),
          '_' => '7',
          'text' => '$foreach.count',
        ),
        2 => ': ',
        3 => 
        array (
          'body' => 
          array (
            0 => 'key',
          ),
          '_' => '7',
          'text' => '$key',
        ),
        4 => ' -> Value: ',
        5 => 
        array (
          'body' => 
          array (
            0 => 'allProducts',
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
                  'body' => 
                  array (
                    0 => 'key',
                  ),
                  '_' => '8',
                ),
              ),
            ),
          ),
          '_' => '7',
          'text' => '$allProducts.get($key)',
        ),
        6 => '</li>
',
      ),
      '_' => '3',
    ),
    4 => '
</div>
<div>
范围操作符 m > n
',
    5 => 
    array (
      'it' => 
      array (
        'id' => 'a',
        'data' => 
        array (
          'startExp' => 1,
          'endExp' => 5,
          '_' => '11',
        ),
        '_' => '2',
      ),
      's' => 
      array (
        0 => 
        array (
          'body' => 
          array (
            0 => 'a',
          ),
          '_' => '7',
          'text' => '$a',
        ),
        1 => '
',
      ),
      '_' => '3',
    ),
    6 => '
</div>
<div>
范围操作符 m < n
',
    7 => 
    array (
      'it' => 
      array (
        'id' => 'a',
        'data' => 
        array (
          'startExp' => 5,
          'endExp' => -1,
          '_' => '11',
        ),
        '_' => '2',
      ),
      's' => 
      array (
        0 => 
        array (
          'body' => 
          array (
            0 => 'a',
          ),
          '_' => '7',
          'text' => '$a',
        ),
        1 => '
',
      ),
      '_' => '3',
    ),
    8 => '
</div>',
  ),
  '_' => '0',
);
?>