var fs = require('fs');

var tmpl = fs.readFileSync('../../example/input/city-index.vm', 'utf-8');
var data = JSON.parse(fs.readFileSync('../../example/input/city-index.json', 'utf-8'));

var velocity = require('../../src/javascript/velocity.js');
var foobar = require('velocityjs');

var calMem = function (lib, tmpl, data) {
    var mem0 = null, mem1 = null;
    mem0 = process.memoryUsage();
    lib.render(tmpl, data);
    mem1 = process.memoryUsage();
    console.log(JSON.stringify(mem0));
    console.log(JSON.stringify(mem1));
};

var calTime = function (lib, tmpl, data) {
    var time = process.hrtime();
    lib.render(tmpl, data);
    var diff = process.hrtime(time);
    // console.log('took %d nanoseconds', diff[0] * 1e9 + diff[1]);
    console.log('took %d ms', Math.ceil((diff[0] * 1e9 + diff[1]) / 1000000));
};

// calMem(velocity, tmpl, data);
// calMem(foobar, tmpl, data);

calTime(velocity, tmpl, data);
calTime(foobar, tmpl, data);

var moreTmpl = (new Array(20)).fill(tmpl).join('');

calTime(velocity, moreTmpl, data);
calTime(foobar, moreTmpl, data);
