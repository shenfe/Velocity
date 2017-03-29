(function() {
    var args = process.argv.splice(2);

    var inputPath, outputPath;

    for (var i = 0, argLen = args.length; i < argLen; i++) {
        if (i === argLen - 1) break;
        if (args[i] === '-i') inputPath = args[i + 1];
        else if (args[i] === '-o') outputPath = args[i + 1];
    }

    if (inputPath == null || outputPath == null) {
        console.log('Please specify an input path and an output path.');
        return;
    }

    var ve = require('./velocity');

    var runCase = function (caseName) {
        var curCase = caseName;
        fs.readFile(inputPath + '/' + curCase + '.vm', function (err, data) {
            if (err) {
                console.log('Case file of ' + curCase + '.vm cannot be found.');
                throw err;
            }
            var caseTpl = data.toString();
            fs.readFile(inputPath + '/' + curCase + '.json', function (err_, data_) {
                if (err_) {
                    console.log('Case file of ' + curCase + '.json cannot be found.');
                    throw err_;
                }
                fs.writeFile(outputPath + '/' + curCase + '.html',
                    ve.render(caseTpl, JSON.parse(data_.toString())), function (err__) {
                    if (err__) {
                        throw err_;
                    }
                });
            });
        });
    };

    var fs = require('fs'); // 引入fs模块

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (s) {
            if (typeof s !== 'string') return false;
            if (s.length > this.length) return false;
            return (this.substr(this.length - s.length) === s);
        };
    }

    var cases = fs.readdirSync(inputPath);
    cases.forEach(function(fileName){
        if (fileName.endsWith('.vm') && !fs.lstatSync(inputPath + '/' + fileName).isDirectory()){
            var caseName = fileName.substr(0, fileName.length - 3);
            runCase(caseName);
        }
    });
})();
