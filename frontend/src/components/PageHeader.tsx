interface PageHeader {
    title: string
}

export function PageHeader({ title }: PageHeader) {
    return (
        <div className="align-items-center pb-4">
            <h1 className="h3 mb-0">{title}</h1>
        </div>
    )
}