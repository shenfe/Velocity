var fs = require('fs');

require('shelljs/global');

var childProcess = require('child_process');

function runScript (scriptPath, callback) {
    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback && callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback && callback(err);
    });
}

process.chdir('./src/php');
runScript('./build.js', function (err) {
    if (err) throw err;
    console.log('finished');

    process.chdir('../../');
    cp('./src/php/velocity.php', './build/php/velocity.php');
    cp('./src/php/velocity.php', './test/php/src/velocity.php');
});
