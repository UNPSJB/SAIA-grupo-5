import React, { useState } from 'react';
import { Nav as BSNav, Offcanvas } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export function Nav() {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    return (
        <>
        <div className="d-none d-lg-flex
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
                    <BSNav.Link as={NavLink} to="/personal">
                        <i className="bi bi-people me-2"></i>
                        Personal
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/checklist">
                        <i className="bi bi-check2-square me-2"></i>
                        Checklist
                    </BSNav.Link>
                </BSNav>
            </div>
        </div>
        <div
            className="d-lg-none d-flex
            align-items-center 
            px-3 
            py-2 
            text-white 
            sticky-top"
            style={{ backgroundColor: "#0a0091" }}
        >
            <button
                type="button"
                className="btn btn-outline-light me-3"
                onClick={() => setMostrarMenu(true)}
                aria-label="Abrir menú"
            >
                <i className="bi bi-list"></i>
            </button>
            <span className="fs-4">SAIA-5</span>
        </div>
            <Offcanvas
                show={mostrarMenu}
                onHide={() => setMostrarMenu(false)}
                className="text-white"
                style={{ backgroundColor: "#0a0091" }}
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>SAIA-5</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    
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
                    <BSNav.Link as={NavLink} to="/checklist">
                        <i className="bi bi-check2-square me-2"></i>
                        Checklist
                    </BSNav.Link>
                </BSNav>
                </Offcanvas.Body>
            </Offcanvas>        
        </>
    );
}
