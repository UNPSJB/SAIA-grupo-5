import type { ReactNode } from "react"
import "./PageHeader.css"

interface PageHeaderProps {
    title: string
    eyebrow?: string
    subtitle?: string
    actions?: ReactNode
}

export function PageHeader({ title, eyebrow, subtitle, actions }: PageHeaderProps) {
    if (!eyebrow && !subtitle && !actions) {
        return (
            <div className="align-items-center pb-4">
                <h1 className="h3 mb-0">{title}</h1>
            </div>
        )
    }

    return (
        <div className="page-header">
            <div>
                {eyebrow && <span className="page-header-eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions}
        </div>
    )
}
