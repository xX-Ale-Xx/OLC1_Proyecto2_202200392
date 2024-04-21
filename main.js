const express = require('express');
const app = express();
const port = 3000;
let cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

app.use(cors());
app.use(express.json());


const parser = require('./analizador');
const Interprete = require('./Analizador/Interprete');
global.inter = new Interprete();
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
      global.cod = "";
      TS.getInstance().reiniciar();
      L_Error.getInstance().reiniciar();
      var resultado = parser.parse(req.body.textoEditor); 
      console.log(resultado);
      console.log(imprimir(resultado));
      global.inter.analizar(resultado);
      var result = global.cod;
       
      console.log(result);
      var tablaSim = TS.getInstance().getsimbolos();
      generarHtml(tablaSim);
      generarHtmlErrores(L_Error.getInstance().getErroresHtml());
      result += L_Error.getInstance().getErrores();
     
      res.send(result);
      return;
    }catch(error){
        console.log(error);
        return;
    }
});


function generarHtml(texto){
  fs.writeFile('public/tablaSimbolos.html', texto, (err) => {
    if (err) {
        console.error('Error al escribir el archivo HTML:', err);
    } else {
        console.log('Archivo HTML generado con éxito.');
    }
});
}

function generarHtmlErrores(texto){
  fs.writeFile('public/errores.html', texto, (err) => {
    if (err) {
        console.error('Error al escribir el archivo HTML:', err);
    } else {
        console.log('Archivo HTML generado con éxito.');
    }
});
}

function imprimir(raiz){
    var texto ="";
    var contador=1; 
    texto+="digraph G{";
  
      texto+="Node0[label=\"" + escapar(raiz.tag +" | "+raiz.value) + "\"];\n";
  
    
    recorrido("Node0",raiz);
  
    texto+= "}";

    fs.writeFile('public/output.dot', texto, err => {
      if (err) {
          console.error("Error al escribir el archivo:", err);
      } else {
          console.log("Archivo .dot generado con éxito.");
          generarImagen();
      }
  });
  function generarImagen() {
    // Comando para convertir el .dot en una imagen PNG y abrir la imagen
    const cmd = 'dot -Tpng public/output.dot -o public/output.png';

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar el comando: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error en stderr: ${stderr}`);
            return;
        }
        console.log('Imagen generada y abierta con éxito.');
    });
}
  
    return texto;
  
    function recorrido(padre,hijos){
      if(hijos === undefined || hijos === null) return;
  
      //console.log(typeof hijos);
  
      if(typeof hijos=="string")return;
      hijos.childs.forEach(nodito=> {
        if(typeof nodito.tag=="undefined")return;
        let nombrehijo="Node"+contador;
        if(Array.isArray(nodito.value)){
    
          let datos = "[";
        for(const v of nodito.value){
          if(Array.isArray(v)){
            datos += "[";
            for(const x of v){
              datos +=  x.value +",";
            }
            datos += "],";

          }else{
          datos +=  v.value +",";
          }
        }
        datos += "]";
        texto+=nombrehijo+"[label=\"" + escapar(nodito.tag +" | "+datos) + "\"];\n";
        texto+=padre+"->"+nombrehijo+";\n";
        contador++;

        }else{
          texto+=nombrehijo+"[label=\"" + escapar(nodito.tag +" | "+nodito.value) + "\"];\n";
          texto+=padre+"->"+nombrehijo+";\n";
          contador++;
        }
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

