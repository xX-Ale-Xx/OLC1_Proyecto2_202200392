const express = require('express');
const app = express();
const port = 3000;
let cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());


const parser = require('./analizador');
const Interprete = require('./Analizador/Interprete');
const TS = require('./Analizador/TS');
const L_Error = require('./Analizador/L_Error');
const N_Error = require('./Analizador/N_Error');
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para enviar el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post( "/compilar",(req,res) =>{
    
    try{
      TS.getInstance().reiniciar();
      L_Error.getInstance().reiniciar();
      var resultado = parser.parse(req.body.textoEditor); 
      console.log(resultado);
      console.log(imprimir(resultado));
      var inter = new Interprete();
      var result = inter.analizar(resultado);
      console.log(result);
      var tablaSim = TS.getInstance().getsimbolos();
      console.log(tablaSim);
      result += L_Error.getInstance().getErrores();
     
      res.send(result);
      return;
    }catch(error){
        console.log(error);
        return;
    }
});


function imprimir(raiz){
    var texto ="";
    var contador=1;
    texto+="digraph G{";
    texto+="Node0[label=\"" + escapar(raiz.tag +" | "+raiz.value) + "\"];\n";
  
    recorrido("Node0",raiz);
  
    texto+= "}";
  
    return texto;
  
    function recorrido(padre,hijos){
      if(hijos === undefined || hijos === null) return;
  
      //console.log(typeof hijos);
  
      if(typeof hijos=="string")return;
      hijos.childs.forEach(nodito=> {
        if(typeof nodito.tag=="undefined")return;
        let nombrehijo="Node"+contador;
        texto+=nombrehijo+"[label=\"" + escapar(nodito.tag +" | "+nodito.value) + "\"];\n";
        texto+=padre+"->"+nombrehijo+";\n";
        contador++;
        recorrido(nombrehijo,nodito);
      })
  
    }
  
    function escapar(cadena) {
      cadena = cadena.replace("\\", "\\\\");
      cadena = cadena.replace("\"", "\\\"");
      return cadena;
  }
  
  
  }

 

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

