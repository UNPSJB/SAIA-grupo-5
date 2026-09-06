import { PeageHeader } from "../../components/PageHeader";

export function PersonalPage() {
    return (
        <div className="cover-container mx-auto">
            <main className="px-3">
                <PeageHeader title="Personal" />
                <p className="lead fs-6 fst-italic">
                    Esta es una pagina de inicio creada para
                    tener valores de referencia y tener en cuenta a
                    la hora de empezar con el proyecto de Desarrollo.
                </p>
            </main>
        </div>
    )
}