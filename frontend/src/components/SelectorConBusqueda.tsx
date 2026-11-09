import { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";

interface SelectorConBusquedaProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function SelectorConBusqueda({ value, options, onChange, placeholder = "Seleccionar...", disabled = false }: SelectorConBusquedaProps) {
    const [show, setShow] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((option) => option.value === value);
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase().trim()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShow(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        onChange(value);
        setSearch("");
        setShow(false);
    };

    return (
        <div ref={containerRef} className="position-relative">
            <Form.Control
                type="text"
                value={show ? search : selected?.label ?? placeholder}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShow(true);
                }}
                onFocus={() => {
                    setSearch("");
                    setShow(true);
                }}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
            />

            {show && !disabled && (
                <div className="dropdown-menu show w-100 p-1 shadow-sm" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {filteredOptions.length === 0 ? (
                        <div className="text-muted text-center py-2">No se encontraron resultados</div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`dropdown-item ${value === option.value ? "active" : ""}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
