import { useAuth } from "../../hooks/useAuth";
import { AlertasRecambios } from "./components/AlertasRecambios";

export function HomePage() {
    const { currentUser } = useAuth();

    return (
        <div className="cover-container mx-auto p-5">
            <main className="px-3">
                <h1>Sistema de apoyo a la inocuidad alimentaria</h1>
                <p className="lead fs-6 fst-italic">
                    Esta es una pagina de inicio creada para
                    tener valores de referencia y tener en cuenta a
                    la hora de empezar con el proyecto de Desarrollo.
                </p>

                {currentUser?.administrar && <AlertasRecambios />}
            </main>
        </div>
    )
}
