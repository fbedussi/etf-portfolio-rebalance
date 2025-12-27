import type { ApiResponse, PricesApiResponse } from "@/model"

const TIMEOUT = 30_000;

const pendingPricesCalls = new Map<string, Promise<ApiResponse<PricesApiResponse>>>();

export function getPrices(isin: string): Promise<ApiResponse<PricesApiResponse>> {
    if (pendingPricesCalls.has(isin)) {
        return pendingPricesCalls.get(isin)!;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const promise = fetch(`https://grafici.borsaitaliana.it/api/instruments/${isin},XMIL,ISIN/history/period?period=1Y&adjustment=true&add-last-price=true`, {
        headers: {
            authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
        signal: controller.signal,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch prices for ISIN ${isin}. Status code: ${response.status}`)
            }
            return response.json()
        })
        .then(data => {
            return { data }
        })  
        .catch(error => {
            return { error }
        })
        .finally(() => {
            clearTimeout(timeoutId)
            pendingPricesCalls.delete(isin)
        })

    pendingPricesCalls.set(isin, promise);

    return promise;
}   