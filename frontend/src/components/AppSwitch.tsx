import type { Ref } from 'react';
import { Form, type FormCheckProps } from 'react-bootstrap';
import './AppSwitch.css';

type AppSwitchProps = Omit<FormCheckProps, 'type'> & {
    ref?: Ref<HTMLInputElement>;
};

export function AppSwitch({ className, ref, ...props }: AppSwitchProps) {
    return (
        <Form.Check
            {...props}
            ref={ref}
            type="switch"
            className={['app-switch', className].filter(Boolean).join(' ')}
        />
    );
}
