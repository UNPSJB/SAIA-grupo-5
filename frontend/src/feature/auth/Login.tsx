import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import './Login.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { isAuthenticated, isLoading, login, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login({ username, password });
    };

    if (isLoading) {
        return (
            <div className="saia-loading-wrapper d-flex flex-column justify-content-center align-items-center">
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-3 text-white-50">Cargando datos del usuario...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="saia-login-wrapper">
            <Card className="saia-login-card">
                <Card.Body className="p-0">
                    <div className="saia-avatar-circle">
                        <i className="bi bi-shield-check"></i>
                    </div>

                    <div className="text-center">
                        <h3 className="saia-title">SAIA</h3>
                        <p className="saia-subtitle">Sistema de Apoyo a la Inocuidad Alimentaria</p>
                    </div>

                    {error && (
                        <Alert variant="danger" className="py-2 small border-0">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formUsername">
                            <Form.Label className="visually-hidden">Nombre de usuario</Form.Label>
                            <div className="saia-input-group">
                                <i className="bi bi-person-fill saia-input-icon" aria-hidden="true"></i>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="saia-input"
                                    required
                                    autoFocus
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label className="visually-hidden">Contraseña</Form.Label>
                            <div className="saia-input-group">
                                <i className="bi bi-lock-fill saia-input-icon" aria-hidden="true"></i>
                                <Form.Control
                                    type="password"
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="saia-input"
                                    required
                                />
                            </div>
                        </Form.Group>

                        <Button type="submit" className="w-100 saia-submit-btn">
                            Ingresar
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};
