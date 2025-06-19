function sumar(valor1,valor2){
    let resultado= valor1+valor2;
    return resultado;
}
function saludar(nombreCompleto){
    let nombreconnumero = nombreCompleto+" y tienes  "+ sumar(1,19) +"años de edad";
    return nombreconnumero
}
modulo.exports = {
   sumar,
    saludar
}