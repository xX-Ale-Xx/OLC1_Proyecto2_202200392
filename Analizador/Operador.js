const Pila = require('./Pila');
const ResultadoOp = require('./Resultado');
const Simbolo = require('./Simbolo');
const TS = require('./TS');
const L_Error = require('./L_Error');
const N_Error = require('./N_Error');
class Operador{
    constructor(){

    }

    ejecutar(raiz){
        var Resultado1=null;
        var Resultado2=null;
        var Resultado=null;
        switch (raiz.tag) {
            case "EXP":
                if (raiz.childs.length==3) {
                    Resultado1=this.ejecutar(raiz.childs[0]);
                    Resultado2=this.ejecutar(raiz.childs[2]);
                    var op = raiz.childs[1].value;
                    console.log(op);
                    console.log(Resultado1, "Resultado1");
                    console.log(Resultado2, "Resultado2");
                    switch (op) {
                        case "+":
                        case "-":
                        case ",":
                        case "%":
                        case "*":
                        case "/":
                            return this.aritmetico(Resultado1,Resultado2,raiz.childs[1].fila,raiz.childs[1].columna,op);
                        case "==":
                        case "!=":
                            return this.igualdad(Resultado1,Resultado2,raiz.childs[1].fila,raiz.childs[1].columna,op);
                        case ">":
                        case ">=":
                        case "<":
                        case "<=":
                            return this.relacional(Resultado1,Resultado2,raiz.childs[1].fila,raiz.childs[1].columna,op);
                        case "&&":
                        case "||":
                            return this.logicos(Resultado1,Resultado2,raiz.childs[1].fila,raiz.childs[1].columna,op);
                        default:
                            break;  
                    }
                }else if(raiz.childs.length==2){
                   if(raiz.childs[0].value=="!"){
                       Resultado1=this.ejecutar(raiz.childs[1])
                       if(Resultado1.tipo=="bool"){
                           Resultado= new ResultadoOp();
                           Resultado.tipo="bool"
                           Resultado.valor=!Resultado1.valor
                           return Resultado
                       }
                   }else if(raiz.childs[0].value=="-"){
                    
                    Resultado1=this.ejecutar(raiz.childs[1])
                       if(Resultado1.tipo=="int"){
                           Resultado= new ResultadoOp();
                           Resultado.tipo="int"
                           Resultado.valor=-Resultado1.valor
                           console.log(Resultado, "Resultado");
                           return Resultado
                       }else if(Resultado1.tipo=="double"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="double"
                        Resultado.valor=-Resultado1.valor
                        return Resultado
                    }
                   }
                
                }else{
                    return this.ejecutar(raiz.childs[0]);
                }
                
                break;
            case "TERNARIO":
                Resultado1=this.ejecutar(raiz.childs[2]);
                Resultado2=this.ejecutar(raiz.childs[4]);
                let Resultado3=this.ejecutar(raiz.childs[0]);
                console.log(Resultado1, "Resultado1");
                console.log(Resultado2, "Resultado2");
                console.log(Resultado3, "Resultado3");
                if(Resultado3.tipo=="bool"){
                    console.log("ola1");
                    if(Resultado3.valor){
                    console.log("ola2");
                        return Resultado1;
                    }else{
                    console.log("ola3");
                        return Resultado2;
                    }
                }
                break;
            case "id":
                    Resultado = new ResultadoOp();
                    let simbolo= TS.getInstance().obtener(raiz.value);
                    Resultado.tipo=simbolo.tipo;
                    Resultado.valor=simbolo.valor;
                    console.log(raiz.value, "ola");
                    return Resultado;
                
            case "numero":
                    Resultado= new ResultadoOp();
                    if(raiz.value.includes(".")){
                        Resultado.tipo="double";
                        Resultado.valor=parseFloat(raiz.value);
                        return Resultado
                    }else{
                        Resultado.tipo="int";
                        Resultado.valor=parseInt(raiz.value);
                        return Resultado
                    }
                    
            case "true":
                    Resultado= new ResultadoOp();
                    Resultado.tipo="bool";
                    Resultado.valor=true;
                    return Resultado;

                
            case "false":
                    Resultado= new ResultadoOp();
                    Resultado.tipo="bool";
                    Resultado.valor=false;
                    return Resultado;

            case "string":
                    Resultado= new ResultadoOp();
                    Resultado.tipo="std::string";
                    Resultado.valor=raiz.value;
                    return Resultado;
            case "char":
                Resultado= new ResultadoOp();
                Resultado.tipo="char";
                Resultado.valor=raiz.value;
                return Resultado;
            default:
                break;
        }

    }

