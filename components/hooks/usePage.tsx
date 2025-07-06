import { useSearchParameter } from '@/src/hooks/useSearchParameter'

export function usePage() {
    return useSearchParameter<number | undefined>(
        'page',
        (p) => (p ? Number(p) : undefined),
        (v) => (v ? String(v) : [])
    )
}
