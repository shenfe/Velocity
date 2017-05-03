<?php

namespace PhpVelocity;

include "./velocity.php";

#[build-start]

class executor_factory {
    static private function bool_of_value ($v) {
        return is_array($v) || is_object($v) || !empty($v) || $v === 0 || $v === '';
    }
    static private function type_of_value ($v) {
        if (is_string($v)) return 1;
        if (is_array($v))  return 2;
        if (is_object($v)) return 3;
        return 0;
    }
    static private function is_assoc (array $arr) {
        if (array() === $arr) return false;
        return array_keys($arr) !== range(0, count($arr) - 1);
    }
    static private function key_or_property_exists ($v, $key) {
        if (is_numeric($key) && (string)((int)($key)) === (string)$key) $key = (int)$key;
        return is_array($v) ? array_key_exists($key, $v) : property_exists($v, $key);
    }
    static private function & ref_of_elem (&$v, $key) {
        if (is_numeric($key) && (string)((int)($key)) === (string)$key) $key = (int)$key;
        $re = is_array($v) ? $v[$key] : $v->{$key};
        return $re;
    }
    static private function stringify ($v) {
        $vtype = self::type_of_value($v);
        if ($vtype === 2 || $vtype === 3) {
            $vs = array();
            $numeric = ($vtype === 2 && !self::is_assoc($v));
            foreach ($v as $key => $item) {
                $vs[] = ($numeric ? '' : ($key . '=')) . self::stringify($item);
            }
            return $numeric ? ('[' . join(', ', $vs) . ']') : ('{' . join(', ', $vs) . '}');
        }
        if (is_bool($v)) return $v === true ? 'true' : 'false';
        if (is_null($v)) return 'null';
        return (string)$v;
    }
    static private function set_value_by_ref (&$scope, $keys, $v = null) {
        $is_set = func_num_args() > 2;
        $main = $keys[0];
        $len = count($keys);
        $error = false;
        $data = &$scope['$this'];
        $ref = $main;
        $val = null;

        $data_type = self::type_of_value($data);
        if (($data_type !== 2 && $data_type !== 3)
            || ($data_type === 2 && !isset($data[$ref]))
            || ($data_type === 3 && !isset($data->{$ref}))) {
            unset($data);
            $data = &$scope;
            $ref = '$'.$main;
            $data_type = self::type_of_value($data);
        }
        if ($data_type === 2) {
            $val = &$data[$ref];
        } elseif ($data_type === 3) {
            $val = &$data->{$ref};
        } else {
            return array(
                'code' => 0,
                'msg' => 'Scope data error.',
                'value' => ''
            );
        }

        if ($len > 1) {
            $key = null;
            $val_type = null;
            $first_key = true;
            foreach ($keys as $key) {
                if ($first_key) {
                    $first_key = false;
                    continue;
                }
                $val_type = self::type_of_value($val);
                $data_type = self::type_of_value($data);
                if ($key['type'] === 3
                    && ($ref === 'get' || $ref === 'keySet' || $ref === 'substring'
                    || $ref === 'length' || $ref === 'size')) {
                    $wrong_type = false;
                    switch ($ref) {
                        case 'get':
                            if (($data_type !== 2 && $data_type !== 3)
                                || 1 !== count($key['value'])) {
                                $wrong_type = true;
                            } else {
                                $ref = $key['value'][0];
                                unset($val);
                                if (self::key_or_property_exists($data, $ref)) {
                                    $val = & self::ref_of_elem($data, $ref);
                                } else {
                                    $val = null;
                                }
                            }
                            break;
                        case 'keySet':
                            if (($data_type !== 2 && $data_type !== 3)
                                || 0 !== count($key['value'])) {
                                $wrong_type = true;
                            } else {
                                $props = array();
                                foreach ($data as $pk => $pv) {
                                    $props[] = $pk;
                                }
                                return array(
                                    'code' => 1,
                                    'value' => $props
                                );
                            }
                            break;
                        case 'substring':
                            if ($data_type !== 1) {
                                $wrong_type = true;
                            } else {
                                $param_count = count($key['value']);
                                if ($param_count !== 1 && $param_count !== 2) {
                                    $wrong_type = true;
                                } else {
                                    $_this = $data;
                                    $ref = null;
                                    unset($val);
                                    if ($param_count === 1) {
                                        $val = mb_substr($_this, $key['value'][0]);
                                    } else {
                                        $val = mb_substr($_this, $key['value'][0], $key['value'][1] - $key['value'][0]);
                                    }
                                    unset($data);
                                    $data = $val;
                                }
                            }
                            break;
                        case 'length':
                            if ($data_type !== 1) {
                                $wrong_type = true;
                            } else {
                                $param_count = count($key['value']);
                                if ($param_count !== 0) {
                                    $wrong_type = true;
                                } else {
                                    $_this = $data;
                                    $ref = null;
                                    unset($val);
                                    $val = mb_strlen($_this);
                                    unset($data);
                                    $data = $val;
                                }
                            }
                            break;
                        case 'size':
                            if ($data_type !== 2) {
                                $wrong_type = true;
                            } else {
                                $param_count = count($key['value']);
                                if ($param_count !== 0) {
                                    $wrong_type = true;
                                } else {
                                    $_this = $data;
                                    $ref = null;
                                    unset($val);
                                    $val = count($_this);
                                    unset($data);
                                    $data = $val;
                                }
                            }
                            break;
                        default:
                            return array(
                                'code' => 0,
                                'msg' => "Undefined method '" . $ref . "'.",
                                'value' => ''
                            );
                    }
                    if ($wrong_type) {
                        return array(
                            'code' => 0,
                            'msg' => "Something wrong with method '" . $ref . "'.",
                            'value' => ''
                        );
                    }
                    continue;
                }
                if (($key['type'] === 1 || $key['type'] === 2) && ($val_type === 2 || $val_type === 3)) {
                    unset($data);
                    $data = &$val;
                    $ref = $key['value'];
                    unset($val);
                    if (self::key_or_property_exists($data, $ref)) {
                        $val = & self::ref_of_elem($data, $ref);
                    } else {
                        $val = null;
                    }
                    continue;
                } elseif ($val_type === 1 && $key['type'] === 1) { // string: substring, length
                    unset($data);
                    $data = $val;
                    $ref = $key['value'];
                    unset($val);
                    $val = null;
                    continue;
                } else {
                    $error = true;
                    break;
                }
            }
            if ($error) {
                return array(
                    'code' => 0,
                    'msg' => 'error',
                    'value' => ''
                );
            }
        }
        if ($is_set) {
            if ($ref === null) {
                return array(
                    'code' => 0,
                    'msg' => 'cannot set a result of a function!',
                    'value' => ''
                );
            }
            $data_type = self::type_of_value($data);
            if ($data_type === 2) {
                $data[$ref] = $v;
            } elseif ($data_type === 3) {
                $data->{$ref} = $v;
            } else {
                return array(
                    'code' => 0,
                    'msg' => "cannot set property $ref of non-array or non-object value" . var_dump($data),
                    'value' => ''
                );
            }
            unset($val);
            $val = $v;
        }

        return array(
            'code' => 1,
            'value' => $val
        );
    }

