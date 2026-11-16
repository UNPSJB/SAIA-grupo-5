import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ClienteForm } from "../components/ClienteForm";
import { api } from "../../../libs/axios";
import type { NewCliente, NewDireccionCliente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoClientePage() {
    const navigate = useNavigate();

    const guardarCliente = async (datos: NewCliente, direcciones: NewDireccionCliente[]) => {
        try {
            const respCliente = await api.post("/clientes/", datos);
            const clienteCreado = respCliente.data;

            for (const dir of direcciones) {
                await api.post("/direcciones-cliente/", {
                    cliente_id: clienteCreado.id,
                    calle_altura: dir.calle_altura,
                    provincia: dir.provincia,
                    localidad: dir.localidad,
                    codigo_postal: dir.codigo_postal,
                    descripcion: dir.descripcion,
                });
            }

            await mutate("/clientes/");
            mostrarAlertaExito("El cliente se creo correctamente.");
            navigate("/clientes");
        } catch (error: any) {
            let mensajeFinal = "No se pudo crear el cliente.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Crear nuevo Cliente" />

            <Container>
                <ClienteForm
                    textoBoton="Crear Cliente"
                    onSubmit={guardarCliente}
                />
            </Container>
        </>
    );
}