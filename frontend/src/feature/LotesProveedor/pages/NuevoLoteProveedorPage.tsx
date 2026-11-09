import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { LoteProveedorForm } from '../componets/LoteProveedorForm';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { NewLoteProveedor } from '../types';

export function NuevoLoteProveedorPage() {
    const navigate = useNavigate();

    const crearLote = async (datos: NewLoteProveedor) => {
        try {
            await api.post('/lotes-proveedor/', datos);
            mostrarAlertaExito('Recepcion y lote registrados con exito.');
            navigate('/recepciones');
        } catch (error: any) {
            let mensaje = 'No se pudo crear el lote de proveedor.';
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensaje = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensaje);
        }
    };

    return (
        <Container>
            <PageHeader title="Nueva Recepcion de Lote" subtitle="Registrar ingreso de mercaderia de proveedor" />
            <LoteProveedorForm textoBoton="Registrar Recepción" onSubmit={crearLote} />
        </Container>
    );
}