start
= s:Statements {
    return $s;
}

Statements "0"
= s:(Statement)* {
    return array('s' => $s, '_' => '0');
}

Statement
= UnparsedText / Comments / SetStatement / ForeachStatement / IfStatement
/ Comment { return ''; }
/ ReferenceRender
/ RawText

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
S_END               = "#end" / "#{end}"
S_BEGIN             = "$" / S_UNPARSED_BEGIN / S_COMMENT / S_COMMENTS_BEGIN / S_SET / S_FOREACH / S_IF

RawText
= $(RawTextInner+) / S_BEGIN

RawTextInner
= [^$#] / (!(S_BEGIN / S_ELSEIF / S_ELSE / S_END) .)

UnparsedText
= S_UNPARSED_BEGIN t:$(UnparsedTextInner*) S_UNPARSED_END {
    return $t;
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

IfStatement "1"
= S_IF L_R_BRAC e:Expression R_R_BRAC _ s:Statements _ elifs:(ElseIfStatement)* _ el:ElseStatement? _ S_END {
    $re = array(
        'e'     => $e,
        's'     => $s['s'],
        '_'     => '1'
    );
    if (!empty($elifs)) $re['elifs'] = $elifs;
    if (!empty($el)) $re['el'] = $el;
    return $re;
}

ElseIfStatement
= S_ELSEIF L_R_BRAC e:Expression R_R_BRAC _ s:Statements {
    return array('e' => $e, 's' => $s['s']);
}

ElseStatement
= S_ELSE s:Statements { return $s['s']; }

ItemInArray "2"
= "$" id:Identifier __ "in" __ list:(ReferenceValue / ArrLiteral) {
    return array(
        'id'   => $id,
        'data' => $list,
        '_'    => '2'
    );
}

ForeachStatement "3"
= S_FOREACH L_R_BRAC _ it:ItemInArray R_R_BRAC _ s:Statements _ S_END {
    return array(
        'it' => $it,
        's'  => $s['s'],
        '_'  => '3'
    );
}

ReferenceInner "4"
= main:Identifier tail:(
    ("." Identifier)
    / ("[" Expression R_S_BRAC)
    / ("(" (Expression (_ "," Expression)*)? R_R_BRAC)
)* {
    $tails = array();
    $tails[] = $main;
    foreach ($tail as $i) {
        if ($i[0] === '.') {
            $tails[] = array(
                'type'  => 1,
                'value' => $i[1]
            );
        } elseif ($i[0] === '[') {
            $tails[] = array(
                'type'  => 2,
                'value' => $i[1]
            );
        } elseif ($i[0] === '(') {
            $params = array();
            if (!empty($i[1])) {
                $ps = $i[1];
                $params[] = $ps[0];
                if (!empty($ps[1])) {
                    foreach ($ps[1] as $j) {
                        $params[] = $j[2];
                    }
                }
            }
            $tails[] = array(
                'type'  => 3,
                'value' => $params
            );
        }
    }
    return $tails;
}

ReferenceBody
= "{" _ ref:ReferenceInner R_BRACE { return $ref; }
/ ReferenceInner

SetStatement "5"
= S_SET L_R_BRAC _ "$" body:ReferenceBody _ "=" v:Expression R_R_BRAC {
    return array(
        'body' => $body,
        'v'    => $v,
        '_'    => '5'
    );
}

Reference "6"
= "$" bang:("!")? body:ReferenceBody {
    $re = array(
        'body' => $body,
        '_'    => '6'
    );
    if (!empty($bang)) $re['bang'] = true;
    return $re;
}

ReferenceRender "7"
= ref:Reference {
    $ref['text'] = $this->text();
    $ref['_'] = '7';
    return $ref;
}

ReferenceValue "8"
= ref:Reference {
    $ref['_'] = '8';
    return $ref;
}

Identifier
= [a-zA-Z] [0-9a-zA-Z_-]* { return $this->text(); }

Expression
= _ e:ConditionalOrExpression { return $e; }

ValLiteral
= BoolLiteral / StringLiteral / NumberLiteral / ArrLiteral / ObjLiteral

Kv "9"
= _ k:StringLiteral _ ":" _ v:(ValLiteral / ReferenceValue) {
    return array(
        'key' => $k,
        'val' => $v
    );
}

ObjLiteral "10"
= "{" head:Kv? tail:(_ "," Kv)* R_BRACE {
    $tails = array();
    if (isset($head)) $tails[] = $head;
    if (count($tail) > 0) {
        foreach ($tail as $t) {
            $tails[] = $t[2];
        }
    }
    $re = array(
        '_' => '10'
    );
    if (count($tails) > 0) {
        $re['tail'] = $tails;
    }
    return $re;
}

ArrRange "11"
= "[" start:Expression _ ".." end:Expression R_S_BRAC {
    return array(
        'startExp' => $start,
        'endExp'   => $end,
        '_'        => '11'
    );
}

ArrLiteral "12"
= "[" head:Expression? tail:(_ "," Expression)* R_S_BRAC {
    $tails = array();
    if (isset($head)) $tails[] = $head;
    if (count($tail) > 0) {
        foreach ($tail as $t) {
            $tails[] = $t[2];
        }
    }
    $re = array(
        '_' => '12'
    );
    if (count($tails) > 0) {
        $re['tail'] = $tails;
    }
    return $re;
}
/ ArrRange

PrimaryExpression
= ValLiteral
/ s1:("-")? r:ReferenceValue {
    if (!empty($s1)) $r['_'] = '13';
    return $r;
}
/ "!" p:PrimaryExpression {
    return array(
        'p' => $p,
        '_' => '14'
    );
}
/ s2:[!-]? "(" e:Expression R_R_BRAC {
    return empty($s2) ? $e : array(
        's'   => $s2,
        'exp' => $e,
        '_'   => '15'
    );
}

ConditionalOrExpression "16"
= head:ConditionalAndExpression tail:(_ "||" _ ConditionalAndExpression)* {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '16'
    );
}

ConditionalAndExpression "17"
= head:EqualityExpression tail:(_ "&&" _ EqualityExpression)* {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '17'
    );
}

