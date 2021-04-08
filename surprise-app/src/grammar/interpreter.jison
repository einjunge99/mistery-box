
%{
    const {FunctionC3D} = require('../interpreter/instruction/Function');
    const {Conditional} = require('../interpreter/instruction/Conditional');
    const {Label} = require('../interpreter/instruction/Label');
    const {Goto} = require('../interpreter/instruction/Goto');
    const {AccessC3D} = require('../interpreter/instruction/Access');
    const {Print} = require('../interpreter/instruction/Print');
    const {ReturnC3D} = require('../interpreter/instruction/Return');
    const {ExpressionC3D} = require('../interpreter/instruction/Expression');
%}

%lex
entero [0-9]+
number {entero}("."{entero})?
%%

\s+											// ignora los espacios en blanco
"//".*										// comentario de linea
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]			// comentario de multiples lineas	

{number}             return 'number'

"double"            return 'double'
"void"              return 'void'
"int"               return 'int'
"float"             return 'float'
"return"			return "return"
"if"				return "if";
"goto"              return "goto";
"Stack"             return "Stack";
"Heap"              return "Heap";
"printf"            return "printf"

","                 return ","
":"					return ':';
";"					return ";";
"{"					return '{';
"}"					return '}';
"("					return '(';
")"					return ')';
'['                 return '['
']'                 return ']'                   

"<="				return '<=';
">="				return '>=';
"=="				return '==';
"!="				return '!=';

"+"					return '+';
"-"					return '-';
"*"					return '*';
"/"					return '/';

"<"					return '<';
">"					return '>';
"="					return '=';

\"([^\\\"]|\\.)*\"				{ yytext = yytext.substr(1,yyleng-2); return 'cadena'; }
([a-zA-Z_])[a-zA-Z0-9_]*		return 'id';


<<EOF>>				return 'EOF';
.				    return 'ERROR'

/lex

%left '==', '!='
%left '>=', '<=','>', '<'
%left '+' '-'
%left '*', '/'

%start INICIO
%%

INICIO
: GLOBALES EOF{return $1}
| EOF
;

GLOBALES 
: GLOBALES DECLARAR_FUNCIONES  {$1.push($2);$$=$1;}
| DECLARAR_FUNCIONES           {$$=[$1];}
;

DECLARAR_FUNCIONES
: 'void' id '(' ')' CUERPO {$$=new FunctionC3D($1,$2,$5,@1.first_line, @1.first_column)}
;

CUERPO
: '{' '}' {$$=[]}              
| '{' INSTRUCCIONES '}' {$$=$2}
;

INSTRUCCIONES
: INSTRUCCIONES INSTRUCCION {$1.push($2);$$ = $1;}
| INSTRUCCION               {$$ = [$1];}
;

INSTRUCCION
: LABEL                     {$$=$1}
| IF ';'                    {$$=$1}
| GOTO ';'                  {$$=$1}
| FUNCION ';'               {$$=$1}
| EXPRESION ';'             {$$=$1}
| PRINT  ';'                {$$=$1}
| RETURN ';'                {$$=$1}
;

LABEL
: 'id' ':'  {$$=new Label($1,@1.first_line, @1.first_column)}
;

IF
: 'if' '(' VALOR RELATIONAL VALOR ')' 'goto' 'id' {$$=new Conditional($3,$4,$5,$8,@1.first_line, @1.first_column)}
;

GOTO
: 'goto' 'id'  {$$=new Goto($2,@1.first_line, @1.first_column)}
;

FUNCION
: id '(' ')' {$$=new AccessC3D($1,@1.first_line, @1.first_column)}
;

EXPRESION
: id '=' VALOR ARITHMETIC VALOR    {$$=new ExpressionC3D(@1.first_line, @1.first_column,$1,$3,$5,$4)}
| id '=' VALOR                     {$$=new ExpressionC3D(@1.first_line, @1.first_column,$1,$3)}
| id '=' STRUCTURE                 {$$=new ExpressionC3D(@1.first_line, @1.first_column,$1,$3)}
| STRUCTURE '=' VALOR              {$$=new ExpressionC3D(@1.first_line, @1.first_column,$1,$3)}
;

PRINT
: 'printf' '(' cadena ',' CASTEO VALOR ')' {$$=new Print($3,$6,@1.first_line, @1.first_column)}
;


RETURN
: 'return'  {$$=new ReturnC3D(@1.first_line, @1.first_column)}
;

ARITHMETIC
: '+'   {$$=$1}
| '-'   {$$=$1}
| '*'   {$$=$1}
| '/'   {$$=$1}
;

RELATIONAL
: '>'   {$$=$1}
| '>='  {$$=$1}
| '<'   {$$=$1}
| '<='  {$$=$1}
| '=='  {$$=$1}
| '!='  {$$=$1}
;

CASTEO
: '(' 'float' ')' {$$=$1+$2+$3}
| '(' 'int' ')'   {$$=$1+$2+$3}
| /*epsilon*/     {$$=""}
; 

STRUCTURE
: 'Stack' '[' CASTEO VALOR ']' {$$=$1+","+$4}
| 'Heap' '[' CASTEO VALOR ']'  {$$=$1+","+$4}
;

VALOR
: number        {$$ = $1}
| '-' number    {$$ = $1+$2}
| id            {$$ = $1}
;
