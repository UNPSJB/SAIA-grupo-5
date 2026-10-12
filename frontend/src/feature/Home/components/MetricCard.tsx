import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
    label: string;
    value: number | string;
    icon: string;
    tone: string;
    detail?: string;
    to?: string;
}

export function MetricCard({ label, value, icon, tone, detail, to }: MetricCardProps) {
    const navigate = useNavigate();
    const clickable = Boolean(to);

    return (
        <Card
            className={`dashboard-metric h-100${clickable ? " dashboard-metric-clickable" : ""}`}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => navigate(to!) : undefined}
            onKeyDown={clickable ? (event) => { if (event.key === "Enter") navigate(to!); } : undefined}
        >
            <Card.Body>
                <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                        <div className="dashboard-metric-label">{label}</div>
                        <div className="dashboard-metric-value">{value}</div>
                    </div>
                    <span className="dashboard-metric-icon" style={{ color: tone, backgroundColor: `${tone}18` }}>
                        <i className={`bi ${icon}`} aria-hidden="true" />
                    </span>
                </div>
                {detail && <div className="dashboard-metric-detail">{detail}</div>}
            </Card.Body>
        </Card>
    );
}
