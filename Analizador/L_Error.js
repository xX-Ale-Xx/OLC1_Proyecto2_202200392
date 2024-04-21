var L_Error = (function(){
    var instancia;


    class Lista{
        constructor(){
            this.principio=null;
            this.fin=null;
        }

        insertar(Error){
            
            if(this.principio==null){
                this.principio=Error;
                this.fin=Error;
                return;
            }

            this.fin.siguiente=Error;
            Error.anterior=this.fin;
            this.fin=Error;
            console.log(this.fin);
        }

        getErroresHtml(){
            var texto = `<html><head><title>Reporte de Errores</title><style>
            table {
              border-collapse: collapse;
              width: 100%;
              border: 1px solid #ddd;
            }
            th, td {
              border: 1px solid #ddd;
              text-align: left;
              padding: 8px;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            th {
              background-color: #4CAF50;
              color: white;
            }
            </style></head><body>
            <h1>Reporte de Errores</h1>
            <table>
            <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fila</th>
                <th>Columna</th>
            </tr>`;

            var muestra = this.principio;
            while(muestra != null){
                texto += `<tr>
                <td>${muestra.tipo}</td>
                <td>${muestra.descripcion}</td>
                <td>${muestra.fila}</td>
                <td>${muestra.columna}</td>
                </tr>`;
                muestra = muestra.siguiente;
            }
            texto += "</table></body></html>";
            return texto;
        }    

        getErrores(){
            var texto="";

            var muestra=this.principio;

            while(muestra!=null){
                texto+="ERROR: Tipo:"+muestra.tipo
                +" Descripcion: "+muestra.descripcion
                +" Fila: "+muestra.fila
                +" Columna: "+muestra.columna+" \n";
                muestra=muestra.siguiente;
            }

            return texto;

        }    
        
        reiniciar() {
        this.principio=null;
        this.fin=null;
        }

        

 
    }



    function crearInstancia(){
        return new Lista();
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

module.exports = L_Error;