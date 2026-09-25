import 'sweetalert2/themes/bootstrap-5.css'
import Swal from 'sweetalert2'

export const mostrarAlertaExito = (mensaje: string) => {
    return Swal.fire({
        title: "Exito",
        text: mensaje,
        icon: "success",
        theme: "bootstrap-5-light",
        confirmButtonText: "Aceptar",
        customClass: {
            actions: "justify-content-center"
        }
});
}


export const mostrarAlertaError = (mensaje: string) => {
    return Swal.fire({
        title: "Error",
        text: mensaje,
        icon: "error",
        theme: "bootstrap-5-light",
        confirmButtonText: "Aceptar",
        customClass: {
            actions: "justify-content-center"
        }
});
}