#!/bin/bash

outputDiff=`node ./test/diff/main.js -1 ./test/java/output -2 ./test/javascript/output -3 ./test/diff/result.html`
#open ./test/diff/result.html