    static private $console = false;
    static private $node_type = '_';
    private $scope;

    function __construct () {
        $this->scope = array(
            '$this' => array()
        );
        if (method_exists($this, $f = '__construct' . func_num_args())) {
            call_user_func_array(array($this, $f), func_get_args());
        }
    }

    function __construct1 ($data) {
        $this->set_data($data, true);
    }

    public function get_data () {
        return $this->scope;
    }

    public function set_data ($data, $clear = false) {
        $data = array(
            '$this' => !empty($data) ? $data : array()
        );
        if ($clear === true) {
            $this->scope = $data;
        } else {
            $this->scope = array_merge($this->scope, $data);
        }
    }

    public function run ($e) {
        if (!is_array($e) && !is_object($e)) {
            return $e;
        }
        $v = $e[self::$node_type];
        if (!is_string($v)) return $e;
        $v = '_'.$v;
        if (!method_exists($this, $v)) return '';
        return $this->{$v}($e);
    }

    private function concat ($s) {
        $re = '';
        foreach ($s as $statement) {
            $re .= $this->run($statement);
        }
        return $re;
    }

    private function _0 ($e) {
        return $this->concat($e['s']);
    }
    private function _1 ($e) {
        if (self::bool_of_value($this->run($e['e']))) {
            return $this->concat($e['s']);
        }
        if (!empty($e['elifs'])) {
            foreach ($e['elifs'] as $elif) {
                if (self::bool_of_value($this->run($elif['e']))) {
                    return $this->concat($elif['s']);
                }
            }
        }
        return !empty($e['el']) ? $this->concat($e['el']) : '';
    }
    private function _2 ($e) {
        $this->scope['$foreach'] = array('count' => -1);
        $this->scope['$velocityCount'] = -1;
        $list = $this->run($e['data']);
        return array(
            'error' => !is_array($list),
            'key' => $e['id'],
            'dataset' => $list
        );
    }
    private function _3 ($e) {
        $iia = $this->run($e['it']);
        if ($iia['error']) {
            if (self::$console) echo "cannot iterate " . var_dump($iia['dataset']) . "\n";
            return '';
        }

        $re = '';
        $data = $iia['dataset'];
        foreach ($data as $key => $value) {
            $this->scope['$foreach']['count'] = 1 + $key;
            $this->scope['$velocityCount'] = 1 + $key;
            $this->scope['$' . $iia['key']] = $value;
            $re .= $this->concat($e['s']);
        }

        return $re;
    }
    private function _4 ($keys) {
        $re = array();
        $re[] = $keys[0];
        if (count($keys) > 0) {
            $first_key = true;
            foreach ($keys as $key => $t) {
                if ($first_key) {
                    $first_key = false;
                    continue;
                }
                $v = null;
                if ($t['type'] === 2) {
                    $v = $this->run($t['value']);
                } elseif ($t['type'] === 3) {
                    $v = array();
                    foreach ($t['value'] as $param) {
                        $v[] = $this->run($param);
                    }
                } else {
                    $v = $t['value'];
                }
                $re[] = array(
                    'type' => $t['type'],
                    'value' => $v
                );
            }
        }
        return $re;
    }
    private function _5 ($e) {
        self::set_value_by_ref($this->scope, $this->_4($e['body']), $this->run($e['v']));
        return '';
    }
    private function _6 ($e) {
        $re = self::set_value_by_ref($this->scope, $this->_4($e['body']));
        $re['bang'] = isset($e['bang']);
        return $re;
    }
    private function _7 ($e) {
        $r = $this->_6($e);
        if ($r['code'] === 0) {
            if (self::$console) echo $r['msg'] . "\n";
            return $r['bang'] ? '' : $e['text'];
        }

        $val_is_null = !array_key_exists('value', $r) || $r['value'] === null;
        return ($r['bang'] && $val_is_null)
            ? '' : ($val_is_null ? $e['text'] : self::stringify($r['value']));
    }
    private function _8 ($e) {
        $r = $this->_6($e);
        if ($r['code'] === 0) {
            if (self::$console) echo $r['msg'] . "\n";
            return null;
        }
        return $r['value'];
    }
    private function _10 ($e) {
        $re = array();
        if (isset($e['tail'])) {
            foreach ($e['tail'] as $t) {
                $re[$this->run($t['key'])] = $this->run($t['val']);
            }
        }
        return $re;
    }
    private function _11 ($e) {
        $start = $this->run($e['startExp']);
        $end = $this->run($e['endExp']);
        if (!is_numeric($start) || !is_numeric($end)) {
            if (self::$console) echo "wrong start or end of the array index\n";
            return null;
        }
        $start = (int)$start;
        $end = (int)$end;
        $re = array();
        if ($start <= $end) {
            for ($i = $start; $i <= $end; $i++) {
                $re[] = $i;
            }
        } else {
            for ($i = $start; $i >= $end; $i--) {
                $re[] = $i;
            }
        }
        return $re;
    }
    private function _12 ($e) {
        $re = array();
        if (isset($e['tail'])) {
            foreach ($e['tail'] as $t) {
                $re[] = $this->run($t);
            }
        }
        return $re;
    }
    private function _13 ($e) {
        $re = $this->_8($e);
        if (!(!is_string($re) && is_numeric($re))) {
            if (self::$console) echo "[velocity.js] type error: operator '-' is for Number.\n";
            return null;
        }
        return -$re;
    }
    private function _14 ($e) {
        return !(self::bool_of_value($this->run($e['p'])));
    }
    private function _15 ($e) {
        $exp = $this->run($e['exp']);
        if ($e['s'] === '-' && !(!is_string($exp) && is_numeric($exp))) {
            if (self::$console) echo "[velocity.js] type error: -" . var_dump($exp) . "\n";
        }
        return !empty($e['s']) ? ($e['s'] === '!' ? !(self::bool_of_value($exp)) : -$exp) : $exp;
    }
    private function _16 ($e) {
        $re = $this->run($e['head']);
        foreach ($e['tail'] as $t) {
            if (self::bool_of_value($re)) {
                return true;
            }
            $re = $this->run($t[3]);
        }
        return !empty($e['tail']) ? self::bool_of_value($re) : $re;
    }
    private function _17 ($e) {
        $re = $this->run($e['head']);
        foreach ($e['tail'] as $t) {
            if (!self::bool_of_value($re)) {
                return false;
            }
            $re = $this->run($t[3]);
        }
        return !empty($e['tail']) ? self::bool_of_value($re) : $re;
    }
    private function _18 ($e) {
        $re = $this->run($e['head']);
        foreach ($e['tail'] as $t) {
            if ($t[1] === '==') {
                $re = ($re == $this->run($t[3]));
            } elseif ($t[1] === '!=') {
                $re = ($re != $this->run($t[3]));
            }
        }
        return $re;
    }
    private function _19 ($e) {
        $v1 = $this->run($e['head']);
        if (empty($e['tail'])) {
            return $v1;
        }
        $op = $e['tail'][1];
        $exp = $e['tail'][3];
        $v2 = $this->run($exp);
        switch ($op) {
            case '<':
                return $v1 < $v2;
            case '>':
                return $v1 > $v2;
            case '<=':
                return $v1 <= $v2;
            case '>=':
                return $v1 >= $v2;
            default:
                return false;
        }
        return false;
    }
    private function _20 ($e) {
        $re = $this->run($e['head']);
        foreach ($e['tail'] as $t) {
            if ($t[1] === '+') {
                $re += $this->run($t[3]);
            } elseif ($t[1] === '-') {
                $re -= $this->run($t[3]);
            }
        }
        return $re;
    }
    private function _21 ($e) {
        $re = $this->run($e['head']);
        foreach ($e['tail'] as $t) {
            if ($t[1] === '*') {
                $re *= $this->run($t[3]);
            } elseif ($t[1] === '/') {
                $re /= $this->run($t[3]);
            } elseif ($t[1] === '%') {
                $re %= $this->run($t[3]);
            }
        }
        return $re;
    }
    private function _22 ($e) {
        return $this->concat($e['parts']);
    }
};

