import { Nav as BSNav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export function Nav() {
    return (
        <div className="d-flex
            flex-column
            flex-shrink-0
            p-3
            min-vh-100
            text-bg-dark"
            style={{ minWidth: 220 }}
        >
            <div className="sticky-top" style={{ top: 0 }}>
                <span className="text-white fs-4">
                    <i className="bi bi-check2-square me-2"></i>
                    Navbar
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
                    <BSNav.Link as={NavLink} to="/personal">
                        <i className="bi bi-people me-2"></i>
                        Personal
                    </BSNav.Link>
                </BSNav>
            </div>
        </div>
    );
}
