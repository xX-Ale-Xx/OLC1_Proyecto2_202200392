const Pila = require('./Pila');
const Operador = require('./Operador');
const Resultado = require('./Resultado');
const Simbolo = require('./Simbolo');
const L_Error = require('./L_Error');
const N_Error = require('./N_Error');
var TS = (function(){
    var instancia;


    class Tabla{
        constructor(){
            this.simbolos=[];
        }

        insertar(simbolo, pila) {
            // Buscar si el símbolo ya existe en la tabla
            let simboloExistente = this.simbolos.find(s => s.nombre === simbolo.nombre);
        
            // Si el símbolo existe, actualizar su valor
            if (simboloExistente) {
                simboloExistente.valor = simbolo.valor;
                simboloExistente.tipo = simbolo.tipo;  // Opcionalmente actualizar el tipo si es necesario
                console.log(`Valor actualizado para el símbolo ${simbolo.nombre} a ${simbolo.valor}`);
            } else {
                // Si no existe, agregar el nuevo símbolo a la tabla
                this.simbolos.push(simbolo);
                console.log(`Símbolo ${simbolo.nombre} agregado con valor ${simbolo.valor}`);
            }
        }
        
        getsimbolos(){
            var texto="";

            texto+=`<html><head><title>Reporte de Tabla de Simbolos</title><style>
            table {
                border-collapse: collapse;
                width: 100%;
                background-color: white; /* Fondo blanco para la tabla */
            }
        
            th, td {
                text-align: left;
                padding: 8px;
                background-color: white; /* Fondo blanco para las celdas */
            }
        
            tr:nth-child(even) {
                background-color: white; /* Fondo blanco para las filas pares también */
            }
        
            th {
                background-color: #4CAF50;
                color: white;
            }
        
            body {
                background-color: white; /* Asegura que el fondo alrededor de la tabla también es blanco */
            }
        </style>
        </head><body>
            <h1>Reporte de Tabla de Simbolos</h1>
            <table>
            <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Valor</th>
            </tr>`;
            var cuenta=1;
            this.simbolos.forEach(simbolo =>{
                texto+="<tr>\n";
                texto+="<td>"+cuenta+"</td>\n";
                texto+="<td>"+simbolo.nombre+"</td>\n";
                texto+="<td>"+simbolo.tipo+"</td>\n";
                texto+="<td>"+simbolo.valor+"</td>\n";
                texto+="</tr>";
                cuenta++;
            })
            texto+="</table></body></html>";

            return texto;

        }    
        
        reiniciar() {
        this.simbolos=[]
        }

        obtener(nombre, pila){
            let res=null;
            this.simbolos.forEach(simbolo=>{
                if(simbolo.nombre==nombre ){
                    res=simbolo;
                }
            })
        
            return res;
        }

        obtenerSinAmbito(nombre){
            let res=null;
            this.simbolos.forEach(simbolo=>{
                if(simbolo.nombre==nombre){
                    res=simbolo;
                }
            })
        
            return res;
        }

        modificar(simbol, pila){
            console.log(simbol.ambito, "AMBITO");
            if(pila.existe(simbol.ambito)){
            this.simbolos.forEach(simbolo=>{
                if(simbolo.nombre==simbol.nombre){
                    simbolo.valor=simbol.valor;
                    simbolo.tipo=simbol.tipo;
                    console.log(simbol.valor, "SI modifique");
                }
            })
        }else{
            L_Error.getInstance().insertar(new N_Error("Semantico", `El simbolo ${simbol.nombre} no existe en el ambito actual`));
        }
    }

    borrarPorAmbito(ambitoEspecifico) {
        const simbolosIniciales = this.simbolos.length;
        this.simbolos = this.simbolos.filter(simbolo => simbolo.ambito !== ambitoEspecifico);
        const simbolosEliminados = simbolosIniciales - this.simbolos.length;
        console.log(`${simbolosEliminados} símbolos eliminados del ámbito ${ambitoEspecifico}`);
    }
    
 
    }
    function crearInstancia(){
        return new Tabla();
    }

    

    return {
        getInstance:function(){
            if(!instancia){
                instancia=crearInstancia()
            }
            return instancia;
        }
    }

})();

module.exports = TS;
