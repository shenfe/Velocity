<?php
include './velocity.php';
use PhpVelocity\Main as Velocity;

$case_dir = '../../cases/';

if ($argc > 1) {
    runcase($argv[1]);
} else {
    if (is_dir($case_dir)) {
        if ($dh = opendir($case_dir)) {
            while (($file = readdir($dh)) !== false) {
                if ($file === "." || $file === ".." || $file === "") continue;

                $filename = substr($file, 0, strrpos($file, '.'));
                $subfix = substr($file, strlen($filename) + 1);
                if ($subfix !== 'vm') continue;

                runcase($filename);
            }
            closedir($dh);
        } else {
            echo "fail to open dir: $case_dir\n";
        }
    }
}

function runcase ($filename) {
    global $case_dir;
    $json_string = file_get_contents($case_dir . $filename . ".json");
    $data = json_decode($json_string, true);
    $tmpl = $case_dir . $filename . ".vm";

    echo "case: " . $filename . "\n";
    // echo "data: " . json_encode($data) . "\n";
    // echo "tmpl: " . $tmpl . "\n";

    $fp = fopen("../output/".$filename.".html", "w");
    if ($fp) {
        $ve = new Velocity('../compile');
        $case_output = fwrite($fp, $ve->render($tmpl, $data));
        if (!$case_output) {
            echo "fail to write file: $filename\n";
        }
    } else {
        echo "fail to write file: $filename\n";
    }
    fclose($fp);
}

function deldir ($dir) {
    $dh = opendir($dir);
    while ($file = readdir($dh)) {
        if ($file !== "." && $file !== "..") {
            $fullpath = $dir."/".$file;
            if(!is_dir($fullpath)) {
                unlink($fullpath);
            } else {
                deldir($fullpath);
            }
        }
    }

    closedir($dh);
    if (rmdir($dir)) {
        return true;
    } else {
        return false;
    }
}
?>
