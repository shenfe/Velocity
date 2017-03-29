var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var fs = require('fs');

require('shelljs/global');

var testCasePath = './test/cases';
var testJavaOuputPath = './test/java/output';
var testPhpOuputPath = './test/php/output';

// app.use(bodyParser.json({limit: '1mb'})); // 指定参数使用 json 格式
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/src/debug'));
app.use(express.static(__dirname + '/src/javascript'));
app.use(express.static(__dirname + '/test'));

app.get('/', function (req, res) {
    res.redirect('index.html');
});

app.get('/run', function (req, res) {
    res.redirect('diff/result.html');
});

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (s) {
        if (typeof s !== 'string') return false;
        if (s.length > this.length) return false;
        return (this.substr(this.length - s.length) === s);
    };
}

var getCaseData = function (id) {
    var vmStr = fs.readFileSync(testCasePath + '/' + id + '.vm', 'utf-8');
    var jsonStr = fs.readFileSync(testCasePath + '/' + id + '.json', 'utf-8');
    return {
        vm: vmStr,
        json: JSON.parse(jsonStr)
    };
};

var getCaseList = function () {
    var re = [];
    var cases = fs.readdirSync(testCasePath);
    cases.forEach(function (fileName) {
        if (fileName.endsWith('.vm') && !fs.lstatSync(testCasePath + '/' + fileName).isDirectory()){
            var caseName = fileName.substr(0, fileName.length - 3);
            re.push(caseName);
        }
    });
    return re;
};

app.get('/case-list', function (req, res) {
    console.log('/case-list');
    res.json({
        code: 200,
        data: getCaseList()
    });
});

app.get('/case/:id', function (req, res) {
    console.log('/case/' + req.params.id);
    res.json({
        code: 200,
        data: getCaseData(req.params.id)
    });
});

app.get('/case/:id/java', function (req, res) {
    var id = req.params.id;
    var outputFile = testJavaOuputPath + '/' + id + '.html';
    console.log('/case/' + id + '/java');

    fs.stat(outputFile, function (err, stat) {
        if(stat && stat.isFile()) {
            fs.unlinkSync(outputFile);
        }
        var output = exec('java -jar ./test/java/runner.jar'
            + ' -i ' + testCasePath
            + ' -o ' + testJavaOuputPath
            + ' -n ' + id, {silent: true});
        fs.stat(outputFile, function (err1, stat1) {
            if(stat1 && stat1.isFile()) {
                res.json({
                    code: 200,
                    data: {
                        html: fs.readFileSync(outputFile, 'utf-8')
                    }
                });
            } else {
                res.json({
                    code: 500,
                    msg: output.stderr
                });
            }
        });
    });
});

app.get('/case/:id/php', function (req, res) {
    var id = req.params.id;
    var outputFile = testPhpOuputPath + '/' + id + '.html';
    console.log('/case/' + id + '/php');

    fs.stat(outputFile, function (err, stat) {
        if(stat && stat.isFile()) {
            fs.unlinkSync(outputFile);
        }
        var output = exec('cd ./test/php && sh ./run.sh ' + id, {silent: true});
        fs.stat(outputFile, function (err1, stat1) {
            if(stat1 && stat1.isFile()) {
                res.json({
                    code: 200,
                    data: {
                        html: fs.readFileSync(outputFile, 'utf-8')
                    }
                });
            } else {
                res.json({
                    code: 500,
                    msg: output.stderr
                });
            }
        });
    });
});

app.get('/case-runall', function (req, res) {
    console.log('/case-runall');
    exec('sh ./sync_dists.sh');
    var output = exec('sh ./run_tests.sh', {silent: true});
    res.json({
        code: 200,
        msg: output.stdout,
        data: {
            log: output.stdout,
            err: output.stderr
        }
    });
});

app.post('/case/post', multipartMiddleware, function (req, res) {
    var data = JSON.parse(req.body.json);
    console.log('/case/post', data);
    fs.writeFile(testCasePath + '/' + data.id + '.vm', data.vm, function (err) {
        if (err) {
            throw err;
        }
    });
    fs.writeFile(testCasePath + '/' + data.id + '.json', JSON.stringify(data.json), function (err) {
        if (err) {
            throw err;
        }
    });
    res.json({
        code: 200,
        msg: 'success'
    });
});

var server = app.listen(3223, function () {
    console.log('Listening on port %d', server.address().port);
});
