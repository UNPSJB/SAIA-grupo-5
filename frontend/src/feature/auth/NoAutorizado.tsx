import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const NoAutorizado: React.FC = () => {
    const navigate = useNavigate();

    const goBack = () => {
        // No usamos navigate(-1): Vamos a un
        // lugar que sabemos que es accesible para cualquier logueado.
        navigate('/', { replace: true });
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ width: '480px' }} className="shadow-sm border-0 text-center p-4">
                <Card.Body>
                    <div className="text-danger mb-3">
                        <i className="bi bi-shield-lock-fill display-1"></i>
                    </div>
                    <h3 className="fw-bold mb-2">Acceso No Autorizado</h3>
                    <p className="text-muted mb-4">
                        El sitio que buscas no existe o no cuentas con los permisos suficientes para acceder a esta sección.
                    </p>
                    <Button variant="outline-primary" onClick={goBack}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver atrás
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};
