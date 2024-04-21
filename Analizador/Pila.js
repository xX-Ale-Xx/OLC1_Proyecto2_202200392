class Pila{
    constructor(ambito){
        this.size=2;
        this.inicio=null;
        this.fin=null;
        this.ambito=ambito;
    }

    reiniciar(){
        this.size=2;
        this.inicio=null;
        this.fin=null;
    }
    obtenerUltimoAmbito() {
        
        return "global"; // Retorna el ámbito del último nodo
    }
    
    push(nueva)
    {
        console.log("ingresando a la pila variable: '" + nueva.ambito  );
        if (this.existe(nueva.ambito)) return false;

        console.log("ingresando a la pila variable: '" + nueva.ambito  );
        if (this.inicio == null)
        {
            this.inicio = nueva;
            this.fin = nueva;
        
        }
        else
        {
            nueva.anterior=this.fin;
            this.fin.siguiente=nueva;
            this.fin = nueva;
           
        }
        this.size++;

        return true;
    }
    pop()
    {
        // Se disminuye el tamaño
        return ;
    }

    vaciarPila()
    {
        while (!this.fin.ambito=="$$" && !this.fin.ambito()=="$") { var aux = pop(); }//vaciar hasta $ o $$
        pop();
    }
    existe(nombre){
        if(nombre=="$$"||nombre=="$") return false;
        var actual = this.fin;

        while(actual!=null && nombre != null){
            if(actual.ambito.toLowerCase()===nombre.toLowerCase()){
                console.log(actual.ambito.toLowerCase());
                console.log(nombre);
                console.log('aca esta malo')
                return true;
            }
            actual = actual.anterior;
        }

        return false;

    }

    recorrerPila() {
        let actual = this.fin;
        console.log("Recorriendo la pila desde el fin al inicio:");
        while (actual != null) {
            console.log( "Ámbito:"+actual.ambito);
            actual = actual.anterior;
        }
    }



    obtener(nombre)
    {
        var actual = this.fin; //el nodo actual siempre es el ultimo de la pila
        if (actual==null)return null; 
            
        
        for (var i = 0; i < this.size-2; i++)
        {
            if (actual.ambito.toUpperCase()==nombre.toUpperCase())
            {
                return actual;   
            }
            else if (actual.ambito=="$$") return null;
            actual = actual.anterior;
        }
        return null;



    }
}


module.exports = Pila;