    logicos(R1,R2,fila,columna,op){
            let tipo1 = R1.tipo;
            let tipo2 = R2.tipo;
            var res = new ResultadoOp();
            if(tipo1=="error"||tipo2=="error"){
                res.tipo="error";
                return res;
            }

            if(tipo1=="bool" && tipo2=="bool"){
                res.tipo="bool"
                switch(op){
                    case "&&":
                        res.valor=R1.valor&&R2.valor
                        return res;
                    case "||":
                        res.valor=R1.valor||R2.valor;
                        return res;
                }
            }


        }

    aritmetico(R1,R2,fila,columna,op){
            
            let tipo1 = R1.tipo;
            let tipo2 = R2.tipo;
            var res = new ResultadoOp();
            if(tipo1=="error"||tipo2=="error"){
                res.tipo="error";
                return res;
            }
            switch(op){
                case "+":
                    switch(tipo1){
                        case "int":
                            switch(tipo2){
                                case "int":
                                    res.tipo="int";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "std::string":
                                    res.tipo="std::string";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "bool":
                                    res.tipo="int";
                                    res.valor=R1.valor+R2.valor;
                                    return res;   
                                case "char":
                                    res.tipo="int";
                                    res.valor=R1.valor+R2.valor.charCodeAt(0);
                                    return res; 
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                            }
                        case "double":
                            switch(tipo2){
                                case "int":
                                case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "std::string":
                                    res.tipo="std::string";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "bool":
                                    res.tipo="double";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                case "char":
                                    res.tipo="double";
                                    res.valor=R1.valor+R2.valor.charCodeAt(0);
                                    return res;    
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                        return res;
                            }
                            case "bool":
                                switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor+R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor+R2.valor;
                                        return res;
                                    case "std::string":
                                        res.tipo="std::string";
                                        res.valor=R1.valor+R2.valor;
                                        return res;   
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                            return res;
                                }
                        case "std::string":
                            switch(tipo2){
                                case "int":
                                case "double":
                                case "bool":
                                case "char":
                                case "std::string":
                                    res.tipo="std::string";
                                    res.valor=R1.valor+R2.valor;
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                            }

                            case "char":
                                switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor.charCodeAt(0)+R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor.charCodeAt(0)+R2.valor;
                                        return res;
                                    case "std::string":
                                        res.tipo="std::string";
                                        res.valor=R1.valor+R2.valor;
                                        return res;   
                                    case "char":
                                        res.tipo="std::string";
                                        res.valor=R1.valor+R2.valor;
                                        return res; 
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                }
                        default:
                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                            res.tipo="error";
                            res.valor="error";
                            return res;
                        
                    
                    
                    }
                
