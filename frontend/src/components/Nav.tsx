import { Nav as BSNav, NavDropdown } from "react-bootstrap";

export function Nav() {
    return (
        <div className="d-flex flex-column bg-dark p-3 vh-100" data-bs-theme="dark" style={{ width: "180px" }}>
            <span className="text-white mb-3 fs-4">Navbar</span>
            <BSNav className="flex-column">
                <BSNav.Link href="#" active>Home</BSNav.Link>
                <BSNav.Link href="#">Link</BSNav.Link>
                <NavDropdown title="Dropdown" id="nav-dropdown">
                    <NavDropdown.Item href="#">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#">Another action</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#">Something else here</NavDropdown.Item>
                </NavDropdown>
                <BSNav.Link href="#" disabled>Disabled</BSNav.Link>
            </BSNav>
        </div>
    );
}
