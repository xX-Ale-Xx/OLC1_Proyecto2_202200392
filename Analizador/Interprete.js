const Pila = require('./Pila');
const Operador = require('./Operador');
const ResultadoOp = require('./Resultado');
const Simbolo = require('./Simbolo');
const TS = require('./TS');
const L_Error = require('./L_Error');
const N_Error = require('./N_Error');
global.cod = "";
global.br = false;
global.cont = false;
global.ret = false;
global.valorRetorno = null;
global.funcionActual = "global";
class Interprete{
 
  constructor(){
    this.global = new Pila("global");
    this.mglobal = [];
    this.estructuras=[];
  }

  analizar(raiz){
    this.global.push(new Pila("global"));
    this.global.push(new Pila("global1"));
    this.guardarFunciones(raiz,this.global);
    this.interpretarGlobal(raiz,this.global,null);
    this.buscarEXEC(raiz);
    
  }


  buscarEXEC(raiz){
    if(raiz===undefined || raiz===null)return;
    for(const hijo of raiz.childs){
    this.buscarEXEC(hijo);
    }

    if(raiz.tag == "SENTENCIA_EXECUTE"){
      this.interpretar(raiz.childs[1],this.global,null);
      return;
    }

  }

  analizarFuncion(raiz, pila){
    this.interpretar(raiz,pila,null);
  }

