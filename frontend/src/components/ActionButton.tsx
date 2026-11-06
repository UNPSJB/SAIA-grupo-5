import { Button, OverlayTrigger, Tooltip, type ButtonProps } from "react-bootstrap";

interface ActionButtonProps extends ButtonProps {
    tooltip: string;
    icon: string;
    download?: string | boolean;
}

export function ActionButton({ tooltip, icon, disabled, style, ...buttonProps }: ActionButtonProps) {
    return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <span className="d-inline-block">
                <Button
                    {...buttonProps}
                    disabled={disabled}
                    style={disabled ? { ...style, pointerEvents: "none" } : style}
                >
                    <i className={`bi ${icon}`}></i>
                </Button>
            </span>
        </OverlayTrigger>
    );
}
