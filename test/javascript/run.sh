#!/bin/bash

rm -rf ./output
mkdir ./output
node ./src/main.js -i ../cases -o ./output
