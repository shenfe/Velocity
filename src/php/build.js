var fs = require('fs');

var peg = require('./pegjs/peg-0.8.0.js');
var peg4php = require('./pegjs/phppegjs');

var output = peg.buildParser(fs.readFileSync('./velocity.pegjs', 'utf-8'), {
    plugins: [peg4php]
});

var baseStr = fs.readFileSync('./base.php', 'utf-8');
var buildStart = '#[build-start]';
baseStr = baseStr.substr(baseStr.indexOf(buildStart) + buildStart.length);
fs.writeFileSync('./velocity.php', output + baseStr + "\n?>");

/* for debug */
// output = peg.buildParser(fs.readFileSync('../javascript/velocity.pegjs', 'utf-8'));
// var root = output.parse(fs.readFileSync('./test.vm', 'utf-8'));
// console.log(JSON.stringify(root));
