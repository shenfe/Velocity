var executorFactory = function () {
    var boolOfValue = function (v) {
        return !!v || v === 0 || v === '';
    };
    var setValueByRef = function (scope, keys, v) {
        var isSet = arguments.length > 2;
        var main = keys[0];
        var len = keys.length;
        var error = false;
        var data = scope.$this, ref = main, val;

        if (!data.hasOwnProperty(ref)) {
            data = scope;
            ref = '$' + main;
        }
        val = data[ref];

        if (len > 1) {
            var key, valType;
            for (var i = 1; i < len; i++) {
                key = keys[i];
                valType = (val === undefined) ? '[object Undefined]' : Object.prototype.toString.call(val);
                if (key.type === 3
                    && (ref === 'get' || ref === 'keySet' || ref === 'substring' || ref === 'length' || ref === 'size')) {
                    var dataType = (data === undefined) ? '[object Undefined]' : Object.prototype.toString.call(data);
                    var exec = true;
                    var wrongType = false;
                    switch (ref) {
                        case 'get':
                            if (dataType !== '[object Object]' || 1 !== key.value.length) {
                                wrongType = true;
                            } else {
                                ref = key.value[0];
                                val = data[ref];
                                exec = false;
                            }
                            break;
                        case 'keySet':
                            if (dataType !== '[object Object]' || 0 !== key.value.length) {
                                wrongType = true;
                            } else {
                                var props = [];
                                for (var prop in data) {
                                    if (!data.hasOwnProperty(prop)) continue;
                                    props.push(prop);
                                }
                                return {
                                    code: 1,
                                    value: props
                                };
                            }
                            break;
                        case 'substring':
                            if (dataType !== '[object String]') {
                                wrongType = true;
                            }
                            break;
                        case 'length':
                            if (dataType !== '[object String]') {
                                wrongType = true;
                            } else {
                                ref = 'length';
                                val = data[ref];
                                exec = false;
                            }
                            break;
                        case 'size':
                            if (dataType !== '[object Array]') {
                                wrongType = true;
                            } else {
                                ref = 'length';
                                val = data[ref];
                                exec = false;
                            }
                            break;
                        default:
                            return {
                                code: 0,
                                msg: 'Undefined method \'' + ref + '\'.',
                                value: ''
                            };
                    }
                    if (wrongType) {
                        return {
                            code: 0,
                            msg: 'Something wrong with method \'' + ref + '\'.',
                            value: ''
                        };
                    }
                    if (exec) {
                        var _this = data;
                        data = val;
                        ref = null;
                        val = val.apply(_this, key.value);
                    }
                    continue;
                }
                if (key.type === 1 && valType === '[object String]') {
                    data = val;
                    ref = key.value;
                    val = data[ref];
                    continue;
                }
                if ((key.type === 1 || key.type === 2) && (valType === '[object Object]' || valType === '[object Array]')) {
                    data = val;
                    ref = key.value;
                    val = data[ref];
                    continue;
                }
                else {
                    error = true;
                    break;
                }
            }
            if (error) {
                return {
                    code: 0,
                    msg: 'error',
                    value: ''
                };
            }
        }
        if (isSet) {
            if (ref === null) {
                return {
                    code: 0,
                    msg: 'cannot set a result of a function!',
                    value: ''
                };
            }
            data[ref] = v;
            val = v;
        }
        return {
            code: 1,
            value: val
        };
    };
    var executor = {
        console: false,
        _nodeType: '_',
        scope: null,
        run: function (e) {
            if (typeof e[executor._nodeType] !== 'string') return e;
            if (typeof this[e[executor._nodeType]] !== 'function') return '';
            return this[e[executor._nodeType]].apply(e);
        },
        concat: function (s) {
            var re = '';
            for (var i = 0, len = s.length; i < len; i++) {
                re += executor.run(s[i]).toString();
            }
            return re;
        },
        '0': function () { // Statements
            return executor.concat(this.s);
        },
        '1': function () { // IfStatement
            if (boolOfValue(executor.run(this.e))) {
                return executor.concat(this.s);
            }
            if (this.elifs) {
                for (var i = 0, len = this.elifs.length; i < len; i++) {
                    if (boolOfValue(executor.run(this.elifs[i].e))) {
                        return executor.concat(this.elifs[i].s);
                    }
                }
            }
            return this.el ? executor.concat(this.el) : '';
        },
        '2': function () { // ItemInArray
            executor.scope['$foreach'] = {
                count: -1
            };
            executor.scope['$velocityCount'] = -1;
            var list = executor.run(this.data);

            if (Object.prototype.toString.call(list) === '[object Object]') {
                var keys = [];
                var toBreak = false;
                for (var k in list) {
                    if (!list.hasOwnProperty(k)) continue;
                    var i = parseInt(k);
                    if (isNaN(i) || String(i) !== k) {
                        toBreak = true;
                        break;
                    }
                    keys.push(i);
                }
                if (!toBreak) {
                    keys.sort(function (a, b) { return a - b; });
                    if (keys.length - 1 === keys[keys.length - 1]) {
                        var listData = [];
                        for (var i = 0, len = keys.length; i < len; i++) {
                            listData.push(list[i]);
                        }
                        list = listData;
                    }
                }
            }

            return {
                error: Object.prototype.toString.call(list) !== '[object Array]',
                key: this.id,
                dataset: list
            };
        },
        '3': function () { // ForeachStatement
            var iia = executor.run(this.it);
            if (iia.error) {
                if (executor.console) console.error('cannot iterate ', iia.dataset);
                return '';
            }

            var re = '', data = iia.dataset;
            for (var i = 0, len = data.length; i < len; i++) {
                executor.scope['$foreach'].count = i + 1;
                executor.scope['$velocityCount'] = i + 1;
                executor.scope['$' + iia.key] = data[i];
                re += executor.concat(this.s);
            }

            return re;
        },
        '4': function (keys) { // ReferenceInner
            var re = [keys[0]];
            if (keys.length) {
                var t, v;
                for (var i = 1, len = keys.length; i < len; i++) {
                    t = keys[i];
                    if (t.type === 2) {
                        v = executor.run(t.value);
                    } else if (t.type === 3) {
                        v = [];
                        for (var j = 0, llen = t.value.length; j < llen; j++) v.push(executor.run(t.value[j]));
                    } else {
                        v = t.value;
                    }
                    re.push({
                        type: t.type,
                        value: v
                    });
                }
            }
            return re;
        },
        '5': function () { // SetStatement
            setValueByRef(executor.scope, executor['4'](this.body), executor.run(this.v));
            return '';
        },
        '23': function () { // DefineStatement
            var s = this.s;
            setValueByRef(executor.scope, executor['4'](this.body), function () {
                return executor.concat(s);
            });
            return '';
        },
        '6': function () { // Reference
            var r = setValueByRef(executor.scope, executor['4'](this.body));
            r.bang = this.bang;
            return r;
        },
        '7': function () { // ReferenceRender
            var r = executor['6'].apply(this);

            if (r.code === 0) {
                if (executor.console) console.error(r.msg);
                return r.bang ? '' : this.text;
            }
            var stringify = function (v) {
                var vtype = (v === undefined) ? '[object Undefined]' : Object.prototype.toString.call(v);
                if (vtype === '[object Array]') {
                    var vs = [];
                    for (var i = 0, len = v.length; i < len; i++) {
                        vs.push(stringify(v[i]));
                    }
                    return '[' + vs.join(', ') + ']';
                } else if (vtype === '[object Object]') {
                    var vs = [];
                    for (var i in v) {
                        vs.push(i + '=' + stringify(v[i]));
                    }
                    return '{' + vs.join(', ') + '}';
                } else if (vtype === '[object Function]') {
                    return stringify(v());
                } else {
                    return v.toString();
                }
            };
            return (r.bang && r.value == null) ? '' : (r.value == null ? this.text : stringify(r.value));
        },
        '8': function () { // ReferenceValue
            var r = executor['6'].apply(this);

            if (r.code === 0) {
                if (executor.console) console.error(r.msg);
                return null;
            }
            return r.value;
        },
        '10': function () { // ObjLiteral
            var re = {};
            if (this.tail) {
                for (var i = 0, len = this.tail.length; i < len; i++) {
                    re[executor.run(this.tail[i].key)] = executor.run(this.tail[i].val);
                }
            }
            return re;
        },
        '11': function () { // ArrRange
            var start = executor.run(this.startExp),
                end = executor.run(this.endExp);
            if (typeof start !== 'number' || typeof end !== 'number') {
                if (executor.console) console.error('wrong start or end of the array index');
                return null;
            }
            var left = parseInt(start, 10);
            var right = parseInt(end, 10);
            if (isNaN(left) || isNaN(right) || left != start || right != end) {
                if (executor.console) console.error('wrong start or end of the array index');
                return null;
            }
            var re = [];
            if (left <= right) {
                for (var i = left; i <= right; i++) {
                    re.push(i);
                }
            } else {
                for (var i = left; i >= right; i--) {
                    re.push(i);
                }
            }
            return re;
        },
        '12': function () { // ArrLiteral
            var re = [];
            if (this.tail) {
                for (var i = 0, len = this.tail.length; i < len; i++) {
                    re.push(executor.run(this.tail[i]));
                }
            }
            return re;
        },
        '13': function () { // -ReferenceValue
            var r = executor['8'].apply(this);
            if (typeof r !== 'number') {
                if (executor.console) console.error('[velocity.js] type error: operator \'-\' is for Number.');
                return null;
            }
            return -r;
        },
        '14': function () { // !PrimaryExpression
            return !(boolOfValue(executor.run(this.p)));
        },
        '15': function () { // [!-]? (Expression)
            var e = executor.run(this.exp);
            if (this.s === '-' && typeof e !== 'number') {
                if (executor.console) console.error('[velocity.js] type error: -' + e);
            }
            return this.s ? (this.s === '!' ? !(boolOfValue(e)) : -e) : e;
        },
        '16': function () { // ConditionalOrExpression
            var re = executor.run(this.head);
            for (var i = 0, len = this.tail.length; i < len; i++) {
                if (boolOfValue(re)) return true;
                re = executor.run(this.tail[i][3]);
            }
            return this.tail.length ? boolOfValue(re) : re;
        },
        '17': function () { // ConditionalAndExpression
            var re = executor.run(this.head);
            for (var i = 0, len = this.tail.length; i < len; i++) {
                if (!boolOfValue(re)) return false;
                re = executor.run(this.tail[i][3]);
            }
            return this.tail.length ? boolOfValue(re) : re;
        },
        '18': function () { // EqualityExpression
            var re = executor.run(this.head);
            for (var i = 0, len = this.tail.length; i < len; i++) {
                var s = this.tail[i];
                if (s[1] === '==') re = (re == executor.run(s[3]));
                else if (s[1] === '!=') re = (re != executor.run(s[3]));
            }
            return re;
        },
        '19': function () { // RelationalExpression
            var v1 = executor.run(this.head);
            if (!this.tail) return v1;
            var op = this.tail[1],
                e = this.tail[3];
            var v2 = executor.run(e);
            if (op === '<') return v1 < v2;
            if (op === '>') return v1 > v2;
            if (op === '<=') return v1 <= v2;
            if (op === '>=') return v1 >= v2;
            return false;
        },
        '20': function () { // AdditiveExpression
            var re = executor.run(this.head);
            var t;
            for (var i = 0, len = this.tail.length; i < len; i++) {
                t = this.tail[i];
                if (t[1] === '+') re += executor.run(t[3]);
                else if(t[1] === '-') re -= executor.run(t[3]);
            }
            return re;
        },
        '21': function () { // MultiplicativeExpression
            var re = executor.run(this.head);
            var t;
            for (var i = 0, len = this.tail.length; i < len; i++) {
                t = this.tail[i];
                if (t[1] === '*') re *= executor.run(t[3]);
                else if(t[1] === '/') re /= executor.run(t[3]);
                else if(t[1] === '%') re %= executor.run(t[3]);
            }
            return re;
        },
        '22': function () { // StringLiteral
            return executor.concat(this.parts);
        }
    };
    return executor;
};

