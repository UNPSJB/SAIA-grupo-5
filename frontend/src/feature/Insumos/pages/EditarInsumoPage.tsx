import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import type { InsumoConNutricionSubmit } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Insumo } from "../types";
import type { InfoNutricional } from "../../InformacionNutricionalInsumo/types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);
    const { data: infoNutricional, isLoading: cargandoNutricion } = useApi<InfoNutricional>(id ? `/informaciones-nutricionales/insumo/${id}` : null);

    const actualizarInsumo = async ({ insumo: datosInsumo, nutricion }: InsumoConNutricionSubmit) => {
        try{
            await api.put(`/insumos/${id}`, datosInsumo);
            if (nutricion) {
                if (infoNutricional) {
                    const { modificado_respecto_fuente, ...payloadUpdate } = nutricion;
                    await api.put(`/informaciones-nutricionales/${infoNutricional.id}`, payloadUpdate);
                } else {
                    await api.post("/informaciones-nutricionales/", { ...nutricion, insumo_id: Number(id)});
                }
            }
            await mutate("/insumos/");
            await mutate(`/insumos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            await mutate(`/informaciones-nutricionales/insumo/${id}`);
            mostrarAlertaExito("El insumo se edito correctamente.");
            navigate("/insumos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el insumo.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Insumo";

    if (isLoading || cargandoNutricion) return <PageLoading title={tituloPagina} />;

    if (!insumo) return (
        <Container>
            <PageHeader title="Insumo no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El insumo ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Insumo</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (!insumo.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un insumo dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    )
    
    return(
        <>
            <PageHeader title={tituloPagina}/>
            <Container>
                <InsumoForm textoBoton="Editar Insumo"
                    onSubmit={actualizarInsumo}
                    valoresIniciales={{
                        nombre: insumo.nombre,
                        marca: insumo.marca,
                        unidad_medida_id: insumo.unidad_medida_id,
                        peso_unidad: insumo.peso_unidad,
                    }}
                    nutricionInicial={
                        infoNutricional
                            ? {
                                  fuente_nutricional_id: infoNutricional.fuente_nutricional_id,
                                  referencia_fuente: infoNutricional.referencia_fuente,
                                  valor_energetico: infoNutricional.valor_energetico,
                                  carbohidratos: infoNutricional.carbohidratos,
                                  azucares_totales: infoNutricional.azucares_totales,
                                  azucares_anadidos: infoNutricional.azucares_anadidos,
                                  proteinas: infoNutricional.proteinas,
                                  grasas_totales: infoNutricional.grasas_totales,
                                  grasas_saturadas: infoNutricional.grasas_saturadas,
                                  grasas_trans: infoNutricional.grasas_trans,
                                  fibra_alimentaria: infoNutricional.fibra_alimentaria,
                                  sodio: infoNutricional.sodio,
                              }
                            : null
                    }
                />
            </Container>
        </>
    )
}
