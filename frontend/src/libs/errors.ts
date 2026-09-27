// Para resolver el  "[object Object]" 

export function getErrorMessage(error: any, fallback: string): string {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
        return detail
            .map((d) => (typeof d === "string" ? d : d?.msg))
            .filter(Boolean)
            .join(" ");
    }

    return fallback;
}
