import Tabs, { type TabsProps } from 'react-bootstrap/Tabs';
import './AppTabs.css';

export function AppTabs({ className, ...props }: TabsProps) {
    return <Tabs {...props} className={['app-tabs', className].filter(Boolean).join(' ')} />;
}
