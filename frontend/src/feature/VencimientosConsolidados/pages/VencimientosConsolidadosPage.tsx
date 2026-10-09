import { useSearchParams } from 'react-router-dom';
import { Container, Tab, Tabs } from "react-bootstrap"
import { PageHeader } from "../../../components/PageHeader"
import { useApi } from "../../../hooks/useApi"
import type { ConfiguracionSistema } from "../../ConfiguracionSistema/types"
import { PersonalTab } from "../components/PersonalTab"
import { ElementosTab } from "../components/ElementosTab"
import { EquiposTab } from "../components/EquiposTab"

export function VencimientosConsolidadosPage() {
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get('default')
    const { data: configuracion } = useApi<ConfiguracionSistema>("/configuracion-sistema/")
    const diasAntelacion = configuracion?.dias_antelacion_vencimiento ?? 15
    const diasAntelacionElementos = configuracion?.dias_antelacion_elementos ?? 15

    return (
        <Container>
            <PageHeader title="Vencimientos consolidados" />
            <Tabs defaultActiveKey={defaultTab!=null? defaultTab : "personal"} className="mb-3">
                <Tab eventKey="personal" title="Personal">
                    <PersonalTab diasAntelacion={diasAntelacion} />
                </Tab>
                <Tab eventKey="elementos" title="Elementos de limpieza">
                    <ElementosTab diasAntelacion={diasAntelacionElementos} />
                </Tab>
                <Tab eventKey="equipos" title="Equipos">
                    <EquiposTab diasAntelacion={diasAntelacion} />
                </Tab>
            </Tabs>
        </Container>
    )
}
