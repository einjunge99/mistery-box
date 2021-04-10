
 
%{
    const {Types,getType} = require('../compiler/utils/Type');
    const {Param} = require('../compiler/utils/Param');

    const {Break} = require('../compiler/actions/instruction/transfer/Break');
    const {Continue} = require('../compiler/actions/instruction/transfer/Continue');
    const {ReturnTS} = require('../compiler/actions/instruction/transfer/Return');

    const {Call} = require('../compiler/actions/instruction/Call')
    const {Console} = require('../compiler/actions/instruction/Console')
    const {Statement} = require('../compiler/actions/instruction/Statement')

    const {And} = require('../compiler/actions/expression/logical/And')
    const {Or} = require('../compiler/actions/expression/logical/Or')
    const {Not} = require('../compiler/actions/expression/logical/Not')
    
    const {Plus} = require('../compiler/actions/expression/arithmetic/Plus')
    const {Mul} = require('../compiler/actions/expression/arithmetic/Mul')
    const {Div} = require('../compiler/actions/expression/arithmetic/Div')
    const {Minus} = require('../compiler/actions/expression/arithmetic/Minus')
    const {Neg} = require('../compiler/actions/expression/arithmetic/Neg')
    const {Inc} = require('../compiler/actions/expression/arithmetic/Inc')
    const {Dec} = require('../compiler/actions/expression/arithmetic/Dec')

    const {Equal} = require('../compiler/actions/expression/relational/Equal')
    const {NotEqual} = require('../compiler/actions/expression/relational/NotEqual')
    const {Less} = require('../compiler/actions/expression/relational/Less')
    const {Great} = require('../compiler/actions/expression/relational/Great')
    
    const {Primitive} = require('../compiler/actions/expression/literal/Primitive')
    const {Complex} = require('../compiler/actions/expression/literal/Complex')

    const {DeclareVariable} = require('../compiler/actions/instruction/variable/DeclareVariable')
    const {AssignVariable} = require('../compiler/actions/instruction/variable/AssignVariable')

    const {AccessVariable} = require('../compiler/actions/expression/access/AccessVariable')
    const {AccessFunction} = require('../compiler/actions/expression/access/AccessFunction')

    const {DeclareFunction} = require('../compiler/actions/instruction/function/DeclareFunction')

    const {DoWhile} = require('../compiler/actions/instruction/control/DoWhile')
    const {For} = require('../compiler/actions/instruction/control/For')
    const {ForBody} = require('../compiler/actions/instruction/control/ForBody')
    const {If} = require('../compiler/actions/instruction/control/If')
    const {While} = require('../compiler/actions/instruction/control/While')
%}

%lex
%options case-sensitive
entero [0-9]+
number {entero}("."{entero})?
%%

\s+											// ignora los espacios en blanco
"//".*										// comentario de linea
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]			// comentario de multiples lineas	

{number}             return 'number'

"log"               return "log"
"console"           return "console"

"."                 return "."
","                 return ","

"++"                return "++"
"--"                return "--"
"true"				return "true"
"false"				return "false"
"return"			return "return"

"let"				return "let"
"const"				return "const"
'function'          return 'function'

"if"				return 'if';
"else"				return 'else';
"do"				return "do"
"while"				return "while"
"for"               return "for"

"break"				return 'break';
"continue"          return "continue"

";"					return ";";
":"					return ":";
"{"					return '{';
"}"					return '}';
"("					return '(';
")"					return ')';

"<="				return '<=';
">="				return '>=';
"=="				return '==';
"!="				return '!=';

"&&"				return '&&'
"||"				return '||'
"!"					return '!'

"+"					return '+';
"-"					return '-';
"*"					return '*';
"/"					return '/';


"<"					return '<';
">"					return '>';
"="					return '=';

\'([^\\\']|\\.)*\'				{ yytext = yytext.substr(1,yyleng-2); return 'cadena'; }
\"([^\\\"]|\\.)*\"				{ yytext = yytext.substr(1,yyleng-2); return 'cadena'; }

([a-zA-Z_])[a-zA-Z0-9_]*		return 'id';

<<EOF>>				return 'EOF';
.				    return 'ERROR'
/lex

%left '?'
%left '||'
%left '&&'
%left '==', '!='
%left '>=', '<=','>', '<'
%left '+' '-'
%left '*', '/'
%right '!'
%left UMINUS


%start S
%%

S
: INSTRUCTIONS EOF{return $1}
| EOF
;


INSTRUCTIONS
: INSTRUCTIONS INSTRUCTION {$1.push($2);$$ = $1;}
| INSTRUCTION              {$$ = [$1];}
;

INSTRUCTION
: IF                        {$$ = $1}
| WHILE                     {$$ = $1}
| SWITCH                    {$$ = $1}
| FOR                       {$$ = $1}
| DO_WHILE ';'              {$$ = $1}
| RETURN ';'                {$$ = $1}
| EXPRESION ';'             {$$ = new Call($1,@1.first_line,@1.first_column)} 
| ASIGNAR ';'               {$$ = new Call($1,@1.first_line,@1.first_column)}  
| DECLARAR_FUNCIONES        {$$ = $1}
| DECLARAR_VARIABLE ';'     {$$ = $1}
| CONSOLE ';'               {$$ = $1}
| 'break' ';'               {$$ = new Break(@1.first_line,@1.first_column)}
| 'continue' ';'            {$$ = new Continue(@1.first_line,@1.first_column)}
| error                     {$$ = $1}
;

WHILE
: 'while' '(' EXPRESION ')' CUERPO  {$$ = new While($3, $5, @1.first_line, @1.first_column)}
;

