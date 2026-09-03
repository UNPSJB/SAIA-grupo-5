import useSWR from 'swr'
import { api } from '../lib/axios'

async function featcher(url: string) {
    const res = await api.get(url)
    return res.data
}

export function useApi<T>(url: string | null) {
    const { data, isLoading, error } = useSWR<T>(url, featcher)

    return { data, isLoading, error }
}