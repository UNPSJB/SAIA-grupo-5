import { useState } from "react";
import { Alert, ListGroup, Modal, Spinner } from "react-bootstrap";
import { mutate } from "swr";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import type { Sector } from "../../Sectores/types";
import type { Equipo } from "../types";

interface AgregarSectorModalProps {
    equipo: Equipo | null;
    onHide: () => void;
}

export function AgregarSectorModal({ equipo, onHide }: AgregarSectorModalProps) {
    const [asignando, setAsignando] = useState(false);
    // Se pasa null como key mientras no haya equipo seleccionado, para no traer sectores hasta que se abra el modal
    const { data: sectores, error, isLoading } = useApi<Sector[]>(equipo ? "/sectores/" : null);

    const handleSelectSector = async (sector: Sector) => {
        if (!equipo) return;
        setAsignando(true);
        try {
            await api.put(`/equipos/${equipo.id}`, { sector_id: sector.id });
            await mutate("/equipos");
            onHide();
        } catch (err) {
            alert("No se pudo asignar el sector al equipo.");
            console.log(err);
        } finally {
            setAsignando(false);
        }
    };

    return (
        <Modal show={equipo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Asignar sector a {equipo?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {(isLoading || asignando) && (
                    <div className="text-center py-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                )}
                {error && (
                    <Alert variant="danger" className="mb-0">
                        Ocurrió un error al cargar los sectores.
                    </Alert>
                )}
                {!isLoading && !error && !asignando && (
                    sectores && sectores.length > 0 ? (
                        <ListGroup variant="flush">
                            {sectores.map((sector) => (
                                <ListGroup.Item
                                    key={sector.id}
                                    action
                                    onClick={() => handleSelectSector(sector)}
                                >
                                    {sector.nombre}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p className="text-muted mb-0">
                            No hay sectores para asignar.
                        </p>
                    )
                )}
            </Modal.Body>
        </Modal>
    );
}