EqualityExpression "18"
= head:RelationalExpression tail:(_ ("==" / "!=") _ RelationalExpression)* {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '18'
    );
}

RelationalExpression "19"
= head:AdditiveExpression tail:(_ ("<=" / ">=" / "<" / ">") _ AdditiveExpression)? {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '19'
    );
}

AdditiveExpression "20"
= head:MultiplicativeExpression tail:(_ ("+" / "-") _ MultiplicativeExpression)* {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '20'
    );
}

MultiplicativeExpression "21"
= head:PrimaryExpression tail:(_ ("*" / "/" / "%") _ PrimaryExpression)* {
    if (empty($tail)) return $head;
    return array(
        'head' => $head,
        'tail' => $tail,
        '_'    => '21'
    );
}

StringLiteral "22"
= Quotation_mark chars:(ReferenceRender / Char / Quotation_mark_escaped)* Quotation_mark {
    return array(
        'parts' => $chars,
        '_'     => '22'
    );
}
/ Quotation_mark_raw chars_raw:(Char / Quotation_mark_raw_escaped)* Quotation_mark_raw {
    return array(
        'parts' => $chars_raw,
        '_'     => '22'
    );
}

Char
= Unescaped
/ Escape sequence:(
    "\\"
    / "/"
    / "b" { return "\b"; }
    / "f" { return "\f"; }
    / "n" { return "\n"; }
    / "r" { return "\r"; }
    / "t" { return "\t"; }
    / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
        return chr_unicode(intval($digits, 16));
    }
) { return $sequence; }

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

Unescaped
= [^\0-\x1F\x22\x5C]

PositiveIntegerLiteral
= [1-9] [0-9]*

PositiveFloatLiteral
= ( "0" / PositiveIntegerLiteral ) "." [0-9]+

BoolLiteral
= "true" { return true; }
/ "false" { return false; }

NumberLiteral
= "-"? (PositiveFloatLiteral / PositiveIntegerLiteral) { return floatval($this->text()); }
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
