import { useAuth } from "../../hooks/useAuth";
import { AlertasRecambios } from "./components/AlertasRecambios";
import { AlertasVencimientosPersonal } from "../Personal/components/AlertasVencimientosPersonal";

export function HomePage() {
    const { currentUser } = useAuth();

    return (
        <div className="cover-container mx-auto p-5">
            <main className="px-3">
                {currentUser?.administrar && (
                    <>
                        <AlertasRecambios />
                        <AlertasVencimientosPersonal />
                    </>
                )}
            </main>
        </div>
    )
}
