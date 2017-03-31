window.vmEditor = null;
window.jsonEditor = null;

var session = {
    case: '' // 当且仅当空字符串代表没有
};

var getCaseList = function (callback) {
    document.getElementById('caseList').innerHTML = '';
    fetch('/case-list', {
        method: 'get'
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log('test cases: ', data.data);
                var caseListDom = document.getElementById('caseList');
                for (let cs of data.data) {
                    if (session.case === cs) {
                        caseListDom.innerHTML += `<div class="case-item active">${cs}</div>`;
                    } else {
                        caseListDom.innerHTML += `<div class="case-item">${cs}</div>`;
                    }
                }
                callback && callback();
            });
        } else {
            // error
        }
    }).catch(function (err) {
        // error
    });
};

var _process = function (vm, json) {
    /** 直接render **/
    $('#output1').html(window.velocity.render(vm, json));

    /** 先编译成function，再对数据执行 **/
    // var p = window.velocity.compile(vm, { raw: true });
    // console.log('parser: ', p);
    // $('#output1').html((new Function('data', p))(json));
};

var getJavaResultOfCase = function (id) {
    fetch(`/case/${id}/java`, {
        method: 'get'
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                if (data.code !== 200) {
                    console.error(data.msg);
                    alert(data.msg);
                    $('#output2').html('');
                } else {
                    console.log(`test case ${id}'s java result:`, data.data);
                    $('#output2').html(data.data.html);
                }
            });
        } else {
            //
        }
    }).catch(function (err) {
        console.log(err);
    });
};

var getPhpResultOfCase = function (id) {
    fetch(`/case/${id}/php`, {
        method: 'get'
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                if (data.code !== 200) {
                    console.error(data.msg);
                    alert(data.msg);
                    $('#output3').html('');
                } else {
                    console.log(`test case ${id}'s php result:`, data.data);
                    $('#output3').html(data.data.html);
                }
            });
        } else {
            //
        }
    }).catch(function (err) {
        console.log(err);
    });
};

var runCase = function () {
    $('#htmlOutput .outputBox').html('');
    if (!session.case) {
        return false;
    }
    _process(window.vmEditor.getValue(), window.jsonEditor.get());
    saveCase(function () {
        // fetch the output of other-lang vlc upon this case, and display
        getJavaResultOfCase(session.case);
        getPhpResultOfCase(session.case);
    });
};

var _loadCaseData = function (id, vm, json) {
    if (id || id === '') {
        session.case = id;
    }
    window.vmEditor.setValue(vm);
    window.jsonEditor.set(json);
    // runCase();
};

var loadCase = function (id) {
    fetch(`/case/${id}`, {
        method: 'get'
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log('test case: ', data.data);
                _loadCaseData(id, data.data.vm, data.data.json);
            });
        } else {
            // error
        }
    }).catch(function (err) {
        // error
    });
};

var runAllCases = function () {
    console.log('run all test cases: begin');
    fetch('/case-runall', {
        method: 'get'
    }).then(function (res) {
        if (res.ok) {
            res.json().then(function (data) {
                console.log('run all test cases: ', data.msg);
                var error = data.data.log + '\n' + data.data.err;
                alert(error);
                console.error(error);
                // if (!data.data.err) {
                    window.open('/run');
                // }
            });
        } else {
            console.log('run all test cases: error');
        }
    }).catch(function (err) {
        console.log('run all test cases: error');
    });
};

var saveCase = function (callback) {
    if (!session.case) {
        return false;
    }
    var data = new FormData();
    data.append('json', JSON.stringify({
        id: session.case,
        vm: window.vmEditor.getValue(),
        json: window.jsonEditor.get()
    }));
    fetch('/case/post', {
        method: 'post',
        body: data
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        callback && callback(data);
    })
};

var clearEditor = function () {
    window.vmEditor.setValue('');
    window.jsonEditor.set({});
    $('.outputBox').empty();
};

$(document).ready(function () {
    getCaseList(function () {
        var storedCase = localStorage.getItem('velocity-test-case') || $('#caseList .case-item:first-child').text();
        $('#caseList .case-item').each(function (i, el) {
            if ($(el).text() === storedCase) {
                $(el).trigger('click');
                return false;
            }
        });
    });

    /* json editor */
    window.jsonEditor = new JSONEditor(document.getElementById('dataInput'), {
        modes: ['text', 'code', 'tree', 'form', 'view'],
        mode: 'code',
        ace: ace,
        onChange: function () {
            // nothing
        }
    });

    /* vm editor */
    window.vmEditor = ace.edit('templateInput');
    window.vmEditor.setTheme('ace/theme/github');
    window.vmEditor.getSession().setMode('ace/mode/velocity');
    window.vmEditor.commands.addCommand({
        name: 'process',
        bindKey: {
            win: 'Ctrl-M',
            mac: 'Command-M'
        },
        exec: function (editor) {
            runCase();
        },
        readOnly: true
    });

    /* bind events */
    $('#btn-new').click(function () {
        var name = prompt('enter the case name', '');
        if (name) {
            session.case = name;
            clearEditor();
            saveCase(function (res) {
                if (res.code === 200) {
                    getCaseList();
                }
            });
        }
    });
    $('#btn-save').click(function () {
        saveCase();
    });
    $('#btn-run').click(function () {
        runCase();
    });
    $('#btn-sync').click(function () {
        getCaseList();
    });
    $('#btn-all').click(function () {
        runAllCases();
    });
    $('#caseList').delegate('.case-item', 'click', function (e) {
        var targetCase = e.target.innerText;
        localStorage.setItem('velocity-test-case', targetCase);
        if (targetCase === session.case) {
            return;
        }
        $('.outputBox').empty();
        $(e.target).siblings().removeClass('active').end().addClass('active');
        loadCase(targetCase);
    });

});
