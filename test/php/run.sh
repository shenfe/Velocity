#!/bin/bash

rm -rf ./output
mkdir ./output
cd ./src

PHP_PATH="../../../src/php/interpreter/php/"

if [ ! -d "../../../src/php/interpreter/php" ]; then
    PHP_PATH=""
fi

echo "commond: $0"

if [ $# -lt 1 ]; then
    echo "(all)"
    ${PHP_PATH}php ./main.php
    exit 1
else
    for arg in "$@"
    do
        echo $arg
        ${PHP_PATH}php ./main.php $arg
    done
fi
