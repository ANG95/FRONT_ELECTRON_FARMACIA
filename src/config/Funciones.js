// parsea datos que se almacenan en localStorage
var datosUsuario = JSON.parse(localStorage.getItem('_userD'))

// calcula edad años mese y dias
function calcularEdad(fecha) {
    // Si la fecha es correcta, calculamos la edad

    if (typeof fecha != "string" && fecha && esNumero(fecha.getTime())) {
        // fecha = formatDate(fecha, "yyyy-MM-dd");
    }

    var values = fecha.split("-");
    // console.log("values ", values);
    var dia = values[2];
    var mes = values[1];
    var ano = values[0];

    // cogemos los valores actuales
    var fecha_hoy = new Date();
    var ahora_ano = fecha_hoy.getYear();
    var ahora_mes = fecha_hoy.getMonth() + 1;
    var ahora_dia = fecha_hoy.getDate();

    // realizamos el calculo
    var edad = (ahora_ano + 1900) - ano;
    if (ahora_mes < mes) {
        edad--;
    }
    if ((mes === ahora_mes) && (ahora_dia < dia)) {
        edad--;
    }
    if (edad > 1900) {
        edad -= 1900;
    }

    // calculamos los meses
    var meses = 0;

    if (ahora_mes > mes && dia > ahora_dia)
        meses = ahora_mes - mes - 1;
    else if (ahora_mes > mes)
        meses = ahora_mes - mes
    if (ahora_mes < mes && dia < ahora_dia)
        meses = 12 - (mes - ahora_mes);
    else if (ahora_mes < mes)
        meses = 12 - (mes - ahora_mes + 1);
    if (ahora_mes === mes && dia > ahora_dia)
        meses = 11;

    // calculamos los dias
    var dias = 0;
    if (ahora_dia > dia)
        dias = ahora_dia - dia;
    if (ahora_dia < dia) {
        var ultimoDiaMes = new Date(ahora_ano, ahora_mes - 1, 0);
        dias = ultimoDiaMes.getDate() - (dia - ahora_dia);
    }

    return edad + " años, " + meses + " meses y " + dias + " días";
}
function esNumero(strNumber) {
    if (strNumber === null) return false;
    if (strNumber === undefined) return false;
    if (typeof strNumber === "number" && !isNaN(strNumber)) return true;
    if (strNumber === "") return false;
    if (strNumber === "") return false;
    var psFloat;
    psFloat = parseFloat(strNumber);
    return !isNaN(strNumber) && !isNaN(psFloat);
}
// fecha Actual
function fechaActual() {
    var fecha = new Date(); //Fecha actual
    var mes = fecha.getMonth() + 1; //obteniendo mes
    var dia = fecha.getDate(); //obteniendo dia
    var ano = fecha.getFullYear(); //obteniendo año
    if (dia < 10)
        dia = '0' + dia; //agrega cero si el menor de 10
    if (mes < 10)
        mes = '0' + mes //agrega cero si el menor de 10
    return dia + "-" + mes + "-" + ano;
}

// fecha actual mas la hora en Y-m-d h:m:s
// fecha Actual
function fechaActualYMDhms() {
    var fecha = new Date(); //Fecha actual
    var mes = fecha.getMonth() + 1; //obteniendo mes
    var dia = fecha.getDate(); //obteniendo dia
    var ano = fecha.getFullYear(); //obteniendo año
    var hora = fecha.getHours();
    var minutos = fecha.getMinutes();
    var segundos = fecha.getSeconds();

    if (dia < 10)
        dia = '0' + dia; //agrega cero si el menor de 10
    if (mes < 10)
        mes = '0' + mes //agrega cero si el menor de 10
    return ano + "-" + mes + "-" + dia + " " + hora + ":" + minutos + ":" + segundos;
}

// espera que el usuario termine de digitar los inputs
function debounce(func, wait, immediate) {
    var timeout;
    return function () {

        var context = this,
            args = arguments;
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;

            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (callNow) func.apply(context, args);
    }
}

// retorna la fecha que entra en 02/12/1995 a> 1995-12-02
function formatDateAMD(texto) {
    if (texto) {
        var cambiarDato = texto.split("/")
        return `${cambiarDato[2]}-${cambiarDato[1]}-${cambiarDato[0]}`
    } else {
        return "fecha no válida !!!"
    }
}

// fecha actual en formato año-mes-dia
function fechaActualYMD() {
    var fecha = new Date(); //Fecha actual
    var mes = fecha.getMonth() + 1; //obteniendo mes
    var dia = fecha.getDate(); //obteniendo dia
    var ano = fecha.getFullYear(); //obteniendo año
    if (dia < 10)
        dia = '0' + dia; //agrega cero si el menor de 10
    if (mes < 10)
        mes = '0' + mes //agrega cero si el menor de 10
    return ano + "-" + mes + "-" +dia ;
}

// cantidad dias entre dos fechas
function CantDias(fechaLimite) {
    var fechaInicio = new Date(fechaActualYMD()).getTime();
    var fechaFin = new Date(fechaLimite).getTime();
    var diff = fechaFin - fechaInicio;
    return (diff / (1000 * 60 * 60 * 24))
}

export {
    datosUsuario,
    calcularEdad,
    fechaActual,
    debounce,
    formatDateAMD,
    fechaActualYMDhms,
    fechaActualYMD,
    CantDias
}