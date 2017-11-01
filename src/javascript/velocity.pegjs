start
= s:Statements {
    return s;
}

Statements "0"
= s:(Statement)* {
    return {
        s: s,
        _: '0'
    };
}

Statement
= SpecStatement
/ S_ELSEIF { return text() } / S_ELSE { return text() } / S_END { return text() }
/ [$#]
/ $([^$#]+)

SpecStatement
= UnparsedText
/ Comments
/ SetStatement
/ ForeachStatement
/ IfStatement
/ DefineStatement
/ MacroStatement
/ Comment { return ''; }
/ MacroExecStatement
/ ReferenceRender

S_UNPARSED_BEGIN    = "#[["
S_UNPARSED_END      = "]]#"
S_COMMENT           = "##"
S_COMMENTS_BEGIN    = "#*"
S_COMMENTS_END      = "*#"
S_SET               = "#set"
S_FOREACH           = "#foreach"
S_IF                = "#if"
S_ELSEIF            = "#elseif"
S_ELSE              = "#{else}" / ("#else" ![0-9a-zA-Z_-])
S_DEFINE            = "#define"
S_MACRO             = "#macro"
S_END               = "#end" / "#{end}"

UnparsedText
= S_UNPARSED_BEGIN t:$(UnparsedTextInner*) S_UNPARSED_END {
    return t;
}

UnparsedTextInner
= !S_UNPARSED_END .

Comment
= S_COMMENT (!EOL .)* EOL

Comments
= S_COMMENTS_BEGIN CommentsInner* S_COMMENTS_END {
    return '';
}

CommentsInner
= !S_COMMENTS_END .

NonIfEndStatement
= !(S_ELSEIF / S_ELSE / S_END) s:Statement { return s; }

NonEndStatement
= !S_END s:Statement { return s; }

IfStatement "1"
= S_IF L_R_BRAC e:Expression R_R_BRAC _ s:(NonIfEndStatement)* _ elifs:(ElseIfStatement)* _ el:ElseStatement? _ S_END {
    return {
        e: e,
        s: s,
        elifs: (elifs && elifs.length) ? elifs : undefined,
        el: el || undefined,
        _: '1'
    };
}

ElseIfStatement
= S_ELSEIF L_R_BRAC e:Expression R_R_BRAC _ s:(NonIfEndStatement)* {
    return {
        e: e,
        s: s
    };
}

ElseStatement
= S_ELSE s:(NonIfEndStatement)* { return s; }

DefineStatement "23"
= S_DEFINE L_R_BRAC _ "$" body:ReferenceBody R_R_BRAC _ s:(NonEndStatement)* _ S_END {
    return {
        body: body,
        s: s,
        _: '23'
    };
}

MacroStatement "24"
= S_MACRO L_R_BRAC _ name:Identifier param:(__ SingleRefernce)* R_R_BRAC _ s:(NonEndStatement)* _ S_END {
    var params = [];
    if (param && param.length) {
        for (var i = 0, len = param.length; i < len; i++) {
            params.push(param[i][1]);
        }
    }
    return {
        name: name,
        params: params,
        s: s,
        _: '24'
    };
}

MacroExecStatement "25"
= "#" name:Identifier L_R_BRAC args:(Expression)* R_R_BRAC {
    return {
        text: text(),
        name: name,
        args: args,
        _: '25'
    };
}

ItemInArray "2"
= "$" id:Identifier __ "in" __ list:(ReferenceValue / ArrLiteral) {
    return {
        id: id,
        data: list,
        _: '2'
    };
}

ForeachStatement "3"
= S_FOREACH L_R_BRAC _ it:ItemInArray R_R_BRAC _ s:(NonEndStatement)* _ S_END {
    return {
        it: it,
        s: s,
        _: '3'
    };
}

ReferenceInner "4"
= main:Identifier tail:(
    ("." Identifier)
    / ("[" Expression R_S_BRAC)
    / ("(" (Expression (_ "," Expression)*)? R_R_BRAC)
)* {
    var tails = [main];
    for (var i = 0, len = tail.length; i < len; i++) {
        if (tail[i][0] === '.') {
            tails.push({
                type: 1,
                value: tail[i][1]
            });
        } else if (tail[i][0] === '[') {
            tails.push({
                type: 2,
                value: tail[i][1]
            });
        } else if (tail[i][0] === '(') {
            var params = [];
            if (tail[i][1]) {
                var ps = tail[i][1];
                params.push(ps[0]);
                if (ps[1]) {
                    for (var j = 0, llen = ps[1].length; j < llen; j++) {
                        params.push(ps[1][j][2]);
                    }
                }
            }
            tails.push({
                type: 3,
                value: params
            });
        }
    }
    return tails;
}

ReferenceBody
= "{" _ ref:ReferenceInner R_BRACE { return ref; }
/ ReferenceInner

SetStatement "5"
= S_SET L_R_BRAC _ "$" body:ReferenceBody _ "=" v:Expression R_R_BRAC {
    return {
        body: body,
        v: v,
        _: '5'
    };
}

SingleRefernce
= "${" _ r1:Identifier R_BRACE { return r1; }
/ "$" r2:Identifier { return r2; }

Reference "6"
= "$" bang:("!")? body:ReferenceBody {
    return {
        bang: !!bang || undefined,
        body: body,
        _: '6'
    };
}

ReferenceRender "7"
= ref:Reference {
    ref.text = text();
    ref._ = '7';
    return ref;
}

ReferenceValue "8"
= ref:Reference {
    ref._ = '8';
    return ref;
}

Identifier
= [a-zA-Z] [0-9a-zA-Z_-]* { return text(); }

Expression
= _ e:ConditionalOrExpression { return e; }

ValLiteral
= BoolLiteral / StringLiteral / NumberLiteral / ArrLiteral / ObjLiteral

Kv "9"
= _ k:StringLiteral _ ":" _ v:(ValLiteral / ReferenceValue) {
    return {
        key: k,
        val: v
    };
}

ObjLiteral "10"
= "{" head:Kv? tail:(_ "," Kv)* R_BRACE {
    var tails = head ? [head] : [];
    if (tail.length) {
        for (var i = 0, len = tail.length; i < len; i++) {
            tails.push(tail[i][2]);
        }
    }
    return {
        tail: tails.length ? tails : undefined,
        _: '10'
    };
}

ArrRange "11"
= "[" start:Expression _ ".." end:Expression R_S_BRAC {
    return {
        startExp: start,
        endExp: end,
        _: '11'
    };
}

ArrLiteral "12"
= "[" head:Expression? tail:(_ "," Expression)* R_S_BRAC {
    var tails = head ? [head] : [];
    if (tail.length) {
        for (var i = 0, len = tail.length; i < len; i++) {
            tails.push(tail[i][2]);
        }
    }
    return {
        tail: tails.length ? tails : undefined,
        _: '12'
    };
}
/ ArrRange

PrimaryExpression
= ValLiteral
/ s1:("-")? r:ReferenceValue {
    if (s1) r._ = '13';
    return r;
}
/ "!" p:PrimaryExpression {
    return {
        p: p,
        _: '14'
    };
}
/ s2:[!-]? "(" e:Expression R_R_BRAC {
    return !s2 ? e : {
        s: s2,
        exp: e,
        _: '15'
    };
}

ConditionalOrExpression "16"
= head:ConditionalAndExpression tail:(_ "||" _ ConditionalAndExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        _: '16'
    };
}

ConditionalAndExpression "17"
= head:EqualityExpression tail:(_ "&&" _ EqualityExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        _: '17'
    };
}

EqualityExpression "18"
= head:RelationalExpression tail:(_ ("==" / "!=") _ RelationalExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        _: '18'
    };
}

