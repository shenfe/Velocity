#!/bin/bash

rm -rf ./output
mkdir ./output
java -jar runner.jar -i ../cases -o output
