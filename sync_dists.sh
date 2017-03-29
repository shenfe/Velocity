#!/bin/bash

#rm ./test/java/src/velocity-1.7-dep.jar
#cp ./src/java/velocity.jar ./build/java/velocity.jar
#cp ./build/java/velocity.jar ./test/java/src/velocity-1.7-dep.jar

rm ./test/javascript/src/velocity.js

#java -jar ./tool/yuicompressor-2.4.8.jar --type js --charset UTF-8 ./src/javascript/velocity.js -o ./build/javascript/velocity.js
uglifyjs ./src/javascript/velocity.js -m -c conditionals,booleans,unused,join_vars,drop_console=true -o ./build/javascript/velocity.js --source-map ./build/javascript/velocity.js.map

cp ./build/javascript/velocity.js ./test/javascript/src/velocity.js
cp ./build/javascript/velocity.js ./src/javascript/velocity.js
#cp ./src/javascript/velocity.js ./test/javascript/src/velocity.js

cp ./src/php/velocity.php ./build/php/velocity.php
cp ./src/php/velocity.php ./test/php/src/velocity.php