                case "-":
                    switch(tipo1){
                        case "int":
                            switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor-R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor-R2.valor;
                                        return res;
                                    case "bool":
                                        res.tipo="int";
                                        res.valor=R1.valor-R2.valor;
                                        return res;
                                    case "char":
                                        res.tipo="int";
                                        res.valor=R1.valor-R2.valor.charCodeAt(0);
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                }
                        case "double":
                            switch(tipo2){
                                case "int":
                                case "bool":
                                case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor-R2.valor;
                                    return res;
                                case "char":
                                    res.tipo="double";
                                    res.valor=R1.valor-R2.valor.charCodeAt(0);
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                                }
                        case "bool":
                            switch(tipo2){
                               case "int":
                                    res.tipo="int";
                                    res.valor=R1.valor-R2.valor;
                                    return res;
                                case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor-R2.valor;
                                    return res;
                                    
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                                    }
                        case "char":
                             switch(tipo2){
                                    case "int":
                                    res.tipo="int";
                                    res.valor=R1.valor.charCodeAt(0)-R2.valor;
                                    return res;
                             case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor.charCodeAt(0)-R2.valor;
                                    return res;
                                                
                            default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                                }
                        default:
                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                            res.tipo="error";
                            res.valor="error";
                            return res;
                        }
                case ",":
                    switch(tipo1){
                        case "int":
                            switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor**R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor**R2.valor;
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                }
                        case "double":
                            switch(tipo2){
                                case "int":
                                case "double":
                                    res.tipo="double";
                                    res.valor=R1.valor**R2.valor;
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                    return res;
                                }
                        default:
                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                            res.tipo="error";
                            res.valor="error";
                            return res;
                        }
                case "*":
                        switch(tipo1){
                            case "int":
                                switch(tipo2){
                                        case "int":
                                            res.tipo="int";
                                            res.valor=R1.valor*R2.valor;
                                            return res;
                                        case "double":
                                            res.tipo="double";
                                            res.valor=R1.valor*R2.valor;
                                            return res;
                                        case "char":
                                            res.tipo="int";
                                            res.valor=R1.valor*R2.valor.charCodeAt(0);
                                            return res;
                                        default:
                                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                            res.tipo="error";
                                            res.valor="error";
                                            return res;
                                    }
                            case "double":
                                switch(tipo2){
                                    case "int":
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor*R2.valor;
                                        return res;
                                    case "char":
                                        res.tipo="double";
                                        res.valor=R1.valor*R2.valor.charCodeAt(0);
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                    }
                            case "char":
                                switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor.charCodeAt(0)*R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor.charCodeAt(0)*R2.valor;
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                    }
                            default:
                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                res.tipo="error";
                                res.valor="error";
                                return res;
                            }
                case "/":
                        switch(tipo1){
                            case "int":
                                switch(tipo2){
                                        case "int":
                                            res.tipo="int";
                                            res.valor=R1.valor/R2.valor;
                                            return res;
                                        case "double":
                                            res.tipo="double";
                                            res.valor=R1.valor/R2.valor;
                                            return res;
                                        case "char":
                                            res.tipo="int";
                                            res.valor=R1.valor/R2.valor.charCodeAt(0);
                                            return res;
                                        default:
                                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                            res.tipo="error";
                                            res.valor="error";
                                            return res;
                                    }
                            case "double":
                                switch(tipo2){
                                    case "int":
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor/R2.valor;
                                        return res;
                                    case "char":
                                        res.tipo="double";
                                        res.valor=R1.valor/R2.valor.charCodeAt(0);
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                    }
                            case "char":
                                switch(tipo2){
                                    case "int":
                                        res.tipo="int";
                                        res.valor=R1.valor.charCodeAt(0)/R2.valor;
                                        return res;
                                    case "double":
                                        res.tipo="double";
                                        res.valor=R1.valor.charCodeAt(0)/R2.valor;
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                    }
                            default:
                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                res.tipo="error";
                                res.valor="error";
                                return res;
                            }

                            case "%":
                                switch(tipo1){
                                    case "int":
                                        switch(tipo2){
                                                case "int":
                                                    res.tipo="double";
                                                    res.valor=R1.valor%R2.valor;
                                                    return res;
                                                case "double":
                                                    res.tipo="double";
                                                    res.valor=R1.valor%R2.valor;
                                                    return res;
                                                default:
                                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                                    res.tipo="error";
                                                    res.valor="error";
                                                    return res;
                                            }
                                    case "double":
                                        switch(tipo2){
                                            case "int":
                                            case "double":
                                                res.tipo="double";
                                                res.valor=R1.valor%R2.valor;
                                                return res;
                                            default:
                                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                                res.tipo="error";
                                                res.valor="error";
                                                return res;
                                            }
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                    }

            }
            
        }



    relacional(R1,R2,fila,columna,op){
        let tipo1 = R1.tipo;
        let tipo2 = R2.tipo;
        var res = new ResultadoOp();
        if(tipo1=="error"||tipo2=="error"){
            res.tipo="error";
            return res;
        }
        switch(op){
            case ">":
                switch(tipo1){
                    case "int":
                    case "double":
                        switch(tipo2){
                            case "int":
                            case "double":
                                res.tipo="bool";
                                res.valor=R1.valor>R2.valor;
                                return res;
                            default:
                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                res.tipo="error";
                                res.valor="error";
                                    return res;
                        }
                    default:
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                        res.tipo="error";
                        res.valor="error";
                        return res;
                }
                case "<":
                    switch(tipo1){
                        case "int":
                        case "double":
                            switch(tipo2){
                                case "int":
                                case "double":
                                    res.tipo="bool";
                                    res.valor=R1.valor<R2.valor;
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                        return res;
                            }
                        default:
                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                            res.tipo="error";
                            res.valor="error";
                            return res;
                    }
                case ">=":
                        switch(tipo1){
                            case "int":
                            case "double":
                                switch(tipo2){
                                    case "int":
                                    case "double":
                                        res.tipo="bool";
                                        res.valor=R1.valor>=R2.valor;
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                            return res;
                                }
                            default:
                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                res.tipo="error";
                                res.valor="error";
                                return res;
                        }
                case "<=":
                                switch(tipo1){
                                    case "int":
                                    case "double":
                                        switch(tipo2){
                                            case "int":
                                            case "double":
                                                res.tipo="bool";
                                                res.valor=R1.valor<=R2.valor;
                                                return res;
                                            default:
                                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                                res.tipo="error";
                                                res.valor="error";
                                                    return res;
                                        }
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                        return res;
                                }
                               
        }

    }

    igualdad(R1,R2,fila,columna,op){
        let tipo1 = R1.tipo;
        let tipo2 = R2.tipo;
        var res = new ResultadoOp();
        if(tipo1=="error"||tipo2=="error"){
            res.tipo="error";
            return res;
        }
        switch(op){
            case "==":
                res.tipo="bool";
                res.valor=R1.valor==R2.valor
                return res;
            case "!=":
                res.tipo="bool";
                res.valor=R1.valor!=R2.valor;
                return res;
        }

    }

        verificarrelacional(tipo1,tipo2){
            switch(tipo1){
                case "int":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default:
                            return false;
                    }
                case "double":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default: return false;

                    }
                case "char":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default: return false;
                    }

            }
        }
        verificarigualdad(tipo1,tipo2){
            switch(tipo1){
                case "int":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default:
                            return false;
                    }
                case "double":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default: return false;

                    }
                case "char":
                    switch(tipo2){
                        case "int":
                        case "double":
                        case "char":
                            return true;
                        default: return false;
                    }
                case "bool":
                    switch(tipo2){
                        case "bool":
                            return true;
                        default: return false;
                    }
            }
        }


        castearnumero(R1,pila){
            var temp0=Generador.getInstance().getTemp();
            var temp1=Generador.getInstance().getTemp();
            R1.codigo+=Generador.getInstance().makecomentario("Procesando casteo de "+R1.tmp);
            R1.codigo+=Generador.getInstance().makeasignacion(R1.tmp,temp0);
            R1.codigo+=Generador.getInstance().getfromP(temp1,(pila.size+2));
            R1.codigo+=Generador.getInstance().changestack(temp1,temp0);
            R1.codigo+=Generador.getInstance().incP(pila.size);
            R1.codigo+=Generador.getInstance().makecall('obtenerCadena_');
            R1.codigo+=Generador.getInstance().getfromStack('P',temp0);
            R1.codigo+=Generador.getInstance().make3d('+',temp0,'4',temp0);
            R1.codigo+=Generador.getInstance().decP(pila.size);
            R1.tmp=temp0;
            return R1;
        }

        procesarcadena(temporal,nombre_cad){
            var codigo="";
            var temp1 = Generador.getInstance().getTemp();
            var temp2 = Generador.getInstance().getTemp();
            var etq0 = Generador.getInstance().getEtq();
            var etq1 = Generador.getInstance().getEtq();
            var etq2 = Generador.getInstance().getEtq();
            codigo+=Generador.getInstance().makecomentario("Procesando cadena: "+nombre_cad);
            codigo+=Generador.getInstance().makeasignacion(temporal,temp1);
            codigo+=Generador.getInstance().getheap(temp1,temp2);
            codigo+=etq0+":\n";
            codigo+=Generador.getInstance().jmpcondicional(temp2,"<>","-1",etq1);
            codigo+=Generador.getInstance().jmpincondicional(etq2);
            codigo+=etq1+":\n";
            codigo+=Generador.getInstance().changeheap('H',temp2);
            codigo+=Generador.getInstance().incheap('1');
            codigo+=Generador.getInstance().make3d("+",temp1,"1",temp1);
            codigo+=Generador.getInstance().getheap(temp1,temp2);
            codigo+=Generador.getInstance().jmpincondicional(etq0);
            codigo+=etq2+": \n";
            return codigo;
        }
    }

    module.exports = Operador;