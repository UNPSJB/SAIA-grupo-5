import { PeageHeader } from "../../components/PageHeader";
import { useApi } from "../../hooks/useApi";
import type { Insumo } from "./types";

export function InsumosPage() {
    const { data, error, isLoading } = useApi<Insumo[]>("/insumos")

    if (isLoading) return <p>Se estan cargando los insumos...</p>
    if (error) return <p>Ocurrió un error al cargar insumos</p>

    console.log(data)

    return (
        <>
            <PeageHeader title="Listado de Insumos" />
            <div className="container col-md-8">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Unidad de medida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((insumo: Insumo, i) => (
                            <tr key={insumo.id}>
                                <th scope="row">{i + 1}</th>
                                <td>{insumo.nombre}</td>
                                <td>{insumo.unidad_medida}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}