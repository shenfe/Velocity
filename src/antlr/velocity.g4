grammar Velocity;

program
: Statements? EOF
;

Statements
: s=(Statement)* {
    return {
        s: s,
        $: '0'
    };
}
;

Statement
: UnparsedText
| Comment
| Comments
| ReferenceRender
| SetStatement
| ForeachStatement
| IfStatement
| RawText
;

S_UNPARSED_BEGIN    : '#[['
;
S_UNPARSED_END      : ']]#'
;
S_COMMENT           : '##'
;
S_COMMENTS_BEGIN    : '#*'
;
S_COMMENTS_END      : '*#'
;
S_SET               : '#set'
;
S_FOREACH           : '#foreach'
;
S_IF                : '#if'
;
S_ELSEIF            : '#elseif'
;
S_ELSE              : ('#else' ___) | '#{else}'
;
S_END               : '#end' | '#{end}'
;
S_BEGIN             : S_UNPARSED_BEGIN | S_COMMENT | S_COMMENTS_BEGIN | '$' | S_SET | S_FOREACH | S_IF
;

RawText
: t=(RawTextInner+) { return $t.text; }
| S_BEGIN
;

RawTextInner
: !(Symbol) .
;

Symbol
: S_BEGIN | S_ELSEIF | S_ELSE | S_END
;

UnparsedText
: S_UNPARSED_BEGIN t=(UnparsedTextInner*) S_UNPARSED_END {
    return $t.text;
}
;

UnparsedTextInner
: !(S_UNPARSED_END) .
;

Comment
: S_COMMENT [^\n]* {
    return '';
}
;

Comments
: S_COMMENTS_BEGIN CommentsInner* S_COMMENTS_END {
    return '';
}
;

CommentsInner
: !(S_COMMENTS_END) .
;

IfStatement
: S_IF _ '(' _ e=Expression _ ')' _ s=Statements _ elifs=(ElseIfStatement)* _ el=ElseStatement? _ S_END {
    return {
        e: e,
        s: s,
        elifs: (elifs && elifs.length) ? elifs : undefined,
        el: el || undefined,
        $: '1'
    };
}
;

ElseIfStatement
: S_ELSEIF _ '(' _ e=Expression _ ')' _ s=Statements {
    return {
        e: e,
        s: s
    };
}
;

ElseStatement
: S_ELSE _ s=Statements { return s; }
;

ItemInArray
: '$' id=Identifier __ 'in' __ list=(ReferenceValue | ArrLiteral) {
    return {
        id: id,
        data: list,
        $: '2'
    };
}
;

ForeachStatement
: S_FOREACH _ '(' _ it=ItemInArray _ ')' _ s=Statements _ S_END {
    return {
        it: it,
        s: s,
        $: '3'
    };
}
;

ReferenceInner
: main:Identifier tail=(
    ('.' Identifier)
    | ('[' _ Expression _ ']')
    | ('(' _ (Expression (_ ',' _ Expression)*)? _ ')')
)* {
    var tails = [];
    for (var i = 0, len = tail.length; i < len; i++) {
        if (tail[i][0] === '.') {
            tails.push({
                type: 1,
                value: tail[i][1]
            });
        } else if (tail[i][0] === '[') {
            tails.push({
                type: 2,
                value: tail[i][2]
            });
        } else if (tail[i][0] === '(') {
            var params = [];
            if (tail[i][2]) {
                var ps = tail[i][2];
                params.push(ps[0]);
                if (ps[1]) {
                    for (var j = 0, llen = ps[1].length; j < llen; j++) {
                        params.push(ps[1][j][3]);
                    }
                }
            }
            tails.push({
                type: 3,
                value: params
            });
        }
    }
    return {
        main: main,
        tail: tails.length ? tails : undefined,
        $: '4'
    };
}
;

SetStatement
: S_SET _ '(' _ '$' body=(('{' _ ReferenceInner _ '}') | ReferenceInner) _ '=' _ v=Expression _ ')' {
    return {
        body: (body.length && body.length > 1) ? body[2] : body,
        v: v,
        $: '5'
    };
}
;

Reference
: '$' bang='!'? body=(('{' _ ReferenceInner _ '}') | ReferenceInner) {
    return {
        bang: bang || undefined,
        body: (body.length && body.length > 1) ? body[2] : body,
        $: '6'
    };
}
;

