var opts = {
    format: 'globals',
    exportVar: 'velocity',
    // optimize: 'size',
    output: 'source'
};

var fs = require('fs');

require('shelljs/global');

var peg = require('pegjs');

var pegjs_dev_file = './src/javascript/velocity.pegjs';
var js_file = './src/javascript/velocity.js';
var base_file = './src/javascript/base.js';
var randStr = 'func_' + Date.now();
var moduleStr = `
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ${randStr};
    }
} else {
    window.velocity = ${randStr};
}
`;

var build = function () {
    var pegStr = fs.readFileSync(pegjs_dev_file, 'utf-8');
    var parserStr = peg.generate(pegStr, opts);
    console.log('peg parser generation done');
    var baseStr = fs.readFileSync(base_file, 'utf-8');
    var funcStr = `var ${randStr} = (function () { ${parserStr} ${baseStr} })(); ${moduleStr}`;
    fs.writeFileSync(js_file, funcStr);
    console.log('writing js module file done');
};

fs.stat(js_file, function (err, stat) {
    if(stat && stat.isFile()) {
        fs.unlinkSync(js_file);
    } else {
        console.log(js_file + ' does not exist');
    }
    build();

    var uglifyOutput = exec('uglifyjs ./src/javascript/velocity.js -m -c conditionals,booleans,unused,join_vars,drop_console=true -o ./build/javascript/velocity.js --source-map ./build/javascript/velocity.js.map', {silent: true});

    rm('./test/javascript/src/velocity.js');
    cp('./build/javascript/velocity.js', './test/javascript/src/velocity.js');
});
