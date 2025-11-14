const convert_fecha_hora = (fechaStr = new Date()) => {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) {
        throw new Error("El parámetro debe ser una fecha válida en formato ISO.");
    }
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset()); // Ajusta a la zona horaria local
    return fecha.toISOString().replace("T", " ").substring(0, 19);
};

const convert_fecha = (fechaStr = new Date()) => {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) {
        throw new Error("El parámetro debe ser una fecha válida en formato ISO.");
    }
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset()); // Ajusta a la zona horaria local
    return fecha.toISOString().substring(0, 10);
};

const convert_hora = (fechaStr = new Date()) => {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) {
        throw new Error("El parámetro debe ser una fecha válida en formato ISO.");
    }
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset()); // Ajusta a la zona horaria local
    return fecha.toISOString().substring(11, 19);
};

const convert_fecha_ddmmaa = (fechaStr = new Date()) => {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) {
        throw new Error("El parámetro debe ser una fecha válida en formato ISO.");
    }
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset()); // Ajusta a la zona horaria local

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
};


export { convert_fecha_hora, convert_fecha, convert_hora, convert_fecha_ddmmaa };