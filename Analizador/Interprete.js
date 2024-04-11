const Pila = require('./Pila');
const Operador = require('./Operador');
const ResultadoOp = require('./Resultado');
const Simbolo = require('./Simbolo');
const TS = require('./TS');
const L_Error = require('./L_Error');
const N_Error = require('./N_Error');

class Interprete{
 
  constructor(){
    this.global = new Pila("global");
    this.mglobal = [];
    this.estructuras=[];
  }
  analizar(raiz){

    return this.interpretar(raiz,this.global,null);

  }

  interpretar(raiz){
    let op;
    let res;
    let simbolo;
    let codigo="";
    if(raiz===undefined || raiz===null)return;
    for(const hijo of raiz.childs){
      codigo += this.interpretar(hijo);
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
     raiz.result = op.ejecutar(raiz.childs[1]);
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
    }else if(raiz.tag == "SENTENCIA"){
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
      console.log(value, "este es el valor");
      for(const hijo of raiz.childs[1].result){
        if(raiz.childs[0].value.toLowerCase() == value.tipo){
        simbolo = new Simbolo(hijo, raiz.childs[0].value.toLowerCase(), value.valor);
        TS.getInstance().insertar(simbolo)
        }else{
          L_Error.getInstance().insertar(new N_Error("Semantico","No es posible asignar un valor " + value.tipo + " a  un "+ raiz.childs[0].value ,raiz.childs[0].fila,raiz.childs[0].columna ));
                                    
        }
      }
    }else if(raiz.tag == "PRINT" && raiz.childs[3].childs.length!=1){
     op = new Operador();
     codigo += op.ejecutar(raiz.childs[2]).valor + "\n";
    }else if(raiz.tag == "PRINT" && raiz.childs[3].childs.length==1){
      op = new Operador();
      codigo += op.ejecutar(raiz.childs[2]).valor;
    }
    
    return codigo;
  
}

}

  
module.exports = Interprete;