DO_WHILE
: 'do' CUERPO 'while' '(' EXPRESION ')' {$$ = new DoWhile($5, $2, @1.first_line, @1.first_column)}
;

IF
: 'if' '(' EXPRESION ')' CUERPO                 {$$ = new If($3, $5, null, @1.first_line, @1.first_column)}
| 'if' '(' EXPRESION ')' CUERPO 'else' CUERPO   {$$ = new If($3, $5, $7, @1.first_line, @1.first_column)}
| 'if' '(' EXPRESION ')' CUERPO 'else' IF       {$$ = new If($3, $5, $7, @1.first_line, @1.first_column)}
;

FOR
: 'for' '(' CUERPO_FOR ')' CUERPO   {$$ = new For($3,$5,@1.first_line, @1.first_column)}
;

CUERPO_FOR                
: DECLARAR_VARIABLE ';' EXPRESION ';' EXPRESION    {$$ = new ForBody($1,$3,$5,@1.first_line, @1.first_column)}
| ASIGNAR ';' EXPRESION ';' EXPRESION              {$$ = new ForBody($1,$3,$5,@1.first_line, @1.first_column)}         
;


CUERPO
: '{' '}'              {$$ = new Statement([], @1.first_line, @1.first_column);}
| '{' INSTRUCTIONS '}' {$$ = new Statement($2, @1.first_line, @1.first_column);}
;

CONSOLE
: 'console' '.' 'log' '(' LISTA_EXPRESIONES ')'     {$$ = new Console($5, @1.first_line, @1.first_column)}
;

EXPRESION
: EXPRESION '&&' EXPRESION  {$$ = new And($1,$3,@1.first_line, @1.first_column)}              
| EXPRESION '||' EXPRESION  {$$ = new Or($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '+' EXPRESION   {$$ = new Plus($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '-' EXPRESION   {$$ = new Minus($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '*' EXPRESION   {$$ = new Mul($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '/' EXPRESION   {$$ = new Div($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '>' EXPRESION   {$$ = new Great(false,$1,$3,@1.first_line, @1.first_column)}
| EXPRESION '>=' EXPRESION  {$$ = new Great(true,$1,$3,@1.first_line, @1.first_column)}
| EXPRESION '<' EXPRESION   {$$ = new Less(false,$1,$3,@1.first_line, @1.first_column)}
| EXPRESION '<=' EXPRESION  {$$ = new Less(true,$1,$3,@1.first_line, @1.first_column)}
| EXPRESION '==' EXPRESION  {$$ = new Equal($1,$3,@1.first_line, @1.first_column)}
| EXPRESION '!=' EXPRESION  {$$ = new NotEqual($1,$3,@1.first_line, @1.first_column)}
| '-' EXPRESION             {$$ = new Neg($2,@1.first_line, @1.first_column)}}  
| '!' EXPRESION             {$$ = new Not($2,@1.first_line, @1.first_column)}            
| '(' EXPRESION ')'         {$$ = $2}              
| ACCESO '++'               {$$ = new Inc($1,@1.first_line, @1.first_column)}            
| ACCESO '--'               {$$ = new Dec($1,@1.first_line, @1.first_column)}
| LITERAL                   {$$ = $1}                                                                 
;

LITERAL
: number                    {$$ = new Primitive($1, @1.first_line, @1.first_column, Types.NUMBER)}
| 'true'                    {$$ = new Primitive(true, @1.first_line, @1.first_column, Types.BOOLEAN)}
| 'false'                   {$$ = new Primitive(false, @1.first_line, @1.first_column, Types.BOOLEAN)}
| cadena                    {$$ = new Complex($1, @1.first_line, @1.first_column, Types.STRING)}
| ACCESO                    {$$ = $1}           
| FUNCION                   {$$ = $1}
;

ASIGNAR
: ACCESO '=' EXPRESION      {$$ = new AssignVariable($1,$3,@1.first_line,@1.first_column)}
;

LISTA_EXPRESIONES
: LISTA_EXPRESIONES ',' EXPRESION   {$1.push($3);$$=$1}
| EXPRESION                         {$$ = [$1]}
;

FUNCION
: id '(' LISTA_EXPRESIONES ')' {$$ = new AccessFunction($1,$3,@1.first_line,@1.first_column);}
| id '(' ')'                   {$$ = new AccessFunction($1,[],@1.first_line,@1.first_column);}
;

ACCESO
:  id  {$$ = new AccessVariable($1,null,@1.first_line,@1.first_column)}          
;

RETURN
: 'return'              { $$ = new ReturnTS(null,@1.first_line,@1.first_column)}
| 'return' EXPRESION    { $$ = new ReturnTS($2,@1.first_line,@1.first_column)}
;


DECLARAR_VARIABLE
: DINAMICO id ':' TIPO '=' EXPRESION    {$$ = new DeclareVariable($1,$2,$4,$6,@1.first_line,@1.first_column)}
| DINAMICO id ':' TIPO                  {$$ = new DeclareVariable($1,$2,$4,null,@1.first_line,@1.first_column)}
;

TIPO
: id    {$$ = getType($1)}
;


DINAMICO
: 'let'     {$$=false}
| 'const'   {$$=true}
;


DECLARAR_FUNCIONES
: 'function' id '(' PARAMETROS ')' ':' TIPO CUERPO            {$$ = new DeclareFunction($2,$4,$7,$8,@1.first_line,@1.first_column)}
| 'function' id '(' ')' ':' TIPO CUERPO                       {$$ = new DeclareFunction($2,[],$6,$7,@1.first_line,@1.first_column)}
;

PARAMETROS
: PARAMETROS ',' id ':' TIPO            {$1.push(new Param($3,$5));$$=$1}
| id ':' TIPO                           {$$ = [new Param($1,$3)]}
;

