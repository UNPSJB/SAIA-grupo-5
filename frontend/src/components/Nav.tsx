import React, { useState } from 'react';
import { Nav as BSNav, NavDropdown, Offcanvas, Button, Badge  } from "react-bootstrap";

import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks";

export function Nav() {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const { currentUser, logout } = useAuth();

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
                    <BSNav.Link as={NavLink} to="/equipos">
                        <i className="bi bi-tools me-2"></i>
                        Equipos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/elementos-limpieza">
                        <i className="bi bi-bucket me-2"></i>
                        Elementos de Limpieza
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/recambios-elementos-limpieza">
                        <i className="bi bi-clock-history me-2"></i>
                        Recambios Elementos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/checklist">
                        <i className="bi bi-check2-square me-2"></i>
                        Checklist
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

                    {/* Módulo de Personal y consumoProducto solo visible para usuarios con permiso de administrar */}
                    {currentUser?.administrar && (
                            <BSNav.Link as={NavLink} to="/personal">
                                <i className="bi bi-people me-2"></i>
                                Personal
                            </BSNav.Link>
                    )}
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/consumos-productos/consulta">
                                <i className="bi bi-droplet-half me-2"></i>
                                Consulta de Consumo
                        </BSNav.Link>
                    )}
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/historial">
                            <i className="bi bi-clock-history me-2"></i>
                            Historial
                        </BSNav.Link>
                    )}

                </BSNav>

                <div className="mt-auto">
                    {currentUser?.administrar && (
                        <NavDropdown
                            title={
                                <>
                                    <i className="bi bi-database me-2"></i>
                                    Datos Maestros
                                </>
                            }
                            id="datos-maestros-dropdown"
                        >
                            <NavDropdown.Item as={NavLink} to="/sectores">
                                <i className="bi bi-geo-alt me-2"></i>
                                Sectores
                            </NavDropdown.Item>

                            <NavDropdown.Item as={NavLink} to="/tipos-elementos-limpieza">
                                <i className="bi bi-tags me-2"></i>
                                Tipos de Elementos
                            </NavDropdown.Item>

                            <NavDropdown.Item as={NavLink} to="/tipos-quimicos">
                                <i className="bi bi-flask me-2"></i>
                                Tipos de Químicos
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/tipos-documentos">
                                <i className="bi-file-earmark-text me-2"></i>
                                Tipos de Documentos
                            </NavDropdown.Item>
                        </NavDropdown>
                    )}

                    <hr className="my-3" />

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
                    <BSNav.Link as={NavLink} to="/" end onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-house-door me-2" ></i>
                        Home
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/insumos" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-box-seam me-2"></i>
                        Insumos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/insumos-quimicos" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-droplet me-2"></i>
                        Insumos Quimicos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/equipos" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-tools me-2"></i>
                        Equipos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/elementos-limpieza" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-bucket me-2"></i>
                        Elementos de Limpieza
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/recambios-elementos-limpieza" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-clock-history me-2"></i>
                        Recambios Elementos
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/checklist" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-check2-square me-2"></i>
                        Checklist
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/superficies" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-virus2 me-2"></i>
                        Superficies
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/planes-limpieza" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-clipboard-check me-2"></i>
                        Planes de Limpieza
                    </BSNav.Link>
                    <BSNav.Link as={NavLink} to="/tareas" onClick={() => setMostrarMenu(false)}>
                        <i className="bi bi-list-check me-2"></i>
                        Tareas
                    </BSNav.Link>
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/personal" onClick={() => setMostrarMenu(false)}>
                            <i className="bi bi-people me-2"></i>
                            Personal
                        </BSNav.Link>
                    )}
                    {currentUser?.administrar && (
                        <BSNav.Link as={NavLink} to="/historial" onClick={() => setMostrarMenu(false)}>
                            <i className="bi bi-clock-history me-2"></i>
                            Historial
                        </BSNav.Link>
                    )}
                </BSNav>
                <hr className="mt-auto" />
                <div className="mt-auto">
                    {currentUser?.administrar && (
                        <NavDropdown
                            title={
                                <>
                                    <i className="bi bi-database me-2"></i>
                                    Datos Maestros
                                </>
                            }
                            id="datos-maestros-dropdown-mobile"
                        >
                            <NavDropdown.Item
                                as={NavLink}
                                to="/sectores"
                                onClick={() => setMostrarMenu(false)}
                            >
                                <i className="bi bi-geo-alt me-2"></i>
                                Sectores
                            </NavDropdown.Item>

                            <NavDropdown.Item
                                as={NavLink}
                                to="/tipos-elementos-limpieza"
                                onClick={() => setMostrarMenu(false)}
                            >
                                <i className="bi bi-tags me-2"></i>
                                Tipos de Elementos
                            </NavDropdown.Item>

                            <NavDropdown.Item
                                as={NavLink}
                                to="/tipos-quimicos"
                                onClick={() => setMostrarMenu(false)}
                            >
                                <i className="bi bi-flask me-2"></i>
                                Tipos de Químicos
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                as={NavLink}
                                to="/tipos-documentos"
                                onClick={() => setMostrarMenu(false)}
                            >
                                <i className="bi bi-flask me-2"></i>
                                Tipos de Documentos
                            </NavDropdown.Item>
                        </NavDropdown>
                    )}

                    <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={() => {
                            setMostrarMenu(false);
                            logout();
                        }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                    </Button>
                </div>

                </Offcanvas.Body>
            </Offcanvas>        
        </>
    );
}


