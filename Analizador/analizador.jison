%{
var cadena = '';
var errores = [];
%}
%lex

%options case-insensitive
%x string
%x charLiteral

%%
\s+              //espacios en blanco
"//".*                              {} 
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/] {}
";"                      return 'Tptcoma'
"."                      return 'Tpointer'
"length"             return 'Tlength'
"typeof"             return 'Ttypeof'

"*"                      return 'Tpor'
"/"                      return 'Tdiv'
"-"                      return 'Tmenos'
"+"                      return 'Tmas'
"!="                return 'Tdiferente'
"!"                 return 'Tnot'
"pow"                return 'Tpow'
">="                return 'Tmayori'
"<="                return 'Tmenori'
"=="                return 'Tigual'
"%"                 return 'Tmod'
">"                 return 'Tmayor'
"<"                 return 'Tmenor'
"&&"                 return 'Tand'
"||"                 return 'Tor'
"?"                  return 'Tinterrogacion'
":"                  return 'Tdospuntos'

"c_str"            return 'Tc_str'
"("                      return 'Tparbre'
")"                      return 'Tparcierra'
","                      return 'Tcoma'
"="                      return 'Tasigna1'
"{"                      return 'Tllave1'
"}"                      return 'Tllave2'
"["                      return 'Tcorchete1'
"]"                      return 'Tcorchete2'

"std::tostring"          return 'Ttostring'

"round"             return 'Tround'
"tolower"            return 'To'
"toupper"          return 'To'
"execute"            return 'Texecute'
"for"                return 'Tfor'
"endl"               return 'Tendl'
"new"                 return 'Tnew'
"cout"             return 'Tcout'
"bool"            return 'PTipo'
"int"               return 'PTipo'
"std::string"       return 'PTipo'
"char"              return 'PTipo'
"true"              return 'Ttrue'
"false"             return 'Tfalse'
"double"            return 'PTipo'
"if"                return 'Tif'
"print"             return 'Tprint' 
"else"              return 'Telse'  
"while"             return 'Twhile' 
"do"                return 'Tdo'
"switch"            return 'Tswitch'
"case"              return 'Tcase'
"default"           return 'Tdefault'
"break"             return 'Tsent_trans'
"continue"             return 'Tcontinue'
"void"              return 'Tvoid'
"return"            return 'Treturn'


([a-zA-Z])([a-zA-Z0-9])* return 'Tid'
[0-9]+("."[0-9]+)?\b     return 'Tnumero'

                        

[']\\\\[']|[']\\\"[']|[']\\\'[']|[']\\n[']|[']\\t[']|[']\\r[']|['].?[']	        { yytext=yytext.substr(1, yyleng-2); return 'Tchar' }

\"[^\"]*\"              { yytext = yytext.substr(1,yyleng-2); return 'Tstring'; }

<<EOF>>                  return 'EOF'
.                        { errores.push({tipo: "Lexico", error: yytext, linea: yylloc.first_line, columna: yylloc.first_column+1}); return 'INVALID'; }

/lex


%{

    function AST_Node(tag,value,fila,columna){
        this.tag = tag;
        this.value = value;
        this.fila=fila;
        this.columna=columna;
        this.result = null;

        this.childs = [];

        this.addChilds = addChilds;
        this.getSon = getSon;

        function addChilds(){
            for (var i = 0; i < arguments.length; i++) {
                this.childs.push(arguments[i]);
                if (arguments[i]!== null){
                    arguments[i].padre = this;
                }
            }
        }  

        function getSon(pos){
            if(pos > this.hijos.length - 1) return null;
            return this.hijos[pos];
        }
    };

%}
%nonassoc 'Tinterrogacion' 'Tdospuntos' 'Tpointer'
%right 'Tasigna1'
%left  'Tor'
%left  'Tand'
%right 'Tnot' UMINUS 
%left  'Tmayor' 'Tmenor' 'Tmenori' 'Tmayori' 'Tdiferente' 'Tigual' 'Tigualr'
%left  'Tmas' 'Tmenos'
%left  'Tpor' 'Tdiv' 'Tmod'
%nonassoc 'Tpow'
%left 'Tparbre' 'Tparcierra'
%right 'umenos'
%right 'cast'


%start S

%%

S: SENTENCIAS EOF {$$=new AST_Node("RAIZ","RAIZ",this.$first_line,@1.last_column);$$.addChilds($1);return $$} ;


