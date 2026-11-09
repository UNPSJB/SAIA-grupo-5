import { Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { LoteProveedorForm } from '../componets/LoteProveedorForm';
import { useApi } from '../../../hooks';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { LoteProveedor, NewLoteProveedor } from '../types';

export function EditarLoteProveedorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: lote, isLoading, error } = useApi<LoteProveedor>(`/lotes-proveedor/${id}`);

    const actualizarLote = async (datos: NewLoteProveedor) => {
        try {
            await api.put(`/lotes-proveedor/${id}`, {
                numero_lote: datos.numero_lote,
                numero_remito: datos.numero_remito,
                fecha_recepcion: datos.fecha_recepcion,
                archivo_adjunto: datos.archivo_adjunto,
            });
            mostrarAlertaExito('Lote de proveedor editado correctamente.');
            navigate('/recepciones');
        } catch (error: any) {
            let mensaje = 'No se pudo actualizar el lote.';
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensaje = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensaje);
        }
    };

    if (isLoading) return <PageLoading title="Editar Lote" />;
    if (!lote || error) return (
        <Container>
            <PageHeader title="Lote no encontrado" />
            <Alert variant="danger">El lote a editar no existe.</Alert>
        </Container>
    );

    return (
        <Container>
            <PageHeader title={`Editar Lote ${lote.numero_lote}`} />
            <LoteProveedorForm
                isEdit
                textoBoton="Guardar Cambios"
                onSubmit={actualizarLote}
                valoresIniciales={{
                    proveedor_id: lote.proveedor_id,
                    numero_lote: lote.numero_lote,
                    numero_remito: lote.numero_remito,
                    fecha_recepcion: lote.fecha_recepcion,
                    archivo_adjunto: lote.archivo_adjunto,
                }}
            />
        </Container>
    );
}