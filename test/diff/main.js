(function() {
    var fs = require('fs');

    var inputPath1, inputPath2, outputFile;
    var args = process.argv.splice(2);
    for (var i = 0, argLen = args.length; i < argLen; i++) {
        if (i === argLen - 1) break;
        if (args[i] === '-1') inputPath1 = args[i + 1];
        else if (args[i] === '-2') inputPath2 = args[i + 1];
        else if (args[i] === '-3') outputFile = args[i + 1];
    }
    if (inputPath1 == null || inputPath2 == null) {
        console.log('Please specify input paths and an output file.');
        return;
    }

    var caseHtml = '';

    var head = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">\
        <title>[browser-diff](https://github.com/bgrins/browser-diff)</title>\
        <style>\
        html, body, textarea { font-family: Calibri, Candara, Segoe, "Segoe UI", Optima, sans-serif; line-height: 1.5; }\
        .result { border: 1px #ccc solid; padding: 10px; }\
        .case-diff { position: relative; max-width: 666px; margin: 0 auto; }\
        .case-diff textarea { box-sizing: border-box; width: 50% !important; min-height: 200px; }\
        .toggle { position: absolute; top: 0; right: 0; }\
        </style>\
        <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>\
        <script type="text/javascript" src="js/diff-match-patch.js"></script>\
        <script type="text/javascript" src="js/browser-diff.js"></script>\
        </head><body>';

    var tail = '</body></html>';

    var caseHtmlGenerate = function (name, s1, s2) {
        return '<div class="case-diff"><h3 class="title">' + name + '</h3>\
            <a class="toggle" href="javascript:void(0)">view outputs</a>\
            <textarea class="source1" style="display:none">' + s1 + '</textarea><textarea class="source2" style="display:none">' + s2 + '</textarea>\
            <div class="result"></div></div>';
    };

    var runCase = function (caseName) {
        caseHtml += caseHtmlGenerate(caseName,
            fs.readFileSync(inputPath1 + '/' + caseName + '.html'),
            fs.readFileSync(inputPath2 + '/' + caseName + '.html'));
        console.log(caseName);
    };

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (s) {
            if (typeof s !== 'string') return false;
            if (s.length > this.length) return false;
            return (this.substr(this.length - s.length) === s);
        };
    }

    var cases = fs.readdirSync(inputPath1);
    cases.forEach(function(fileName){
        if (fileName.endsWith('.html') && !fs.lstatSync(inputPath1 + '/' + fileName).isDirectory()){
            var caseName = fileName.substr(0, fileName.length - 5);
            runCase(caseName);
        }
    });

    fs.writeFileSync(outputFile, head + caseHtml + tail);
})();