SENTENCIAS: SENTENCIAS SENTENCIA {
$$= new AST_Node("SENTENCIAS","SENTENCIAS",this._$.first_line,@2.last_column); $$.addChilds($1,$2)
}
            | SENTENCIA {$$= new AST_Node("SENTENCIAS","SENTENCIAS",this._$.first_line,@1.last_column);
                      $$.addChilds($1);} ;


SENTENCIA:  DEC_VAR {$$= new AST_Node("SENTENCIA","SENTENCIA",this._$.first_line,@1.last_column); $$.addChilds($1);}
           |ARREGLOS_DEC {$$ = new AST_Node("SENTENCIA_ARR","SENTENCIA_ARR",this._$.first_line,@1.last_column); $$.addChilds($1);}
           |BLOQUE{$$=$1}
           |IF{$$=$1}
           |SWITCH{$$= new AST_Node("SENTENCIA_SWITCH","SENTENCIA_SWITCH",this._$.first_line,@1.last_column); $$.addChilds($1);}
           |WHILE{$$= new AST_Node("SENTENCIA_WHILE","SENTENCIA_WHILE",this._$.first_line,@1.last_column);$$.addChilds($1);}
           |DO_WHILE Tptcoma{$$=new AST_Node("SENTENCIA_DO_WHILE","SENTENCIA_DO_WHILE",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node(";",";",this._$.first_line,@2.last_column));}
           |PRINT{$$=$1}
           |INCREMENTO_O_DECREMENTO Tptcoma{$$=new AST_Node("SENTENCIA_IAD","SENTENCIA_IAD",this._$.first_line,@1.last_column);$$.addChilds($1,new AST_Node(";",$2,this._$.first_line,@2.last_column));}
           |ASIGNACION {$$=new AST_Node("SENTENCIA_ASIG", "SENTENCIA_ASIG", this._$.first_line,@1.last_column); $$.addChilds($1);}
           |Tsent_trans {$$=new AST_Node("SENTENCIA_TR","SENTENCIA_TR",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tsent_trans",$1,this._$.first_line,@1.last_column));}
           |FOR { $$=new AST_Node("SENTENCIA_FOR","SENTENCIA_FOR",this._$.first_line,@1.last_column); $$.addChilds($1); }
           |FUNCION {$$=new AST_Node("SENTENCIA_FUNCION","SENTENCIA_FUNCION",this._$.first_line,@1.last_column); $$.addChilds($1); }
           |LLAMADA_FUNCION Tptcoma {$$=new AST_Node("SENTENCIA_LLAMADA","SENTENCIA_LLAMADA",this._$.first_line,@1.last_column); $$.addChilds($1,new AST_Node(";",";",this._$.first_line,@2.last_column));}
           |RETORNAR {$$=new AST_Node("SENTENCIA_RETORNAR","SENTENCIA_RETORNAR",this._$.first_line,@1.last_column); $$.addChilds($1);}
           |CONTINUE { $$=new AST_Node("SENTENCIA_CONTINUE","SENTENCIA_CONTINUE",this._$.first_line,@1.last_column); $$.addChilds($1);}
           |Texecute LLAMADA_FUNCION Tptcoma {$$=new AST_Node("SENTENCIA_EXECUTE","SENTENCIA_EXECUTE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Texecute",$1,this._$.first_line,@1.last_column),$2,new AST_Node(";",";",this._$.first_line,@3.last_column));}
           |REASIGNACION {$$=new AST_Node("SENTENCIA_REASIG","SENTENCIA_REASIG",this._$.first_line,@1.last_column); $$.addChilds($1);}
           ;

REASIGNACION: Tid Tasigna1 EXP Tptcoma {$$=new AST_Node("REASIGNACION","REASIGNACION",this._$.first_line,@3.last_column); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("=",$2,this._$.first_line,@2.last_column),$3,new AST_Node(";",";",this._$.first_line,@4.last_column));};

CONTINUE: Tcontinue Tptcoma {$$=new AST_Node("CONTINUE","CONTINUE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tcontinue",$1,this._$.first_line,@1.last_column),new AST_Node(";",";",this._$.first_line,@2.last_column));};

