import { Spinner } from "react-bootstrap";
import { PageHeader } from "./PageHeader";

interface PageLoadingProps {
    title: string;
}

export function PageLoading({ title }: PageLoadingProps) {
    return (
        <>
            <PageHeader title={title} />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );
}