var _vlct = this['velocity'];

var expo = {
    context: function (data) {
        var context = executorFactory();
        var patch = function (s, data) {
            for (var i in data) {
                if (!data.hasOwnProperty(i)) continue;
                if (Object.prototype.toString.call(s[i]) !== '[object Object]'
                    || Object.prototype.toString.call(data[i]) !== '[object Object]') {
                    s[i] = data[i];
                    continue;
                }
                patch(s[i], data[i]);
            }
        };
        var history = '';
        this.execute = function (tmpl, data, dataLevel) {
            // dataLevel: 0: set and not patch; 1: set and patch; 2: reset
            if (!dataLevel) this.set(data);
            else if (dataLevel === 1) this.set(data, true);
            else this.reset(data);
            
            var output = context.run(_vlct.parse(tmpl));
            history += output;
            return {
                data: context.scope,
                output: output,
                history: history
            };
        };
        this.render = function (tmpl, data) {
            return this.execute(tmpl, data).output;
        };
        this.set = function (data, isPatching) {
            data = data || {};
            var s = context.scope.$this;
            for (var i in data) {
                if (!data.hasOwnProperty(i)) continue;
                if (!isPatching || (Object.prototype.toString.call(s[i]) !== '[object Object]'
                                    || Object.prototype.toString.call(data[i]) !== '[object Object]')) {
                    s[i] = data[i];
                    continue;
                }
                patch(s[i], data[i]);
            }
        };
        this.reset = function (data) {
            context.scope = { $this: data || {} };
        };
        this.empty = function () {
            history = '';
        };
        
        this.reset(data);
    },
    render: function (tmpl, data) {
        var root = _vlct.parse(tmpl);
        var render = executorFactory();
        render.scope = { $this: data || {} };
        return render.run(root);
    },
    compile: function (tmpl, opt) {
        var root = _vlct.parse(tmpl);
        if (opt && (opt === true || opt.raw)) {
            // var findNodeType = function (nodeStr, type) {
            //     return (nodeStr.indexOf('"$":"' + type + '"') > 0);
            // };
            return 'var root = ' + JSON.stringify(root) + '; '
                + 'var render = (' + executorFactory.toString() + ')(); '
                + 'render.scope = { $this: arguments[0] || {} }; '
                + 'return render.run(root);';
        } else {
            var render = executorFactory();
            return function (data) {
                render.scope = { $this: data || {} };
                return render.run(root);
            };
        }
    }
};

return expo;
