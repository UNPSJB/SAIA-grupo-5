import './TituloSeccion.css';

interface TituloSeccionProps {
    titulo: string;
}

export function TituloSeccion({ titulo }: TituloSeccionProps) {
    return <h6 className="titulo-seccion">{titulo}</h6>;
}