RETORNAR: Treturn EXP Tptcoma {$$=new AST_Node("RETORNAR","RETORNAR",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Treturn",$1,this._$.first_line,@1.last_column),$2,new AST_Node(";",";",this._$.first_line,@3.last_column));}
|Treturn Tptcoma {$$=new AST_Node("RETORNAR","RETORNAR",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Treturn",$1,this._$.first_line,@1.last_column),new AST_Node(";",";",this._$.first_line,@2.last_column));};

LLAMADA_FUNCION: Tid Tparbre VALORES {$$=new AST_Node("LLAMADA_FUNCION","LLAMADA_FUNCION",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3);}
|Tid Tparbre LIST_P Tparcierra{$$=new AST_Node("LLAMADA_FUNCION","LLAMADA_FUNCION",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3,new AST_Node(")",")",this._$.first_line,@4.last_column));};

LIST_P: LIST_P Tcoma EXP {$$ = new AST_Node("LIST_P","LIST_P",this._$.first_line,@2.last_column); $$.addChilds($1,new AST_Node(",",$2,this._$.first_line,@2.last_column),$3);}
| EXP {$$=new AST_Node("LIST_P","LIST_P",this._$.first_line,@1.last_column); $$.addChilds($1);};

FUNCION: Tvoid Tid Tparbre VALORES BLOQUE {$$=new AST_Node("FUNCION","FUNCION",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tvoid",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.last_column),new AST_Node("(","(",this._$.first_line,@3.last_column), $4, $5);}
|PTipo Tid Tparbre VALORES BLOQUE {$$=new AST_Node("FUNCION","FUNCION",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("PTipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.last_column),new AST_Node("(","(",this._$.first_line,@3.last_column), $4, $5);};

VALORES: Tparcierra {$$=new AST_Node("VALORES","VALORES",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node(")",$1,this._$.first_line,@1.last_column));}
| PARAMETROS_LIST Tparcierra{$$= new AST_Node("VALORES","VALORES",this._$.first_line,@1.last_column); $$.addChilds($1,new AST_Node(")",")",this._$.first_line,@2.last_column));};

PARAMETROS_LIST:PARAMETROS_LIST Tcoma PTipo Tid{$$ = new AST_Node("PARAMETROS_LIST","PARAMETROS_LIST",this._$.first_line,@1.last_column); $$.addChilds($1, new AST_Node(",",",",this._$.first_line,@2.last_column), new AST_Node("PTipo",$3,this._$.first_line,@3.last_column), new AST_Node("id",$4,this._$.first_line,@4.last_column));}
|PTipo Tid{$$=new AST_Node("PARAMETROS_LIST","PARAMETROS_LIST",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("PTipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.last_column));};

DEC_VAR: PTipo DECLARACION_1 FINDEC {$$= new AST_Node("DEC_VAR","DEC_VAR",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),$2, $3);};

INCREMENTO_O_DECREMENTO: Tid INC_AND_DEC {$$=new AST_Node("INCREMENTO_O_DECREMENTO","INCREMENTO_O_DECREMENTO",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),$2);};

FOR: Tfor Tparbre DEC_VAR  EXP Tptcoma INCREMENTO_O_DECREMENTO Tparcierra BLOQUE {$$=new AST_Node("FOR","FOR",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tfor",$1,this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3,$4,new AST_Node(";",";",this._$.first_line,@4.last_column), $6,new AST_Node(")",")",this._$.first_line,@7.last_column),$8) };

ASIGNACION: Tid Tcorchete1 EXP Tcorchete2 Tasigna1 EXP Tptcoma {$$=new AST_Node("ASIGNACION","ASIGNACION_T1",this._$.first_line,@5.last_column); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("[",$2,this._$.first_line,@2.first_column),$3,new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("=",$5,this._$.first_line,@5.last_column),$6, new AST_Node(";",$7,this._$.first_line,@7.last_column));}
| Tid Tcorchete1 EXP Tcorchete2 Tcorchete1 EXP Tcorchete2 Tasigna1 EXP Tptcoma {$$ = new AST_Node("ASIGNACION","ASIGNACION_T2",this._$.first_line,@9.last_column); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("[",$2,this._$.first_line,@2.first_column),$3,new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("[",$5,this._$.first_line,@5.first_column),$6,new AST_Node("]",$7,this._$.first_line,@7.first_column),new AST_Node("=",$8,this._$.first_line,@8.last_column),$9, new AST_Node(";",$10,this._$.first_line,@10.last_column));}
;

ARREGLOS_DEC: PTipo Tid Tcorchete1 Tcorchete2 Tasigna1 Tnew PTipo Tcorchete1 EXP Tcorchete2 Tptcoma {$$=new AST_Node("ARREGLOS_DEC","ARREGLOS_DEC_T1",this._$.first_line,@10.last_column); $$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.first_column),new AST_Node("[",$3,this._$.first_line,@3.first_column),new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("=",$5,this._$.first_line,@5.last_column),new AST_Node("new",$6,this._$.first_line,@6.first_column),new AST_Node("tipo",$7,this._$.first_line,@7.first_column),new AST_Node("[",$8,this._$.first_line,@8.first_column),$9,new AST_Node("]",$10,this._$.first_line,@10.first_column),new AST_Node(";",$11,this._$.first_line,@11.last_column));}
| PTipo Tid Tcorchete1 Tcorchete2 Tcorchete1 Tcorchete2 Tasigna1 Tnew PTipo Tcorchete1 EXP Tcorchete2 Tcorchete1 EXP Tcorchete2 Tptcoma {$$=new AST_Node("ARREGLOS_DEC","ARREGLOS_DEC_T2",this._$.first_line,@15.last_column); $$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.first_column),new AST_Node("[",$3,this._$.first_line,@3.first_column),new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("[",$5,this._$.first_line,@5.first_column),new AST_Node("]",$6,this._$.first_line,@6.first_column),new AST_Node("=",$7,this._$.first_line,@7.last_column),new AST_Node("new",$8,this._$.first_line,@8.first_column),new AST_Node("tipo",$9,this._$.first_line,@9.first_column),new AST_Node("[",$10,this._$.first_line,@10.first_column),$11,new AST_Node("]",$12,this._$.first_line,@12.first_column),new AST_Node("[",$13,this._$.first_line,@13.first_column),$14,new AST_Node("]",$15,this._$.first_line,@15.first_column),new AST_Node(";",$16,this._$.first_line,@16.last_column));}
| PTipo Tid Tcorchete1 Tcorchete2 Tasigna1 Tcorchete1 LIST_EXP Tcorchete2 Tptcoma {$$=new AST_Node("ARREGLOS_DEC","ARREGLOS_DEC_T3",this._$.first_line,@9.last_column); $$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.first_column),new AST_Node("[",$3,this._$.first_line,@3.first_column),new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("=",$5,this._$.first_line,@5.last_column),new AST_Node("[",$6,this._$.first_line,@6.first_column),new AST_Node("LIST_EXP",$7,this._$.first_line,@7.first_column),new AST_Node("]",$8,this._$.first_line,@8.first_column),new AST_Node(";",$9,this._$.first_line,@9.last_column));}
| PTipo Tid Tcorchete1 Tcorchete2 Tcorchete1 Tcorchete2 Tasigna1 Tcorchete1 LIST_DOB Tcorchete2 Tptcoma {$$=new AST_Node("ARREGLOS_DEC","ARREGLOS_DEC_T4",this._$.first_line,@11.last_column); $$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.first_column),new AST_Node("[",$3,this._$.first_line,@3.first_column),new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("[",$5,this._$.first_line,@5.first_column),new AST_Node("]",$6,this._$.first_line,@6.first_column),new AST_Node("=",$7,this._$.first_line,@7.last_column),new AST_Node("[",$8,this._$.first_line,@8.first_column),new AST_Node("LIST_DOB",$9,this._$.first_line,@9.first_column),new AST_Node("]",$10,this._$.first_line,@10.first_column),new AST_Node(";",$11,this._$.first_line,@11.last_column));}
|PTipo Tid Tcorchete1 Tcorchete2 Tasigna1 EXP Tptcoma {$$=new AST_Node("ARREGLOS_DEC","ARREGLOS_DEC_T5",this._$.first_line,@6.last_column); $$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@1.last_column),new AST_Node("id",$2,this._$.first_line,@2.first_column),new AST_Node("[",$3,this._$.first_line,@3.first_column),new AST_Node("]",$4,this._$.first_line,@4.first_column),new AST_Node("=",$5,this._$.first_line,@5.last_column),$6,new AST_Node(";",$7,this._$.first_line,@7.last_column));}
;

LIST_DOB: LIST_DOB Tcoma Tcorchete1 LIST_EXP Tcorchete2 {$$= $1; $1.push($4);}
| Tcorchete1 LIST_EXP Tcorchete2 {$$=[$2];};


LIST_EXP: LIST_EXP Tcoma EXP {$$= $1; $1.push($3); }
| EXP {$$=[$1]; };


FINDEC: Tptcoma {$$ = new AST_Node("FINDEC","FINDEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("ptcoma",$1,this._$.first_line,@1.last_column));}
| Tasigna1 EXP Tptcoma {$$ = new AST_Node("FINDEC","FINDEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("=",$1, this._$.first_line,@1.last_column),$2, new AST_Node(";",$3,this._$.first_line,@3.last_column));}
;

INC_AND_DEC: Tmas Tmas {$$ = new AST_Node("INC_AND_DEC","INC_AND_DEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("++",$1+$2,this._$.first_line,@1.last_column));}
| Tmenos Tmenos {$$ = new AST_Node("INC_AND_DEC","INC_AND_DEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("--",$1+$2,this._$.first_line,@1.last_column));}
;
DECLARACION_1:  ID_LIST  {$$= new AST_Node("DECLARACION","DECLARACION",this._$.first_line,@1.first_column); $$.addChilds($1)};


ID_LIST: ID_LIST Tcoma Tid {$$= new AST_Node("ID_LIST","ID_LIST"); $$.addChilds($1,new AST_Node(",",$2,this._$.first_line,@3.first_column) ,new AST_Node("id",$3,this._$.first_line,@3.first_column));}
        | Tid {$$= new AST_Node("ID_LIST","ID_LIST"); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.first_column))};


BLOQUE: Tllave1 SENTENCIAS Tllave2{$$= new AST_Node("BLOQUE","BLOQUE",this._$.first_line,@1.last_column); $$.addChilds($2)}
        |Tllave1 Tllave2{$$= new AST_Node("BLOQUE","BLOQUE",this._$.first_line,@1.last_column);};

SWITCH: Tswitch Tparbre EXP Tparcierra Tllave1 CASES Tllave2 {$$=new AST_Node("SWITCH","SWITCH",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tswhitch","switch",this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3,new AST_Node(")",")",this._$.first_line,@4.last_column),new AST_Node("{","{",this._$.first_line,@5.first_column),$6,new AST_Node("}","}",this._$.first_line,@7.last_column))}
|Tswitch Tparbre EXP Tparcierra Tllave1 CASES DEFAULT Tllave2 {$$=new AST_Node("SWITCH","SWITCH",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tswhitch","switch",this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3,new AST_Node(")",")",this._$.first_line,@4.last_column),new AST_Node("{","{",this._$.first_line,@5.first_column),$6,$7,new AST_Node("}","}",this._$.first_line,@8.last_column));}
;
CASES: CASES CASE {$$=new AST_Node("CASES","CASES",this._$.first_line,@2.last_column); $$.addChilds($1,$2)}
|CASE {$$=new AST_Node("CASES","CASES",this._$.first_line,@1.last_column); $$.addChilds($1)};

CASE: Tcase EXP Tdospuntos SENTENCIAS {$$=new AST_Node("CASE","CASE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tcase","case",this._$.first_line,@1.last_column),$2,new AST_Node(":",":",this._$.first_line,@3.last_column),$4);}
|Tcase EXP Tdospuntos SENTENCIAS Tsent_trans Tptcoma {$$=new AST_Node("CASE","CASE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tcase","case",this._$.first_line,@1.last_column),$2,new AST_Node(":",":",this._$.first_line,@3.last_column),$4,new AST_Node("Tsentencia_trans",$5,this._$.first_line,@5.last_column),new AST_Node(";",";",this._$.first_line,@6.last_column));}
| Tcase EXP Tdospuntos Tsent_trans Tptcoma {$$=new AST_Node("CASE","CASE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tcase","case",this._$.first_line,@1.last_column),$2,new AST_Node(":",":",this._$.first_line,@3.last_column),new AST_Node("Tsentencia_trans",$4,this._$.first_line,@4.last_column),new AST_Node(";",";",this._$.first_line,@5.last_column));}
| Tcase EXP Tdospuntos {$$=new AST_Node("CASE","CASE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tcase","case",this._$.first_line,@1.last_column),$2,new AST_Node(":",":",this._$.first_line,@3.last_column));}
;

DEFAULT: Tdefault Tdospuntos SENTENCIAS {$$=new AST_Node("DEFAULT","DEFAULT",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tdefault","default",this._$.first_line,@1.last_column),new AST_Node(":",":",this._$.first_line,@2.last_column),$3)}
|Tdefault Tdospuntos {$$=new AST_Node("DEFAULT","DEFAULT",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Tdefault","default",this._$.first_line,@1.last_column),new AST_Node(":",":",this._$.first_line,@2.last_column));}
;

IF: Tif Tparbre EXP Tparcierra BLOQUE    {$$= new AST_Node("IF","IF",this._$.first_line,@1.last_column);$$.addChilds($3,$5)}
    |Tif Tparbre EXP Tparcierra BLOQUE Telse IF {$$= new AST_Node("IF","IF",this._$.first_line,@1.last_column);  $$.addChilds($3,$5,$7)}
    |Tif Tparbre EXP Tparcierra BLOQUE Telse BLOQUE {$$= new AST_Node("IF","IF",this._$.first_line,@1.last_column); var aux = new AST_Node("ELSE","ELSE",this._$.first_line,@6.last_column); aux.addChilds($7);$$.addChilds($3,$5,aux)};

WHILE: Twhile Tparbre EXP Tparcierra BLOQUE{$$=new AST_Node("WHILE","WHILE",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("Twhile","while",this._$.first_line,@1.last_column),new AST_Node("(","(",this._$.first_line,@2.last_column),$3,new AST_Node(")",")",this._$.first_line,@4.last_column),$5)};


DO_WHILE: Tdo BLOQUE Twhile Tparbre EXP Tparcierra {$$=new AST_Node("DO_WHILE","DO_WHILE",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("Tdo",$1,this._$.first_line,@1.last_column),$2,new AST_Node("Twhile",$3,this._$.first_line,@3.last_column),new AST_Node("(",$4,this._$.first_line,@4.last_column),$5,new AST_Node(")",$6,this._$.first_line,@6.last_column))};


PRINT: Tcout Tmenor Tmenor EXP FIN_COUT {$$= new AST_Node("PRINT","PRINT",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("cout",$1,this._$.first_line,@1.last_column),new AST_Node("<<",$2+$3,this._$.first_line,@2.last_column),$4,$5)};

FIN_COUT: Tptcoma {$$= new AST_Node("FIN_COUT","FIN_COUT",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node(";",$1,this._$.first_line,@1.last_column));}
        | Tmenor Tmenor Tendl Tptcoma {$$= new AST_Node("FIN_COUT","FIN_COUT",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("<<",$1+$2,this._$.first_line,@1.last_column),new AST_Node("endl",$3,this._$.first_line,@3.last_column),new AST_Node(";",$4,this._$.first_line,@4.last_column));}
;
EXP: EXP Tmas EXP                    {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmenos EXP                  {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tpor EXP                    {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tdiv EXP                    {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmod EXP                    {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tdiferente EXP              {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tigual EXP                  {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tigualr EXP                 {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmayor EXP                  {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmenor EXP                  {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmayori EXP                 {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tmenori EXP                 {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tand EXP                    {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |EXP Tor EXP                     {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds($1,new AST_Node("op",$2,this._$.first_line,@2.last_column),$3);}
    |Tnot EXP                        {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("op",$1,this._$.first_line,@1.last_column),$2);}
    |To Tparbre EXP Tparcierra   {$$= new AST_Node("TO","TO",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("To",$1,this._$.first_line,@1.last_column),new AST_Node("(",$2,this._$.first_line,@2.last_column),$3, new AST_Node(")",$4,this._$.first_line,@4.last_column));}
    |Tmenos EXP %prec umenos         {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("op",$1,this._$.first_line,@1.last_column),$2);}
    |Tpow Tparbre EXP Tcoma EXP Tparcierra {$$=new AST_Node("EXP","EXP",this._$.first_line,@1.last_column); 
                                            $$.addChilds($3,new AST_Node(",",$4,this._$.first_line,@4.last_column),$5);}
    |EXP Tinterrogacion EXP Tdospuntos EXP  {$$=new AST_Node("TERNARIO","TERNARIO",this._$.first_line,@1.last_column); 
                                            $$.addChilds($1,new AST_Node("?",$2,this._$.first_line,@2.last_column),$3,new AST_Node(":",$4,this._$.first_line,@4.last_column),$5);}
    |Tparbre EXP Tparcierra              {$$=$2}
    | Ttostring Tparbre EXP Tparcierra {$$=new AST_Node("TO_STRING","TO_STRING",this._$.first_line,@1.last_column); 
                                            $$.addChilds(new AST_Node("tostring",$1,this._$.first_line,@1.last_column),new AST_Node("(",$2,this._$.first_line,@2.last_column),$3,new AST_Node(")",$4,this._$.first_line,@4.last_column));}
    |EXP Tpointer Tlength Tparbre Tparcierra {$$=new AST_Node("LENGTH","LENGTH",this._$.first_line,@3.last_column); 
                                            $$.addChilds($1,new AST_Node(".",$2,this._$.first_line,@2.last_column),new AST_Node("length",$3,this._$.first_line,@3.last_column),new AST_Node("(",$4,this._$.first_line,@4.last_column),new AST_Node(")",$5,this._$.first_line,@5.last_column));}
    |LLAMADA_FUNCION {$$ = new AST_Node("LLAMADA","LLAMADA",this._$.first_line,@1.last_column); $$.addChilds($1);}
    | EXP Tpointer Tc_str Tparbre Tparcierra {$$=new AST_Node("C_STR","C_STR",this._$.first_line,@3.last_column); 
                                            $$.addChilds($1,new AST_Node(".",$2,this._$.first_line,@2.last_column),new AST_Node("c_str",$3,this._$.first_line,@3.last_column),new AST_Node("(",$4,this._$.first_line,@4.last_column),new AST_Node(")",$5,this._$.first_line,@5.last_column));}
    |Ttypeof Tparbre EXP Tparcierra {$$=new AST_Node("TYPEOF","TYPEOF",this._$.first_line,@1.last_column); 
                                            $$.addChilds(new AST_Node("typeof",$1,this._$.first_line,@1.last_column),new AST_Node("(",$2,this._$.first_line,@2.last_column),$3,new AST_Node(")",$4,this._$.first_line,@4.last_column));}
    |Tid Tcorchete1 EXP Tcorchete2 {$$ = new AST_Node("ID_ARR","ID_ARR",this._$.first_line,@1.last_column);  $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("[",$2,this._$.first_line,@2.last_column),$3,new AST_Node("]",$4,this._$.first_line,@4.last_column));}
    |Tround Tparbre EXP Tparcierra {$$=new AST_Node("ROUND","ROUND",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("round",$1,this._$.first_line,@1.last_column),new AST_Node("(",$2,this._$.first_line,@2.last_column),$3,new AST_Node(")",$4,this._$.first_line,@4.last_column));}
    |Tid Tcorchete1 EXP Tcorchete2 Tcorchete1 EXP Tcorchete2 {$$ = new AST_Node("ID_ARR_2","ID_ARR_2",this._$.first_line,@1.last_column);  $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column),new AST_Node("[",$2,this._$.first_line,@2.last_column),$3,new AST_Node("]",$4,this._$.first_line,@4.last_column),new AST_Node("[",$5,this._$.first_line,@5.last_column),$6,new AST_Node("]",$7,this._$.first_line,@7.last_column));}
    |Tparbre PTipo Tparcierra EXP  %prec cast   {$$=new AST_Node("CAST","CAST",this._$.first_line,@1.last_column); 
                                            $$.addChilds(new AST_Node("cast",$1+$2+$3,this._$.first_line,@1.last_column),$4);}
    |Tstring                          {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);
                                         var text = $1.substr(0,$1.length);
                                         text=text.replace(/\\n/g,"\n");
                                         text=text.replace(/\\t/g,"\t");
                                         text=text.replace(/\\r/g,"\r");
                                         text=text.replace(/\\\\/g,"\\");
                                         text=text.replace(/\\\"/g,"\"");
                                        $$.addChilds(new AST_Node("string",text,this._$.first_line,@1.last_column));}
    |Tnumero                         {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("numero",$1,this._$.first_line,@1.last_column));}
    |Ttrue                           {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("true",$1,this._$.first_line,@1.last_column));}
    |Tfalse                          {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("false",$1,this._$.first_line,@1.last_column));}
    |Tid                             {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.last_column));}
    |Tchar                             {$$= new AST_Node("EXP","EXP",this._$.first_line,@1.last_column);$$.addChilds(new AST_Node("char",$1,this._$.first_line,@1.last_column));};


    
    