ReferenceRender
: ref=Reference {
    return {
        ref: ref,
        text: $ref.text,
        $: '7'
    };
}
;

ReferenceValue
: ref=Reference {
    return {
        ref: ref,
        $: '8'
    };
}
;

Identifier
: [a-zA-Z] [0-9a-zA-Z_-]* { return $Identifier.text; }
;

Expression
: ConditionalOrExpression
;

ValLiteral
: BoolLiteral | StringLiteral | NumberLiteral | ArrLiteral | ObjLiteral
;

Kv
: k=StringLiteral _ ':' _ v=(ValLiteral | ReferenceValue) {
    return {
        key: k,
        val: v,
        $: '9'
    };
}
;

ObjLiteral
: '{' _ head=Kv? tail=(_ ',' _ Kv)* _ '}' {
    return {
        head: head,
        tail: tail,
        $: '10'
    };
}
;

ArrRange
: '[' _ start=Expression _ '..' _ end=Expression _ ']' {
    return {
        startExp: start,
        endExp: end,
        $: '11'
    };
}
;

ArrLiteral
: '[' _ head=Expression? tail=(_ ',' _ Expression)* _ ']' {
    return {
        head: head,
        tail: tail.length ? tail : undefined,
        $: '12'
    };
}
| ArrRange
;

PrimaryExpression
: ValLiteral
| s1='-'? r=ReferenceValue {
    return !s1 ? r : {
        ref: r,
        $: '13'
    };
}
| '!' p=PrimaryExpression {
    return {
        p: p,
        $: '14'
    };
}
| s2=[!-]? '(' _ e=Expression _ ')' {
    return !s2 ? e : {
        s: s2,
        exp: e,
        $: '15'
    };
}
;

ConditionalOrExpression
: head=ConditionalAndExpression tail=(_ '||' _ ConditionalAndExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        $: '16'
    };
}
;

ConditionalAndExpression
: head=EqualityExpression tail=(_ '&&' _ EqualityExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        $: '17'
    };
}
;

EqualityExpression
: head=RelationalExpression tail=(_ ('==' | '!=') _ RelationalExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        $: '18'
    };
}
;

RelationalExpression
: head=AdditiveExpression tail=(_ ('<=' | '>=' | '<' | '>') _ AdditiveExpression)? {
    if (!tail) return head;
    return {
        head: head,
        tail: tail,
        $: '19'
    };
}
;

AdditiveExpression
: head=MultiplicativeExpression tail=(_ ('+' | '-') _ MultiplicativeExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        $: '20'
    };
}
;

MultiplicativeExpression
: head=PrimaryExpression tail=(_ ('*' | '/' | '%') _ PrimaryExpression)* {
    if (!tail.length) return head;
    return {
        head: head,
        tail: tail,
        $: '21'
    };
}
;

StringLiteral
: Quotation_mark chars=(ReferenceRender | Char)* Quotation_mark {
    return {
        parts: chars,
        $: '22'
    };
}
;

Char
: Unescaped
| Escape sequence=(
    '"'
    | '\\'
    | '/'
    | 'b' { return '\b'; }
    | 'f' { return '\f'; }
    | 'n' { return '\n'; }
    | 'r' { return '\r'; }
    | 't' { return '\t'; }
    | 'u' digits=(HEXDIG HEXDIG HEXDIG HEXDIG) {
        return String.fromCharCode(parseInt($digits.text, 16));
    }
) { return sequence; }
;

Escape
: '\\'
;

Quotation_mark
: '"'
;

Unescaped
: [^\0-\x1F\x22\x5C]
;

PositiveIntegerLiteral
: [1-9] [0-9]* {
    return parseInt($PositiveIntegerLiteral.text);
}
;

PositiveFloatLiteral
: ( '0' | PositiveIntegerLiteral ) '.' [0-9]+ {
    return parseFloat($PositiveFloatLiteral.text);
}
;

BoolLiteral
: 'true' { return true; }
| 'false' { return false; }
;

NumberLiteral
: s='-'? n=(PositiveFloatLiteral | PositiveIntegerLiteral) { return s ? -n : n; }
| '0' { return 0; }
;

HEXDIG
: [0-9a-f]i
;

___
: [ \t\n\r\v\f]
;

__
: ___+
;

_
: ___*
;

WS
: [ \t\r\n]+ -> skip
;
