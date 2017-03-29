#!/bin/bash

rm -rf ./test/java/output
mkdir ./test/java/output
rm -rf ./test/javascript/output
mkdir ./test/javascript/output
outputJava=`java -jar ./test/java/runner.jar -i ./test/cases -o ./test/java/output`
outputJs=`node ./test/javascript/src/main.js -i ./test/cases -o ./test/javascript/output`
sh ./diff_output.sh
echo 'Open test/diff/result.html for results.'
