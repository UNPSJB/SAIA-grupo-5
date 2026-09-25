import { Nav as BSNav, Button, Badge } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks";

export function Nav() {
    const { currentUser, logout } = useAuth();

    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 min-vh-100 text-white"
            style={{ minWidth: 230, backgroundColor: "#0a0091" }}
        >
            <div className="sticky-top d-flex flex-column" style={{ top: 0, minHeight: "calc(100vh - 2rem)" }}>
                <div className="d-flex align-items-center justify-content-between">
                    <span className="text-white fs-4 fw-bold">SAIA-5</span>
                </div>

                {currentUser && (
                    <div className="mt-2 mb-2 p-2 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                        <div className="small text-truncate fw-semibold">
                            <i className="bi bi-person-circle me-1"></i>
                            {currentUser.nombre} {currentUser.apellido || ''}
                        </div>
                        <div className="d-flex gap-1 mt-1 flex-wrap">
                            {currentUser.administrar && (
                                <Badge bg="info" className="text-dark" style={{ fontSize: "0.7rem" }}>
                                    Admin
                                </Badge>
                            )}
                            {currentUser.operar && (
                                <Badge bg="secondary" style={{ fontSize: "0.7rem" }}>
                                    Operario
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <hr />

                <BSNav
                    className="nav nav-pills flex-column mb-auto"
                    style={
                        {
                            "--bs-nav-link-color": "#adb5bd",
                            "--bs-nav-link-hover-color": "#fff",
                        } as React.CSSProperties
                    }
                >
                    <BSNav.Link as={NavLink} to="/" end>
                        <i className="bi bi-house-door me-2"></i>
                        Home
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/insumos">
                        <i className="bi bi-box-seam me-2"></i>
                        Insumos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/insumos-quimicos">
                        <i className="bi bi-droplet me-2"></i>
                        Insumos Quimicos
                    </BSNav.Link>

                    <BSNav.Link as={NavLink} to="/tipos-quimicos">
                        <i className="bi bi-flask me-2"></i>
                        Tipos de Quimicos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/equipos">
                        <i className="bi bi-tools me-2"></i>
                        Equipos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/sectores">
                        <i className="bi bi-geo-alt me-2"></i>
                        Sectores
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/superficies">
                        <i className="bi bi-virus2 me-2"></i>
                        Superficies
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/planes-limpieza">
                        <i className="bi bi-clipboard-check me-2"></i>
                        Planes de Limpieza
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/tareas">
                        <i className="bi bi-list-check me-2"></i>
                        Tareas
                    </BSNav.Link>
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/personal">
                            <i className="bi bi-people me-2"></i>
                            Personal
                        </BSNav.Link>
                    )}
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/historial">
                            <i className="bi bi-clock-history me-2"></i>
                            Historial
                        </BSNav.Link>
                    )}
                </BSNav>

                <hr className="mt-auto" />

                <div>
                    <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={logout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </div>
    );
}