class Main {
    private $parser;
    private $executor;
    private $cache;
    private $compile_dir;
    private $compile_check;
    private $console = false;

    function __construct ($dir = null, $check = false) {
        $this->parser = new Parser;
        $this->executor = new executor_factory;
        $this->cache = array();

        if (isset($dir) && is_dir($dir)) {
            $this->compile_dir = $dir;
        } else {
            $this->compile_dir = '.';
        }

        $this->compile_check = !!$check;
    }

    private function hash ($path) {
        $h = 't' . hash('md4', $path);
        if ($this->compile_check) {
            $mtime = filemtime($path);
            if (!$mtime) {
                if ($this->console) echo "Fail to get filemtime: $path\n";
            } else {
                $h .= '_' . $mtime;
            }
        }
        return $h;
    }

    public function render ($tmplpath, $data = null, $clear = false) {
        $tid = $this->hash($tmplpath);
        $root = null;
        $compilepath = $this->compile_dir . '/' . $tid . '.php';
        if (is_file($compilepath)) {
            include $compilepath;
        } else {
            try {
                if (isset($this->cache[$tid])) {
                    $root = $this->cache[$tid];
                } else {
                    $tmpl = file_get_contents($tmplpath);
                    if ($tmpl === false) {
                        if ($this->console) echo 'File not found: ' . $tmplpath . "\n";
                        return '';
                    }
                    $root = $this->parser->parse($tmpl);
                    $this->cache[$tid] = &$root;
                }
                file_put_contents($compilepath, "<?php\n" . '$root=' . var_export($root, true) . ";\n?>");
            } catch (SyntaxError $ex) {
                $message = 'Syntax error: ' . $ex->getMessage()
                    . ' At line ' . $ex->grammarLine
                    . ' column ' . $ex->grammarColumn
                    . ' offset ' . $ex->grammarOffset;
                if ($this->console) echo $message . "\n";
            }
        }
        if (isset($data) || $clear) $this->executor->set_data($data, $clear);
        return $this->executor->run($root);
    }
};
