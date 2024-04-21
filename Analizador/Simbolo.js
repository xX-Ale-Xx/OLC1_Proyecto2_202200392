class Simbolo{
    constructor(nombre, tipo, valor, tamaño1, tamaño2, ambito, parametros) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.valor = valor;
        this.ambito = ambito;

        // Asumimos que si 'parametros' está definido, las dimensiones no importan
        if (parametros !== undefined) {
            this.parametros = parametros;
            this.tamaño1 = null;
            this.tamaño2 = null;
        } else {
            // Asignar tamaños dependiendo de si están definidos
            this.tamaño1 = tamaño1 !== undefined ? tamaño1 : null;
            this.tamaño2 = tamaño2 !== undefined ? tamaño2 : null;
            this.parametros = [];  // Asumir que no hay parámetros si no están definidos
        }
    }
}
module.exports = Simbolo;