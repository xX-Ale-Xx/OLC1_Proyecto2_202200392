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

"("                      return 'Tparbre'
")"                      return 'Tparcierra'
","                      return 'Tcoma'
"="                      return 'Tasigna1'
"{"                      return 'Tllave1'
"}"                      return 'Tllave2'

"endl"               return 'Tendl'

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


([a-zA-Z])([a-zA-Z0-9])* return 'Tid'
[0-9]+("."[0-9]+)?\b     return 'Tnumero'

                        
\'                   { this.begin('charLiteral'); }
<charLiteral>"\\n"    { return 'Tchar'; }
<charLiteral>"\\t"    { return 'Tchar'; }
<charLiteral>"\\r"    { return 'Tchar'; }
<charLiteral>\\x[0-9a-fA-F]{2} { return 'Tchar'; }
<charLiteral>[^\\\'] { return 'Tchar'; }
<charLiteral>\'    { this.popState(); }

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
%nonassoc 'Tinterrogacion' 'Tdospuntos'
%right 'Tasigna1'
%left  'Tor'
%left  'Tand'
%right 'Tnot' UMINUS 
%left  'Tmayor' 'Tmenor' 'Tmenori' 'Tmayori' 'Tdiferente' 'Tigual' 'Tigualr'
%left  'Tmas' 'Tmenos'
%left  'Tpor' 'Tdiv' 'Tmod'
%nonassoc 'Tpow'
%right 'umenos'


%start S

%%

S: SENTENCIAS EOF {$$=new AST_Node("RAIZ","RAIZ",this.$first_line,@1.last_column);$$.addChilds($1);return $$} ;


SENTENCIAS: SENTENCIAS SENTENCIA {
$$= new AST_Node("SENTENCIAS","SENTENCIAS",this._$.first_line,@2.last_column); $$.addChilds($1,$2)
}
            | SENTENCIA {$$= new AST_Node("SENTENCIAS","SENTENCIAS",this._$.first_line,@1.last_column);
                      $$.addChilds($1);} ;


SENTENCIA:  PTipo DECLARACION_1 FINDEC{$$= new AST_Node("SENTENCIA","SENTENCIA",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("tipo",$1,this._$.first_line,@2.last_column),$2, $3);}
           |BLOQUE{$$=$1}
           |IF{$$=$1}
           |WHILE{$$=$1}
           |DO_WHILE Tptcoma{$$=$1}
           |PRINT{$$=$1}
           |POW Tptcoma{$$=$1};

FINDEC: Tptcoma {$$ = new AST_Node("FINDEC","FINDEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("ptcoma",$1,this._$.first_line,@1.last_column));}
| Tasigna1 EXP Tptcoma {$$ = new AST_Node("FINDEC","FINDEC",this._$.first_line,@1.last_column); $$.addChilds(new AST_Node("=",$1, this._$.first_line,@1.last_column),$2, new AST_Node(";",$3,this._$.first_line,@3.last_column));}
;

DECLARACION_1:  ID_LIST  {$$= new AST_Node("DECLARACION","DECLARACION",this._$.first_line,@1.first_column); $$.addChilds($1)};


ID_LIST: ID_LIST Tcoma Tid {$$= new AST_Node("ID_LIST","ID_LIST"); $$.addChilds($1,new AST_Node(",",$2,this._$.first_line,@3.first_column) ,new AST_Node("id",$3,this._$.first_line,@3.first_column));}
        | Tid {$$= new AST_Node("ID_LIST","ID_LIST"); $$.addChilds(new AST_Node("id",$1,this._$.first_line,@1.first_column))};


BLOQUE: Tllave1 SENTENCIAS Tllave2{$$= new AST_Node("BLOQUE","BLOQUE",this._$.first_line,@1.last_column); $$.addChilds($2)}
        |Tllave1 Tllave2{$$= new AST_Node("BLOQUE","BLOQUE",this._$.first_line,@1.last_column);};


IF: Tif Tparbre EXP Tparcierra BLOQUE    {$$= new AST_Node("IF","IF",this._$.first_line,@1.last_column);$$.addChilds($3,$5)}
    |Tif Tparbre EXP Tparcierra BLOQUE Telse BLOQUE {$$= new AST_Node("IF","IF",this._$.first_line,@1.last_column); var aux = new AST_Node("ELSE","ELSE",this._$.first_line,@6.last_column); aux.addChilds($7);$$.addChilds($3,$5,aux)};

WHILE: Twhile Tparbre EXP Tparcierra BLOQUE{$$=new AST_Node("WHILE","WHILE",this._$.first_line,@1.last_column); $$.addChilds($3,$5)};


DO_WHILE: Tdo BLOQUE Twhile Tparbre EXP Tparcierra {$$=new AST_Node("DO_WHILE","DO_WHILE",this._$.first_line,@1.last_column);$$.addChilds($2,$5)};


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
    |Tmenos EXP %prec umenos         {$$= new AST_Node("EXP","EXP",this._$.first_line,@2.last_column);$$.addChilds(new AST_Node("op",$1,this._$.first_line,@1.last_column),$2);}
    |Tpow Tparbre EXP Tcoma EXP Tparcierra {$$=new AST_Node("EXP","EXP",this._$.first_line,@1.last_column); 
                                            $$.addChilds($3,new AST_Node(",",$4,this._$.first_line,@4.last_column),$5);}
    |EXP Tinterrogacion EXP Tdospuntos EXP  {$$=new AST_Node("TERNARIO","TERNARIO",this._$.first_line,@1.last_column); 
                                            $$.addChilds($1,new AST_Node("?",$2,this._$.first_line,@2.last_column),$3,new AST_Node(":",$4,this._$.first_line,@4.last_column),$5);}
    |Tparbre EXP Tparcierra              {$$=$2}
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
    