import { Nav as BSNav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export function Nav() {
    return (
        <div className="navbar 
                d-flex 
                flex-column 
                justify-content-start 
                align-items-start 
                bg-dark 
                p-3 
                vh-100"
            data-bs-theme="dark"
            style={{ width: "150px" }}>
            <span className="text-white fs-4 p-2">Navbar</span>
            <BSNav
                className="flex-column me-auto"
                style={{
                    "--bs-nav-link-color": "#adb5bd",
                    "--bs-nav-link-hover-color": "#fff"
                } as React.CSSProperties}
            >
                <BSNav.Link as={NavLink} to="/" end>Home</BSNav.Link>
                <BSNav.Link as={NavLink} to="/insumos">Insumos</BSNav.Link>
                <BSNav.Link as={NavLink} to="/equipos">Equipos</BSNav.Link>
                <BSNav.Link as={NavLink} to="/personal">Personal</BSNav.Link>
            </BSNav>
        </div>
    );
}
