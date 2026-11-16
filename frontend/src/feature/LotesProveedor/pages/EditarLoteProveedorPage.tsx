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
                numero_remito: datos.numero_remito,
                fecha_recepcion: datos.fecha_recepcion,
                archivo_adjunto: datos.archivo_adjunto,
            });
            mostrarAlertaExito('Recepcion editada correctamente.');
            navigate('/recepciones');
        } catch (error: any) {
            let mensaje = 'No se pudo actualizar la recepcion.';
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensaje = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensaje);
        }
    };

    if (isLoading) return <PageLoading title="Editar Recepción" />;
    if (!lote || error) return (
        <Container>
            <PageHeader title="Recepción no encontrada" />
            <Alert variant="danger">La recepción a editar no existe.</Alert>
        </Container>
    );

    return (
        <Container>
            <PageHeader title={`Editar Recepción ${lote.numero_remito || `#${lote.id}`}`} />
            <LoteProveedorForm
                isEdit
                textoBoton="Guardar Cambios"
                onSubmit={actualizarLote}
                valoresIniciales={{
                    proveedor_id: lote.proveedor_id,
                    numero_remito: lote.numero_remito,
                    fecha_recepcion: lote.fecha_recepcion,
                    archivo_adjunto: lote.archivo_adjunto,
                }}
            />
        </Container>
    );
}