RelationalExpression "19"
= head:AdditiveExpression tail:(_ ("<=" / ">=" / "<" / ">") _ AdditiveExpression)? {
    if (!tail) return head;
    return {
        head: head,
        tail: tail,
        _: '19'
    };
}

AdditiveExpression "20"
= head:MultiplicativeExpression tail:(_ ("+" / "-") _ MultiplicativeExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        _: '20'
    };
}

MultiplicativeExpression "21"
= head:PrimaryExpression tail:(_ ("*" / "/" / "%") _ PrimaryExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        _: '21'
    };
}

StringLiteral "22"
= Quotation_mark chars:(ReferenceRender / UnescapedChar / Char / Quotation_mark_escaped)* Quotation_mark {
    return {
        parts: chars,
        _: '22'
    };
}
/ Quotation_mark_raw chars_raw:(UnescapedChar_raw / Char / Quotation_mark_raw_escaped)* Quotation_mark_raw {
    return {
        parts: [chars_raw.join('')],
        _: '22'
    };
}

UnescapedChar
= !(Quotation_mark / Escape / EOL) . { return text(); }

UnescapedChar_raw
= !(Quotation_mark_raw / Escape / EOL) . { return text(); }

Char
= Escape sequence:(
    "\\"
    / "/"
    / "b" { return '\b'; }
    / "f" { return '\f'; }
    / "n" { return '\n'; }
    / "r" { return '\r'; }
    / "t" { return '\t'; }
    / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
        return String.fromCharCode(parseInt(digits, 16));
    }
) { return sequence; }

Escape
= "\\"

Quotation_mark
= '"'

Quotation_mark_escaped
= Escape '"' { return '"'; }

Quotation_mark_raw
= "'"

Quotation_mark_raw_escaped
= Escape "'" { return "'"; }

PositiveIntegerLiteral
= [1-9] [0-9]*

PositiveFloatLiteral
= ( "0" / PositiveIntegerLiteral ) "." [0-9]+

BoolLiteral
= "true" { return true; }
/ "false" { return false; }

NumberLiteral
= "-"? (PositiveFloatLiteral / PositiveIntegerLiteral) { return parseFloat(text()); }
/ "0" { return 0; }

HEXDIG = [0-9a-f]i

___
= [ \t\n\r\v\f]

__ "whitespaces"
= ___+

_ "whitespace"
= ___*

L_R_BRAC = _ "("
R_R_BRAC = _ ")"
L_S_BRAC = _ "["
R_S_BRAC = _ "]"
L_BRACE = _ "{"
R_BRACE = _ "}"

EOL
= "\n" / "\r\n" / "\r"

EOF
= !.