  generar_arreglo_valores(tipo, lista, pila){
    let op;
    let arr = [];
    op = new Operador();
    for(const val of lista){
      let valor = op.ejecutar(val, pila);
      if(valor.tipo == tipo || (tipo == "double" && valor.tipo == "int")){
        arr.push(valor.valor);
      }else{
        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + valor.tipo + " a  un "+ tipo ,val.fila,val.columna ));
        return "error";
      }
    }
    return arr;
  }

  generar_arreglo(tipo, tamaño){
    let val;
    switch(tipo){
      case "int":
        val = 0;
        break;
      case "double":
        val = 0.0;
        break;
      case "char":
        val = '\u0000';
        break;
      case "std::string":
        val = "";
        break;
      case "bool":
        val = true;
        break;
    } 

    let new_arr = new Array(tamaño).fill(val);
    return new_arr;

  }

  interpretar(raiz, pila){
    let op;
    let res;
    let simbolo;
    
    if(raiz===undefined || raiz===null)return;
    for(const hijo of raiz.childs){
      if(global.br){
        break;
      }else if(global.cont){
        global.cont = false;
        break;
      }else if(global.ret){
        break;
      }
     if(raiz.tag != "IF" &&raiz.tag != "LLAMADA"&& raiz.tag != "SWITCH" && raiz.tag != "WHILE" && raiz.tag != "DO_WHILE"&& raiz.tag != "FOR" && raiz.tag != "FUNCION" && raiz.tag != "LLAMADA_FUNCION"){
       this.interpretar(hijo, pila);
     }
    }

    if(raiz.tag == "RAIZ"){
      console.log(raiz.tag);
      raiz.result = raiz.childs[0].result;
    } else if(raiz.tag == "SENTENCIAS" && raiz.childs.length==1){
      console.log(raiz.tag);
      raiz.result = raiz.childs[0].result;
    } else if(raiz.tag == "SENTENCIAS" && raiz.childs.length==2){
      console.log(raiz.tag);
      raiz.result = raiz.childs[0] + raiz.childs[1].result;
    }else if(raiz.tag == "FINDEC" && raiz.childs.length==1){
      console.log(raiz.tag);
      raiz.result = raiz.childs[0].result;
    }else if(raiz.tag == "FINDEC" && raiz.childs.length==3){
      op = new Operador();
     raiz.result = op.ejecutar(raiz.childs[1], pila);
    console.log(raiz.result);
    }else if(raiz.tag == "DECLARACION"){
      console.log(raiz.tag);
        raiz.result = raiz.childs[0].result;
    }else if(raiz.tag == "ID_LIST" && raiz.childs.length==1){
      console.log(raiz.tag);
      let list = [];
      list.push(raiz.childs[0].value);
      raiz.result = list;
    }else if (raiz.tag == "ID_LIST" && raiz.childs.length==3){
      console.log(raiz.tag);
      raiz.childs[0].result.push(raiz.childs[2].value);
      console.log(raiz.childs[0].result);
      raiz.result = raiz.childs[0].result;
    }else if(raiz.tag == "DEC_VAR"){
      let value = null;
      if(raiz.childs[2].childs.length != 1){
        value = raiz.childs[2].result;
      }else if(raiz.childs[0].value.toLowerCase() == "int"){
        value = new ResultadoOp();
        value.valor = 0;
        value.tipo = "int";
      }else if(raiz.childs[0].value.toLowerCase() == "double"){
        value = new ResultadoOp();
        value.valor = 0.0;
        value.tipo = "double";
      }else if(raiz.childs[0].value.toLowerCase() == "char"){
        value = new ResultadoOp();
        value.valor = '\u0000';
        value.tipo = "char";
      }else if(raiz.childs[0].value.toLowerCase() == "std::string"){
        value = new ResultadoOp();
        value.valor = "";
        value.tipo = "std::string";
      }else if(raiz.childs[0].value.toLowerCase() == "bool"){
        value = new ResultadoOp();
        value.valor = true;
        value.tipo = "bool";
      }
      for(const hijo of raiz.childs[1].result){

        if((raiz.childs[0].value.toLowerCase() == value.tipo) || (raiz.childs[0].value.toLowerCase() == "double" && value.tipo == "int")){
          console.log(pila, "ESTE ES EL AMBITO para "+ hijo);
        simbolo = new Simbolo(hijo, raiz.childs[0].value.toLowerCase(), value.valor, null, null, pila.obtenerUltimoAmbito());
        console.log(simbolo, "mira, esto se agrego");
        TS.getInstance().insertar(simbolo, pila);
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + value.tipo + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
                                    
        }
      }
    }else if(raiz.tag == "REASIGNACION"){

      simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
      if(simbolo != null){
      op = new Operador();
      let valor = op.ejecutar(raiz.childs[2], pila);
      
        if(simbolo.tipo == valor.tipo || ((simbolo.tipo == "double") && (valor.tipo == "int"))){
          simbolo.valor = valor.valor;
          TS.getInstance().modificar(simbolo, pila);
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + valor.tipo + " a  un "+ simbolo.tipo ,raiz.childs[0].fila,raiz.childs[0].columna ));
        
      }
    }
      
    }else if(raiz.tag == "INCREMENTO_O_DECREMENTO"){
     
      let simboloNew;
      let simbolo= TS.getInstance().obtener(raiz.childs[0].value, pila);
      if(simbolo != null){
      if(simbolo.tipo == "int" || simbolo.tipo == "double"){
      if(raiz.childs[1].childs[0].value == "++"){
        simboloNew = new Simbolo(simbolo.nombre, simbolo.tipo, simbolo.valor + 1, null, null, simbolo.ambito);
        TS.getInstance().modificar(simboloNew, pila);
      }else{
        simboloNew = new Simbolo(simbolo.nombre, simbolo.tipo, simbolo.valor - 1 , null, null, simbolo.ambito);
        TS.getInstance().modificar(simboloNew, pila);
      }
    }else{
      L_Error.getInstance().insertar(new N_Error("Semantico","No es posible incrementar o decrementar un valor "+ simbolo.tipo ,raiz.childs[0].fila,raiz.childs[0].columna ));
    }
  }else{
    L_Error.getInstance().insertar(new N_Error("Semantico","La variable "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
  }
    
    }else if(raiz.tag == "ASIGNACION"){
      switch(raiz.value){
        case "ASIGNACION_T1":
      simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
      if(simbolo != null){
      op = new Operador();
      let valor = op.ejecutar(raiz.childs[2], pila);
      let valor2 = op.ejecutar(raiz.childs[5], pila);
      if(valor.tipo == "int"){
        
      if(simbolo.tipo == valor2.tipo || ((simbolo.tipo == "double") && (valor2.tipo == "int"))){
        simbolo.valor[valor.valor] = valor2.valor;
        TS.getInstance().modificar(simbolo, pila);
      }
      }else{
        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible usar un valor de tipo "+ valor.tipo + " para buscar en un vector." ,raiz.childs[0].fila,raiz.childs[0].columna ));
      }
    }else{
      L_Error.getInstance().insertar(new N_Error("Semantico","La variable "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
    }
      break;

      case "ASIGNACION_T2":
        simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
        if(simbolo != null){
        op = new Operador();
      let val = op.ejecutar(raiz.childs[2], pila);
      let val2 = op.ejecutar(raiz.childs[5], pila);
      let val3 = op.ejecutar(raiz.childs[8], pila);
      if(val.tipo == "int" && val2.tipo == "int"){
        
        if(simbolo.tipo == val3.tipo  || ((simbolo.tipo == "double") && (val3.tipo == "int"))){
          simbolo.valor[val.valor][val2.valor] = val3.valor;
          TS.getInstance().modificar(simbolo, pila);
        }
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","No es posible usar un valor de tipo "+ val.tipo + " para buscar en un vector." ,raiz.childs[0].fila,raiz.childs[0].columna ));
        }}else{
          L_Error.getInstance().insertar(new N_Error("Semantico","La variable "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
        }
        break;
    }
    }else if(raiz.tag == "PRINT" && raiz.childs[3].childs.length!=1){
     op = new Operador();
     console.log(op.ejecutar(raiz.childs[2], pila).valor, "ESO LLEGOOOOOOOOO");
     global.cod += op.ejecutar(raiz.childs[2], pila).valor + "\n";
    }else if(raiz.tag == "PRINT" && raiz.childs[3].childs.length==1){
      op = new Operador();
      global.cod += op.ejecutar(raiz.childs[2], pila).valor;
    }else if (raiz.tag == "ARREGLOS_DEC"){

      let tipo_arr = raiz.value;
      let tamaño1;
      let tamaño2;
        op = new Operador();
        try{
        if(undefined!=op.ejecutar(raiz.childs[8], pila)){
          tamaño1 = op.ejecutar(raiz.childs[8], pila);
        }else{
          tamaño1 = op.ejecutar(raiz.childs[10], pila);
        }
        if(undefined!=op.ejecutar(raiz.childs[13], pila)){
        tamaño2 = op.ejecutar(raiz.childs[13], pila);
        }
      }catch(e){
      }
      try{
      if(tamaño1.valor >=0){
        if(tamaño1.tipo == "int"){
        switch(tipo_arr){
        
        case "ARREGLOS_DEC_T1":
          if(((raiz.childs[0].value.toLowerCase() == raiz.childs[6].value.toLowerCase() ) || (raiz.childs[0].value.toLowerCase() == "double" && raiz.childs[6].value.toLowerCase() == "int"))){
            let arr = this.generar_arreglo(raiz.childs[0].value.toLowerCase(), tamaño1.valor);
            simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), arr, tamaño1, null, pila.obtenerUltimoAmbito());
            TS.getInstance().insertar(simbolo, pila);
          }else{
            L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + raiz.childs[6].value + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
          }
            break;
        case "ARREGLOS_DEC_T2":

                  if(tamaño2.tipo == "int"){
                    if(((raiz.childs[0].value.toLowerCase() == raiz.childs[8].value.toLowerCase() ) || (raiz.childs[0].value.toLowerCase() == "double" && raiz.childs[8].value.toLowerCase() == "int"))){
                      let arr = new Array(tamaño1.valor);
                      for(let i = 0; i < tamaño1.valor; i++){
                        arr[i] = this.generar_arreglo(raiz.childs[0].value.toLowerCase(), tamaño2.valor);
                      }
                      
                      simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), arr, tamaño1.valor, tamaño2.valor, pila.obtenerUltimoAmbito());
                      TS.getInstance().insertar(simbolo, pila);
                    }else{
                      L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + raiz.childs[8].value + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
                    }
                  }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo debe ser de tipo int",raiz.childs[10].fila,raiz.childs[10].columna ));
                  }
                break;
           
            }
          }else{
            L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo debe ser de tipo int",raiz.childs[8].fila,raiz.childs[8].columna ));
         }
      }else{
        if(tamaño1.valor < 0){
          L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo no puede ser negativo",raiz.childs[8].fila,raiz.childs[8].columna ));

        }
    }} catch(e){
    }

    switch(tipo_arr){
      case "ARREGLOS_DEC_T3":
        let ar = this.generar_arreglo_valores(raiz.childs[0].value.toLowerCase(), raiz.childs[6].value, pila);
        if(ar != "error"){
          simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), ar , ar.length, null, pila.obtenerUltimoAmbito());
          TS.getInstance().insertar(simbolo, pila);
        }
        
        break;
      case "ARREGLOS_DEC_T4":
        let ar2 =[];
        let ar3; 
        tamaño2 = raiz.childs[8].value[0].length;
        for(const k of raiz.childs[8].value){
          ar3 = this.generar_arreglo_valores(raiz.childs[0].value.toLowerCase(), k, pila);
          if(ar3.length == tamaño2 && ar3 != "error"){
            ar2.push(ar3);
          }else if(ar3 == "error"){
            break;
          }else{
            ar3 = "error";
            L_Error.getInstance().insertar(new N_Error("Semantico","Los arreglos deben tener la misma longitud",raiz.childs[8].fila,raiz.childs[8].columna ));
            break;
          }
        }
        if(ar3 != "error"){
        simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), ar2 , ar2.length, tamaño2, pila.obtenerUltimoAmbito());
        TS.getInstance().insertar(simbolo, pila);
      }
        break;
    }

  }else if(raiz.tag == "IF"){
    op = new Operador();
        res=op.ejecutar(raiz.childs[0], pila)
       
        if(res.tipo=="bool"){
           let newAmbito = new Pila("if"+raiz.fila+raiz.columna);
           pila.push(newAmbito);
           
          if(res.valor){

            this.interpretar(raiz.childs[1], pila);
            
          }else{
            if(raiz.childs.length==3 && raiz.childs[2].tag == "ELSE"){
              this.interpretar(raiz.childs[2].childs[0].childs[0], pila);
            }else if(raiz.childs.length==3 && raiz.childs[2].tag == "IF"){
              this.interpretar(raiz.childs[2], pila);
            }
          }

          pila.pop();
          
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","La condicion del if debe ser de tipo bool",raiz.childs[0].fila,raiz.childs[0].columna ));
        }
  }else if(raiz.tag == "SWITCH"){
    let newAmbito = new Pila("switch"+raiz.fila+raiz.columna);
    pila.push(newAmbito);
     this.armarSwitch(raiz, pila);
    pila.pop();
  }else if(raiz.tag == "WHILE"){
    op = new Operador()
    res = op.ejecutar(raiz.childs[2], pila)
    let newAmbito = new Pila("while"+raiz.fila+raiz.columna);
    pila.push(newAmbito);
    let comprobar = global.br;
    while(res.valor){
      
      this.interpretar(raiz.childs[4].childs[0], pila);
      if(global.br){
        global.br = false;
        break;
      }else if(global.ret && !pila.existe(global.funcionActual)){
        global.ret = false;
        break;
      }
      
      res = op.ejecutar(raiz.childs[2], pila)
      
    }
    pila.pop();
  }else if(raiz.tag == "DO_WHILE"){
    
    let newAmbito = new Pila("do_while"+raiz.fila+raiz.columna);
    pila.push(newAmbito);
    op = new Operador()
    res = op.ejecutar(raiz.childs[4], pila)
    
        do{
          this.interpretar(raiz.childs[1].childs[0], pila)
          if(global.br){
            global.br = false;
            break;
          }else if(global.ret && !pila.existe(global.funcionActual)){
            global.ret = false;
            break;
          }
          res = op.ejecutar(raiz.childs[4], pila)
        }while(res.valor)

        pila.pop();
  }else if(raiz.tag == "FOR"){
   op = new Operador();
   let newAmbito = new Pila("FOR" + raiz.fila+raiz.columna);
   pila.push(newAmbito);
    this.interpretar(raiz.childs[2], pila);
    res = op.ejecutar(raiz.childs[3], pila);
    while(res.valor){
      this.interpretar(raiz.childs[7].childs[0], pila);
      if(global.br){
        global.br = false;
        break;
      }else if(global.ret && !pila.existe(global.funcionActual)){
        global.ret = false;
        break;
      }
      
      this.interpretar(raiz.childs[5], pila);
      res = op.ejecutar(raiz.childs[3], pila);
    }

   pila.pop();

  }else if(raiz.tag == "LLAMADA_FUNCION" && raiz.childs.length == 3){
    console.log("jejejejeej yo aqui entre");
    simbolo = TS.getInstance().obtenerSinAmbito(raiz.childs[0].value);
    if(simbolo != null){
      let newAmbito = new Pila(raiz.childs[0].value);
      global.funcionActual = raiz.childs[0].value;
      pila.push(newAmbito);
       this.interpretar(simbolo.valor, pila);
      global.ret = false;
      
      TS.getInstance().borrarPorAmbito(raiz.childs[0].value);
      pila.pop();
    }else{
      L_Error.getInstance().insertar(new N_Error("Semantico","La funcion "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
    }

  }else if(raiz.tag == "LLAMADA_FUNCION" && raiz.childs.length == 4){
    
    simbolo = TS.getInstance().obtenerSinAmbito(raiz.childs[0].value);
    if(simbolo != null){
      console.log(simbolo);
      op = new Operador();
      let valores = op.recorrerParaFuncion(raiz, pila);
      let s;
      let p = 0;
      let simAct;
      for(const j of valores.childs[2].result){
        s = TS.getInstance().obtener(j);
        console.log(s);
        let v = simbolo.parametros[p];
        simAct = new Simbolo(v.id, v.tipo, s.valor, s.tamaño1, s.tamaño2);
        TS.getInstance().insertar(simAct);
        p++;
      }

      let newAmbito = new Pila(raiz.childs[0].value);
      global.funcionActual = raiz.childs[0].value;
      pila.push(newAmbito);
       this.interpretar(simbolo.valor, pila);
      global.ret = false;
      
      TS.getInstance().borrarPorAmbito(raiz.childs[0].value);
      pila.pop();
      
    }else{
      L_Error.getInstance().insertar(new N_Error("Semantico","La funcion "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
    }

  }else if(raiz.tag == "VALORES" && raiz.childs.length == 1){
    return;
  }else if(raiz.tag == "VALORES" && raiz.childs.length == 2){
    raiz.result = raiz.childs[0].result;
    console.log(raiz.result, " esta es la raiz");
  }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 2){
    let list = [];
    list.push({tipo: raiz.childs[0].value.toLowerCase(), id: raiz.childs[1].value});
    raiz.result = list;
  }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 4){
    let list = raiz.childs[0].result;
    console.log("esta es la lista "+ list);
    list.push({tipo: raiz.childs[2].value.toLowerCase(), id: raiz.childs[3].value});
    raiz.result = list;

  }
  else if(raiz.tag == "SENTENCIA_TR" && raiz.childs[0].value.toLowerCase() == "break" ){

    global.br = true;
    

  }else if(raiz.tag == "CONTINUE"){
    global.cont = true;
    return;

  }else if(raiz.tag == "RETORNAR" && raiz.childs.length == 2){
    global.ret = true;
    global.valorRetorno = null;
    return;
  }else if(raiz.tag == "RETORNAR" && raiz.childs.length == 3){
    global.ret = true;
    op = new Operador();
    res = op.ejecutar(raiz.childs[1], pila);
    global.valorRetorno = res;
    return ;
  }
    return;
  
}






interpretarGlobal(raiz, pila){
  let op;
  let res;
  let simbolo;
  
  if(raiz===undefined || raiz===null)return;
  for(const hijo of raiz.childs){
    if(global.br){
      break;
    }else if(global.cont){
      global.cont = false;
      break;
    }else if(global.ret){
      break;
    }
   if(raiz.tag != "IF" &&raiz.tag != "LLAMADA"&& raiz.tag != "SWITCH" && raiz.tag != "WHILE" && raiz.tag != "DO_WHILE"&& raiz.tag != "FOR" && raiz.tag != "FUNCION" && raiz.tag != "LLAMADA_FUNCION"){
     this.interpretarGlobal(hijo, pila);
   }
  }

  if(raiz.tag == "RAIZ"){
    console.log(raiz.tag);
    raiz.result = raiz.childs[0].result;
  } else if(raiz.tag == "SENTENCIAS" && raiz.childs.length==1){
    console.log(raiz.tag);
    raiz.result = raiz.childs[0].result;
  } else if(raiz.tag == "SENTENCIAS" && raiz.childs.length==2){
    console.log(raiz.tag);
    raiz.result = raiz.childs[0] + raiz.childs[1].result;
  }else if(raiz.tag == "FINDEC" && raiz.childs.length==1){
    console.log(raiz.tag);
    raiz.result = raiz.childs[0].result;
  }else if(raiz.tag == "FINDEC" && raiz.childs.length==3){
    op = new Operador();
   raiz.result = op.ejecutar(raiz.childs[1], pila);
  console.log(raiz.result);
  }else if(raiz.tag == "DECLARACION"){
    console.log(raiz.tag);
      raiz.result = raiz.childs[0].result;
  }else if(raiz.tag == "ID_LIST" && raiz.childs.length==1){
    console.log(raiz.tag);
    let list = [];
    list.push(raiz.childs[0].value);
    raiz.result = list;
  }else if (raiz.tag == "ID_LIST" && raiz.childs.length==3){
    console.log(raiz.tag);
    raiz.childs[0].result.push(raiz.childs[2].value);
    console.log(raiz.childs[0].result);
    raiz.result = raiz.childs[0].result;
  }else if(raiz.tag == "DEC_VAR"){
    let value = null;
    if(raiz.childs[2].childs.length != 1){
      value = raiz.childs[2].result;
    }else if(raiz.childs[0].value.toLowerCase() == "int"){
      value = new ResultadoOp();
      value.valor = 0;
      value.tipo = "int";
    }else if(raiz.childs[0].value.toLowerCase() == "double"){
      value = new ResultadoOp();
      value.valor = 0.0;
      value.tipo = "double";
    }else if(raiz.childs[0].value.toLowerCase() == "char"){
      value = new ResultadoOp();
      value.valor = '\u0000';
      value.tipo = "char";
    }else if(raiz.childs[0].value.toLowerCase() == "std::string"){
      value = new ResultadoOp();
      value.valor = "";
      value.tipo = "std::string";
    }else if(raiz.childs[0].value.toLowerCase() == "bool"){
      value = new ResultadoOp();
      value.valor = true;
      value.tipo = "bool";
    }
    for(const hijo of raiz.childs[1].result){

      if((raiz.childs[0].value.toLowerCase() == value.tipo) || (raiz.childs[0].value.toLowerCase() == "double" && value.tipo == "int")){
        console.log(pila, "ESTE ES EL AMBITO para "+ hijo);
      simbolo = new Simbolo(hijo, raiz.childs[0].value.toLowerCase(), value.valor, null, null, pila.obtenerUltimoAmbito());
      console.log(simbolo, "mira, esto se agrego");
      TS.getInstance().insertar(simbolo, pila);
      }else{
        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + value.tipo + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
                                  
      }
    }
  
  }else if(raiz.tag == "REASIGNACION"){

    simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
    if(simbolo != null){
    op = new Operador();
    let valor = op.ejecutar(raiz.childs[2], pila);
    
      if(simbolo.tipo == valor.tipo || ((simbolo.tipo == "double") && (valor.tipo == "int"))){
        simbolo.valor = valor.valor;
        TS.getInstance().modificar(simbolo, pila);
      }else{
        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + valor.tipo + " a  un "+ simbolo.tipo ,raiz.childs[0].fila,raiz.childs[0].columna ));
      
    }
  }
    
  }else if(raiz.tag == "ASIGNACION"){
    switch(raiz.value){
      case "ASIGNACION_T1":
    simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
    if(simbolo != null){
    op = new Operador();
    let valor = op.ejecutar(raiz.childs[2], pila);
    let valor2 = op.ejecutar(raiz.childs[5], pila);
    if(valor.tipo == "int"){
      
    if(simbolo.tipo == valor2.tipo || ((simbolo.tipo == "double") && (valor2.tipo == "int"))){
      simbolo.valor[valor.valor] = valor2.valor;
      TS.getInstance().modificar(simbolo, pila);
    }
    }else{
      L_Error.getInstance().insertar(new N_Error("Semantico","No es posible usar un valor de tipo "+ valor.tipo + " para buscar en un vector." ,raiz.childs[0].fila,raiz.childs[0].columna ));
    }
  }else{
    L_Error.getInstance().insertar(new N_Error("Semantico","La variable "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
  }
    break;

    case "ASIGNACION_T2":
      simbolo = TS.getInstance().obtener(raiz.childs[0].value, pila);
      if(simbolo != null){
      op = new Operador();
    let val = op.ejecutar(raiz.childs[2], pila);
    let val2 = op.ejecutar(raiz.childs[5], pila);
    let val3 = op.ejecutar(raiz.childs[8], pila);
    if(val.tipo == "int" && val2.tipo == "int"){
      
      if(simbolo.tipo == val3.tipo  || ((simbolo.tipo == "double") && (val3.tipo == "int"))){
        simbolo.valor[val.valor][val2.valor] = val3.valor;
        TS.getInstance().modificar(simbolo, pila);
      }
      }else{
        L_Error.getInstance().insertar(new N_Error("Semantico","No es posible usar un valor de tipo "+ val.tipo + " para buscar en un vector." ,raiz.childs[0].fila,raiz.childs[0].columna ));
      }}else{
        L_Error.getInstance().insertar(new N_Error("Semantico","La variable "+ raiz.childs[0].value + " no existe en el ambito actual" ,raiz.childs[0].fila,raiz.childs[0].columna ));
      }
      break;
  }
  }else if (raiz.tag == "ARREGLOS_DEC"){

    let tipo_arr = raiz.value;
    let tamaño1;
    let tamaño2;
      op = new Operador();
      try{
      if(undefined!=op.ejecutar(raiz.childs[8], pila)){
        tamaño1 = op.ejecutar(raiz.childs[8], pila);
      }else{
        tamaño1 = op.ejecutar(raiz.childs[10], pila);
      }
      if(undefined!=op.ejecutar(raiz.childs[13], pila)){
      tamaño2 = op.ejecutar(raiz.childs[13], pila);
      }
    }catch(e){
    }
    try{
    if(tamaño1.valor >=0){
      if(tamaño1.tipo == "int"){
      switch(tipo_arr){
      
      case "ARREGLOS_DEC_T1":
        if(((raiz.childs[0].value.toLowerCase() == raiz.childs[6].value.toLowerCase() ) || (raiz.childs[0].value.toLowerCase() == "double" && raiz.childs[6].value.toLowerCase() == "int"))){
          let arr = this.generar_arreglo(raiz.childs[0].value.toLowerCase(), tamaño1.valor);
          simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), arr, tamaño1, null, pila.obtenerUltimoAmbito());
          TS.getInstance().insertar(simbolo, pila);
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + raiz.childs[6].value + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
        }
          break;
      case "ARREGLOS_DEC_T2":

                if(tamaño2.tipo == "int"){
                  if(((raiz.childs[0].value.toLowerCase() == raiz.childs[8].value.toLowerCase() ) || (raiz.childs[0].value.toLowerCase() == "double" && raiz.childs[8].value.toLowerCase() == "int"))){
                    let arr = new Array(tamaño1.valor);
                    for(let i = 0; i < tamaño1.valor; i++){
                      arr[i] = this.generar_arreglo(raiz.childs[0].value.toLowerCase(), tamaño2.valor);
                    }
                    
                    simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), arr, tamaño1.valor, tamaño2.valor, pila.obtenerUltimoAmbito());
                    TS.getInstance().insertar(simbolo, pila);
                  }else{
                    L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + raiz.childs[8].value + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
                  }
                }else{
                  L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo debe ser de tipo int",raiz.childs[10].fila,raiz.childs[10].columna ));
                }
              break;
         
          }
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo debe ser de tipo int",raiz.childs[8].fila,raiz.childs[8].columna ));
       }
    }else{
      if(tamaño1.valor < 0){
        L_Error.getInstance().insertar(new N_Error("Semantico","El tamaño de un arreglo no puede ser negativo",raiz.childs[8].fila,raiz.childs[8].columna ));

      }
  }} catch(e){
  }

  switch(tipo_arr){
    case "ARREGLOS_DEC_T3":
      let ar = this.generar_arreglo_valores(raiz.childs[0].value.toLowerCase(), raiz.childs[6].value, pila);
      if(ar != "error"){
        simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), ar , ar.length, null, pila.obtenerUltimoAmbito());
        TS.getInstance().insertar(simbolo, pila);
      }
      
      break;
    case "ARREGLOS_DEC_T4":
      let ar2 =[];
      let ar3; 
      tamaño2 = raiz.childs[8].value[0].length;
      for(const k of raiz.childs[8].value){
        ar3 = this.generar_arreglo_valores(raiz.childs[0].value.toLowerCase(), k, pila);
        if(ar3.length == tamaño2 && ar3 != "error"){
          ar2.push(ar3);
        }else if(ar3 == "error"){
          break;
        }else{
          ar3 = "error";
          L_Error.getInstance().insertar(new N_Error("Semantico","Los arreglos deben tener la misma longitud",raiz.childs[8].fila,raiz.childs[8].columna ));
          break;
        }
      }
      if(ar3 != "error"){
      simbolo = new Simbolo(raiz.childs[1].value, raiz.childs[0].value.toLowerCase(), ar2 , ar2.length, tamaño2, pila.obtenerUltimoAmbito());
      TS.getInstance().insertar(simbolo, pila);
    }
      break;
  }

}
  return;

}






