import { Nav as BSNav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export function Nav() {
    return (
        <div className="d-flex
            flex-column
            flex-shrink-0
            p-3
            min-vh-100
            text-white"
            style={{ minWidth: 220, backgroundColor: "#0a0091"}}
        >
            <div className="sticky-top" style={{ top: 0 }}>
                <span className="text-white fs-4">
                    SAIA-5
                </span>
                <hr />
                <BSNav
                    className="nav nav-pills flex-column mb-auto"
                    style={{
                        "--bs-nav-link-color": "#adb5bd",
                        "--bs-nav-link-hover-color": "#fff"
                    } as React.CSSProperties}
                >
                    <BSNav.Link as={NavLink} to="/" end> 
                        <i className="bi bi-house-door me-2"></i>
                        Home
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/insumos">
                        <i className="bi bi-box-seam me-2"></i>
                        Insumos
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
                    <BSNav.Link as={NavLink} to="/personal">
                        <i className="bi bi-people me-2"></i>
                        Personal
                    </BSNav.Link>
                </BSNav>
            </div>
        </div>
    );
}
