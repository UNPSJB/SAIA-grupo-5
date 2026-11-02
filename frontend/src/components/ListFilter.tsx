import { Button, ButtonGroup, Dropdown } from "react-bootstrap";

interface ListFilterProps {
    value: string;
    options: Record<string, string>;
    onChange: (value: string) => void;
}

export function ListFilter({ value, options, onChange }: ListFilterProps) {
    return (
        <Dropdown as={ButtonGroup}>
            <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => onChange("todos")}
            >
                Filtrar por: {options[value]}
            </Button>

            <Dropdown.Toggle
                split
                variant="outline-secondary"
                size="sm"
            />

            <Dropdown.Menu>
                {Object.entries(options).map(([valor, label]) => (
                    <Dropdown.Item
                        key={valor}
                        active={value === valor}
                        onClick={() => onChange(valor)}
                    >
                        {label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}