armarSwitch(raiz, pila){
    let op;
    let res;
    let simbolo;
  
    if(raiz===undefined || raiz===null)return;
    for(const hijo of raiz.childs){
      this.armarSwitch(hijo, pila);
    }

    if(raiz.tag == "CASES" && raiz.childs.length == 1){

      raiz.result = [raiz.childs[0]];

    }else if(raiz.tag == "CASES" && raiz.childs.length == 2){

      raiz.childs[0].result.push(raiz.childs[1]);
      raiz.result = raiz.childs[0].result;

    }else if(raiz.tag == "SWITCH" && raiz.childs.length == 7){
      op = new Operador();
      let continuar = false;
      res = op.ejecutar(raiz.childs[2], pila);
      let opcion;
      for(const c of raiz.childs[5].result){
        opcion = op.ejecutar(c.childs[1], pila);
        if(global.ret && !pila.existe(global.funcionActual)){
          global.ret = false;
          break;
        }
        if(res.valor == opcion.valor || continuar){
          
          if(c.childs.length == 6){
            console.log("entro");
            this.interpretar(c.childs[3], pila);
          break;
          }else if(c.childs.length == 4){
             this.interpretar(c.childs[3], pila);
            continuar = true;
          }else if(c.childs.length == 5){
            break;
          }else if(c.childs.length == 3){
            continuar = true;
          }
        }
      }

    }else if(raiz.tag == "SWITCH" && raiz.childs.length == 8){
      op = new Operador();
      let continuar = false;
      let def = true;
      res = op.ejecutar(raiz.childs[2], pila);
      let opcion;
      for(const c of raiz.childs[5].result){
        opcion = op.ejecutar(c.childs[1], pila);
        if(res.valor == opcion.valor || continuar){
          if(c.childs.length == 6){
             this.interpretar(c.childs[3], pila);
          def = false;
          break;
          }else if(c.childs.length == 4){
            this.interpretar(c.childs[3], pila);
            continuar = true;
          }else if(c.childs.length == 5){
            def = false;
            break;
          }else if(c.childs.length == 3){
            continuar = true;
          }
        }
      }

      if(raiz.childs[6].tag == "DEFAULT" && def){
        if(raiz.childs[6].childs.length == 3){
           this.interpretar(raiz.childs[6].childs[2], pila);
        }else{
          
        }
        

      }

    }

    return ;

}

