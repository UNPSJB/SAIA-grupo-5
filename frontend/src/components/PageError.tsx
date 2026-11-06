import { Alert, Col, Container, Row } from "react-bootstrap";
import { PageHeader } from "./PageHeader";

interface PageErrorProps {
    title: string;
    message: string;
}

export function PageError({ title, message }: PageErrorProps) {
    return (
        <Container>
            <PageHeader title={title} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">{message}</Alert>
                </Col>
            </Row>
        </Container>
    );
}
