const Pila = require('./Pila');
const ResultadoOp = require('./Resultado');
const Simbolo = require('./Simbolo');
const TS = require('./TS');
const L_Error = require('./L_Error');
const N_Error = require('./N_Error');
class Operador{
    constructor(){

    }

    ejecutar(raiz, pila){
        var Resultado1=null;
        var Resultado2=null;
        var Resultado=null;
        switch (raiz.tag) {
            case "EXP":
                if (raiz.childs.length==3) {
                    Resultado1=this.ejecutar(raiz.childs[0], pila);
                    Resultado2=this.ejecutar(raiz.childs[2], pila);
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
                       Resultado1=this.ejecutar(raiz.childs[1], pila)
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
                    return this.ejecutar(raiz.childs[0], pila);
                }
                
                break;
            case "CAST":
                Resultado1=this.ejecutar(raiz.childs[1], pila);
                let tipo = raiz.childs[0].value.toLowerCase();
                let tipo1 = Resultado1.tipo;
                if(tipo=="(int)"){
                    if(tipo1=="int"||tipo1=="double"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="int";
                        Resultado.valor=parseInt(Resultado1.valor);
                        return Resultado;
                    }else if(tipo1 == "char"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="int";
                        Resultado.valor=Resultado1.valor.charCodeAt(0);
                        return Resultado;
                    }
                    else{ 
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible castear de: "+tipo1 +' a '+tipo,raiz.childs[0].fila,raiz.childs[0].columna));
                        Resultado= new ResultadoOp();
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                }else if(tipo == "(double)"){
                    if(tipo1=="int" || tipo1=="double"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="double";
                        Resultado.valor=parseFloat(Resultado1.valor);
                        return Resultado;

                    }else if(tipo1 == "char"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="double";
                        Resultado.valor=parseFloat(Resultado1.valor.charCodeAt(0));
                        return Resultado;

                    }else{ 
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible castear de: "+tipo1 +' a '+tipo,raiz.childs[0].fila,raiz.childs[0].columna));
                        Resultado= new ResultadoOp();
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                }
                else if(tipo == "(char)"){
                    if(tipo1=="int"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="char";
                        Resultado.valor=String.fromCharCode(Resultado1.valor);
                        return Resultado;

                    }else if(tipo1 == "char"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="char";
                        Resultado.valor=Resultado1.valor;
                        return Resultado;

                    }else{
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible castear de: "+tipo1 +' a '+tipo,raiz.childs[0].fila,raiz.childs[0].columna));
                        Resultado= new ResultadoOp();
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                }else if(tipo == "(std::string)"){
                    console.log(Resultado1, "tipo1");
                    if(tipo1=="int" || tipo1=="double" || tipo1=="std::string"){
                        Resultado= new ResultadoOp();
                        Resultado.tipo="std::string";
                        Resultado.valor=String(Resultado1.valor);
                        return Resultado;
                    }else{
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible castear de: "+tipo1 +' a '+tipo,raiz.childs[0].fila,raiz.childs[0].columna));
                        Resultado= new ResultadoOp();
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                }

            case "ID_ARR":
                Resultado = new ResultadoOp();
                let val = this.ejecutar(raiz.childs[2], pila);
                    let simb= TS.getInstance().obtener(raiz.childs[0].value, pila);
                    if(simb!=null){
                if(val.tipo == "int"){
                    Resultado.tipo= simb.tipo;
                    Resultado.valor=simb.valor[val.valor];
                    return Resultado;
                }else{
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+val.tipo,raiz.fila,columna.fila));
                        res.tipo="error";
                        res.valor="error";
                            return res;
                    }
                }else{
                        L_Error.getInstance().insertar(new N_Error("Semantico","No existe el simbolo: "+raiz.childs[0].value,raiz.fila,raiz.columna));
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                break;
                case "ID_ARR_2":
                    Resultado = new ResultadoOp();
                    let valorBuscar = this.ejecutar(raiz.childs[2], pila);
                    let valorBuscar2 = this.ejecutar(raiz.childs[5], pila);
                        let simboloBuscar= TS.getInstance().obtener(raiz.childs[0].value, pila);
                        if(simboloBuscar!=null){
                        if(valorBuscar.tipo == "int" && valorBuscar2.tipo == "int"){
                        Resultado.tipo= simboloBuscar.tipo;
                        Resultado.valor=simboloBuscar.valor[valorBuscar.valor][valorBuscar2.valor];
                        return Resultado;
                        }else{
                            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+val.tipo,raiz.fila,columna.fila));
                            res.tipo="error";
                            res.valor="error";
                                return res;
                        }}else{
                            L_Error.getInstance().insertar(new N_Error("Semantico","No existe el simbolo: "+raiz.childs[0].value,raiz.fila,raiz.columna));
                            Resultado.tipo="error";
                            Resultado.valor="error";
                            return Resultado;
                        }
                    break;
            case "TERNARIO":
                Resultado1=this.ejecutar(raiz.childs[2], pila);
                Resultado2=this.ejecutar(raiz.childs[4], pila);
                let Resultado3=this.ejecutar(raiz.childs[0], pila);
                console.log(Resultado1, "Resultado1");
                console.log(Resultado2, "Resultado2");
                console.log(Resultado3, "Resultado3");
                if(Resultado3.tipo=="bool"){
                   
                    if(Resultado3.valor){
                    
                        return Resultado1;
                    }else{
                    
                        return Resultado2;
                    }
                }
                break;
            case "LLAMADA":
                let simbol = TS.getInstance().obtenerSinAmbito(raiz.childs[0].childs[0].value);
                console.log("entre");
                console.log(raiz.childs[0].childs[0].value, "este simbolo busca");
               console.log(simbol);
               pila.recorrerPila();
               
                if(simbol!=null){
                    
                    let newAmbito = new Pila(raiz.childs[0].childs[0].value);
                    global.funcionActual = raiz.childs[0].childs[0].value;
                    pila.push(newAmbito);
                    let funcion = this.recorrerParaFuncion(raiz.childs[0], pila);
                    if(funcion.childs[2].tag != "ID_LIST"){
                    global.inter.analizarFuncion(funcion, pila);
                    if(global.valorRetorno!=null){
                        global.ret = false;
                        Resultado = global.valorRetorno;
                        console.log(global.valorRetorno,"mira este valor de retorno");
                        console.log(Resultado, "mira este resultado--------------");
                        global.valorRetorno = null;
                        if(simbol.tipo== Resultado.tipo){
                        TS.getInstance().borrarPorAmbito(raiz.childs[0].childs[0].value);
                        pila.pop();
                        
                        return Resultado;
                        }else{
                            Resultado= new ResultadoOp();
                            Resultado.tipo="null";
                            Resultado.valor=null;
                            pila.pop();
                            global.ret = false;
                            L_Error.getInstance().insertar(new N_Error("Semantico","El tipo de retorno no coincide con el tipo de la funcion",raiz.fila,raiz.columna));
                            return Resultado;
                                        
                        }
                    }else{
                    Resultado= new ResultadoOp();
                    Resultado.tipo="null";
                    Resultado.valor=null;
                    pila.pop();
                    global.ret = false;
                    return Resultado;
                        
                    }}else{

                        let s;
                        let p = 0;
                        let simAct;
                        
                        for(const ñ of funcion.childs[2].result){
                            s = this.ejecutar(ñ, pila);
                            console.log(s);
                            let v = simbol.parametros[p];
                            simAct = new Simbolo(v.id, v.tipo, s.valor, s.tamaño1, s.tamaño2);
                            TS.getInstance().insertar(simAct);
                            p++;
                        }

                        global.inter.analizarFuncion(funcion, pila);
                        if(global.valorRetorno!=null){
                            global.ret = false;
                            Resultado = global.valorRetorno;
                            console.log(global.valorRetorno,"mira este valor de retorno");
                            console.log(Resultado, "mira este resultado--------------");
                            global.valorRetorno = null;
                            if(simbol.tipo== Resultado.tipo){
                            TS.getInstance().borrarPorAmbito(raiz.childs[0].childs[0].value);
                            pila.pop();
                            return Resultado;
                            }else{
                                Resultado= new ResultadoOp();
                                Resultado.tipo="null";
                                Resultado.valor=null;
                                pila.pop();
                                global.ret = false;
                                L_Error.getInstance().insertar(new N_Error("Semantico","El tipo de retorno no coincide con el tipo de la funcion",raiz.fila,raiz.columna));
                                return Resultado;
                                            
                            }
                        }else{
                        Resultado= new ResultadoOp();
                        Resultado.tipo="null";
                        Resultado.valor=null;
                        pila.pop();
                        global.ret = false;
                        return Resultado;
                            
                        }


                    }
                }
                break;

            case "TO":
                Resultado1=this.ejecutar(raiz.childs[2], pila);
                if(Resultado1.tipo.toLowerCase() == "std::string"){
                    if(raiz.childs[0].value.toLowerCase() == "tolower"){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="std::string";
                    Resultado.valor=Resultado1.valor.toLowerCase();
                    return Resultado;
                    }else if(raiz.childs[0].value.toLowerCase() == "toupper"){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="std::string";
                    Resultado.valor=Resultado1.valor.toUpperCase();
                    return Resultado;
                    }
                }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+Resultado1.tipo,raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                        return res;
                }
                break;
            case "ROUND":
                Resultado1=this.ejecutar(raiz.childs[2], pila);
                if(Resultado1.tipo.toLowerCase() == "double" || Resultado1.tipo.toLowerCase() == "int"){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="int";
                    Resultado.valor=Math.round(Resultado1.valor);
                    return Resultado;
                }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+Resultado1.tipo,raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                    return res;
                }

                break;
            case "LENGTH":
                Resultado1=this.ejecutar(raiz.childs[0], pila);
                try{
                    if(Array.isArray(Resultado1.valor) || Resultado1.tipo.toLowerCase() == "std::string"){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="int";
                    Resultado.valor=Resultado1.valor.length;
                    return Resultado;
                    }else{
                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+Resultado1.tipo,raiz.fila,columna.fila));
                        res.tipo="error";
                        res.valor="error";
                        return res;
                    }
                }catch(e){
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+Resultado1.tipo,raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                    return res;
                }
                break;
            case "TYPEOF":
                Resultado1=this.ejecutar(raiz.childs[2], pila);
                if(Resultado1!=null){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="std::string";
                    Resultado.valor=Resultado1.tipo;
                    return Resultado;
                }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con un null",raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                    return res;
                }
                break;
            case "TO_STRING":
                Resultado1=this.ejecutar(raiz.childs[2], pila);
                if(Resultado1 != null){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="std::string";
                    Resultado.valor=String(Resultado1.valor);
                    return Resultado;
                }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con un null",raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                    return res;
                }
                break;

            case "C_STR":
                Resultado1=this.ejecutar(raiz.childs[0], pila);
                
                if(Resultado1.tipo.toLowerCase() == "std::string"){
                    Resultado= new ResultadoOp();
                    Resultado.tipo="char";
                    Resultado.valor=Resultado1.valor.split("");
                    
                    return Resultado;
                }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion con: "+Resultado1.tipo,raiz.fila,columna.fila));
                    res.tipo="error";
                    res.valor="error";
                    return res;
                }
                break;
            case "id":
                    Resultado = new ResultadoOp();
                    let simbolo= TS.getInstance().obtener(raiz.value, pila);
                    
                    if(simbolo!=null){
                    Resultado.tipo=simbolo.tipo;
                    Resultado.valor=simbolo.valor;
                    
                    return Resultado;
                    }else{  
                        L_Error.getInstance().insertar(new N_Error("Semantico","No existe el simbolo: "+raiz.value,raiz.fila,raiz.columna));
                        Resultado.tipo="error";
                        Resultado.valor="error";
                        return Resultado;
                    }
                
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


    recorrerParaFuncion(raiz, pila){
        let op;
        let res;
        let simbolo;
        
        if(raiz===undefined || raiz===null)return;
        for(const hijo of raiz.childs){
        
        this.recorrerParaFuncion(hijo, pila);
         
        }
        if(raiz.tag == "LLAMADA_FUNCION" && raiz.childs[2].childs.length == 1){
    
            return raiz;
        
          }if(raiz.tag == "LLAMADA_FUNCION" && raiz.length == 4){
            return raiz;
          }else if(raiz.tag == "VALORES" && raiz.childs.length == 1){
            return;
          }else if(raiz.tag == "VALORES" && raiz.childs.length == 2){
            raiz.result = raiz.childs[0].result;
            
          }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 2){
            let list = [];
            list.push({tipo: raiz.childs[0].value.toLowerCase(), id: raiz.childs[1].value});
            raiz.result = list;
          }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 4){
            let list = raiz.childs[0].result;
            console.log("esta es la lista "+ list);
            list.push({tipo: raiz.childs[2].value.toLowerCase(), id: raiz.childs[3].value});
            raiz.result = list;
        
          }else if(raiz.tag == "LIST_P" && raiz.childs.length == 1){
            let list = [];
            list.push(raiz.childs[0]);
            raiz.result = list;
          }else if(raiz.tag == "LIST_P" && raiz.childs.length == 3){
            let list = raiz.childs[0].result;
            console.log("esta es la lista "+ list);
            list.push(raiz.childs[2]);
            raiz.result = list;
        
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
                            case "char":
                                res.tipo="bool";
                                res.valor=R1.valor>R2.valor.charCodeAt(0);
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
                                case "double":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)>R2.valor;
                                    return res;
                                case "char":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)>R2.valor.charCodeAt(0);
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                        return res;
                            }
                            case "std::string":
                                switch(tipo2){
                                    case "std::string":
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
                                case "char":
                                    res.tipo="bool";
                                    res.valor=R1.valor<R2.valor.charCodeAt(0);
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
                                    case "double":
                                        res.tipo="bool";
                                        res.valor=R1.valor.charCodeAt(0)<R2.valor;
                                        return res;
                                    case "char":
                                        res.tipo="bool";
                                        res.valor=R1.valor.charCodeAt(0)<R2.valor.charCodeAt(0);
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                            return res;
                                }
                            case "std::string":
                                switch(tipo2){
                                    case "std::string":
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
                                    case "char":
                                        res.tipo="bool";
                                        res.valor=R1.valor>=R2.valor.charCodeAt(0);
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
                                    case "double":
                                        res.tipo="bool";
                                        res.valor=R1.valor.charCodeAt(0)>=R2.valor;
                                        return res;
                                    case "char":
                                        res.tipo="bool";
                                        res.valor=R1.valor.charCodeAt(0)>=R2.valor.charCodeAt(0);
                                        return res;
                                    default:
                                        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                        res.tipo="error";
                                        res.valor="error";
                                            return res;
                                }
                            case "std::string":
                                switch(tipo2){
                                    case "std::string":
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
                                            case "char":
                                                res.tipo="bool";
                                                res.valor=R1.valor<=R2.valor.charCodeAt(0);
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
                                            case "double":
                                                res.tipo="bool";
                                                res.valor=R1.valor.charCodeAt(0)<=R2.valor;
                                                return res;
                                            case "char":
                                                res.tipo="bool";
                                                res.valor=R1.valor.charCodeAt(0)<=R2.valor.charCodeAt(0);
                                                return res;
                                            default:
                                                L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                                res.tipo="error";
                                                res.valor="error";
                                                return res;
                                            
                                        }
                                    case "std::string":
                                        switch(tipo2){
                                            case "std::string":
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
                switch(tipo1){
                    case "int":
                    case "double":
                        switch(tipo2){
                            case "int":
                            case "double":
                                res.tipo="bool";
                                res.valor=R1.valor==R2.valor;
                                console.log(res, "res");
                                return res;
                            case "char":
                                res.tipo="bool";
                                res.valor=R1.valor==R2.valor.charCodeAt(0);
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
                                case "double":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)==R2.valor;
                                    return res;
                                case "char":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)==R2.valor.charCodeAt(0);
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                        return res;
                            }
                            case "std::string":
                                switch(tipo2){
                                    case "std::string":
                                        res.tipo="bool";
                                        res.valor=R1.valor==R2.valor;
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
            case "!=":
                switch(tipo1){
                    case "int":
                    case "double":
                        switch(tipo2){
                            case "int":
                            case "double":
                                res.tipo="bool";
                                res.valor=R1.valor!=R2.valor;
                                return res;
                            case "char":
                                res.tipo="bool";
                                res.valor=R1.valor!=R2.valor.charCodeAt(0);
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
                                case "double":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)!=R2.valor;
                                    return res;
                                case "char":
                                    res.tipo="bool";
                                    res.valor=R1.valor.charCodeAt(0)!=R2.valor.charCodeAt(0);
                                    return res;
                                default:
                                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible operacion entre: "+tipo1 +' % '+tipo2,fila,columna));
                                    res.tipo="error";
                                    res.valor="error";
                                        return res;
                            }
                            case "std::string":
                                switch(tipo2){
                                    case "std::string":
                                        res.tipo="bool";
                                        res.valor=R1.valor!=R2.valor;
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