guardarFunciones(raiz, pila){
  let op;
  let res;
  let simbolo;
  
  if(raiz===undefined || raiz===null)return;
  for(const hijo of raiz.childs){
  this.guardarFunciones(hijo, pila);
  }

  if(raiz.tag == "FUNCION" && raiz.childs[3].childs.length == 1){
    simbolo = new Simbolo(raiz.childs[1].value,raiz.childs[0].value.toLowerCase(),raiz.childs[4].childs[0], null, null, pila.obtenerUltimoAmbito(), null);
    TS.getInstance().insertar(simbolo, pila); 
  }else if(raiz.tag == "FUNCION" && raiz.childs[3].childs.length == 2){
    console.log(raiz.childs[3].result);
    simbolo = new Simbolo(raiz.childs[1].value,raiz.childs[0].value.toLowerCase(),raiz.childs[4].childs[0], null, null, pila.obtenerUltimoAmbito(), raiz.childs[3].result);
    TS.getInstance().insertar(simbolo, pila); 
  }else if(raiz.tag == "VALORES" && raiz.childs.length == 1){
    return;
  }else if(raiz.tag == "VALORES" && raiz.childs.length == 2){
    raiz.result = raiz.childs[0].result;
    console.log(raiz.result, " esta es la raiz");
  }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 2){
    let list = [];
    list.push({tipo: raiz.childs[0].value.toLowerCase(), id: raiz.childs[1].value});
    raiz.result = list;
  }else if(raiz.tag == "PARAMETROS_LIST" && raiz.childs.length == 4){
    let list = raiz.childs[0].result;
    console.log("esta es la lista "+ list);
    list.push({tipo: raiz.childs[2].value.toLowerCase(), id: raiz.childs[3].value});
    raiz.result = list;

  }

}

}

  
module.exports = Interprete;